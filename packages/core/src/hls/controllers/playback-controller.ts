import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../../constants";
import type { PlayerStore } from "../../shared/store";
import { logger } from "../../utils/logger";
import {
  getSeekableStart,
  getMediaDuration,
  getLiveEdge,
  clamp,
} from "../../utils/helpers";

/**
 * Manages video element media operations (play, pause, seek, volume, speed).
 * Decouples DOM actions from the main Player facade.
 */
export class PlaybackController {
  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly patchState: (patch: any) => void,
    private readonly onLiveSeek: (time: number) => void,
  ) {}

  /** Play the stream, falling back to muted autoplay if blocked. */
  async play(): Promise<void> {
    try {
      await this.video.play();
    } catch (err: any) {
      if (err && err.name === "NotAllowedError" && !this.video.muted) {
        logger.warn(
          "[Player] Unmuted autoplay blocked by browser policy, retrying muted...",
        );
        this.mute();
        try {
          await this.video.play();
        } catch (retryErr) {
          logger.error("[Player] Muted autoplay also blocked:", retryErr);
        }
      } else {
        logger.error("[Player] Playback failed:", err);
      }
    }
  }

  /** Pause playback. */
  pause(): void {
    this.video.pause();
  }

  /** Toggle play/pause state. */
  async togglePlay(): Promise<void> {
    if (this.video.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Seek playback to a specific time. Clamps within bounds depending on stream type (VOD/Live).
   */
  seek(time: number): void {
    const state = this.store.getState();
    if (state.isLive) {
      this.video.currentTime = clamp(
        time,
        getSeekableStart(this.video),
        getLiveEdge(this.video),
      );
      this.onLiveSeek(time);
    } else {
      this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    }
    this.patchState({ currentTime: this.video.currentTime });
  }

  /** Set playback volume level (0-1). */
  setVolume(vol: number): void {
    const c = clamp(vol, 0, 1);
    if (this.video.volume > 0 && c === 0) {
      this.patchState({ previousVolume: this.video.volume });
    }
    this.video.volume = c;
    this.video.muted = c === 0;
  }

  /** Mute the player. */
  mute(): void {
    if (this.video.volume > 0) {
      this.patchState({ previousVolume: this.video.volume });
    }
    this.video.muted = true;
  }

  /** Unmute the player, recovering previous volume if possible. */
  unmute(): void {
    this.video.muted = false;
    if (this.video.volume === 0) {
      const prev = this.store.getState().previousVolume;
      this.video.volume = prev > 0 ? prev : 0.5;
    }
  }

  /** Set target playback rate/speed. */
  setPlaybackRate(rate: number): void {
    this.video.playbackRate = clamp(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
    this.patchState({ playbackRate: this.video.playbackRate });
  }
}
