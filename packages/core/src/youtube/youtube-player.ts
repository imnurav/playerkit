import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { YoutubeLiveManager } from "./youtube-live-manager";
import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../constants";
import { PlayerStore, createInitialPlayerState } from "../shared/store";
import { SecurityManager } from "../shared/security-manager";
import { YoutubeManager } from "./youtube-manager";
import { YouTubePlayerState } from "../types/youtube.types";
import { ErrorManager } from "../shared/error-manager";
import { extractYoutubeId } from "../utils/url";
import { logger } from "../utils/logger";
import { clamp } from "../utils/helpers";
import { EventEmitter } from "../shared/events";
import type {
  PlayerState,
  Unsubscribe,
  QualityLevel,
  SourceOptions,
  PlayerSnapshot,
  SecurityConfig,
  PlayerStateListener,
  CreatePlayerOptions,
} from "../types/player.types";

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
 * YoutubePlayer — wraps the YouTube IFrame Player API behind the same
 * PlayerControls interface as the HLS Player, so the React UI layer
 * works interchangeably.
 */
export class YoutubePlayer extends EventEmitter<PlayerEventMap> {
  private root: HTMLElement;
  /**
   * The element used for requestFullscreen(). Defaults to `root` but should
   * be set to the outer `.pk-player` wrapper div so that all React event
   * handlers (onClick, onPointerMove, etc.) remain inside the fullscreen
   * layer and controls continue to work.
   */
  private fullscreenEl: HTMLElement;
  private store: PlayerStore;
  private manager: YoutubeManager;
  private liveManager: YoutubeLiveManager;
  private errorManager: ErrorManager;
  private securityManager: SecurityManager | null = null;
  private videoId: string;
  private state: YouTubePlayerState = YouTubePlayerState.UNSTARTED;
  private bufferingTimeout: any = null;
  private bufferingHideTimeout: any = null;
  private spinnerShownAt = 0;
  private lastPlayClickedAt = 0;
  private lastSeekAt = 0;
  private lastAutoPlay: boolean | undefined;
  /** Whether the player has received its ready event. */
  private isReady = false;
  /** Queue of commands to execute after ready. */
  private readyQueue: Array<() => void> = [];
  /** Track duration for VOD duration. */
  private duration = 0;
  /** Available quality levels from YouTube. */
  private availableQualities: string[] = [];
  /** First error during initialization. */
  initialError: PlayerError | null = null;

  // Live stream state tracking
  private lockTimeUpdateUntil = 0;
  private lastDurationSyncTime = 0;

  constructor(options: CreatePlayerOptions) {
    super();
    if (options.logLevel) {
      logger.setLevel(options.logLevel);
    }
    this.root = options.root || options.video;
    // Use dedicated fullscreen element if provided (should be the outer .pk-player
    // wrapper so all React handlers stay inside the fullscreen layer).
    this.fullscreenEl = options.fullscreenElement ?? this.root;
    this.videoId = extractYoutubeId(options.src) || options.src;
    this.lastAutoPlay = options.autoPlay;

    const initialState = createInitialPlayerState(options.src);
    this.store = new PlayerStore(initialState);

    this.liveManager = new YoutubeLiveManager(
      this,
      this.store,
      options.live?.dvr,
    );

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
      video: null, // YouTube ignores this - security is CSS-based
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
    this.syncLiveStatus();
    this.syncQualities();

    const isLive = this.store.getState().isLive;
    const update: Partial<PlayerState> = {
      isReady: true,
      duration: this.duration,
      isLive,
      initialSyncCompleted: false, // Keep poster up initially for both VOD/Live until play starts and sync completes
    };
    if (isLive) {
      this.liveManager.reset();
      update.isAtLiveEdge = true;
      update.dvr = false; // Default to false initially to prevent visual slider jitter
      update.seekableStart = 0;
      update.seekableEnd = 0;
      update.liveLatency = 0;
    }

    this.patchState(update);
    this.emit("ready", this.getState());

    // Execute queued commands
    const queue = this.readyQueue.slice();
    this.readyQueue.length = 0;
    queue.forEach((fn) => fn());
  }

  private showBufferingSpinner() {
    if (this.bufferingHideTimeout) {
      clearTimeout(this.bufferingHideTimeout);
      this.bufferingHideTimeout = null;
    }
    if (this.store.getState().isBuffering) return;

    this.patchState({ isBuffering: true });
    this.spinnerShownAt = Date.now();
  }

  private hideBufferingSpinner() {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }

    if (this.bufferingHideTimeout) {
      return; // Hide is already scheduled
    }

