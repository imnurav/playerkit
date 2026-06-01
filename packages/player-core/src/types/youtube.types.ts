/**
 * YouTube-specific types for the player engine.
 */

/** YouTube IFrame Player API states (mirrors YT.PlayerState). */
export const enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

/** Configuration for a YouTube player instance. */
export interface YouTubePlayerOptions {
  videoId: string;
  root: HTMLElement;
  autoPlay?: boolean;
  startTime?: number;
}

/** Shape of the YouTube IFrame Player API's onReady event. */
export interface YouTubePlayerReadyEvent {
  target: YouTubeIFramePlayer;
}

/** Shape of the YouTube IFrame Player API's onStateChange event. */
export interface YouTubePlayerStateChangeEvent {
  data: YouTubePlayerState;
  target: YouTubeIFramePlayer;
}

/** Shape of the YouTube IFrame Player API's onError event. */
export interface YouTubePlayerErrorEvent {
  data: number;
  target: YouTubeIFramePlayer;
}

/** Minimal YT.Player API surface we consume. */
export interface YouTubeIFramePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  setPlaybackQuality(suggestedQuality: string): void;
  getPlaybackQuality(): string;
  getAvailableQualityLevels(): string[];
  getCurrentTime(): number;
  getDuration(): number;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  destroy(): void;
}
