import { FullscreenController } from "./controllers/fullscreen-controller";
import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { createInitialPlayerState, PlayerStore } from "../shared/store";
import { PlaybackController } from "./controllers/playback-controller";
import { KeyboardController } from "./controllers/keyboard-controller";
import { SecurityController } from "./controllers/security-controller";
import { StateSynchronizer } from "./controllers/state-synchronizer";
import { SourceController } from "./controllers/source-controller";
import { HlsController } from "./controllers/hls-controller";
import { NetworkManager } from "../shared/network-manager";
import { ErrorManager } from "../shared/error-manager";
import { LiveManager } from "./live/live-manager";
import { EventEmitter } from "../shared/events";
import type {
  PlayerStateListener,
  CreatePlayerOptions,
  PlayerSnapshot,
  SecurityConfig,
  SourceOptions,
  PlayerState,
  Unsubscribe,
} from "../types/player.types";

import { DEFAULT_LIVE_SYNC_DURATION } from "../constants";

/**
 * Custom HLS Player class.
 * Facade coordinating specialized sub-controllers for playback, sources, and HLS.js lifecycle.
 */
export class Player extends EventEmitter<PlayerEventMap> {
  private readonly video: HTMLVideoElement;
  private readonly root: HTMLElement;
  private readonly store: PlayerStore;
  private readonly errorManager: ErrorManager;
  private readonly networkManager: NetworkManager;

  private readonly liveManager: LiveManager;
  private readonly hlsController: HlsController;
  private readonly playbackController: PlaybackController;
  private readonly sourceController: SourceController;
  private readonly stateSynchronizer: StateSynchronizer;
  private readonly fullscreenController: FullscreenController;
  private readonly keyboardController: KeyboardController;
  private readonly securityController: SecurityController;

  constructor(options: CreatePlayerOptions) {
    super();
    this.video = options.video;
    this.root = options.root || options.video;
    this.store = new PlayerStore(createInitialPlayerState(options.src));
    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    const live = options.live ?? {};
    const liveSyncDuration = live.syncDuration ?? DEFAULT_LIVE_SYNC_DURATION;

    this.fullscreenController = new FullscreenController(
      this.root,
      (isFullscreen) => {
        this.patchState({ isFullscreen });
        this.emit("fullscreenchange", isFullscreen);
      },
    );

    this.liveManager = new LiveManager(
      this.video,
      this.store,
      (p) => this.emit("livestatechange", p),
      liveSyncDuration,
    );
    this.playbackController = new PlaybackController(
      this.video,
      this.store,
      (p) => this.patchState(p),
      (t) => this.liveManager.onSeek(t),
    );
    this.sourceController = new SourceController(
      this.video,
      this.store,
      this.errorManager,
      this.liveManager,
      () => this.hlsController,
      options.tokenFetcher,
      options.tokenRefresher,
      this.fullscreenController,
      () => this.playbackController.play(),
      (p) => this.patchState(p),
      (e, a) => this.emit(e as any, a),
    );

    this.hlsController = new HlsController(
      this.video,
      this.store,
      {
        onQualitiesChange: (q) => this.emit("qualitieschange", q),
        onQualityChange: (q) => this.emit("qualitychange", q),
        onLevelUpdated: (p) => this.handleLevelUpdate(p),
      },
      this.errorManager,
      live.lowLatency ?? false,
      this.sourceController.getXhrSetup(),
    );

    this.stateSynchronizer = new StateSynchronizer(
      this.video,
      this.store,
      this.errorManager,
      {
        onPlay: () => this.liveManager.stopPausePolling(),
        onPause: () => this.liveManager.startPausePolling(),
        onEnded: () => this.liveManager.stopPausePolling(),
        onTimeUpdateLive: () => this.liveManager.computeLiveSnapshot(),
        emit: (e, a) => this.emit(e as any, a as any),
      },
      (p) => this.patchState(p),
    );

    this.networkManager = new NetworkManager(this.errorManager, () =>
      this.retry(),
    );
    this.keyboardController = new KeyboardController(this.root, this.video);
    if (options.keyboard) {
      this.keyboardController.initialize(
        this.playbackController,
        this.fullscreenController,
        () => this.toggleStretch(),
      );
    }

    this.securityController = new SecurityController(
      this.root,
      this.video,
      this.store,
    );
    this.securityController.setSecurityConfig(
      (options.security ?? {}).disableDevOptions,
      this.playbackController,
    );

    this.stateSynchronizer.syncInitialState();
    this.networkManager.attach();

    void this.sourceController.loadSource({
      src: options.src,
      autoPlay: options.autoPlay,
      startTime: options.startTime,
    });
  }

