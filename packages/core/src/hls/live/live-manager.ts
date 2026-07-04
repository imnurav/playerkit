import type { PlayerStore } from "../../shared/store";
import {
  getSeekableStart,
  getLiveLatency,
  getLiveEdge,
} from "../../utils/helpers";

export type LiveStatePayload = {
  dvr: boolean;
  isLive: boolean;
  liveLatency: number;
  isAtLiveEdge: boolean;
};

/**
 * Manages all live stream state: latency tracking, DVR detection, live-edge sync.
 * Consolidates playhead synchronization, paused interval polling, and live play modes.
 */
export class LiveManager {
  private initialLivePosSet = false;
  private state: "LIVE_EDGE" | "DVR" | "SEEKING_TO_LIVE" = "LIVE_EDGE";
  private dvrEntryCount = 0;
  private pollerTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly onStateChange: (payload: LiveStatePayload) => void,
    private readonly liveSyncDuration: number,
  ) {
    this.video.addEventListener("seeked", this.handleSeeked);
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  /** Reset all live state when a new source is loaded. */
  reset(): void {
    this.initialLivePosSet = false;
    this.state = "LIVE_EDGE";
    this.dvrEntryCount = 0;
    this.stopPausePolling();
  }

  /** Stop timers, clean up event listeners and resources. */
  destroy(): void {
    this.stopPausePolling();
    this.video.removeEventListener("seeked", this.handleSeeked);
  }

  // ─── Initial sync ───────────────────────────────────────────────────────

  /**
   * Seek the video to the live edge on first load.
   *
   * @returns true if the seek was successfully initiated, false if already synced.
   */
  tryInitialSync(): boolean {
    const liveEdge = getLiveEdge(this.video);
    if (this.initialLivePosSet || liveEdge <= 0) {
      return false;
    }
    this.initialLivePosSet = true;
    this.seekToLivePosition(liveEdge);
    this.evaluate();
    return true;
  }

  // ─── Live detection ─────────────────────────────────────────────────────

  /**
   * Called on every hls.js LEVEL_UPDATED event (playlist refresh).
   * Updates only structural live fields, delegating live-edge tracking to evaluate().
   */
  detectLive(): void {
    const seekableStart = getSeekableStart(this.video);
    const seekableEnd = getLiveEdge(this.video);
    const hasSeekableRange = this.video.seekable.length > 0;

    this.store.setState({
      isLive: true,
      dvr: hasSeekableRange,
      seekableStart,
      seekableEnd,
    });

    this.evaluate();
  }

  /** Called when hls.js reports the manifest is VOD after being live. */
  markVod(): void {
    this.stopPausePolling();
    this.state = "LIVE_EDGE";
    this.dvrEntryCount = 0;

    const patch = {
      isLive: false,
      isAtLiveEdge: false,
      liveLatency: 0,
      dvr: false,
    };

    this.store.setState(patch);
    this.onStateChange(patch);
  }

  // ─── Latency evaluation ─────────────────────────────────────────────────

  /**
   * Compute the current live edge status without writing to the store.
   *
   * @returns Snapshot containing at-edge status and latency, or null if not live.
   */
  computeLiveSnapshot(): { isAtLiveEdge: boolean; liveLatency: number } | null {
    if (!this.store.getState().isLive) return null;

    const liveLatency = getLiveLatency(this.video);
    this.transitionOnTick(liveLatency);

    const isSeeking = this.state === "SEEKING_TO_LIVE";
    const isAtLiveEdge = isSeeking ? true : this.state !== "DVR";

    return {
      isAtLiveEdge,
      liveLatency: isSeeking ? 0 : liveLatency,
    };
  }

  /** Evaluate live edge state, write to the store, and emit notifications. */
  evaluate(): void {
    const state = this.store.getState();
    if (!state.isLive) return;

    const snapshot = this.computeLiveSnapshot();
    if (!snapshot) return;

    this.updateStateAndNotify(snapshot.isAtLiveEdge, snapshot.liveLatency);
  }

  // ─── Pause polling ──────────────────────────────────────────────────────

  /** Start a timer to evaluate live latency while paused. */
  startPausePolling(): void {
    if (this.pollerTimer !== null) return;
    this.pollerTimer = setInterval(() => this.evaluate(), 1000);
  }

  /** Stop the paused polling timer. */
  stopPausePolling(): void {
    if (this.pollerTimer !== null) {
      clearInterval(this.pollerTimer);
      this.pollerTimer = null;
    }
  }

  // ─── Seek / user action ─────────────────────────────────────────────────

  /**
   * Called when the user seeks to a specific time.
   *
   * @param time Target seek playhead position in seconds.
   */
  onSeek(time: number): void {
    const liveEdge = getLiveEdge(this.video);
    if (liveEdge <= 0) return;

    this.transitionOnSeek(time, liveEdge);
    this.evaluate();
  }

  /**
   * Jump straight to the live edge position.
   *
   * @returns true if seek was initiated, false if live edge not available.
   */
  seekToLive(): boolean {
    const liveEdge = getLiveEdge(this.video);
    if (liveEdge <= 0) return false;

    this.state = "SEEKING_TO_LIVE";
    this.dvrEntryCount = 0;
    this.seekToLivePosition(liveEdge);

    // Immediately snap position to avoid jumps/flicker
    this.updateStateAndNotify(true, 0);
    return true;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private seekToLivePosition(liveEdge: number): void {
    this.video.currentTime = Math.max(0, liveEdge - this.liveSyncDuration);
  }

  private handleSeeked = (): void => {
    const liveLatency = getLiveLatency(this.video);
    this.transitionOnSeeked(liveLatency);
    this.evaluate();
  };

  private transitionOnTick(latency: number): void {
    const dvrThreshold = this.liveSyncDuration + 10;

    if (this.state === "SEEKING_TO_LIVE") {
      if (latency <= this.liveSyncDuration) {
        this.state = "LIVE_EDGE";
      }
      return;
    }

    if (this.state === "LIVE_EDGE") {
      if (latency > dvrThreshold) {
        this.dvrEntryCount++;
        if (this.dvrEntryCount >= 3) {
          this.state = "DVR";
        }
      } else {
        this.dvrEntryCount = 0;
      }
      return;
    }

    if (this.state === "DVR") {
      // Hysteresis: Only exit DVR when well within the live zone (75% of sync duration)
      if (latency <= this.liveSyncDuration * 0.75) {
        this.state = "LIVE_EDGE";
        this.dvrEntryCount = 0;
      } else if (latency > dvrThreshold) {
        this.dvrEntryCount = 3;
      } else {
        this.dvrEntryCount = 0;
      }
    }
  }

  private transitionOnSeek(seekTime: number, liveEdge: number): void {
    const dvrThreshold = this.liveSyncDuration + 10;
    if (seekTime < liveEdge - dvrThreshold) {
      this.state = "DVR";
      this.dvrEntryCount = 3;
    } else {
      this.state = "LIVE_EDGE";
      this.dvrEntryCount = 0;
    }
  }

  private transitionOnSeeked(latency: number): void {
    const dvrThreshold = this.liveSyncDuration + 10;
    if (latency > dvrThreshold) {
      this.state = "DVR";
      this.dvrEntryCount = 3;
    } else {
      this.state = "LIVE_EDGE";
      this.dvrEntryCount = 0;
    }
  }

  /** Write live playhead state updates to the store and trigger events if they changed. */
  private updateStateAndNotify(
    isAtLiveEdge: boolean,
    liveLatency: number,
  ): void {
    const prevState = this.store.getState();

    // Minimize store updates - only write changes
    if (
      prevState.isAtLiveEdge === isAtLiveEdge &&
      prevState.liveLatency === liveLatency
    ) {
      return;
    }

    this.store.setState({ isAtLiveEdge, liveLatency });

    if (prevState.isAtLiveEdge !== isAtLiveEdge) {
      this.onStateChange({
        isLive: true,
        isAtLiveEdge,
        liveLatency,
        dvr: prevState.dvr,
      });
    }
  }
}
