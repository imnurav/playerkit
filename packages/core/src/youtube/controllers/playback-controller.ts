import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../../constants";
import type { YoutubeLiveManager } from "../live/live-manager";
import type { YoutubeController } from "./youtube-controller";
import type { StateSynchronizer } from "./state-synchronizer";
import type { PlayerStore } from "../../shared/store";
import { clamp } from "../../utils/helpers";

/**
 * Handles playback control instructions (play, pause, seek, volume, speed, quality)
 * and delegates to the native YouTube player.
 */
export class PlaybackController {
  constructor(
    private readonly store: PlayerStore,
    private readonly ytController: YoutubeController,
    private readonly synchronizer: StateSynchronizer,
    private readonly liveManager: YoutubeLiveManager,
  ) {}

  /** Start playing the video. */
  async play(): Promise<void> {
    this.synchronizer.setLastPlayClickedAt(Date.now());
    this.ytController.enqueue(() => this.ytController.getEngine().queuePlay());
  }

  /** Pause the video. */
  pause(): void {
    this.ytController.enqueue(() =>
      this.ytController.getEngine().queuePause(),
    );
  }

  /** Toggle play/pause states. */
  async togglePlay(): Promise<void> {
    const isPlaying = this.store.getState().isPlaying;
    const isBuffering = this.store.getState().isBuffering;

    if (isPlaying || isBuffering) {
      this.pause();
    } else {
      await this.play();
    }
  }

  /** Seek playback to a specific time. Clamps within seekable ranges. */
  seek(time: number): void {
    const state = this.store.getState();
    const duration = state.duration;
    let targetTime = time;

    this.synchronizer.setLastSeekAt(Date.now());

    if (state.isLive) {
      if (!state.dvr) {
        // Seeking is disabled on YouTube Live streams without DVR
        return;
      }

      this.liveManager.onSeek(time, duration);
      const seekableEnd = Math.max(
        0,
        duration - this.liveManager.getMinObservedLatency(),
      );
      const seekableStart = Math.max(0, seekableEnd - 43200);
      targetTime = clamp(time, seekableStart, seekableEnd);
    } else {
      targetTime = clamp(time, 0, duration);
    }

    this.store.setState({ currentTime: targetTime });
    this.synchronizer.lockTimeUpdate(1500);
    this.ytController.enqueue(() =>
      this.ytController.getEngine().queueSeek(targetTime),
    );
  }

  /** Seek straight to the live edge. */
  seekToLive(): void {
    const state = this.store.getState();
    if (state.isLive && state.dvr) {
      this.liveManager.seekToLive(state.duration);

      if (state.playbackRate > 1) {
        this.setPlaybackRate(1);
      }
    }
  }

  /** Set the volume from 0 to 1. */
  setVolume(vol: number): void {
    const clamped = clamp(vol, 0, 1);
    this.ytController.enqueue(() => {
      const player = this.ytController.getPlayer();
      if (player) {
        if (clamped === 0) {
          const state = this.store.getState();
          if (state.volume > 0) {
            this.store.setState({ previousVolume: state.volume });
          }
          player.mute();
        } else {
          player.unMute();
          player.setVolume(clamped * 100);
        }
      }
      this.store.setState({ volume: clamped, isMuted: clamped === 0 });
    });
  }

  /** Mute the player. */
  mute(): void {
    this.ytController.enqueue(() => {
      const state = this.store.getState();
      if (state.volume > 0) {
        this.store.setState({ previousVolume: state.volume });
      }
      this.ytController.getPlayer()?.mute();
    });
    this.store.setState({ isMuted: true });
  }

  /** Unmute the player. */
  unmute(): void {
    this.ytController.enqueue(() => {
      const player = this.ytController.getPlayer();
      if (player) {
        player.unMute();
        const state = this.store.getState();
        if (state.volume === 0) {
          const prev = state.previousVolume > 0 ? state.previousVolume : 0.5;
          player.setVolume(prev * 100);
          this.store.setState({ volume: prev });
        }
      }
    });
    this.store.setState({ isMuted: false });
  }

  /** Change the playback speed rate. */
  setPlaybackRate(rate: number): void {
    const clamped = clamp(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
    this.ytController.enqueue(() => {
      this.ytController.getPlayer()?.setPlaybackRate(clamped);
    });
    this.store.setState({ playbackRate: clamped });
  }

  /** Change the active quality level selection. */
  setQuality(quality: number | "auto"): void {
    this.ytController.enqueue(() => {
      this.ytController.getQualityManager().setQuality(quality);
    });
  }
}