  // ─── Getters & Setters ──────────────────────────────────────────────────
  get initialError(): PlayerError | null {
    return this.sourceController.initialError;
  }
  set initialError(val: PlayerError | null) {
    this.sourceController.initialError = val;
  }

  // ─── Playback Control Delegation ────────────────────────────────────────
  play(): Promise<void> {
    return this.playbackController.play();
  }
  pause(): void {
    this.playbackController.pause();
  }
  togglePlay(): Promise<void> {
    return this.playbackController.togglePlay();
  }
  seek(time: number): void {
    this.playbackController.seek(time);
  }
  isLiveStream(): boolean {
    return this.store.getState().isLive;
  }
  setVolume(vol: number): void {
    this.playbackController.setVolume(vol);
  }
  mute(): void {
    this.playbackController.mute();
  }
  unmute(): void {
    this.playbackController.unmute();
  }
  setPlaybackRate(rate: number): void {
    this.playbackController.setPlaybackRate(rate);
  }

  seekToLive(): void {
    if (!this.store.getState().isLive) return;
    this.liveManager.seekToLive();
    if (this.video.playbackRate > 1) {
      this.video.playbackRate = 1;
      this.patchState({ playbackRate: 1 });
    }
  }

  // ─── Quality Selection Delegation ───────────────────────────────────────
  setQuality(quality: number | "auto"): void {
    this.hlsController.setQuality(quality);
  }
  getQualities() {
    return this.hlsController.getQualities();
  }

  // ─── Source Delegation ──────────────────────────────────────────────────
  setSource(options: SourceOptions): void {
    void this.sourceController.loadSource(options);
  }
  retry(): void {
    this.sourceController.retry();
  }

  // ─── Fullscreen Delegation ──────────────────────────────────────────────
  enterFullscreen() {
    return this.fullscreenController.enter();
  }
  exitFullscreen() {
    return this.fullscreenController.exit();
  }
  toggleFullscreen() {
    return this.fullscreenController.toggle();
  }

  // ─── Layout adjustments ─────────────────────────────────────────────────
  toggleStretch(): void {
    const cur = this.store.getState().isStretched;
    this.patchState({ isStretched: !cur });
    this.video.style.objectFit = cur ? "contain" : "fill";
  }

  // ─── Subscription & State ───────────────────────────────────────────────
  getState(): PlayerSnapshot {
    return this.store.getState();
  }
  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }
  setSecurityConfig(config: SecurityConfig): void {
    this.securityController.setSecurityConfig(
      config.disableDevOptions,
      this.playbackController,
    );
  }

  destroy(): void {
    this.liveManager.destroy();
    this.hlsController.destroy();
    this.networkManager.destroy();
    this.stateSynchronizer.destroy();
    this.keyboardController.destroy();
    this.securityController.destroy();
    this.fullscreenController.destroy();
    this.sourceController.destroy();
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  // ─── Private Event Handlers ─────────────────────────────────────────────
  private handleLevelUpdate(payload: {
    isLive: boolean;
    liveEdge: number;
  }): void {
    if (payload.isLive) {
      this.liveManager.detectLive();
      if (this.sourceController.getPendingStartTime() === undefined) {
        this.liveManager.tryInitialSync();
      }
    } else if (this.store.getState().isLive) {
      this.liveManager.markVod();
    }
  }

  private patchState(update: Partial<PlayerState>): void {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }
}
