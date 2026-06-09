import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { PlayerStore, createInitialPlayerState } from "../shared/store";
import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../constants";
import { FullscreenManager } from "../shared/fullscreen-manager";
import { KeyboardManager } from "../shared/keyboard-manager";
import { SecurityManager } from "../shared/security-manager";
import { NetworkManager } from "../shared/network-manager";
import { ErrorManager } from "../shared/error-manager";
import { AuthManager } from "../hls/auth-manager";
import { EventEmitter } from "../shared/events";
import { Mp4Manager } from "./mp4-manager";
import { logger } from "../utils/logger";
import { clamp } from "../utils/helpers";
import {
  getBufferedEnd,
  isTimeBuffered,
  getMediaDuration,
  getBufferedRanges,
  getBufferedPercent,
} from "../utils/helpers";
import type {
  PlayerState,
  Unsubscribe,
  TokenFetcher,
  SourceOptions,
  PlayerSnapshot,
  SecurityConfig,
  PlayerStateListener,
  CreatePlayerOptions,
} from "../types/player.types";

/**
 * Mp4Player — headless progressive MP4 player.
 *
 * Wraps a native HTML5 <video> element behind the same PlayerControls
 * interface exposed by the HLS and YouTube engines, so the React UI layer
 * can switch between engines without knowing which one is active.
 *
 * Design notes:
 *  - No adaptive bitrate / quality switcher (MP4 has a single rendition).
 *  - No live / DVR / latency support. Progressive MP4 is VOD only.
 *  - Re-uses the HLS `AuthManager` for the optional `tokenFetcher` path
 *    since the auth workflow is identical (sign URL → load → refresh).
 *  - The same shared managers (Fullscreen, Keyboard, Security, Network,
 *    Error, Store) are wired in for feature parity.
 */
export class Mp4Player extends EventEmitter<PlayerEventMap> {
  private src: string;
  private root: HTMLElement;
  private store: PlayerStore;
  private mp4Manager: Mp4Manager;
  private video: HTMLVideoElement;
  private errorManager: ErrorManager;
  private networkManager: NetworkManager;
  private lastAutoPlay: boolean | undefined;
  private fullscreenManager: FullscreenManager;
  private pendingStartTime: number | undefined;
  private authManager: AuthManager | null = null;
  private tokenFetcher: TokenFetcher | undefined;
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
    this.tokenFetcher = options.tokenFetcher;
    if (this.tokenFetcher)
      this.authManager = new AuthManager(this.tokenFetcher);

    this.store = new PlayerStore(createInitialPlayerState(options.src));

    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    this.fullscreenManager = new FullscreenManager(this.root, (v) => {
      this.patchState({ isFullscreen: v });
      this.emit("fullscreenchange", v);
    });

    this.mp4Manager = new Mp4Manager(this.video, this.errorManager);

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

