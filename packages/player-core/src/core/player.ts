import { FullscreenManager } from "../managers/fullscreen-manager";
import { createInitialPlayerState, PlayerStore } from "./store";
import { KeyboardManager } from "../managers/keyboard-manager";
import { QualityManager } from "../managers/quality-manager";
import type { PlayerEventMap } from "../types/events.types";
import { AuthManager } from "../managers/auth-manager";
import Hls, { type HlsConfig } from "hls.js";
import { EventEmitter } from "./events";
import type {
  PlayerState,
  Unsubscribe,
  TokenFetcher,
  SourceOptions,
  PlayerControls,
  PlayerSnapshot,
  CreatePlayerOptions,
  PlayerStateListener,
} from "../types/player.types";
import {
  clamp,
  getLiveEdge,
  getBufferedEnd,
  getLiveLatency,
  getMediaDuration,
  getSeekableStart,
  isWithinLiveEdge,
  getBufferedRanges,
  getBufferedPercent,
} from "../utils/helpers";
import {
  createHls,
  attachHlsSource,
  canUseNativeHls,
  type HlsInstance,
} from "./hls";

// ─── Default live sync threshold ─────────────────────────────────────────────

const DEFAULT_LIVE_SYNC_DURATION = 5;

// ─── Player Class ────────────────────────────────────────────────────────────

