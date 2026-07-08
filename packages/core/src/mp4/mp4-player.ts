import { FullscreenController } from "./controllers/fullscreen-controller";
import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { PlayerStore, createInitialPlayerState } from "../shared/store";
import { PlaybackController } from "./controllers/playback-controller";
import { KeyboardController } from "./controllers/keyboard-controller";
import { SecurityController } from "./controllers/security-controller";
import { StateSynchronizer } from "./controllers/state-synchronizer";
import { SourceController } from "./controllers/source-controller";
import { NetworkManager } from "../shared/network-manager";
import { ErrorManager } from "../shared/error-manager";
import { EventEmitter } from "../shared/events";
import { Mp4Manager } from "./mp4-manager";
import { logger } from "../utils/logger";
import type {
  PlayerStateListener,
  CreatePlayerOptions,
  PlayerSnapshot,
  SecurityConfig,
  SourceOptions,
  PlayerState,
  Unsubscribe,
} from "../types/player.types";

/**
 * Mp4Player — headless progressive MP4 player.
 * Wraps a native HTML5 <video> element behind the same PlayerControls
 * interface exposed by the HLS and YouTube engines, so the React UI layer
 * can switch between engines without knowing which one is active.
 *
 * Drives playback using modular specialized sub-controllers for architectural consistency.
 */
export class Mp4Player extends EventEmitter<PlayerEventMap> {
  private readonly video: HTMLVideoElement;
  private readonly root: HTMLElement;
  private readonly store: PlayerStore;
  private readonly errorManager: ErrorManager;
  private readonly networkManager: NetworkManager;
  private readonly mp4Manager: Mp4Manager;

  private readonly playbackController: PlaybackController;
  private readonly fullscreenController: FullscreenController;
  private readonly sourceController: SourceController;
  private readonly synchronizer: StateSynchronizer;
  private readonly keyboardController: KeyboardController;
  private readonly securityController: SecurityController;

  constructor(options: CreatePlayerOptions) {
    super();
    if (options.logLevel) {
      logger.setLevel(options.logLevel);
    }
    this.video = options.video;
    this.root = options.root || options.video;
    this.store = new PlayerStore(createInitialPlayerState(options.src));

    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    this.fullscreenController = new FullscreenController(this.root, (v) => {
      this.patchState({ isFullscreen: v });
      this.emit("fullscreenchange", v);
    });

    this.mp4Manager = new Mp4Manager(this.video, this.errorManager);

    this.playbackController = new PlaybackController(
      this.video,
      this.store,
      (p) => this.patchState(p),
    );

    this.sourceController = new SourceController(
      this.video,
      this.store,
      this.errorManager,
      this.mp4Manager,
      options.tokenFetcher,
      options.tokenRefresher,
      this.fullscreenController,
      () => this.playbackController.play(),
      (p) => this.patchState(p),
      (e, a) => this.emit(e as any, a),
    );

    this.synchronizer = new StateSynchronizer(
      this.video,
      this.store,
      this.errorManager,
      {
        getPendingStartTime: () => this.sourceController.getPendingStartTime(),
        clearPendingStartTime: () =>
          this.sourceController.clearPendingStartTime(),
        setVideoTime: (time) => {
          this.video.currentTime = time;
        },
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
    const security = options.security ?? {};
    this.securityController.setSecurityConfig(
      security.disableDevOptions,
      this.playbackController,
    );

    this.synchronizer.syncInitialState();
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

  async play() {
    await this.playbackController.play();
  }

  pause() {
    this.playbackController.pause();
  }

  async togglePlay() {
    await this.playbackController.togglePlay();
  }

  seek(time: number) {
    this.playbackController.seek(time);
  }

  seekToLive() {
    this.playbackController.seekToLive();
  }

  isLiveStream() {
    return false;
  }

  setVolume(vol: number) {
    this.playbackController.setVolume(vol);
  }

  mute() {
    this.playbackController.mute();
  }

  unmute() {
    this.playbackController.unmute();
  }

  setPlaybackRate(rate: number) {
    this.playbackController.setPlaybackRate(rate);
  }

  // ─── Quality Selection Delegation ───────────────────────────────────────

  setQuality(quality: number | "auto") {
    this.playbackController.setQuality(quality);
  }

  getQualities() {
    return this.store.getState().qualities;
  }

  // ─── Source Delegation ──────────────────────────────────────────────────

  setSource(options: SourceOptions) {
    void this.sourceController.loadSource(options);
  }

  retry() {
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

  toggleStretch() {
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

  setSecurityConfig(config: SecurityConfig) {
    this.securityController.setSecurityConfig(
      config.disableDevOptions,
      this.playbackController,
    );
  }

  destroy() {
    this.mp4Manager.destroy();
    this.networkManager.destroy();
    this.synchronizer.destroy();
    this.sourceController.destroy();
    this.keyboardController.destroy();
    this.securityController.destroy();
    this.fullscreenController.destroy();
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  private patchState(update: Partial<PlayerState>) {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }
}
