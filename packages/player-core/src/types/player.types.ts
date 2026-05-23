import type { PlayerError } from "./events.types";

// ─── Token Authentication ────────────────────────────────────────────────────

export interface TokenFetcherOptions {
  /** Original stream URL before authentication */
  src: string;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface TokenResult {
  /** Authenticated URL (with token already appended) */
  url: string;
  /** Seconds until the token expires — enables auto-refresh */
  expiresIn?: number;
  /** Optional auth headers to pass to HLS.js xhrSetup */
  headers?: Record<string, string>;
}

/**
 * Callback that fetches an authentication token for a stream URL.
 *
 * The developer provides this function and captures any metadata
 * (like `videoId`) in their closure. The returned URL should be
 * the fully authenticated stream URL (with token already appended).
 *
 * @example
 * ```ts
 * const tokenFetcher: TokenFetcher = async ({ src }) => {
 *   const res = await fetch('/api/video/token', {
 *     method: 'POST',
 *     body: JSON.stringify({ url: src }),
 *   });
 *   const { video_url, token } = await res.json();
 *   return { url: `${video_url}?token=${token}` };
 * };
 * ```
 *
 * @example
 * ```ts
 * const videoId = 527697;
 * const tokenFetcher: TokenFetcher = async ({ signal }) => {
 *   const res = await fetch(
 *     `https://api.khanglobalstudies.com/v4/courses/video/${videoId}`,
 *     { signal },
 *   );
 *   const data = await res.json();
 *   return { url: data.video_url };
 * };
 * ```
 */
export type TokenFetcher = (
  options: TokenFetcherOptions,
) => Promise<TokenResult>;

// ─── Player Options ──────────────────────────────────────────────────────────

export interface CreatePlayerOptions {
  /** The <video> element to attach to */
  video: HTMLVideoElement;
  /** HLS stream URL */
  src: string;
  /** Auto-play on load */
  autoPlay?: boolean;
  /** Root element for fullscreen (defaults to video element) */
  root?: HTMLElement;
  /** Enable keyboard shortcuts */
  keyboard?: boolean;
  /** Start playback at this time (seconds) */
  startTime?: number;

  // ── Live streaming ──
  /** Seconds threshold to consider "at live edge" (default: 3) */
  liveSyncDuration?: number;
  /** Enable low-latency HLS mode */
  lowLatency?: boolean;

  // ── Authentication ──
  /** Token fetcher for authenticated streams (e.g. Akamai) */
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
  /** Current fatal error, or null if playback is healthy */
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

  // ── Live stream state ──
  /** true if the current stream is a live broadcast */
  isLive: boolean;
  /** true if playback is within liveSyncDuration of the live edge */
  isAtLiveEdge: boolean;
  /** Seconds behind the live edge (0 for VOD) */
  liveLatency: number;
  /** true if the live stream supports DVR (seekable range > threshold) */
  dvr: boolean;
  /** Start of the seekable range (for live DVR window) */
  seekableStart: number;
  /** End of the seekable range (live edge position) */
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
  /** Retry loading the current source after a fatal error */
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
  /** Jump to the live edge (no-op for VOD) */
  seekToLive: () => void;
};
