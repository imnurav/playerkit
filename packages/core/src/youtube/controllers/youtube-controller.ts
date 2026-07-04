import { YoutubeQualityManager } from "../youtube/youtube-quality-manager";
import type { YouTubeIFramePlayer } from "../../types/youtube.types";
import { YouTubePlayerState } from "../../types/youtube.types";
import type { QualityLevel } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";
import { YoutubeEngine } from "../youtube-engine";

/**
 * Manages the YouTube IFrame player lifecycle, loads scripts dynamically,
 * and delegates active quality level operations to YoutubeQualityManager.
 */
export class YoutubeController {
  private readonly engine: YoutubeEngine;
  private readonly qualityManager: YoutubeQualityManager;
  private isReady = false;
  private readonly readyQueue: Array<() => void> = [];

  constructor(
    root: HTMLElement,
    callbacks: {
      onReady: () => void;
      onError: (errorCode: number) => void;
      onStateChange: (state: YouTubePlayerState) => void;
      onCurrentTimeUpdate: (currentTime: number) => void;
      onQualitiesChange: (qualities: QualityLevel[]) => void;
    },
    store: PlayerStore,
  ) {
    this.qualityManager = new YoutubeQualityManager(
      store,
      () => this.getPlayer(),
      callbacks.onQualitiesChange,
    );

    this.engine = new YoutubeEngine(root, {
      onReady: () => {
        this.isReady = true;
        this.qualityManager.syncQualities();
        callbacks.onReady();

        const queue = this.readyQueue.slice();
        this.readyQueue.length = 0;
        queue.forEach((fn) => fn());
      },
      onError: callbacks.onError,
      onStateChange: callbacks.onStateChange,
      onCurrentTimeUpdate: callbacks.onCurrentTimeUpdate,
    });
  }

  /** Queue a command to run after the player is ready. */
  enqueue(fn: () => void): void {
    if (this.isReady) {
      fn();
    } else {
      this.readyQueue.push(fn);
    }
  }

  /** Set the ready state directly (e.g. on new source load). */
  setReady(ready: boolean): void {
    this.isReady = ready;
    if (!ready) {
      this.readyQueue.length = 0;
    }
  }

  /** Get the low-level YoutubeEngine helper wrapper. */
  getEngine(): YoutubeEngine {
    return this.engine;
  }

  /** Retrieve the active native YouTube IFrame API instance. */
  getPlayer(): YouTubeIFramePlayer | null {
    return this.engine.getPlayer();
  }

  /** Get the specialized quality levels manager. */
  getQualityManager(): YoutubeQualityManager {
    return this.qualityManager;
  }

  /** Clean up and destroy the active engine. */
  destroy(): void {
    this.engine.destroy();
  }
}