    const state = this.store.getState();
    if (!state.isBuffering) return;

    const MIN_SPINNER_SHOW_TIME = 250; // ms
    const timeShown = Date.now() - this.spinnerShownAt;
    const remainingTime = MIN_SPINNER_SHOW_TIME - timeShown;

    if (remainingTime > 0) {
      this.bufferingHideTimeout = setTimeout(() => {
        this.patchState({ isBuffering: false });
        this.bufferingHideTimeout = null;
      }, remainingTime);
    } else {
      this.patchState({ isBuffering: false });
    }
  }

  private handleStateChange(ytState: YouTubePlayerState) {
    this.state = ytState;
    const update: Partial<PlayerState> = {};

    switch (ytState) {
      case YouTubePlayerState.PLAYING:
        update.isPlaying = true;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        this.syncDuration();
        this.syncLiveStatus(); // Populate correct isLive status as soon as stream plays and meta settles

        // VOD streams don't require background edge seek syncing, mark as complete instantly
        const isLive = this.store.getState().isLive;
        if (!isLive) {
          this.liveManager.setInitialSyncCompleted(true);
        }

        this.emit("play", this.getState());
        break;
      case YouTubePlayerState.PAUSED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.startPauseTimer();
        this.emit("pause", this.getState());
        break;
      case YouTubePlayerState.BUFFERING:
        // Use a longer debounce window (800ms) for initial play/seek transitions to avoid loader flash.
        // Mid-playback stalls use a shorter debounce (250ms) to show the spinner quickly.
        const timeSincePlay = Date.now() - this.lastPlayClickedAt;
        const timeSinceSeek = Date.now() - this.lastSeekAt;
        const isTransientState = timeSincePlay < 1000 || timeSinceSeek < 1000;
        const debounceTime = isTransientState ? 800 : 250;

        if (!this.bufferingTimeout) {
          this.bufferingTimeout = setTimeout(() => {
            this.showBufferingSpinner();
            this.bufferingTimeout = null;
          }, debounceTime);
        }
        break;
      case YouTubePlayerState.ENDED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        this.emit("ended", this.getState());
        break;
      case YouTubePlayerState.CUED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        break;
      default:
        // UNSTARTED
        update.isPlaying = false;
        this.hideBufferingSpinner();
        break;
    }

    this.patchState(update);
  }

  private handleError(errorCode: number) {
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
    if (Date.now() < this.lockTimeUpdateUntil) {
      // Ignore polling updates during seek settling
      return;
    }

    const state = this.store.getState();

    // Ignore time updates while the player is buffering
    if (state.isBuffering) {
      return;
    }

    // Ignore transient updates of exactly 0 if we were previously past 1s
    // (YouTube API bug during buffer reload)
    if (currentTime === 0 && state.currentTime > 1.0) {
      return;
    }

    let isLive = state.isLive;
    const now = Date.now();

    // CPU & postMessage traffic optimization + active duration growth tracking:
    if (!isLive) {
      if (this.duration === 0) {
        this.syncDuration();
      } else if (now - this.lastDurationSyncTime > 1500) {
        const oldDur = this.duration;
        this.syncDuration();
        this.lastDurationSyncTime = now;

        // If the duration is increasing while playing, it is a live stream!
        if (oldDur > 0 && this.duration > oldDur + 0.8) {
          logger.info(
            `[handleTimeUpdate] Detected live stream via duration growth:\n` +
              `• Previous Duration: ${oldDur.toFixed(1)}s\n` +
              `• Current Duration: ${this.duration.toFixed(1)}s`,
          );
          isLive = true;
          this.store.setState({ isLive: true });
        }
      }
    } else {
      if (now - this.lastDurationSyncTime > 1000) {
        this.syncDuration();
        this.lastDurationSyncTime = now;
      }
    }

    // Heuristical live stream fallback checks
    if (!isLive) {
      const nativePlayer = this.manager.getPlayer();
      if (nativePlayer) {
        try {
          const dur = nativePlayer.getDuration() || 0;
          const curr = nativePlayer.getCurrentTime() || 0;
          if (dur === 0 && curr > 10) {
            logger.info(
              `[handleTimeUpdate] Detected live stream via heuristic (duration === 0 && currentTime > 10)`,
            );
            isLive = true;
            this.store.setState({ isLive: true });
          }
        } catch {}
      }
    }

    if (isLive) {
      this.liveManager.evaluate(
        currentTime,
        this.duration,
        this.state === YouTubePlayerState.PLAYING,
      );
    } else {
      this.patchState({
        currentTime,
        duration: this.duration,
        isLive,
      });
    }

    this.emit("timeupdate", this.getState());
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

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

  private syncLiveStatus() {
    try {
      const player = this.manager.getPlayer();
      if (!player) return;
      const videoData = (player as any).getVideoData?.();

      let isLive = !!(videoData?.isLive || videoData?.isLiveStream);

      // Heuristical live status fallback
      const duration = player.getDuration() || 0;
      const currentTime = player.getCurrentTime() || 0;
      if (!isLive) {
        if (duration === 0 && currentTime > 10) {
          isLive = true;
        }
      }

      const prevLive = this.store.getState().isLive;

      if (prevLive !== isLive) {
        logger.info(
          `Live Status Synced\n` +
            `• Source Property: player.getVideoData().isLive\n` +
            `• Stream Type: ${isLive ? "LIVE STREAM 🔴" : "VOD (Video On Demand) 🎬"}\n` +
            `• Video ID: ${videoData?.video_id || this.videoId}\n` +
            `• Title: "${videoData?.title || "Unknown"}"\n` +
            `• Author: "${videoData?.author || "Unknown"}"\n` +
            `----------------------------------------\n` +
            `Full player.getVideoData() payload:`,
          videoData,
        );
      }

      this.store.setState({
        isLive,
        dvr: isLive
          ? (this.liveManager.getDvrDetected() ?? false)
          : this.store.getState().dvr,
      });
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

      const qualities: QualityLevel[] = this.availableQualities.map((q, i) => ({
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
      this.emit("qualitieschange", qualities);
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

  private startPauseTimer() {
    this.liveManager.startPausePolling();
  }

  private stopPauseTimer() {
    this.liveManager.stopPausePolling();
  }

  // ─── PlayerControls Implementation ──────────────────────────────────────

  async play() {
    this.lastPlayClickedAt = Date.now();
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
    const state = this.store.getState();
    let targetTime = time;

    this.lastSeekAt = Date.now();
    // Set lock to ignore asynchronous polling updates during seek settling for all streams
    this.lockTimeUpdateUntil = Date.now() + 1200;

    if (state.isLive) {
      if (!state.dvr) {
        // Seeking is disabled on YouTube Live streams without DVR
        return;
      }

      this.liveManager.onSeek(time, this.duration);
      const seekableEnd = Math.max(
        0,
        this.duration - this.liveManager.getMinObservedLatency(),
      );
      const seekableStart = Math.max(0, seekableEnd - 43200);
      targetTime = clamp(time, seekableStart, seekableEnd);
    } else {
      targetTime = clamp(time, 0, this.duration);
    }

    this.patchState({ currentTime: targetTime });
    this.enqueue(() => this.manager.queueSeek(targetTime));
  }

  seekToLive() {
    const state = this.getState();
    if (state.isLive && state.dvr) {
      this.liveManager.seekToLive(this.duration);

      if (state.playbackRate > 1) {
        this.setPlaybackRate(1);
      }
    }
  }

  isLiveStream() {
    return this.store.getState().isLive;
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
      video: null,
      store: this.store,
      controls: this,
      disableDevOptions: config.disableDevOptions,
    });
  }

  destroy() {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }
    if (this.bufferingHideTimeout) {
      clearTimeout(this.bufferingHideTimeout);
      this.bufferingHideTimeout = null;
    }
    document.removeEventListener(
      "fullscreenchange",
      this.handleFullscreenChange,
    );
    this.liveManager.destroy();
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

    const videoId = extractYoutubeId(options.src) || options.src;
    this.videoId = videoId;

    this.liveManager.reset();
    this.liveManager.setHasExplicitStartTime(options.startTime !== undefined);

    this.patchState({
      ...createInitialPlayerState(options.src),
      volume: this.store.getState().volume,
      previousVolume: this.store.getState().previousVolume,
      isMuted: this.store.getState().isMuted,
      playbackRate: this.store.getState().playbackRate,
      isFullscreen: !!document.fullscreenElement,
      initialSyncCompleted: false,
      isBuffering: false,
    });

    const INITIAL_LOAD_DEBOUNCE_TIME = 300; // ms
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
    }
    this.bufferingTimeout = setTimeout(() => {
      this.showBufferingSpinner();
      this.bufferingTimeout = null;
    }, INITIAL_LOAD_DEBOUNCE_TIME);

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

  getVideoId() {
    return this.videoId;
  }

  getNativePlayer() {
    return this.manager.getPlayer();
  }

  triggerTimeUpdate(currentTime: number) {
    this.handleTimeUpdate(currentTime);
  }
}
