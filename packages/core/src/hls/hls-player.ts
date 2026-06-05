import { HlsManager, LevelUpdatePayload } from "./hls-manager";
import { logger } from "../utils/logger";
import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { FullscreenManager } from "../shared/fullscreen-manager";
import { createInitialPlayerState, PlayerStore } from "../shared/store";
import { KeyboardManager } from "../shared/keyboard-manager";
import { SecurityManager } from "../shared/security-manager";
import { NetworkManager } from "../shared/network-manager";
import { ErrorManager } from "../shared/error-manager";
import { AuthManager } from "./auth-manager";
import { LiveManager } from "./live-manager";
import { EventEmitter } from "../shared/events";
import type {
  PlayerState,
  Unsubscribe,
  SourceOptions,
  PlayerSnapshot,
  PlayerStateListener,
  CreatePlayerOptions,
  SecurityConfig,
} from "../types/player.types";
import {
  clamp,
  getLiveEdge,
  getBufferedEnd,
  isTimeBuffered,
  getMediaDuration,
  getSeekableStart,
  getBufferedRanges,
  getBufferedPercent,
} from "../utils/helpers";
import {
  MIN_PLAYBACK_RATE,
  MAX_PLAYBACK_RATE,
  DEFAULT_LIVE_SYNC_DURATION,
} from "../constants";

export class Player extends EventEmitter<PlayerEventMap> {
  private src: string;
  private root: HTMLElement;
  private store: PlayerStore;
  private hlsManager: HlsManager;
  private video: HTMLVideoElement;
  private liveManager: LiveManager;
  private errorManager: ErrorManager;
  private networkManager: NetworkManager;
  private lastAutoPlay: boolean | undefined;
  private fullscreenManager: FullscreenManager;
  private pendingStartTime: number | undefined;
  private authManager: AuthManager | null = null;
  private cleanupCallbacks: Array<() => void> = [];
  private keyboardManager: KeyboardManager | null = null;
  private securityManager: SecurityManager | null = null;
  /** The first error encountered during player initialization (before events can be listened to). */
  initialError: PlayerError | null = null;

