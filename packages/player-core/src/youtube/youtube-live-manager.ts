import type { PlayerStore } from "../shared/store";
import type { YoutubePlayer } from "./youtube-player";
import { clamp } from "../utils/helpers";
import { logger } from "../utils/logger";

/**
 * YoutubeLiveManager — isolates all Live-stream latency calibration, DVR detection,
 * pause polling, auto-seeking, and live-edge sync logic for the YouTube engine.
 */
export class YoutubeLiveManager {
  private player: YoutubePlayer;
  private store: PlayerStore;

  private minObservedLatency = 25; // default ingestion latency (seconds)
  private userIsInDvr = false;
  private dvrEntryCount = 0;
  private playbackTicks = 0;
  private static readonly DVR_CONFIRM_TICKS = 3;
  private pauseTimer: ReturnType<typeof setInterval> | null = null;
  private dvrDetected: boolean | null = null;
  private hasSyncedToLiveEdge = false;
  private hasExplicitStartTime = false;
  private initialSyncCompleted = false;

  // Active seek probe state variables
  private probeState: "idle" | "seeking" | "verifying" | "done" = "idle";
  private probeStartTime = 0;
  private probeInitialTime = 0;
  private probeSeekTarget = 0;

  constructor(player: YoutubePlayer, store: PlayerStore, forcedDvr?: boolean) {
    this.player = player;
    this.store = store;
    if (forcedDvr !== undefined) {
      this.dvrDetected = forcedDvr;
    }
  }

  setHasExplicitStartTime(val: boolean) {
    this.hasExplicitStartTime = val;
  }

  getMinObservedLatency() {
    return this.minObservedLatency;
  }

  getDvrDetected() {
    return this.dvrDetected;
  }

  getInitialSyncCompleted() {
    return this.initialSyncCompleted;
  }

  setInitialSyncCompleted(val: boolean) {
    this.initialSyncCompleted = val;
    this.store.setState({ initialSyncCompleted: val });
  }

  reset() {
    this.minObservedLatency = 25;
    this.userIsInDvr = false;
    this.dvrEntryCount = 0;
    this.dvrDetected = null;
    this.playbackTicks = 0;
    this.hasSyncedToLiveEdge = false;
    this.initialSyncCompleted = false;
    this.probeState = "idle";
    this.probeStartTime = 0;
    this.probeInitialTime = 0;
    this.probeSeekTarget = 0;
    this.stopPausePolling();
  }

  destroy() {
    this.stopPausePolling();
  }

