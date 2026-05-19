export interface CreatePlayerOptions {
  video: HTMLVideoElement;
  src: string;
  autoPlay?: boolean;
  root?: HTMLElement;
  keyboard?: boolean;
  startTime?: number;
}

export type QualityLevel = {
  id: number;
  label: string;
  width: number;
  height: number;
  bitrate: number;
};

export type BufferedRange = {
  start: number;
  end: number;
};

export type PlayerState = {
  src: string;
  isReady: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  selectedQuality: number | "auto";
  activeQuality: number | null;
  qualities: QualityLevel[];
  buffered: BufferedRange[];
  bufferedEnd: number;
  bufferedPercent: number;
};

export type PlayerSnapshot = Readonly<PlayerState>;

export type Unsubscribe = () => void;

export type PlayerStateListener = (state: PlayerSnapshot) => void;

export type SourceOptions = {
  src: string;
  autoPlay?: boolean;
  startTime?: number;
};

export type PlayerControls = {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: number | "auto") => void;
  setSource: (options: SourceOptions) => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}
