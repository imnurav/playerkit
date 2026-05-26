import type { PlayerStore } from "../core/store";
import {
  getLiveEdge,
  getLiveLatency,
  getSeekableStart,
} from "../utils/helpers";

export type LiveStatePayload = {
  isLive: boolean;
  isAtLiveEdge: boolean;
  liveLatency: number;
  dvr: boolean;
};

/**
 * Manages all live stream state: latency tracking, DVR detection, live-edge sync.
 *
 * Design principle: `evaluate()` is the SINGLE authoritative writer of
 * `isAtLiveEdge` and `liveLatency`. All other methods (`detectLive`, `detectLive`,
 * `seekToLive`) only update orthogonal fields (isLive, dvr, seekableStart/End)
 * and then delegate to `evaluate()` for the live-edge fields.
 *
 * This eliminates the race condition where `detectLive()` (called on every
 * LEVEL_UPDATED from hls.js) would reset isAtLiveEdge back to true while
 * `evaluate()` had already computed the user is behind.
 */
export class LiveManager {
  private video: HTMLVideoElement;
  private store: PlayerStore;
  /** Callback to emit `livestatechange` event on the Player EventEmitter. */
  private onStateChange: (payload: LiveStatePayload) => void;
  /**
   * Seconds behind live edge to consider "at live edge".
   * Configurable via `live.syncDuration` prop.
   */
  private liveSyncDuration: number;