  // ─── Native HTML5 video event wiring ────────────────────────────────────

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
      this.patchState({ isPlaying: true });
      this.emit("play", this.getState());
    });
    on("pause", () => {
      this.patchState({ isPlaying: false, isBuffering: false });
      this.emit("pause", this.getState());
    });
    on("ended", () => {
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
    // The native `error` event is also handled by Mp4Manager so the manager
    // can raise it via the central ErrorManager. We intentionally don't
    // double-handle it here to avoid duplicate state writes.
  }

  // ─── PlayerControls implementation ──────────────────────────────────────

  async play() {
    try {
      await this.video.play();
    } catch (err: any) {
      if (err && err.name === "NotAllowedError" && !this.video.muted) {
        logger.warn(
          "[Mp4Player] Unmuted autoplay blocked by browser policy, retrying muted...",
        );
        this.mute();
        try {
          await this.video.play();
        } catch (retryErr) {
          logger.error("[Mp4Player] Muted autoplay also blocked:", retryErr);
        }
      } else {
        logger.error("[Mp4Player] Playback failed:", err);
      }
    }
  }

  pause() {
    this.video.pause();
  }

  async togglePlay() {
    if (this.video.paused) await this.play();
    else this.pause();
  }

  seek(time: number) {
    this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    this.patchState({ currentTime: this.video.currentTime });
  }

  /** No-op for progressive MP4 — there is no live edge. */
  seekToLive() {
    /* MP4 is always VOD */
  }

  /** MP4 is always VOD; this always returns false. */
  isLiveStream() {
    return false;
  }

  setVolume(vol: number) {
    const c = clamp(vol, 0, 1);
    if (this.video.volume > 0 && c === 0)
      this.patchState({ previousVolume: this.video.volume });
    this.video.volume = c;
    this.video.muted = c === 0;
  }

  mute() {
    if (this.video.volume > 0)
      this.patchState({ previousVolume: this.video.volume });
    this.video.muted = true;
  }

  unmute() {
    this.video.muted = false;
    if (this.video.volume === 0)
      this.video.volume =
        this.store.getState().previousVolume > 0
          ? this.store.getState().previousVolume
          : 0.5;
  }

  setPlaybackRate(rate: number) {
    this.video.playbackRate = clamp(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
    this.patchState({ playbackRate: this.video.playbackRate });
  }

  /**
   * MP4 has a single rendition. The method is kept on the interface so the
   * UI settings panel works uniformly, but it is a no-op for progressive
   * downloads.
   */
  setQuality(_quality: number | "auto") {
    /* MP4 has a single rendition */
  }

  getQualities() {
    return this.store.getState().qualities;
  }

  setSource(options: SourceOptions) {
    this.lastAutoPlay = options.autoPlay;
    void this.loadSource(options);
  }

  retry() {
    if (this.src)
      void this.loadSource({ src: this.src, autoPlay: this.lastAutoPlay });
  }

  enterFullscreen() {
    return this.fullscreenManager.enter();
  }

  exitFullscreen() {
    return this.fullscreenManager.exit();
  }

  toggleFullscreen() {
    return this.fullscreenManager.toggle();
  }

  toggleStretch() {
    const cur = this.store.getState().isStretched;
    this.patchState({ isStretched: !cur });
    this.video.style.objectFit = cur ? "contain" : "fill";
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
      video: this.video,
      store: this.store,
      controls: this,
      disableDevOptions: config.disableDevOptions,
    });
  }

  destroy() {
    this.mp4Manager.destroy();
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

  // ─── Source loading ─────────────────────────────────────────────────────

  private async loadSource(options: SourceOptions) {
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

    this.syncAuthManager();

    if (!options.src?.trim() && !this.authManager) {
      const err = this.errorManager.emptySourceError();
      this.initialError = err;
      this.errorManager.raise(err);
      return;
    }

    let streamUrl = options.src;
    if (this.authManager) {
      if (
        options.src &&
        (options.src.includes("hdnts=") || options.src.includes("hdntl="))
      ) {
        this.authManager.setInitialSignedUrl(options.src);
        streamUrl = options.src;
      } else {
        try {
          const result = await this.authManager.authenticate(options.src || "");
          streamUrl = result.url;
        } catch (error) {
          this.errorManager.raise(this.errorManager.authError(error));
          return;
        }
      }
    }

    this.mp4Manager.load(streamUrl);
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

  // ─── Token refresh wiring (re-used from HLS auth flow) ──────────────────

  private applyRefreshCallback(manager: AuthManager): void {
    manager.setRefreshCallback((newUrl) => {
      logger.info(
        "[Mp4Player] Token refreshed, updating video source URL:",
        newUrl,
      );
      const currentTime = this.video.currentTime;
      const isPlaying = !this.video.paused;

      const onLoaded = () => {
        this.video.currentTime = currentTime;
        if (isPlaying) void this.play().catch(() => {});
        this.video.removeEventListener("loadedmetadata", onLoaded);
      };

      this.mp4Manager.updateSrc(newUrl);
      this.video.addEventListener("loadedmetadata", onLoaded);
    });
  }

  private syncAuthManager(): void {
    if (this.tokenFetcher) {
      if (!this.authManager) {
        this.authManager = new AuthManager(this.tokenFetcher);
        this.applyRefreshCallback(this.authManager);
      } else {
        this.authManager.reset();
        this.authManager.updateTokenFetcher(this.tokenFetcher);
      }
    } else {
      if (this.authManager) {
        this.authManager.destroy();
        this.authManager = null;
      }
    }
  }
}
