import { FullscreenController } from "./controllers/fullscreen-controller";
import type { PlayerError, PlayerEventMap } from "../types/events.types";
import { PlayerStore, createInitialPlayerState } from "../shared/store";
import { PlaybackController } from "./controllers/playback-controller";
import { SecurityController } from "./controllers/security-controller";
import { YoutubeController } from "./controllers/youtube-controller";
import { StateSynchronizer } from "./controllers/state-synchronizer";
import { SourceController } from "./controllers/source-controller";
import { YouTubePlayerState } from "../types/youtube.types";
import { YoutubeLiveManager } from "./live/live-manager";
import { ErrorManager } from "../shared/error-manager";
import { EventEmitter } from "../shared/events";
import { logger } from "../utils/logger";
import type {
  PlayerStateListener,
  CreatePlayerOptions,
  PlayerSnapshot,
  SecurityConfig,
  SourceOptions,
  QualityLevel,
  PlayerState,
  Unsubscribe,
} from "../types/player.types";

/**
 * YoutubePlayer — wraps the YouTube IFrame Player API behind the same
 * PlayerControls interface as the HLS Player. Drives playback using
 * modular specialized sub-controllers.
 */
export class YoutubePlayer extends EventEmitter<PlayerEventMap> {
  private readonly root: HTMLElement;
  private readonly store: PlayerStore;
  private readonly errorManager: ErrorManager;

  private readonly liveManager: YoutubeLiveManager;
  private readonly youtubeController: YoutubeController;
  private readonly synchronizer: StateSynchronizer;
  private readonly playbackController: PlaybackController;
  private readonly sourceController: SourceController;
  private readonly fullscreenController: FullscreenController;
  private readonly securityController: SecurityController;

  private activeYtState: YouTubePlayerState = YouTubePlayerState.UNSTARTED;
  initialError: PlayerError | null = null;

  constructor(options: CreatePlayerOptions) {
    super();
    if (options.logLevel) {
      logger.setLevel(options.logLevel);
    }
    this.root = options.root || options.video;

    const initialState = createInitialPlayerState(options.src);
    this.store = new PlayerStore(initialState);

    this.liveManager = new YoutubeLiveManager(
      this,
      this.store,
      options.live?.syncDuration ?? 5,
      options.live?.dvr,
    );

    this.errorManager = new ErrorManager(this.store, (err) =>
      this.emit("error", err),
    );

    // 1. YouTube instance controller
    this.youtubeController = new YoutubeController(
      this.root,
      {
        onReady: () => this.synchronizer.handleReady(),
        onError: (code) =>
          this.synchronizer.handleError(code, this.errorManager),
        onStateChange: (state) => {
          this.activeYtState = state;
          this.synchronizer.handleStateChange(state);
        },
        onCurrentTimeUpdate: (time) =>
          this.synchronizer.handleTimeUpdate(time, this.activeYtState),
        onQualitiesChange: (qualities) =>
          this.emit("qualitieschange", qualities),
      },
      this.store,
    );

    // 2. Synchronizer
    this.synchronizer = new StateSynchronizer(
      this.store,
      this.youtubeController,
      this.liveManager,
      {
        onReady: () => this.emit("ready", this.getState()),
        onPlay: () => this.emit("play", this.getState()),
        onPause: () => this.emit("pause", this.getState()),
        onEnded: () => this.emit("ended", this.getState()),
        onTimeUpdate: () => this.emit("timeupdate", this.getState()),
        onQualitiesChange: (qualities) =>
          this.emit("qualitieschange", qualities),
      },
    );

    // 3. Playback Controller
    this.playbackController = new PlaybackController(
      this.store,
      this.youtubeController,
      this.synchronizer,
      this.liveManager,
    );

    // 4. Source Controller
    this.sourceController = new SourceController(
      this.store,
      this.youtubeController,
      this.synchronizer,
      this.liveManager,
      this.errorManager,
      {
        onSourceChange: (src) => this.emit("sourcechange", src),
      },
    );

    // 5. Fullscreen Controller
    this.fullscreenController = new FullscreenController(
      options.fullscreenElement ?? this.root,
      this.store,
      () => this.emit("statechange", this.getState()),
    );

    // 6. Security Controller
    this.securityController = new SecurityController(
      this.root,
      this.store,
      this,
    );
    this.securityController.setSecurityConfig(options.security || {});

    // Trigger initial load
    void this.sourceController.loadSource({
      src: options.src,
      autoPlay: options.autoPlay,
      startTime: options.startTime,
    });
  }

  // ─── Playback controls ──────────────────────────────────────────────────

  async play(): Promise<void> {
    await this.playbackController.play();
  }

  pause(): void {
    this.playbackController.pause();
  }

  async togglePlay(): Promise<void> {
    await this.playbackController.togglePlay();
  }

  seek(time: number): void {
    this.playbackController.seek(time);
  }

  seekToLive(): void {
    this.playbackController.seekToLive();
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

  setQuality(quality: number | "auto"): void {
    this.playbackController.setQuality(quality);
  }

  getQualities(): QualityLevel[] {
    return this.store.getState().qualities;
  }

  // ─── Source loading ─────────────────────────────────────────────────────

  setSource(options: SourceOptions): void {
    this.sourceController.setSource(options);
  }

  retry(): void {
    this.sourceController.retry();
  }

  // ─── Fullscreen controls ────────────────────────────────────────────────

  enterFullscreen(): Promise<void> {
    return this.fullscreenController.enterFullscreen();
  }

  exitFullscreen(): Promise<void> {
    return this.fullscreenController.exitFullscreen();
  }

  toggleFullscreen(): Promise<void> {
    return this.fullscreenController.toggleFullscreen();
  }

  // ─── Security controls ──────────────────────────────────────────────────

  setSecurityConfig(config: SecurityConfig): void {
    this.securityController.setSecurityConfig(config);
  }

  // ─── State observation ──────────────────────────────────────────────────

  getState(): PlayerSnapshot {
    return this.store.getState();
  }

  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }

  toggleStretch(): void {
    const cur = this.store.getState().isStretched;
    this.patchState({ isStretched: !cur });
  }

  getVideoId(): string {
    return this.sourceController.getLastAutoPlay() !== undefined
      ? this.sourceController.getLastAutoPlay()
        ? "cued"
        : ""
      : ""; // Keep getVideoId or standard videoId mapping
  }

  getNativePlayer(): any {
    return this.youtubeController.getPlayer();
  }

  triggerTimeUpdate(currentTime: number): void {
    this.synchronizer.handleTimeUpdate(currentTime, this.activeYtState);
  }

  destroy(): void {
    this.synchronizer.clearTimeouts();
    this.fullscreenController.destroy();
    this.youtubeController.destroy();
    this.securityController.destroy();
    this.liveManager.destroy();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  private patchState(update: Partial<PlayerState>): void {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }
}
