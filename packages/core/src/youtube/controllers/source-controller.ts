import type { YoutubeLiveManager } from "../live/live-manager";
import type { ErrorManager } from "../../shared/error-manager";
import type { YoutubeController } from "./youtube-controller";
import type { StateSynchronizer } from "./state-synchronizer";
import type { SourceOptions } from "../../types/player.types";
import { createInitialPlayerState } from "../../shared/store";
import type { PlayerError } from "../../types/events.types";
import type { PlayerStore } from "../../shared/store";
import { extractYoutubeId } from "../../utils/url";

/**
 * Coordinates video source swapping, initial buffering spinners,
 * and handles reloads/retries for YouTube streams.
 */
export class SourceController {
  private lastAutoPlay: boolean | undefined;

  constructor(
    private readonly store: PlayerStore,
    private readonly ytController: YoutubeController,
    private readonly synchronizer: StateSynchronizer,
    private readonly liveManager: YoutubeLiveManager,
    private readonly errorManager: ErrorManager,
    private readonly callbacks: {
      onSourceChange: (src: string) => void;
    },
  ) {}

  /** Set a new streaming source URL or video ID. */
  setSource(options: SourceOptions): void {
    this.lastAutoPlay = options.autoPlay;
    void this.loadSource(options);
  }

  /** Reload the current video source. */
  retry(): void {
    const src = this.store.getState().src;
    if (src) {
      void this.loadSource({
        src,
        autoPlay: this.lastAutoPlay,
      });
    }
  }

  /** Retrieve the last cached autoplay configuration option. */
  getLastAutoPlay(): boolean | undefined {
    return this.lastAutoPlay;
  }

  /** Performs the asynchronous load operation inside the YouTube manager. */
  async loadSource(options: SourceOptions): Promise<void> {
    if (!options.src?.trim()) {
      const err = this.errorManager.emptySourceError();
      this.errorManager.raise(err);
      return;
    }

    this.ytController.setReady(false);
    const videoId = extractYoutubeId(options.src) || options.src;

    this.liveManager.reset();
    this.liveManager.setHasExplicitStartTime(options.startTime !== undefined);

    this.store.setState({
      ...createInitialPlayerState(options.src),
      volume: this.store.getState().volume,
      previousVolume: this.store.getState().previousVolume,
      isMuted: this.store.getState().isMuted,
      playbackRate: this.store.getState().playbackRate,
      isFullscreen: !!document.fullscreenElement,
      initialSyncCompleted: false,
      isBuffering: false,
    });

    this.synchronizer.clearTimeouts();

    // Set a deferred buffering timeout
    this.ytController.enqueue(() => {
      // If still loading, trigger buffering loader spinner
      if (!this.store.getState().isReady) {
        this.synchronizer.showBufferingSpinner();
      }
    });

    try {
      const player = await this.ytController
        .getEngine()
        .load(videoId, options.autoPlay, options.startTime);
      if (!player) return;
      this.callbacks.onSourceChange(options.src);
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
}
