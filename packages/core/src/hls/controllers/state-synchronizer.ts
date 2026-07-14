import type { ErrorManager } from "../../shared/error-manager";
import type { PlayerState } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";
import {
  getBufferedPercent,
  getBufferedRanges,
  getMediaDuration,
  getBufferedEnd,
  isTimeBuffered,
} from "../../utils/helpers";

type SyncCallbacks = {
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onTimeUpdateLive: () => { isAtLiveEdge: boolean; liveLatency: number } | null;
  emit: (event: any, arg?: any) => void;
};

/**
 * Listens to HTMLVideoElement events and synchronizes their property updates into PlayerStore.
 * Offloads all direct video listener wiring from the Player facade.
 */
export class StateSynchronizer {
  private readonly cleanupCallbacks: Array<() => void> = [];
  private seekBufferingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly errorManager: ErrorManager,
    private readonly callbacks: SyncCallbacks,
    private readonly patchState: (patch: Partial<PlayerState>) => void,
  ) {
    this.attachEvents();
  }

  /** Synchronizes current media property values into the store on startup. */
  syncInitialState(): void {
    this.patchState({
      currentTime: this.video.currentTime,
      duration: getMediaDuration(this.video),
      volume: this.video.volume,
      isMuted: this.video.muted,
      isPlaying: !this.video.paused,
      playbackRate: this.video.playbackRate,
      ...this.getBuffered(),
    });
  }

  /** Remove all event listeners and clean up. */
  destroy(): void {
    if (this.seekBufferingTimer) {
      clearTimeout(this.seekBufferingTimer);
      this.seekBufferingTimer = null;
    }
    this.cleanupCallbacks.forEach((c) => c());
    this.cleanupCallbacks.length = 0;
  }

  private on<TEvent extends keyof HTMLVideoElementEventMap>(
    event: TEvent,
    listener: (e: HTMLVideoElementEventMap[TEvent]) => void,
  ): void {
    this.video.addEventListener(event, listener);
    this.cleanupCallbacks.push(() =>
      this.video.removeEventListener(event, listener),
    );
  }

  private attachEvents(): void {
    this.on("loadedmetadata", () => {
      this.patchState({
        isReady: true,
        duration: getMediaDuration(this.video),
      });
      this.callbacks.emit("ready", this.store.getState());
    });

    this.on("play", () => {
      this.callbacks.onPlay();
      this.patchState({ isPlaying: true });
      this.callbacks.emit("play", this.store.getState());
    });

    this.on("pause", () => {
      this.patchState({ isPlaying: false, isBuffering: false });
      this.callbacks.onPause();
      this.callbacks.emit("pause", this.store.getState());
    });

    this.on("ended", () => {
      this.callbacks.onEnded();
      this.patchState({ isPlaying: false, isBuffering: false });
      this.callbacks.emit("ended", this.store.getState());
    });

    this.on("timeupdate", () => this.handleTimeUpdate());

    this.on("durationchange", () => {
      this.patchState({
        duration: getMediaDuration(this.video),
        ...this.getBuffered(),
      });
    });

    this.on("progress", () => this.patchState(this.getBuffered()));

    this.on("volumechange", () => {
      this.patchState({ volume: this.video.volume, isMuted: this.video.muted });
    });

    this.on("seeking", () => {
      const isBuf = !isTimeBuffered(this.video, this.video.currentTime);
      this.patchState({
        currentTime: this.video.currentTime,
      });

      if (this.seekBufferingTimer) {
        clearTimeout(this.seekBufferingTimer);
        this.seekBufferingTimer = null;
      }

      if (isBuf) {
        this.seekBufferingTimer = setTimeout(() => {
          this.patchState({ isBuffering: true });
          this.seekBufferingTimer = null;
        }, 150);
      }
    });

    this.on("seeked", () => {
      if (this.seekBufferingTimer) {
        clearTimeout(this.seekBufferingTimer);
        this.seekBufferingTimer = null;
      }
      this.patchState({
        currentTime: this.video.currentTime,
        isBuffering: false,
      });
    });

    this.on("waiting", () => {
      if (this.seekBufferingTimer) {
        clearTimeout(this.seekBufferingTimer);
        this.seekBufferingTimer = null;
      }
      this.seekBufferingTimer = setTimeout(() => {
        if (
          !this.video.paused &&
          !isTimeBuffered(this.video, this.video.currentTime)
        ) {
          this.patchState({ isBuffering: true });
        }
        this.seekBufferingTimer = null;
      }, 150);
    });

    this.on("playing", () => {
      this.patchState({ isBuffering: false, isPlaying: true });
    });

    this.on("error", () => {
      this.errorManager.raise(
        this.errorManager.mediaElementError(this.video.error),
      );
    });
  }

  private handleTimeUpdate(): void {
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
      const live = this.callbacks.onTimeUpdateLive();
      if (live) {
        const prev = this.store.getState();
        update.isAtLiveEdge = live.isAtLiveEdge;
        update.liveLatency = live.liveLatency;

        // Auto-reset speed when catching back up to the live edge
        if (
          !prev.isAtLiveEdge &&
          live.isAtLiveEdge &&
          this.video.playbackRate > 1
        ) {
          this.video.playbackRate = 1;
          update.playbackRate = 1;
        }

        if (prev.isAtLiveEdge !== live.isAtLiveEdge) {
          queueMicrotask(() => {
            this.callbacks.emit("livestatechange", {
              isLive: true,
              isAtLiveEdge: live.isAtLiveEdge,
              liveLatency: live.liveLatency,
              dvr: this.store.getState().dvr,
            });
          });
        }
      }
    }

    this.patchState(update);
    this.callbacks.emit("timeupdate", this.store.getState());
  }

  private getBuffered() {
    return {
      buffered: getBufferedRanges(this.video),
      bufferedEnd: getBufferedEnd(this.video),
      bufferedPercent: getBufferedPercent(this.video),
    };
  }
}
