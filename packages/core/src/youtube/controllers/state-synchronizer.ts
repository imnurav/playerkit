import type { YoutubeLiveManager } from "../live/live-manager";
import type { ErrorManager } from "../../shared/error-manager";
import { YouTubePlayerState } from "../../types/youtube.types";
import type { YoutubeController } from "./youtube-controller";
import type { QualityLevel } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";

const YOUTUBE_ERROR_MAP: Record<number, string> = {
  2: "The YouTube request contains an invalid parameter value.",
  5: "The requested YouTube content cannot be played in an HTML5 player.",
  100: "The video requested was not found. It may have been removed or marked as private.",
  101: "The owner of the requested video does not allow it to be embedded.",
  150: "The owner of the requested video does not allow it to be embedded.",
};

/**
 * Handles mapping YouTube status changes, duration updates,
 * buffering spinner timeouts, and live-edge latency queries into the PlayerStore.
 */
export class StateSynchronizer {
  private duration = 0;
  private lastDurationSyncTime = 0;
  private lockTimeUpdateUntil = 0;

  private bufferingTimeout: ReturnType<typeof setTimeout> | null = null;
  private bufferingHideTimeout: ReturnType<typeof setTimeout> | null = null;
  private spinnerShownAt = 0;
  private lastPlayClickedAt = 0;
  private lastSeekAt = 0;

  constructor(
    private readonly store: PlayerStore,
    private readonly ytController: YoutubeController,
    private readonly liveManager: YoutubeLiveManager,
    private readonly callbacks: {
      onPlay: () => void;
      onPause: () => void;
      onEnded: () => void;
      onTimeUpdate: () => void;
      onReady: () => void;
      onQualitiesChange: (levels: QualityLevel[]) => void;
    },
  ) {}

  /** Lock time update events for a short period (e.g. during seeks). */
  lockTimeUpdate(ms: number): void {
    this.lockTimeUpdateUntil = Date.now() + ms;
  }

  /** Set the timestamp when play was explicitly clicked. */
  setLastPlayClickedAt(time: number): void {
    this.lastPlayClickedAt = time;
  }

  /** Set the timestamp when seek was explicitly initiated. */
  setLastSeekAt(time: number): void {
    this.lastSeekAt = time;
  }

  /** Retrieve the current cached duration. */
  getDuration(): number {
    return this.duration;
  }

  /** Reset internal duration variables on source changes. */
  resetDuration(): void {
    this.duration = 0;
    this.lastDurationSyncTime = 0;
  }

