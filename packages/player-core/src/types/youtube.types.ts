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
  mute(): void;
  unMute(): void;
  destroy(): void;
  playVideo(): void;
  stopVideo(): void;
  pauseVideo(): void;
  isMuted(): boolean;
  getVolume(): number;
  getDuration(): number;
  getCurrentTime(): number;
  getPlayerState(): number;
  getPlaybackRate(): number;
  getPlaybackQuality(): string;
  setVolume(volume: number): void;
  getVideoLoadedFraction(): number;
  setPlaybackRate(rate: number): void;
  getAvailablePlaybackRates(): number[];
  getAvailableQualityLevels(): string[];
  setPlaybackQuality(suggestedQuality: string): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}
