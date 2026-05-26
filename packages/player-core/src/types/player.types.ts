import type { PlayerError } from "./events.types";

// ─── Token Authentication ────────────────────────────────────────────────────

export interface TokenFetcherOptions {
  src: string;
  signal?: AbortSignal;
}

export interface TokenResult {
  url: string;
  expiresIn?: number;
  headers?: Record<string, string>;
}

export type TokenFetcher = (
  options: TokenFetcherOptions,
) => Promise<TokenResult>;

// ─── Live Stream Config ─────────────────────────────────────────────────────

export interface LiveConfig {
  syncDuration?: number;
  lowLatency?: boolean;
}

// ─── Player Options ──────────────────────────────────────────────────────────

export interface CreatePlayerOptions {
  video: HTMLVideoElement;
  src: string;
  autoPlay?: boolean;
  root?: HTMLElement;
  keyboard?: boolean;
  startTime?: number;
  live?: LiveConfig;
  tokenFetcher?: TokenFetcher;
}

// ─── Quality ─────────────────────────────────────────────────────────────────

export type QualityLevel = {
  id: number;
  label: string;
  width: number;
  height: number;
  bitrate: number;
};

// ─── Buffered ────────────────────────────────────────────────────────────────

export type BufferedRange = {
  start: number;
  end: number;
};

// ─── Player State ────────────────────────────────────────────────────────────

export type PlayerState = {
  src: string;
  isReady: boolean;
  error: PlayerError | null;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  isStretched: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  previousVolume: number;
  playbackRate: number;
  selectedQuality: number | "auto";
  activeQuality: number | null;
  qualities: QualityLevel[];
  buffered: BufferedRange[];
  bufferedEnd: number;
  bufferedPercent: number;

  // ── Live ──
  isLive: boolean;
  isAtLiveEdge: boolean;
  liveLatency: number;
  dvr: boolean;
  seekableStart: number;
  seekableEnd: number;
};

export type PlayerSnapshot = Readonly<PlayerState>;

export type Unsubscribe = () => void;

export type PlayerStateListener = (state: PlayerSnapshot) => void;

export type SourceOptions = {
  src: string;
  autoPlay?: boolean;
  startTime?: number;
};

// ─── Player Controls Interface ───────────────────────────────────────────────

export type PlayerControls = {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  retry: () => void;
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
  toggleStretch: () => void;
  seekToLive: () => void;
};
