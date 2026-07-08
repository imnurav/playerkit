import type { FullscreenController } from "./fullscreen-controller";
import type { ErrorManager } from "../../shared/error-manager";
import { createInitialPlayerState } from "../../shared/store";
import type { PlayerError } from "../../types/events.types";
import type { LiveManager } from "../live/live-manager";
import type { PlayerStore } from "../../shared/store";
import type { HlsController } from "./hls-controller";
import { AuthController } from "./auth-controller";
import { logger } from "../../utils/logger";
import type {
  TokenRefresher,
  SourceOptions,
  TokenFetcher,
} from "../../types/player.types";

/**
 * Handles loading media sources, managing playback retries/recovery,
 * and falls back to native HLS streams if HLS.js is unavailable.
 * Owns the AuthController lifecycle to decouple stream authentication from Player facade.
 */
export class SourceController {
  private src = "";
  private lastAutoPlay = false;
  private pendingStartTime?: number;
  private fallbackMetadataListener: (() => void) | null = null;
  initialError: PlayerError | null = null;
  private authController: AuthController | null = null;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly errorManager: ErrorManager,
    private readonly liveManager: LiveManager,
    private readonly getHlsController: () => HlsController,
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

  /** Get the custom XMLHttpRequest header setup hook from the active AuthController. */
  getXhrSetup(): ((xhr: XMLHttpRequest, url: string) => void) | null {
    return this.authController?.getXhrSetup() ?? null;
  }

  /**
   * Loads a media source, triggers authentication, and loads the stream.
   *
   * @param options Source loading options.
   */
  async loadSource(options: SourceOptions): Promise<void> {
    this.cleanupFallbackListener();
    this.liveManager.reset();
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

    if (this.authController) {
      this.authController.reset();
    }

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

    const hlsUsed = this.getHlsController().loadStream(streamUrl);
    if (!hlsUsed) {
      this.fallbackMetadataListener = () => {
        if (!Number.isFinite(this.video.duration)) {
          this.liveManager.detectLive();
        }
      };
      this.video.addEventListener(
        "loadedmetadata",
        this.fallbackMetadataListener,
      );
    }

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

  /** Clean up event listeners and destroy the AuthController. */
  destroy(): void {
    this.cleanupFallbackListener();
    if (this.authController) {
      this.authController.destroy();
      this.authController = null;
    }
  }

  private cleanupFallbackListener(): void {
    if (this.fallbackMetadataListener) {
      this.video.removeEventListener(
        "loadedmetadata",
        this.fallbackMetadataListener,
      );
      this.fallbackMetadataListener = null;
    }
  }

  private applyRefreshCallback(): void {
    if (!this.authController) return;

    this.authController.setRefreshCallback((newUrl) => {
      logger.info(
        "[Player] Token refreshed, updating stream source URL:",
        newUrl,
      );
      this.src = newUrl;

      const hls = this.getHlsController().getInstance();
      if (hls) {
        // HLS.js handles segment token injection dynamically via xhrSetup.
        // We do NOT need to reload the source, which would disrupt playback.
        logger.debug("[Player] HLS.js active, skipping hard source reload.");
      } else {
        // Native fallback requires a hard reload of the source.
        const currentTime = this.video.currentTime;
        const isPlaying = !this.video.paused;

        const onLoaded = () => {
          this.video.currentTime = currentTime;
          if (isPlaying) void this.play().catch(() => {});
          this.video.removeEventListener("loadedmetadata", onLoaded);
        };

        this.video.src = newUrl;
        this.video.addEventListener("loadedmetadata", onLoaded);
      }
    });
  }
}