  /** Guards against repeated initial-sync seeks. */
  private initialLivePosSet = false;
  /**
   * Sticky DVR flag. Set to true when latency exceeds liveSyncDuration
   * for DVR_CONFIRM_TICKS consecutive evaluations (see below).
   * Only cleared when latency drops below 75% of liveSyncDuration (hysteresis).
   */
  private userIsInDvr = false;
  /**
   * Consecutive-reading counter used to debounce DVR entry.
   *
   * HLS.js advances seekable.end() by one full segment duration each time a
   * new segment loads (~2-6 s). This causes a transient latency spike that
   * looks like the user went behind — even when they're sitting at the live
   * edge. Without dampening, every segment boundary would flip the badge to
   * "Go Live" for a second or two, then snap back.
   *
   * Solution: latency must exceed liveSyncDuration for DVR_CONFIRM_TICKS
   * consecutive computeLiveSnapshot() calls before userIsInDvr is set to true.
   * timeupdate fires ~every 250 ms, so 3 ticks ≈ 750 ms. A real segment-
   * boundary spike lasts only 1–2 ticks; genuine lag (pause, slow network)
   * lasts much longer.
   */
  private dvrEntryCount = 0;
  /** Number of consecutive high-latency readings required to enter DVR mode. */
  private static readonly DVR_CONFIRM_TICKS = 3;
  /** Timer handle for polling live latency while the video is paused. */
  private pauseTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    video: HTMLVideoElement,
    store: PlayerStore,
    onStateChange: (payload: LiveStatePayload) => void,
    liveSyncDuration: number,
  ) {
    this.video = video;
    this.store = store;
    this.onStateChange = onStateChange;
    this.liveSyncDuration = liveSyncDuration;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  /** Reset all live state when a new source is loaded. */
  reset() {
    this.initialLivePosSet = false;
    this.userIsInDvr = false;
    this.dvrEntryCount = 0;
    this.clearPauseTimer();
  }

  destroy() {
    this.clearPauseTimer();
  }

  // ─── Initial sync ───────────────────────────────────────────────────────

  /**
   * Seek the video to the live edge on first load.
   * Called once after hls.js reports the first LEVEL_UPDATED on a live stream.
   * Returns true if the seek happened, false if already done or edge not ready.
   */
  tryInitialSync(): boolean {
    if (this.initialLivePosSet) return false;
    this.initialLivePosSet = true;
    const edge = getLiveEdge(this.video);
    if (edge > 0) {
      this.video.currentTime = edge;
      this.userIsInDvr = false;
      this.dvrEntryCount = 0;
      // evaluate() will pick up the exact latency after the seek settles
      this.evaluate();
      return true;
    }
    return false;
  }

  // ─── Live detection ─────────────────────────────────────────────────────

  /**
   * Called on every hls.js LEVEL_UPDATED event (every playlist refresh).
   * Updates only the structural live fields (isLive, dvr, seekable window).
   * NEVER touches isAtLiveEdge / liveLatency — those are evaluate()'s job.
   * Immediately calls evaluate() so the live-edge badge stays accurate.
   */
  detectLive() {
    const seekableStart = getSeekableStart(this.video);
    const seekableEnd = getLiveEdge(this.video);
    const seekableRange = seekableEnd - seekableStart;
    const dvr = seekableRange > this.liveSyncDuration;

    this.store.setState({
      isLive: true,
      dvr,
      seekableStart,
      seekableEnd,
    });

    // Delegate live-edge accuracy to evaluate()
    this.evaluate();
  }

  /** Called when hls.js reports the manifest is actually VOD after being live. */
  markVod() {
    this.userIsInDvr = false;
    this.clearPauseTimer();
    this.store.setState({
      isLive: false,
      isAtLiveEdge: false,
      liveLatency: 0,
      dvr: false,
    });
    this.onStateChange({
      isLive: false,
      isAtLiveEdge: false,
      liveLatency: 0,
      dvr: false,
    });
  }

  // ─── Latency evaluation ─────────────────────────────────────────────────

  /**
   * Compute the current live edge status without writing to the store.
   * Returns null if the stream is not live.
   * Used by timeupdate in player.ts to merge live state into one atomic patch.
   */
  computeLiveSnapshot(): { isAtLiveEdge: boolean; liveLatency: number } | null {
    if (!this.store.getState().isLive) return null;

    const latency = getLiveLatency(this.video);

    if (latency > this.liveSyncDuration) {
      // Increment the confirmation counter instead of entering DVR immediately.
      // Only flip the flag after DVR_CONFIRM_TICKS consecutive high-latency
      // readings — this absorbs the transient spike that occurs every time
      // hls.js loads a new segment and advances seekable.end().
      this.dvrEntryCount++;
      if (this.dvrEntryCount >= LiveManager.DVR_CONFIRM_TICKS) {
        this.userIsInDvr = true;
      }
    } else if (latency <= this.liveSyncDuration * 0.75) {
      // Latency is within the live zone — cancel any pending DVR entry
      // and clear DVR mode if the user has caught back up.
      this.dvrEntryCount = 0;
      this.userIsInDvr = false;
    } else {
      // Latency is in the hysteresis band (75–100% of syncDuration).
      // Don't change either flag, and reset the confirmation counter so
      // a spike that subsides before DVR_CONFIRM_TICKS does not accumulate.
      this.dvrEntryCount = 0;
    }

    return { isAtLiveEdge: !this.userIsInDvr, liveLatency: latency };
  }

  /**
   * Evaluate live edge state and write to the store + emit the callback.
   * Called from the pause-polling timer and from detectLive/seekToLive
   * where no outer patchState call is going to happen.
   *
   * Hysteresis:
   *   - Enter DVR mode: latency > liveSyncDuration  (e.g. > 5s behind)
   *   - Exit  DVR mode: latency ≤ liveSyncDuration * 0.75  (e.g. ≤ 3.75s)
   */
  evaluate() {
    const state = this.store.getState();
    if (!state.isLive) return;

    const snapshot = this.computeLiveSnapshot();
    if (!snapshot) return;
    const { isAtLiveEdge: atEdge, liveLatency: latency } = snapshot;

    // Write directly to the store; the callback only fires when at-edge flips.
    this.store.setState({ isAtLiveEdge: atEdge, liveLatency: latency });
    if (state.isAtLiveEdge !== atEdge) {
      this.onStateChange({
        isLive: true,
        isAtLiveEdge: atEdge,
        liveLatency: latency,
        dvr: state.dvr,
      });
    }
  }

  // ─── Pause polling ──────────────────────────────────────────────────────

  /**
   * Start a 1-second interval to keep live latency accurate while paused.
   * During playback, evaluate() is driven by timeupdate events instead.
   */
  startPausePolling() {
    this.clearPauseTimer();
    this.pauseTimer = setInterval(() => this.evaluate(), 1000);
  }

  stopPausePolling() {
    this.clearPauseTimer();
  }

  private clearPauseTimer() {
    if (this.pauseTimer !== null) {
      clearInterval(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  // ─── Seek / user action ─────────────────────────────────────────────────

  /**
   * Called when the user seeks to a specific time on a live stream.
   * Updates the DVR flag based on how far behind live edge the seek target is.
   */
  onSeek(time: number) {
    const edge = getLiveEdge(this.video);
    if (edge <= 0) return;

    if (time < edge - this.liveSyncDuration) {
      // User deliberately seeked into the DVR window — enter DVR immediately
      // (no confirmation ticks needed; this is an explicit user action).
      this.userIsInDvr = true;
      this.dvrEntryCount = LiveManager.DVR_CONFIRM_TICKS;
    } else {
      // User seeked back near the live edge — clear DVR mode immediately.
      this.userIsInDvr = false;
      this.dvrEntryCount = 0;
    }
    // Update live state immediately after seek
    this.evaluate();
  }

  /**
   * Jump to the live edge. Clears DVR mode and snaps state immediately.
   * Returns true if seek happened, false if live edge not available.
   */
  seekToLive(): boolean {
    const edge = getLiveEdge(this.video);
    if (edge <= 0) return false;

    this.video.currentTime = edge;
    this.userIsInDvr = false;
    this.dvrEntryCount = 0;
    // Don't hard-code liveLatency: 0 here — let evaluate() compute it
    // after the seek settles to avoid stale values.
    this.evaluate();
    return true;
  }
}
