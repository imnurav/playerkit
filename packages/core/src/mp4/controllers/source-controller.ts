import { AuthController } from "../../hls/controllers/auth-controller";
import type { FullscreenController } from "./fullscreen-controller";
import type { ErrorManager } from "../../shared/error-manager";
import { createInitialPlayerState } from "../../shared/store";
import type { PlayerError } from "../../types/events.types";
import type { PlayerStore } from "../../shared/store";
import type { Mp4Manager } from "../mp4-manager";
import { logger } from "../../utils/logger";
import type {
  TokenRefresher,
  SourceOptions,
  TokenFetcher,
} from "../../types/player.types";

/**
 * Handles loading media sources, managing playback retries/recovery,
 * and manages the AuthController lifecycle to decouple stream authentication from Mp4Player.
 */
export class SourceController {
  private src = "";
  private lastAutoPlay = false;
  private pendingStartTime?: number;
  initialError: PlayerError | null = null;
  private authController: AuthController | null = null;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly errorManager: ErrorManager,
    private readonly mp4Manager: Mp4Manager,
    private readonly tokenFetcher: TokenFetcher | undefined,
    private readonly tokenRefresher: TokenRefresher | undefined,
    private readonly fullscreenController: FullscreenController,
    private readonly play: () => Promise<void>,
    private readonly patchState: (patch: any) => void,
    private readonly emit: (event: string, arg?: any) => void,
  ) {
    if (this.tokenFetcher) {
      this.authController = new AuthController(
        this.tokenFetcher,
        this.tokenRefresher,
      );
      this.applyRefreshCallback();
    }
  }

  /** Get the current loaded source URL string. */
  getSrc(): string {
    return this.src;
  }

  /** Get the pending start time offset parameter. */
  getPendingStartTime(): number | undefined {
    return this.pendingStartTime;
  }

  /** Resets the pending start time. */
  clearPendingStartTime(): void {
    this.pendingStartTime = undefined;
  }

  /** Get the auto-play mode of the last source load command. */
  getLastAutoPlay(): boolean | undefined {
    return this.lastAutoPlay;
  }

  /**
   * Loads a media source, triggers authentication, and loads the stream.
   *
   * @param options Source loading options.
   */
  async loadSource(options: SourceOptions): Promise<void> {
    this.src = options.src;
    this.lastAutoPlay = !!options.autoPlay;
    this.pendingStartTime = options.startTime;

    this.patchState({
      ...createInitialPlayerState(options.src),
      volume: this.video.volume,
      previousVolume: this.store.getState().previousVolume,
      isMuted: this.video.muted,
      playbackRate: this.video.playbackRate,
      isFullscreen: this.fullscreenController.isFullscreen(),
    });

    this.syncAuthManager();

    if (!options.src?.trim() && !this.authController) {
      const err = this.errorManager.emptySourceError();
      this.initialError = err;
      this.errorManager.raise(err);
      return;
    }

    let streamUrl = options.src;
    if (this.authController) {
      if (
        options.src &&
        (options.src.includes("hdnts=") || options.src.includes("hdntl="))
      ) {
        this.authController.setInitialSignedUrl(options.src);
      } else {
        try {
          const result = await this.authController.authenticate(
            options.src || "",
          );
          streamUrl = result.url;
        } catch (error) {
          this.errorManager.raise(this.errorManager.authError(error));
          return;
        }
      }
    }

    this.mp4Manager.load(streamUrl);
    if (options.autoPlay) {
      void this.play();
    }
    this.emit("sourcechange", options.src);
  }

  /** Retries loading the current source stream URL. */
  retry(): void {
    if (this.src) {
      void this.loadSource({ src: this.src, autoPlay: this.lastAutoPlay });
    }
  }

  /** Clean up resources and destroy the AuthController. */
  destroy(): void {
    if (this.authController) {
      this.authController.destroy();
      this.authController = null;
    }
  }

  private applyRefreshCallback(): void {
    if (!this.authController) return;

    this.authController.setRefreshCallback((newUrl) => {
      logger.info(
        "[Mp4Player] Token refreshed, updating stream source URL:",
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
      if (!this.authController) {
        this.authController = new AuthController(
          this.tokenFetcher,
          this.tokenRefresher,
        );
        this.applyRefreshCallback();
      } else {
        this.authController.reset();
        this.authController.updateTokenFetcher(
          this.tokenFetcher,
          this.tokenRefresher,
        );
      }
    } else {
      if (this.authController) {
        this.authController.destroy();
        this.authController = null;
      }
    }
  }
}