  /** Clean up pending loader timeouts. */
  clearTimeouts(): void {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }
    if (this.bufferingHideTimeout) {
      clearTimeout(this.bufferingHideTimeout);
      this.bufferingHideTimeout = null;
    }
  }

  /** Display the buffering loader debounced. */
  showBufferingSpinner(): void {
    if (this.bufferingHideTimeout) {
      clearTimeout(this.bufferingHideTimeout);
      this.bufferingHideTimeout = null;
    }
    if (this.store.getState().isBuffering) return;

    this.store.setState({ isBuffering: true });
    this.spinnerShownAt = Date.now();
  }

  /** Hide the buffering loader with minimum visibility bounds. */
  hideBufferingSpinner(): void {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }

    if (this.bufferingHideTimeout) {
      return; // Hide is already scheduled
    }

    const state = this.store.getState();
    if (!state.isBuffering) return;

    const MIN_SPINNER_SHOW_TIME = 250; // ms
    const timeShown = Date.now() - this.spinnerShownAt;
    const remainingTime = MIN_SPINNER_SHOW_TIME - timeShown;

    if (remainingTime > 0) {
      this.bufferingHideTimeout = setTimeout(() => {
        this.store.setState({ isBuffering: false });
        this.bufferingHideTimeout = null;
      }, remainingTime);
    } else {
      this.store.setState({ isBuffering: false });
    }
  }

  /** Syncs duration bounds with the state store. */
  syncDuration(): number {
    try {
      const player = this.ytController.getPlayer();
      const d = player?.getDuration() ?? 0;
      if (d > 0 && Number.isFinite(d)) {
        this.duration = d;
        this.store.setState({ duration: d });
        return d;
      }
    } catch {
      // Player might not be ready yet
    }
    return this.store.getState().duration;
  }

  /** Syncs structural live settings with the state store. */
  syncLiveStatus(): void {
    try {
      const player = this.ytController.getPlayer();
      if (!player) return;
      const videoData = (player as any).getVideoData?.();

      let isLive = !!(videoData?.isLive || videoData?.isLiveStream);

      const duration = player.getDuration() || 0;
      const currentTime = player.getCurrentTime() || 0;
      if (!isLive) {
        if (duration === 0 && currentTime > 10) {
          isLive = true;
        }
      }

      this.store.setState({
        isLive,
        dvr: isLive
          ? (this.liveManager.getDvrDetected() ?? false)
          : this.store.getState().dvr,
      });
    } catch {
      // Player might not be ready yet
    }
  }

  /** Handles raw player ready callbacks. */
  handleReady(): void {
    const player = this.ytController.getPlayer()!;
    const initialState = this.store.getState();

    // Sync volume/mute
    player.setVolume(initialState.volume * 100);
    if (initialState.isMuted) player.mute();

    // Sync speed
    player.setPlaybackRate(initialState.playbackRate);

    // Initial parsing
    const duration = this.syncDuration();
    this.syncLiveStatus();
    this.ytController.getQualityManager().syncQualities();

    const isLive = this.store.getState().isLive;
    const update: Partial<import("../../types/player.types").PlayerState> = {
      isReady: true,
      duration,
      isLive,
      initialSyncCompleted: false, // Keep poster overlay up initially
    };

    if (isLive) {
      this.liveManager.reset();
      update.isAtLiveEdge = true;
      update.dvr = false; // Prevent slider jitter
      update.seekableStart = 0;
      update.seekableEnd = 0;
      update.liveLatency = 0;
    }

    this.store.setState(update);
    this.callbacks.onReady();
  }

  /** Handles YouTube state change updates. */
  handleStateChange(ytState: YouTubePlayerState): void {
    const update: Partial<import("../../types/player.types").PlayerState> = {};

    switch (ytState) {
      case YouTubePlayerState.PLAYING:
        update.isPlaying = true;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        this.syncDuration();
        this.syncLiveStatus();

        if (!this.store.getState().isLive) {
          this.liveManager.setInitialSyncCompleted(true);
        }
        this.store.setState(update);
        this.callbacks.onPlay();
        break;

      case YouTubePlayerState.PAUSED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.startPauseTimer();
        this.store.setState(update);
        this.callbacks.onPause();
        break;

      case YouTubePlayerState.BUFFERING:
        const timeSincePlay = Date.now() - this.lastPlayClickedAt;
        const timeSinceSeek = Date.now() - this.lastSeekAt;
        const isTransient = timeSincePlay < 1000 || timeSinceSeek < 1000;
        const debounce = isTransient ? 800 : 250;

        if (!this.bufferingTimeout) {
          this.bufferingTimeout = setTimeout(() => {
            this.showBufferingSpinner();
            this.bufferingTimeout = null;
          }, debounce);
        }
        break;

      case YouTubePlayerState.ENDED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        this.store.setState(update);
        this.callbacks.onEnded();
        break;

      case YouTubePlayerState.CUED:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.stopPauseTimer();
        this.store.setState(update);
        break;

      default:
        update.isPlaying = false;
        this.hideBufferingSpinner();
        this.store.setState(update);
        break;
    }
  }

  /** Handles YouTube player time updates. */
  handleTimeUpdate(currentTime: number, ytState: YouTubePlayerState): void {
    if (Date.now() < this.lockTimeUpdateUntil) {
      const lastSeekTime = this.store.getState().currentTime;
      if (Math.abs(currentTime - lastSeekTime) < 1.5) {
        this.lockTimeUpdateUntil = 0;
      } else {
        return;
      }
    }
    const state = this.store.getState();
    if (state.isBuffering) return;

    if (currentTime === 0 && state.currentTime > 1.0) return;

    let isLive = state.isLive;
    const now = Date.now();

    if (!isLive) {
      if (this.duration === 0) {
        this.duration = this.syncDuration();
      } else if (now - this.lastDurationSyncTime > 1500) {
        const oldDur = this.duration;
        this.duration = this.syncDuration();
        this.lastDurationSyncTime = now;

        if (oldDur > 0 && this.duration > oldDur + 0.8) {
          isLive = true;
          this.store.setState({ isLive: true });
        }
      }
    } else {
      if (now - this.lastDurationSyncTime > 1000) {
        this.duration = this.syncDuration();
        this.lastDurationSyncTime = now;
      }
    }

    if (!isLive) {
      const nativePlayer = this.ytController.getPlayer();
      if (nativePlayer) {
        try {
          const dur = nativePlayer.getDuration() || 0;
          const curr = nativePlayer.getCurrentTime() || 0;
          if (dur === 0 && curr > 10) {
            isLive = true;
            this.store.setState({ isLive: true });
          }
        } catch {}
      }
    }

    if (isLive) {
      this.liveManager.evaluate(
        currentTime,
        this.duration,
        ytState === YouTubePlayerState.PLAYING,
      );
    } else {
      this.store.setState({
        currentTime,
        duration: this.duration,
        isLive,
      });
    }

    this.callbacks.onTimeUpdate();
  }

  /** Handles raw player errors. */
  handleError(errorCode: number, errorManager: ErrorManager): void {
    let message =
      YOUTUBE_ERROR_MAP[errorCode] ||
      `YouTube playback error (code: ${errorCode}).`;

    // Help developers debug local IP address restrictions
    if (
      (errorCode === 101 || errorCode === 150) &&
      typeof window !== "undefined"
    ) {
      const hostname = window.location.hostname;
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      if (isIP) {
        message +=
          " (Note: YouTube blocks restricted live stream embeds when accessed via raw IP addresses. Please use your local computer hostname, e.g., http://your-computer-name.local:5173, or an ngrok tunnel instead).";
      }
    }

    const err = {
      message,
      fatal: true,
      category: errorCode >= 100 ? ("auth" as const) : ("source" as const),
      details: `YouTube error code ${errorCode}`,
    };
    errorManager.raise(err);
  }

  /** Starts a timer to poll when paused. */
  startPauseTimer(): void {
    this.liveManager.startPausePolling();
  }

  /** Stops the paused polling timer. */
  stopPauseTimer(): void {
    this.liveManager.stopPausePolling();
  }
}