  /**
   * Evaluate live latency, DVR state, and perform auto-seek/sync to the live edge.
   */
  evaluate(currentTime: number, duration: number, isPlaying: boolean) {
    if (duration <= 0) {
      if (isPlaying && !this.initialSyncCompleted) {
        this.setInitialSyncCompleted(true);
      }
      return;
    }

    // 1. Auto-seek to live edge on first playback to bypass YouTube's cached-position resume
    if (
      !this.hasSyncedToLiveEdge &&
      !this.hasExplicitStartTime &&
      this.dvrDetected === true
    ) {
      this.hasSyncedToLiveEdge = true;
      const liveEdge = Math.max(0, duration - this.minObservedLatency);
      if (duration - currentTime > 60 && liveEdge > 0) {
        // Ensure dvr is initialized in the state store so that the player's seek() is not blocked
        this.store.setState({ dvr: this.dvrDetected ?? false });

        logger.info(
          `Auto-seeking to live edge to bypass cached resume\n` +
            `• Current Time: ${currentTime.toFixed(1)}s\n` +
            `• Live Edge: ${liveEdge.toFixed(1)}s\n` +
            `• Delta: ${(duration - currentTime).toFixed(1)}s`,
        );
        setTimeout(() => {
          this.player.seek(liveEdge);
        }, 300);
        return;
      }
    }

    // 2. Programmatic active DVR detection seek probe
    if (this.dvrDetected === null) {
      if (isPlaying) {
        this.playbackTicks++;
      }

      if (duration > 120) {
        if (this.probeState === "idle") {
          if (this.playbackTicks >= 4) {
            this.probeState = "seeking";
            this.probeInitialTime = currentTime;
            this.probeSeekTarget = Math.max(0, currentTime - 15);
            logger.info(
              `[YoutubeLiveManager] Starting active DVR seek probe...\n` +
                `• Initial Playhead: ${this.probeInitialTime.toFixed(1)}s\n` +
                `• Target Playhead: ${this.probeSeekTarget.toFixed(1)}s\n` +
                `• Initiating native seekTo...`
            );
            
            this.probeStartTime = Date.now();
            this.probeState = "verifying";

            try {
              this.player.getNativePlayer()?.seekTo(this.probeSeekTarget, true);
            } catch (err) {
              logger.error(`[YoutubeLiveManager] Native seekTo failed during probe:`, err);
            }
          }
        } else if (this.probeState === "verifying") {
          const elapsed = Date.now() - this.probeStartTime;
          if (elapsed >= 400) {
            const delta = this.probeInitialTime - currentTime;
            if (delta >= 8) {
              this.dvrDetected = true;
              this.probeState = "done";
              logger.info(
                `Live DVR Support Confirmed ✅ (Active Probe Succeeded)\n` +
                  `• Broadcast Duration: ${duration.toFixed(1)} seconds\n` +
                  `• Target Seeked Time: ${this.probeSeekTarget.toFixed(1)} seconds\n` +
                  `• Actual Playhead: ${currentTime.toFixed(1)} seconds\n` +
                  `• Delta: ${delta.toFixed(1)} seconds\n` +
                  `• Scrubbing and seeking enabled.\n` +
                  `----------------------------------------`
              );
              
              // Immediately restore live playback edge
              logger.info(`[YoutubeLiveManager] Restoring playback to live edge...`);
              this.seekToLive(duration);
            } else if (elapsed >= 1500) {
              this.dvrDetected = false;
              this.probeState = "done";
              logger.info(
                `Non-DVR Stream Confirmed ❌ (Active Probe Failed/Timed Out)\n` +
                  `• Broadcast Duration: ${duration.toFixed(1)} seconds\n` +
                  `• Target Seeked Time: ${this.probeSeekTarget.toFixed(1)} seconds\n` +
                  `• Actual Playhead: ${currentTime.toFixed(1)} seconds\n` +
                  `• Delta: ${delta.toFixed(1)} seconds\n` +
                  `• Scrubbing and seeking disabled.\n` +
                  `----------------------------------------`
              );
            }
          }
        }
      } else if (this.playbackTicks > 12) {
        // Fallback for duration <= 120
        this.dvrDetected = false;
        logger.info(
          `Non-DVR Stream Confirmed ❌ (Duration <= 120s)\n` +
            `• Broadcast Duration: ${duration.toFixed(1)} seconds\n` +
            `• Scrubbing and seeking disabled.\n` +
            `----------------------------------------`
        );
      }
    }

    // Intercept currentTime during active seek probe to avoid UI jumps
    let reportedTime = currentTime;
    if (this.probeState === "seeking" || this.probeState === "verifying") {
      reportedTime = this.probeInitialTime;
    }

    const dvr = this.dvrDetected ?? false;
    const update: Partial<import("../types/player.types").PlayerState> = {
      dvr,
      currentTime: reportedTime,
      duration,
    };

    if (dvr) {
      // Calibrate client-side live edge ingestion delay
      const rawLatency = duration - reportedTime;
      if (!this.userIsInDvr && isPlaying) {
        if (rawLatency > 5 && rawLatency < 60) {
          this.minObservedLatency = Math.min(
            this.minObservedLatency,
            rawLatency,
          );
          this.minObservedLatency = clamp(this.minObservedLatency, 15, 45);
        }
      }

      // Define seekable window boundaries (YouTube live stream DVR limit is 12 hours)
      const seekableEnd = Math.max(0, duration - this.minObservedLatency);
      const seekableStart = Math.max(0, seekableEnd - 43200);
      const liveLatency = Math.max(0, seekableEnd - reportedTime);

      // Debounce DVR mode entries using hysteresis model
      const liveSyncDuration = 15;
      if (liveLatency > liveSyncDuration) {
        this.dvrEntryCount++;
        if (this.dvrEntryCount >= YoutubeLiveManager.DVR_CONFIRM_TICKS) {
          this.userIsInDvr = true;
        }
      } else if (liveLatency <= liveSyncDuration * 0.75) {
        this.dvrEntryCount = 0;
        this.userIsInDvr = false;
      } else {
        this.dvrEntryCount = 0;
      }

      update.isAtLiveEdge = !this.userIsInDvr;
      update.liveLatency = liveLatency;
      update.seekableStart = seekableStart;
      update.seekableEnd = seekableEnd;
    } else {
      // Non-DVR YouTube live stream: force live edge and disable seeking
      this.userIsInDvr = false;
      this.dvrEntryCount = 0;
      update.isAtLiveEdge = true;
      update.liveLatency = 0;
      update.seekableStart = 0;
      update.seekableEnd = 0;
    }

    // Handle initialSyncCompleted calculation
    if (!this.initialSyncCompleted) {
      if (this.dvrDetected !== null) {
        this.setInitialSyncCompleted(true);
        update.initialSyncCompleted = true;
      }
    }

    this.store.setState(update);
  }

  // ─── Pause Polling ───

  startPausePolling() {
    this.stopPausePolling();
    const state = this.store.getState();
    if (!state.isLive || !state.dvr) return;

    this.pauseTimer = setInterval(() => {
      try {
        const nativePlayer = this.player.getNativePlayer();
        if (nativePlayer) {
          this.player.triggerTimeUpdate(nativePlayer.getCurrentTime());
        }
      } catch {}
    }, 1000);
  }

  stopPausePolling() {
    if (this.pauseTimer !== null) {
      clearInterval(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  onSeek(time: number, duration: number) {
    const seekableEnd = Math.max(0, duration - this.minObservedLatency);
    const liveLatency = Math.max(0, seekableEnd - time);
    const liveSyncDuration = 15;

    if (liveLatency > liveSyncDuration) {
      this.userIsInDvr = true;
      this.dvrEntryCount = YoutubeLiveManager.DVR_CONFIRM_TICKS;
    } else {
      this.userIsInDvr = false;
      this.dvrEntryCount = 0;
    }

    const seekableStart = Math.max(0, seekableEnd - 43200);

    this.store.setState({
      isAtLiveEdge: !this.userIsInDvr,
      liveLatency,
      seekableStart,
      seekableEnd,
    });
  }

  seekToLive(duration: number) {
    const seekableEnd = Math.max(0, duration - this.minObservedLatency);
    if (seekableEnd > 0) {
      this.player.seek(seekableEnd);
    }
  }
}