  constructor(options: CreatePlayerOptions) {
    super();
    if (options.logLevel) {
      logger.setLevel(options.logLevel);
    }
    this.video = options.video;
    this.src = options.src;
    this.root = options.root || options.video;
    this.pendingStartTime = options.startTime;
    this.lastAutoPlay = options.autoPlay;
    if (options.tokenFetcher)
      this.authManager = new AuthManager(options.tokenFetcher);

    const live = options.live ?? {};
    const liveSyncDuration = live.syncDuration ?? DEFAULT_LIVE_SYNC_DURATION;
    this.store = new PlayerStore(createInitialPlayerState(options.src));

    // ErrorManager is created first — all other managers that can emit errors
    // receive it as a dependency rather than building PlayerError objects themselves.
    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    this.fullscreenManager = new FullscreenManager(this.root, (v) => {
      this.patchState({ isFullscreen: v });
      this.emit("fullscreenchange", v);
    });
    this.liveManager = new LiveManager(
      this.video,
      this.store,
      (p) => this.emit("livestatechange", p),
      liveSyncDuration,
    );

    const xhrSetup = this.authManager?.getXhrSetup() ?? null;
    this.hlsManager = new HlsManager(
      this.video,
      this.store,
      {
        onQualitiesChange: (q) => this.emit("qualitieschange", q),
        onQualityChange: (q) => this.emit("qualitychange", q),
        onLevelUpdated: (p) => this.handleLevelUpdate(p),
      },
      this.errorManager,
      live.lowLatency ?? false,
      xhrSetup,
    );

    this.networkManager = new NetworkManager(this.errorManager, () =>
      this.retry(),
    );
    this.syncMediaState();
    this.attachVideoEvents();
    this.networkManager.attach();
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
        getPlaybackRate: () => this.video.playbackRate,
      });
    }

    const security = options.security ?? {};
    this.securityManager = new SecurityManager({
      root: this.root,
      video: this.video,
      store: this.store,
      controls: this,
      disableDevOptions: security.disableDevOptions,
    });
  }

  private attachVideoEvents() {
    const on = <TEvent extends keyof HTMLVideoElementEventMap>(
      event: TEvent,
      listener: (e: HTMLVideoElementEventMap[TEvent]) => void,
    ) => {
      this.video.addEventListener(event, listener);
      this.cleanupCallbacks.push(() =>
        this.video.removeEventListener(event, listener),
      );
    };

    on("loadedmetadata", () => {
      this.patchState({
        isReady: true,
        duration: getMediaDuration(this.video),
      });
      this.emit("ready", this.getState());
      if (this.pendingStartTime !== undefined) {
        this.video.currentTime = this.pendingStartTime;
        this.pendingStartTime = undefined;
      }
    });
    on("play", () => {
      this.liveManager.stopPausePolling();
      this.patchState({ isPlaying: true });
      this.emit("play", this.getState());
    });
    on("pause", () => {
      this.patchState({ isPlaying: false, isBuffering: false });
      this.liveManager.startPausePolling();
      this.emit("pause", this.getState());
    });
    on("ended", () => {
      this.liveManager.stopPausePolling();
      this.patchState({ isPlaying: false, isBuffering: false });
      this.emit("ended", this.getState());
    });
    on("timeupdate", () => {
      const update: Partial<PlayerState> = {
        currentTime: this.video.currentTime,
        ...this.getBuffered(),
      };
      if (this.video.seekable.length > 0) {
        update.seekableStart = this.video.seekable.start(0);
        update.seekableEnd = this.video.seekable.end(
          this.video.seekable.length - 1,
        );
      }
      if (this.store.getState().isLive) {
        // Use computeLiveSnapshot() so we can merge isAtLiveEdge + liveLatency
        // into this single patchState call — avoids two separate store writes
        // (and two React re-renders) per timeupdate tick.
        const live = this.liveManager.computeLiveSnapshot();
        if (live) {
          const prev = this.store.getState();
          update.isAtLiveEdge = live.isAtLiveEdge;
          update.liveLatency = live.liveLatency;

          // Auto-reset playback speed when the player catches back up to the
          // live edge. If the user set speed to e.g. 2x to close the gap,
          // keeping it at 2x past the live edge causes constant buffering.
          if (
            !prev.isAtLiveEdge &&
            live.isAtLiveEdge &&
            this.video.playbackRate > 1
          ) {
            this.video.playbackRate = 1;
            update.playbackRate = 1;
          }

          // Emit the livestatechange event if the at-edge flag flipped.
          // Deferred via queueMicrotask so listeners see consistent state.
          if (prev.isAtLiveEdge !== live.isAtLiveEdge) {
            queueMicrotask(() =>
              this.emit("livestatechange", {
                isLive: true,
                isAtLiveEdge: live.isAtLiveEdge,
                liveLatency: live.liveLatency,
                dvr: this.store.getState().dvr,
              }),
            );
          }
        }
      }
      this.patchState(update);
      this.emit("timeupdate", this.getState());
    });
    on("durationchange", () =>
      this.patchState({
        duration: getMediaDuration(this.video),
        ...this.getBuffered(),
      }),
    );
    on("progress", () => this.patchState(this.getBuffered()));
    on("volumechange", () =>
      this.patchState({ volume: this.video.volume, isMuted: this.video.muted }),
    );
    on("seeking", () => {
      const isBuf = !isTimeBuffered(this.video, this.video.currentTime);
      this.patchState({
        currentTime: this.video.currentTime,
        isBuffering: isBuf,
      });
    });
    on("seeked", () =>
      this.patchState({
        currentTime: this.video.currentTime,
        isBuffering: false,
      }),
    );
    on("waiting", () => {
      if (
        !this.video.paused &&
        !isTimeBuffered(this.video, this.video.currentTime)
      ) {
        this.patchState({ isBuffering: true });
      }
    });
    on("playing", () =>
      this.patchState({ isBuffering: false, isPlaying: true }),
    );
    on("error", () =>
      // Delegate HTMLVideoElement media errors to ErrorManager for consistent
      // message formatting and state writing.
      this.errorManager.raise(
        this.errorManager.mediaElementError(this.video.error),
      ),
    );
  }

  private handleLevelUpdate(payload: LevelUpdatePayload) {
    if (payload.isLive) {
      this.liveManager.detectLive();
      if (this.pendingStartTime === undefined)
        this.liveManager.tryInitialSync();
    } else if (this.store.getState().isLive) this.liveManager.markVod();
  }

  /** Play the video stream. Returns a promise that resolves when playback starts. */
  async play() {
    try {
      await this.video.play();
    } catch (err: any) {
      if (err && err.name === "NotAllowedError" && !this.video.muted) {
        logger.warn(
          "[Player] Unmuted autoplay blocked by browser policy, retrying muted...",
        );
        this.mute();
        try {
          await this.video.play();
        } catch (retryErr) {
          logger.error("[Player] Muted autoplay also blocked:", retryErr);
        }
      } else {
        logger.error("[Player] Playback failed:", err);
      }
    }
  }

  /** Pause the video stream. */
  pause() {
    this.video.pause();
  }

  /** Toggle play/pause state based on the current video paused state. */
  async togglePlay() {
    if (this.video.paused) await this.play();
    else this.pause();
  }

  /** Seek to a specific time (in seconds). For live streams, clamps within seekable bounds and updates live edges. */
  seek(time: number) {
    const state = this.store.getState();
    if (state.isLive) {
      this.video.currentTime = clamp(
        time,
        getSeekableStart(this.video),
        getLiveEdge(this.video),
      );
      this.liveManager.onSeek(time);
    } else
      this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    this.patchState({ currentTime: this.video.currentTime });
  }

  /** Jump straight to the live edge position. (Live streams only) */
  seekToLive() {
    if (!this.store.getState().isLive) return;
    this.liveManager.seekToLive();
    // If the user was using elevated speed to catch up, snap back to 1x
    // when they press "Go Live" — otherwise they'd immediately overshoot.
    if (this.video.playbackRate > 1) {
      this.video.playbackRate = 1;
      this.patchState({ playbackRate: 1 });
    }
  }

  /** Check if the currently loaded stream is a live stream. */
  isLiveStream() {
    return this.store.getState().isLive;
  }

  /** Set the volume level of the video element between 0 and 1. Automatically mutes if volume is 0. */
  setVolume(vol: number) {
    const c = clamp(vol, 0, 1);
    if (this.video.volume > 0 && c === 0)
      this.patchState({ previousVolume: this.video.volume });
    this.video.volume = c;
    this.video.muted = c === 0;
  }

  /** Mute the video element volume. */
  mute() {
    if (this.video.volume > 0)
      this.patchState({ previousVolume: this.video.volume });
    this.video.muted = true;
  }

  /** Unmute the video element volume. Restores to previous non-zero volume or defaults to 0.5. */
  unmute() {
    this.video.muted = false;
    if (this.video.volume === 0)
      this.video.volume =
        this.store.getState().previousVolume > 0
          ? this.store.getState().previousVolume
          : 0.5;
  }

  /** Set the playback rate (speed) of the video. Clamped between MIN_PLAYBACK_RATE (0.25) and MAX_PLAYBACK_RATE (4). */
  setPlaybackRate(rate: number) {
    this.video.playbackRate = clamp(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
    this.patchState({ playbackRate: this.video.playbackRate });
  }

  /** Set the active hls.js stream quality level index or "auto". */
  setQuality(quality: number | "auto") {
    this.hlsManager.setQuality(quality);
  }

  /** Retrieve the list of available qualities parsed from the stream manifest. */
  getQualities() {
    return this.hlsManager.getQualities();
  }

  /** Load a new video source with optional autoPlay and startTime offsets. */
  setSource(options: SourceOptions) {
    this.lastAutoPlay = options.autoPlay;
    void this.loadSource(options);
  }

  /** Retry loading the current source stream (useful to recover from network errors). */
  retry() {
    if (this.src)
      void this.loadSource({ src: this.src, autoPlay: this.lastAutoPlay });
  }

  /** Enter fullscreen mode for the player root container. */
  enterFullscreen() {
    return this.fullscreenManager.enter();
  }

  /** Exit fullscreen mode. */
  exitFullscreen() {
    return this.fullscreenManager.exit();
  }

  /** Toggle fullscreen mode. */
  toggleFullscreen() {
    return this.fullscreenManager.toggle();
  }

  /** Toggle video container stretch between cover/fill and standard contain bounds. */
  toggleStretch() {
    const cur = this.store.getState().isStretched;
    this.patchState({ isStretched: !cur });
    this.video.style.objectFit = cur ? "contain" : "fill";
  }

  /** Get a snapshot of the current player state variables. */
  getState(): PlayerSnapshot {
    return this.store.getState();
  }

  /** Subscribe to player state changes. Returns an unsubscribe function. */
  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }

  destroy() {
    this.liveManager.destroy();
    this.hlsManager.destroy();
    this.networkManager.destroy();
    this.cleanupCallbacks.forEach((c) => c());
    this.cleanupCallbacks = [];
    this.keyboardManager?.destroy();
    this.securityManager?.destroy();
    this.fullscreenManager.destroy();
    this.authManager?.destroy();
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  private async loadSource(options: SourceOptions) {
    this.liveManager.reset();
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

    if (!options.src?.trim()) {
      const err = this.errorManager.emptySourceError();
      this.initialError = err;
      this.errorManager.raise(err);
      return;
    }

    let streamUrl = options.src;
    if (this.authManager) {
      try {
        const result = await this.authManager.authenticate(options.src);
        streamUrl = result.url;
      } catch (error) {
        this.errorManager.raise(this.errorManager.authError(error));
        return;
      }
    }

    const hlsUsed = this.hlsManager.loadStream(streamUrl);
    if (!hlsUsed)
      this.listen(this.video, "loadedmetadata", () => {
        if (!Number.isFinite(this.video.duration))
          this.liveManager.detectLive();
      });
    if (options.autoPlay) void this.play();
    this.emit("sourcechange", options.src);
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
      ...this.getBuffered(),
    });
  }
  private getBuffered() {
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
  setSecurityConfig(config: SecurityConfig) {
    if (this.securityManager) {
      this.securityManager.destroy();
    }

    // Reset devtools detection flag if security config changes
    this.store.setState({ isDevtoolsDetected: false });

    this.securityManager = new SecurityManager({
      root: this.root,
      video: this.video,
      store: this.store,
      controls: this,
      disableDevOptions: config.disableDevOptions,
    });
  }
  private listen = <TEvent extends keyof HTMLVideoElementEventMap>(
    target: HTMLVideoElement,
    event: TEvent,
    listener: (e: HTMLVideoElementEventMap[TEvent]) => void,
  ) => {
    target.addEventListener(event, listener);
    this.cleanupCallbacks.push(() =>
      target.removeEventListener(event, listener),
    );
  };
}