export class Player
  extends EventEmitter<PlayerEventMap>
  implements PlayerControls
{
  private video: HTMLVideoElement;
  private src: string;
  private root: HTMLElement;
  private hls: HlsInstance | null = null;
  private store: PlayerStore;
  private qualityManager = new QualityManager();
  private fullscreenManager: FullscreenManager;
  private keyboardManager: KeyboardManager | null = null;
  private authManager: AuthManager | null = null;
  private cleanupCallbacks: Array<() => void> = [];

  // ── Configuration ──
  private liveSyncDuration: number;
  private lowLatency: boolean;
  private tokenFetcher: TokenFetcher | null;
  private pendingStartTime: number | undefined;

  // ── Error recovery ──
  private recoverAttempted = false;

  // ── Initial live positioning ──
  private initialLivePosSet = false;

  constructor(options: CreatePlayerOptions) {
    super();

    this.video = options.video;
    this.src = options.src;
    this.root = options.root || options.video;
    this.liveSyncDuration =
      options.liveSyncDuration ?? DEFAULT_LIVE_SYNC_DURATION;
    this.lowLatency = options.lowLatency ?? false;
    this.tokenFetcher = options.tokenFetcher ?? null;
    this.pendingStartTime = options.startTime;

    this.store = new PlayerStore(createInitialPlayerState(options.src));
    this.fullscreenManager = new FullscreenManager(
      this.root,
      this.handleFullscreenChange,
    );

    // Set up auth manager if tokenFetcher is provided
    if (this.tokenFetcher) {
      this.authManager = new AuthManager(this.tokenFetcher);
    }

    this.syncMediaState();
    this.attachEvents();
    void this.loadSource({
      src: options.src,
      autoPlay: options.autoPlay,
      startTime: options.startTime,
    });

    if (options.keyboard) {
      this.keyboardManager = new KeyboardManager({
        target: this.root,
        controls: this,
        getCurrentTime: () => this.video.currentTime,
        getMuted: () => this.video.muted,
        getVolume: () => this.video.volume,
      });
    }
  }

  // ─── Event Attachment ────────────────────────────────────────────────────

  private attachEvents() {
    this.listen(this.video, "loadedmetadata", () => {
      this.patchState({
        isReady: true,
        duration: getMediaDuration(this.video),
      });
      this.emit("ready", this.getState());

      // Apply startTime after media is loaded (not before, when it would be ignored)
      if (this.pendingStartTime !== undefined) {
        this.video.currentTime = this.pendingStartTime;
        this.pendingStartTime = undefined;
      }
    });

    this.listen(this.video, "play", () => {
      this.patchState({ isPlaying: true });
      this.emit("play", this.getState());
    });

    this.listen(this.video, "pause", () => {
      this.patchState({ isPlaying: false });
      this.emit("pause", this.getState());
    });

    this.listen(this.video, "ended", () => {
      this.patchState({ isPlaying: false, isBuffering: false });
      this.emit("ended", this.getState());
    });

    this.listen(this.video, "timeupdate", () => {
      const update: Partial<PlayerState> = {
        currentTime: this.video.currentTime,
        ...this.getBufferedState(),
      };

      // Update seekable range (crucial for live stream progress bar)
      if (this.video.seekable.length > 0) {
        update.seekableStart = this.video.seekable.start(0);
        update.seekableEnd = this.video.seekable.end(
          this.video.seekable.length - 1,
        );
      }

      // Update live stream edge tracking (no forced seeking)
      if (this.store.getState().isLive) {
        const isAtLiveEdge = isWithinLiveEdge(
          this.video,
          this.liveSyncDuration,
        );
        const liveLatency = getLiveLatency(this.video);
        const prevState = this.store.getState();

        update.isAtLiveEdge = isAtLiveEdge;
        update.liveLatency = liveLatency;

        // Emit livestatechange if edge state changed
        if (prevState.isAtLiveEdge !== isAtLiveEdge) {
          this.emit("livestatechange", {
            isLive: true,
            isAtLiveEdge,
            liveLatency,
            dvr: prevState.dvr,
          });
        }
      }

      this.patchState(update);
      this.emit("timeupdate", this.getState());
    });

    this.listen(this.video, "durationchange", () => {
      this.patchState({
        duration: getMediaDuration(this.video),
        ...this.getBufferedState(),
      });
      this.emit("durationchange", this.getState());
    });

    this.listen(this.video, "progress", () => {
      this.patchState(this.getBufferedState());
    });

    this.listen(this.video, "volumechange", () => {
      this.patchState({ volume: this.video.volume, isMuted: this.video.muted });
      this.emit("volumechange", this.getState());
    });

    this.listen(this.video, "seeking", () => {
      this.patchState({ currentTime: this.video.currentTime });
      this.emit("seeking", this.getState());
    });

    this.listen(this.video, "seeked", () => {
      this.patchState({ currentTime: this.video.currentTime });
      this.emit("seeked", this.getState());
    });

    this.listen(this.video, "waiting", () => {
      this.patchState({ isBuffering: true });
      this.emit("waiting", this.getState());
    });

    this.listen(this.video, "playing", () => {
      this.patchState({ isBuffering: false, isPlaying: true });
      this.emit("playing", this.getState());
    });

    this.listen(this.video, "error", () => {
      this.emit("error", {
        message: this.video.error?.message || "Video playback failed.",
        raw: this.video.error || undefined,
      });
    });
  }

  // ─── Public Control Methods ──────────────────────────────────────────────

  async play() {
    try {
      await this.video.play();
    } catch {
      // Browser blocked autoplay (user gesture required).
      // This is normal — the user can tap/click to start playback.
      // Do not re-throw; it would only pollute the console.
    }
  }

  pause() {
    this.video.pause();
  }

  async togglePlay() {
    if (this.video.paused) {
      await this.play();
      return;
    }

    this.pause();
  }

  seek(time: number) {
    const state = this.store.getState();

    if (state.isLive) {
      // For live streams, clamp to the seekable range
      const seekableStart = getSeekableStart(this.video);
      const seekableEnd = getLiveEdge(this.video);
      this.video.currentTime = clamp(time, seekableStart, seekableEnd);
    } else {
      this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    }

    this.patchState({ currentTime: this.video.currentTime });
  }

  /**
   * Jump to the live edge. No-op for VOD streams.
   */
  seekToLive() {
    if (!this.store.getState().isLive) {
      return;
    }

    const liveEdge = getLiveEdge(this.video);
    if (liveEdge > 0) {
      this.video.currentTime = liveEdge;
      this.patchState({
        currentTime: this.video.currentTime,
        isAtLiveEdge: true,
        liveLatency: 0,
      });
    }
  }

  /**
   * Convenience getter for checking if the current stream is live.
   */
  isLiveStream(): boolean {
    return this.store.getState().isLive;
  }

  setVolume(volume: number) {
    const clamped = clamp(volume, 0, 1);

    // Store current volume before changing (for mute restore)
    if (this.video.volume > 0 && clamped === 0) {
      this.patchState({ previousVolume: this.video.volume });
    }

    this.video.volume = clamped;
    this.video.muted = clamped === 0;
  }

  mute() {
    // Store current volume so unmute can restore it
    if (this.video.volume > 0) {
      this.patchState({ previousVolume: this.video.volume });
    }
    this.video.muted = true;
  }

  unmute() {
    this.video.muted = false;

    // Restore previous volume if current volume is 0
    if (this.video.volume === 0) {
      const previousVolume = this.store.getState().previousVolume;
      this.video.volume = previousVolume > 0 ? previousVolume : 0.5;
    }
  }

  setPlaybackRate(rate: number) {
    this.video.playbackRate = clamp(rate, 0.25, 4);
    this.patchState({ playbackRate: this.video.playbackRate });
  }

  setQuality(quality: number | "auto") {
    const qualities = this.qualityManager.getQualities();

    if (quality !== "auto" && !qualities[quality]) {
      return;
    }

    this.qualityManager.setQuality(quality);
    this.patchState({
      selectedQuality: this.qualityManager.getSelectedQuality(),
      activeQuality: this.qualityManager.getActiveQuality(),
    });
    this.emit(
      "qualitychange",
      quality === "auto" ? "auto" : qualities[quality],
    );
  }

  getQualities() {
    return this.qualityManager.getQualities();
  }

  setSource(options: SourceOptions) {
    void this.loadSource(options);
  }

  async enterFullscreen() {
    await this.fullscreenManager.enter();
  }

  async exitFullscreen() {
    await this.fullscreenManager.exit();
  }

  async toggleFullscreen() {
    await this.fullscreenManager.toggle();
  }

  toggleStretch() {
    const current = this.store.getState().isStretched;
    this.patchState({ isStretched: !current });
    this.video.style.objectFit = current ? "contain" : "fill";
  }

  getState(): PlayerSnapshot {
    return this.store.getState();
  }

  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }

  // ─── Destroy ─────────────────────────────────────────────────────────────

  destroy() {
    this.cleanupCallbacks.forEach((callback) => {
      callback();
    });
    this.cleanupCallbacks = [];

    this.keyboardManager?.destroy();
    this.fullscreenManager.destroy();
    this.authManager?.destroy();
    this.destroyHls();
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  // ─── Source Loading ──────────────────────────────────────────────────────

  private async loadSource(options: SourceOptions) {
    this.destroyHls();
    this.recoverAttempted = false;

    this.src = options.src;
    this.pendingStartTime = options.startTime;

    this.patchState({
      ...createInitialPlayerState(options.src),
      volume: this.video.volume,
      previousVolume: this.store.getState().previousVolume,
      isMuted: this.video.muted,
      playbackRate: this.video.playbackRate,
      isFullscreen: this.fullscreenManager.isFullscreen(),
    });

    // ── Authenticate if tokenFetcher is configured ──
    let streamUrl = options.src;

    if (this.authManager) {
      try {
        const tokenResult = await this.authManager.authenticate(options.src);
        streamUrl = tokenResult.url;

        // Set up callback to handle token refresh for long streams
        this.authManager.setRefreshCallback((newUrl) => {
          if (this.hls) {
            this.hls.loadSource(newUrl);
          }
        });
      } catch (error) {
        this.emit("error", {
          message: "Failed to authenticate stream.",
          raw: error instanceof Error ? error : undefined,
        });
        return;
      }
    }

    // ── Build HLS.js config ──
    const hlsConfig = this.buildHlsConfig();

    // When auth is configured, try to force hls.js even on iOS. Native HLS on
    // iOS does not pass custom headers or query parameters on segment requests
    // — it only respects cookies. hls.js applies auth headers/URL params to
    // every request via xhrSetup, making auth work reliably.
    const forceHls = !!this.authManager;
    this.hls = createHls(hlsConfig, forceHls);

    if (this.hls) {
      this.qualityManager.setHls(this.hls);
      this.attachHlsEvents();
      attachHlsSource(this.hls, this.video, streamUrl);
    } else if (canUseNativeHls(this.video)) {
      if (this.authManager) {
        // iOS native HLS detected with auth configured. Native HLS will NOT
        // apply custom headers or query params from the playlist URL to
        // segment requests. Your server must set cookies on the initial
        // playlist response so that subsequent segment requests carry auth.
        //
        // If you use Akamai (hdnts tokens), configure edge side to handle
        // this. For other CDNs, switch to cookie-based auth or force hls.js
        // (requires MSE support on iOS).
        this.emit("error", {
          message:
            "Authenticated HLS on iOS requires the server to set and read " +
            "cookies. hls.js could not be loaded on this device. Configure " +
            "your CDN for cookie-based auth, or ensure MSE is available.",
          fatal: true,
        });
      }

      this.video.src = streamUrl;

      // For native HLS (Safari), detect live from duration
      this.listen(this.video, "loadedmetadata", () => {
        if (!Number.isFinite(this.video.duration)) {
          this.detectLiveStream();
        }
      });
    } else {
      this.emit("error", {
        message: "This browser cannot play HLS streams.",
      });
    }

    if (options.autoPlay) {
      void this.play();
    }

    this.emit("sourcechange", options.src);
  }

  // ─── HLS.js Config Builder ──────────────────────────────────────────────

  private buildHlsConfig(): Partial<HlsConfig> {
    const config: Partial<HlsConfig> = {
      // Let hls.js handle live sync. It keeps playback ~3 segments behind the
      // live edge by gently adjusting playhead on each playlist refresh. This
      // is the standard industry behavior (YouTube, Twitch, Hulu).
      // When the user seeks backward into DVR territory, hls.js detects that
      // currentTime < liveEdge and stops syncing until the user seeks forward
      // again or clicks "Go Live".
      liveSyncDurationCount: 3,
    };

    // Low-latency HLS mode
    if (this.lowLatency) {
      config.enableWorker = true;
      config.lowLatencyMode = true;
      config.backBufferLength = 90;
    }

    // Auth headers via xhrSetup
    if (this.authManager) {
      const xhrSetup = this.authManager.getXhrSetup();
      if (xhrSetup) {
        config.xhrSetup = xhrSetup;
      }
    }

    return config;
  }

  // ─── HLS Event Handling ──────────────────────────────────────────────────

  private attachHlsEvents() {
    if (!this.hls) {
      return;
    }

    this.hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      this.syncQualities();

      // Apply startTime after manifest is parsed (for HLS.js)
      if (this.pendingStartTime !== undefined) {
        this.video.currentTime = this.pendingStartTime;
        this.pendingStartTime = undefined;
      }

      // Detect live stream from manifest
      if (data.levels && data.levels.length > 0) {
        // HLS.js sets duration to Infinity for live streams
        if (!Number.isFinite(this.video.duration)) {
          this.detectLiveStream();
        }
      }
    });

    this.hls.on(Hls.Events.LEVEL_UPDATED, (_event, data) => {
      // Detect live/VOD from level details
      if (data.details.live) {
        this.detectLiveStream();

        // First LEVEL_UPDATED with a live stream: seek to live edge.
        // At MANIFEST_PARSED time the seekable range is empty (getLiveEdge
        // returns 0) because hls.js hasn't loaded any segments yet.
        // LEVEL_UPDATED fires after the first segment is loaded, so this is
        // the earliest reliable opportunity to position at the live edge.
        if (!this.initialLivePosSet && this.pendingStartTime === undefined) {
          this.initialLivePosSet = true;
          const liveEdge = getLiveEdge(this.video);
          if (liveEdge > 0) {
            this.video.currentTime = liveEdge;
            this.patchState({
              currentTime: liveEdge,
              isAtLiveEdge: true,
              liveLatency: 0,
            });
          }
        }
      } else if (this.store.getState().isLive) {
        // Stream transitioned from live to VOD (broadcast ended)
        this.patchState({
          isLive: false,
          isAtLiveEdge: false,
          liveLatency: 0,
          dvr: false,
        });
        this.emit("livestatechange", {
          isLive: false,
          isAtLiveEdge: false,
          liveLatency: 0,
          dvr: false,
        });
      }
    });

    this.hls.on(Hls.Events.LEVELS_UPDATED, () => {
      this.syncQualities();
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      this.patchState({
        activeQuality: this.qualityManager.getActiveQuality(),
      });
    });

    this.hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        // Attempt error recovery before emitting
        if (!this.recoverAttempted && this.hls) {
          this.recoverAttempted = true;

          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls.recoverMediaError();
              return;
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.hls.startLoad(-1);
              return;
          }
        }

        // Recovery failed or not applicable — emit fatal error
        this.emit("error", {
          message: data.reason || data.details || "HLS playback failed.",
          fatal: true,
          details: data.details,
          raw: data,
        });
      } else {
        // Non-fatal error — still emit for logging but don't disrupt playback
        this.emit("error", {
          message: data.reason || data.details || "HLS playback warning.",
          fatal: false,
          details: data.details,
          raw: data,
        });
      }
    });
  }

  // ─── Live Stream Detection ───────────────────────────────────────────────

  private detectLiveStream() {
    const seekableStart = getSeekableStart(this.video);
    const seekableEnd = getLiveEdge(this.video);
    const seekableRange = seekableEnd - seekableStart;
    const dvr = seekableRange > this.liveSyncDuration;
    const isAtLiveEdge = isWithinLiveEdge(this.video, this.liveSyncDuration);
    const liveLatency = getLiveLatency(this.video);

    this.patchState({
      isLive: true,
      isAtLiveEdge,
      liveLatency,
      dvr,
      seekableStart,
      seekableEnd,
    });

    this.emit("livestatechange", {
      isLive: true,
      isAtLiveEdge,
      liveLatency,
      dvr,
    });
  }

  // ─── Internal Helpers ────────────────────────────────────────────────────

  private syncQualities() {
    const qualities = this.qualityManager.getQualities();

    this.patchState({
      qualities,
      selectedQuality: this.qualityManager.getSelectedQuality(),
      activeQuality: this.qualityManager.getActiveQuality(),
    });
    this.emit("qualitieschange", qualities);
  }

  private destroyHls() {
    this.hls?.destroy();
    this.hls = null;
    this.qualityManager.setHls(null);
  }

  private syncMediaState() {
    this.patchState({
      currentTime: this.video.currentTime,
      duration: getMediaDuration(this.video),
      volume: this.video.volume,
      isMuted: this.video.muted,
      isPlaying: !this.video.paused,
      playbackRate: this.video.playbackRate,
      isFullscreen: this.fullscreenManager.isFullscreen(),
      ...this.getBufferedState(),
    });
  }

  private getBufferedState() {
    return {
      buffered: getBufferedRanges(this.video),
      bufferedEnd: getBufferedEnd(this.video),
      bufferedPercent: getBufferedPercent(this.video),
    };
  }

  private patchState(update: Partial<PlayerState>) {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }

  private handleFullscreenChange = (isFullscreen: boolean) => {
    this.patchState({ isFullscreen });
    this.emit("fullscreenchange", isFullscreen);
  };

  private listen<TEvent extends keyof HTMLVideoElementEventMap>(
    target: HTMLVideoElement,
    event: TEvent,
    listener: (event: HTMLVideoElementEventMap[TEvent]) => void,
  ) {
    target.addEventListener(event, listener);
    this.cleanupCallbacks.push(() => {
      target.removeEventListener(event, listener);
    });
  }
}
