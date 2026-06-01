import { EventEmitter } from "./events";
import { PlayerStore, createInitialPlayerState } from "./store";
import { YoutubeManager } from "../managers/youtube-manager";
import { ErrorManager } from "../managers/error-manager";
import { SecurityManager } from "../managers/security-manager";
import type {
  PlayerState,
  Unsubscribe,
  SourceOptions,
  PlayerControls,
  PlayerSnapshot,
  PlayerStateListener,
  SecurityConfig,
  CreatePlayerOptions,
} from "../types/player.types";
import { YouTubePlayerState } from "../types/youtube.types";
import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { extractYoutubeId } from "../utils/url";
import { clamp } from "../utils/helpers";
import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../constants";

/**
 * Map YouTube error codes to human-readable messages.
 */
const YOUTUBE_ERROR_MAP: Record<number, string> = {
  2: "The YouTube request contains an invalid parameter value.",
  5: "The requested YouTube content cannot be played in an HTML5 player.",
  100: "The video requested was not found. It may have been removed or marked as private.",
  101: "The owner of the requested video does not allow it to be embedded.",
  150: "The owner of the requested video does not allow it to be embedded.",
};

/**
 * Default YouTube quality labels (lowest to highest).
 * YouTube API uses string quality labels rather than numeric indices.
 */
const QUALITY_LABELS = [
  "small",
  "medium",
  "large",
  "hd720",
  "hd1080",
  "highres",
];

/**
 * YoutubePlayer — wraps the YouTube IFrame Player API behind the same
 * PlayerControls interface as the HLS Player, so the React UI layer
 * works interchangeably.
 */
export class YoutubePlayer extends EventEmitter<PlayerEventMap> {
  private root: HTMLElement;
  /**
   * The element used for requestFullscreen(). Defaults to `root` but should
   * be set to the outer `.vp-player` wrapper div so that all React event
   * handlers (onClick, onPointerMove, etc.) remain inside the fullscreen
   * layer and controls continue to work.
   */
  private fullscreenEl: HTMLElement;
  private store: PlayerStore;
  private manager: YoutubeManager;
  private errorManager: ErrorManager;
  private securityManager: SecurityManager | null = null;
  private videoId: string;
  private state: YouTubePlayerState = YouTubePlayerState.UNSTARTED;
  private lastAutoPlay: boolean | undefined;
  private pendingStartTime: number | undefined;
  /** Whether the player has received its ready event. */
  private isReady = false;
  /** Queue of commands to execute after ready. */
  private readyQueue: Array<() => void> = [];
  /** The raw error from the YouTube IFrame API. */
  private youtubeError: number | null = null;
  /** Track current time separately since we poll it. */
  private currentTime = 0;
  /** Track duration for VOD duration. */
  private duration = 0;
  /** Available quality levels from YouTube. */
  private availableQualities: string[] = [];
  /** First error during initialization. */
  initialError: PlayerError | null = null;

  constructor(options: CreatePlayerOptions) {
    super();
    this.root = options.root || options.video;
    // Use dedicated fullscreen element if provided (should be the outer .vp-player
    // wrapper so all React handlers stay inside the fullscreen layer).
    this.fullscreenEl = options.fullscreenElement ?? this.root;
    this.videoId = extractYoutubeId(options.src) || options.src;
    this.pendingStartTime = options.startTime;
    this.lastAutoPlay = options.autoPlay;

    const initialState = createInitialPlayerState(options.src);
    this.store = new PlayerStore(initialState);

    // ErrorManager — centralized error handling
    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    // Create the container that YouTube iframe will be injected into
    this.manager = new YoutubeManager(this.root, {
      onReady: this.handleReady.bind(this),
      onStateChange: this.handleStateChange.bind(this),
      onError: this.handleError.bind(this),
      onCurrentTimeUpdate: this.handleTimeUpdate.bind(this),
    });

    // Security manager
    this.securityManager = new SecurityManager({
      root: this.root,
      video: null as any, // YouTube ignores this - security is CSS-based
      store: this.store,
      controls: this,
      disableDevOptions: options.security?.disableDevOptions,
    });

    // Keep isFullscreen state in sync
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);

