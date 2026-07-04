import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from "../../constants";
import { clamp, getMediaDuration } from "../../utils/helpers";
import type { PlayerStore } from "../../shared/store";
import { logger } from "../../utils/logger";

/**
 * Handles media playback control operations (play, pause, seek, volume, speed, mute, unmute).
 * Decouples direct DOM manipulation on HTMLVideoElement from Mp4Player.
 */
export class PlaybackController {
  constructor(
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
    private readonly patchState: (patch: any) => void,
  ) {}

  /** Play the MP4 video, falling back to muted autoplay if blocked. */
  async play(): Promise<void> {
    try {
      await this.video.play();
    } catch (err: any) {
      if (err && err.name === "NotAllowedError" && !this.video.muted) {
        logger.warn(
          "[Mp4Player] Unmuted autoplay blocked by browser policy, retrying muted...",
        );
        this.mute();
        try {
          await this.video.play();
        } catch (retryErr) {
          logger.error("[Mp4Player] Muted autoplay also blocked:", retryErr);
        }
      } else {
        logger.error("[Mp4Player] Playback failed:", err);
      }
    }
  }

  /** Pause the video. */
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

  /** Seek video to a specific time, clamped between 0 and duration. */
  seek(time: number): void {
    this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    this.patchState({ currentTime: this.video.currentTime });
  }

  /** No-op for progressive MP4 — there is no live edge. */
  seekToLive(): void {
    /* MP4 is always VOD */
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

  /** No-op for progressive MP4 — there is a single rendition. */
  setQuality(_quality: number | "auto"): void {
    /* MP4 has a single rendition */
  }
}