    // Start loading
    void this.loadSource({
      src: options.src,
      autoPlay: options.autoPlay,
      startTime: options.startTime,
    });
  }

  // ─── Event Handlers ─────────────────────────────────────────────────────

  private handleReady() {
    this.isReady = true;
    const player = this.manager.getPlayer()!;

    // Set initial volume
    const initialState = this.store.getState();
    player.setVolume(initialState.volume * 100);
    if (initialState.isMuted) player.mute();

    // Set initial playback rate
    player.setPlaybackRate(initialState.playbackRate);

    // Get duration and sync available qualities
    this.syncDuration();
    this.syncQualities();

    this.patchState({ isReady: true, duration: this.duration });
    this.emit("ready", this.getState());

    // Execute queued commands
    const queue = this.readyQueue.slice();
    this.readyQueue.length = 0;
    queue.forEach((fn) => fn());
  }

  private handleStateChange(ytState: YouTubePlayerState) {
    this.state = ytState;
    const update: Partial<PlayerState> = {};

    switch (ytState) {
      case YouTubePlayerState.PLAYING:
        update.isPlaying = true;
        update.isBuffering = false;
        this.syncDuration();
        this.emit("play", this.getState());
        break;
      case YouTubePlayerState.PAUSED:
        update.isPlaying = false;
        this.emit("pause", this.getState());
        break;
      case YouTubePlayerState.BUFFERING:
        update.isBuffering = true;
        break;
      case YouTubePlayerState.ENDED:
        update.isPlaying = false;
        update.isBuffering = false;
        this.emit("ended", this.getState());
        break;
      case YouTubePlayerState.CUED:
        update.isPlaying = false;
        update.isBuffering = false;
        break;
      default:
        // UNSTARTED
        update.isPlaying = false;
        break;
    }

    this.patchState(update);
  }

  private handleError(errorCode: number) {
    this.youtubeError = errorCode;
    const message =
      YOUTUBE_ERROR_MAP[errorCode] ||
      `YouTube playback error (code: ${errorCode}).`;
    const err: PlayerError = {
      message,
      fatal: true,
      category: errorCode >= 100 ? "auth" : "source",
      details: `YouTube error code ${errorCode}`,
    };
    this.errorManager.raise(err);
  }

  private handleTimeUpdate(currentTime: number) {
    this.currentTime = currentTime;
    this.syncDuration();

    const update: Partial<PlayerState> = {
      currentTime,
      duration: this.duration,
    };

    // Compute buffered estimate from getVideoLoadedFraction
    const fraction = this.manager.getPlayer()?.getVideoLoadedFraction?.() ?? 0;
    if (fraction > 0 && this.duration > 0) {
      const bufferedEnd = fraction * this.duration;
      update.buffered = [{ start: 0, end: bufferedEnd }];
      update.bufferedEnd = bufferedEnd;
      update.bufferedPercent = clamp(
        (bufferedEnd / this.duration) * 100,
        0,
        100,
      );
    }

    this.patchState(update);
    this.emit("timeupdate", this.getState());
  }

  // ─── Internal Helpers ───────────────────────────────────────────────────

  private syncDuration() {
    try {
      const d = this.manager.getPlayer()?.getDuration() ?? 0;
      if (d > 0 && Number.isFinite(d)) {
        this.duration = d;
      }
    } catch {
      // Player may not be ready
    }
  }

  private syncQualities() {
    try {
      const player = this.manager.getPlayer();
      if (!player) return;
      this.availableQualities = player.getAvailableQualityLevels?.() ?? [];
      const active = player.getPlaybackQuality?.() ?? "auto";

      const qualities = this.availableQualities.map((q, i) => ({
        id: i,
        label: q,
        width: 0,
        height: 0,
        bitrate: 0,
      }));

      this.store.setState({
        qualities,
        selectedQuality: "auto",
        activeQuality:
          active === "auto" ? null : this.availableQualities.indexOf(active),
      });
      this.emit("qualitieschange" as any, qualities);
    } catch {
      // Player may not be ready
    }
  }

  private enqueue(fn: () => void) {
    if (this.isReady) {
      fn();
    } else {
      this.readyQueue.push(fn);
    }
  }

  // ─── PlayerControls Implementation ──────────────────────────────────────

  async play() {
    this.enqueue(() => this.manager.queuePlay());
  }

  pause() {
    this.enqueue(() => this.manager.queuePause());
  }

  async togglePlay() {
    if (
      this.state === YouTubePlayerState.PLAYING ||
      this.state === YouTubePlayerState.BUFFERING
    ) {
      this.pause();
    } else {
      await this.play();
    }
  }

  seek(time: number) {
    const clamped = clamp(time, 0, this.duration);
    this.currentTime = clamped;
    this.patchState({ currentTime: clamped });
    this.enqueue(() => this.manager.queueSeek(clamped));
  }

  seekToLive() {
    // Not applicable for YouTube VOD. No-op.
  }

  isLiveStream() {
    return false; // YouTube VOD only for now
  }

  setVolume(vol: number) {
    const clamped = clamp(vol, 0, 1);
    this.enqueue(() => {
      const player = this.manager.getPlayer();
      if (player) {
        if (clamped === 0) {
          const state = this.store.getState();
          if (state.volume > 0)
            this.patchState({ previousVolume: state.volume });
          player.mute();
        } else {
          player.unMute();
          player.setVolume(clamped * 100);
        }
      }
      this.patchState({ volume: clamped, isMuted: clamped === 0 });
    });
  }

  mute() {
    this.enqueue(() => {
      const state = this.store.getState();
      if (state.volume > 0) this.patchState({ previousVolume: state.volume });
      this.manager.getPlayer()?.mute();
    });
    this.patchState({ isMuted: true });
  }

  unmute() {
    this.enqueue(() => {
      this.manager.getPlayer()?.unMute();
      const state = this.store.getState();
      if (state.volume === 0) {
        const prev = state.previousVolume > 0 ? state.previousVolume : 0.5;
        this.manager.getPlayer()?.setVolume(prev * 100);
        this.patchState({ volume: prev });
      }
    });
    this.patchState({ isMuted: false });
  }

  setPlaybackRate(rate: number) {
    const clamped = clamp(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
    this.enqueue(() => {
      this.manager.getPlayer()?.setPlaybackRate(clamped);
    });
    this.patchState({ playbackRate: clamped });
  }

  setQuality(quality: number | "auto") {
    if (quality === "auto") {
      this.enqueue(() => {
        this.manager.getPlayer()?.setPlaybackQuality("default");
      });
      this.store.setState({ selectedQuality: "auto" });
      return;
    }
    const label = this.availableQualities[quality];
    if (label) {
      this.enqueue(() => {
        this.manager.getPlayer()?.setPlaybackQuality(label);
      });
      this.store.setState({
        selectedQuality: quality,
        activeQuality: quality,
      });
    }
  }

  getQualities() {
    return this.store.getState().qualities;
  }

  setSource(options: SourceOptions) {
    this.lastAutoPlay = options.autoPlay;
    void this.loadSource(options);
  }

  retry() {
    if (this.videoId) {
      void this.loadSource({
        src: this.videoId,
        autoPlay: this.lastAutoPlay,
      });
    }
  }

  enterFullscreen() {
    return this.fullscreenEl.requestFullscreen?.() ?? Promise.resolve();
  }

  exitFullscreen() {
    return document.exitFullscreen?.() ?? Promise.resolve();
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      return this.exitFullscreen();
    }
    return this.enterFullscreen();
  }

  private handleFullscreenChange = () => {
    this.patchState({ isFullscreen: !!document.fullscreenElement });
  };

  toggleStretch() {
    const cur = this.store.getState().isStretched;
    this.patchState({ isStretched: !cur });
  }

  getState(): PlayerSnapshot {
    return this.store.getState();
  }

  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }

  setSecurityConfig(config: SecurityConfig) {
    if (this.securityManager) {
      this.securityManager.destroy();
    }
    this.store.setState({ isDevtoolsDetected: false });
    this.securityManager = new SecurityManager({
      root: this.root,
      video: null as any,
      store: this.store,
      controls: this,
      disableDevOptions: config.disableDevOptions,
    });
  }

  destroy() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    this.manager.destroy();
    this.securityManager?.destroy();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  // ─── Source Loading ─────────────────────────────────────────────────────

  private async loadSource(options: SourceOptions) {
    if (!options.src?.trim()) {
      const err = this.errorManager.emptySourceError();
      this.initialError = err;
      this.errorManager.raise(err);
      return;
    }

    // Don't destroy the manager here — if this is the first call from the
    // constructor, the manager was just created. destroy() sets isDestroyed = true
    // which prevents load() from working. Only destroy if we already loaded a previous source.
    this.isReady = false;
    this.readyQueue.length = 0;
    this.youtubeError = null;

    const videoId = extractYoutubeId(options.src) || options.src;
    this.videoId = videoId;
    this.pendingStartTime = options.startTime;

    this.patchState({
      ...createInitialPlayerState(options.src),
      volume: this.store.getState().volume,
      previousVolume: this.store.getState().previousVolume,
      isMuted: this.store.getState().isMuted,
      playbackRate: this.store.getState().playbackRate,
      isFullscreen: !!document.fullscreenElement,
    });

    try {
      const player = await this.manager.load(
        videoId,
        options.autoPlay,
        options.startTime,
      );
      if (!player) return;
      this.emit("sourcechange", options.src);
    } catch (error) {
      const err: PlayerError = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load YouTube video.",
        fatal: true,
        category: "source",
        raw: error instanceof Error ? error : undefined,
      };
      this.errorManager.raise(err);
    }
  }

  private patchState(update: Partial<PlayerState>) {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }
}
