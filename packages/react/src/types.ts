import type { ReactNode, VideoHTMLAttributes, RefObject } from "react";
import type {
  Player,
  LogLevel,
  PlayerError,
  TokenFetcher,
  PlayerControls,
  PlayerSnapshot,
  CreatePlayerOptions,
  Mp4Player as Mp4PlayerEngine,
  YoutubePlayer as YoutubePlayerEngine,
} from "@playerkit/core";
import type {
  ThemeVars,
  PlayerThemeName,
  PlayerObjectFit,
  PlayerCustomization,
} from "@playerkit/ui";

// ─── Shareable UI / Theme Types ─────────────────────────────────────────────

export type {
  PlayerThemeName,
  ThemeVars,
  PlayerCustomization,
  PlayerObjectFit,
};

/** The set of engines the master `Player` component can auto-select. */
export type PlayerEngineType = "hls" | "mp4" | "youtube";

// ─── Base Player Component Types ─────────────────────────────────────────────

export type BasePlayerProps = {
  /** The source URL or YouTube video ID. */
  src: string;
  /** Explicitly specify the player stream format ("hls" | "mp4" | "youtube"). If not provided, it will automatically detect based on the source URL/ID. */
  type?: PlayerEngineType;
  /** Optional CSS class name to style the outer container of the player. */
  className?: string;
  /** Inline styles for the outer player container. */
  style?: React.CSSProperties;
  /** Whether the player control bar and floating controls are enabled. Default: true */
  controls?: boolean;
  /** Whether playback starts automatically when loaded. Default: false */
  autoPlay?: boolean;
  /** Time in seconds to start playback from. Default: 0 */
  startTime?: number;
  /** Whether keyboard controls are enabled. Default: true */
  keyboard?: boolean;
  /** Predefined player theme name. Defaults to "default" */
  theme?: PlayerThemeName;
  /** CSS custom properties to override theme variables (e.g. `--pk-accent`). */
  themeOverrides?: ThemeVars;
  /** Array of custom playback speed values available in the settings menu. */
  playbackRates?: number[];
  /** Number of seconds to seek backward/forward on seek keypress or double-tap gestures. Default: 10 */
  seekStep?: number;
  /** Active protection to block developer tools, shortcut keys, dragging, and context menus. Default: false */
  disableDevOptions?: boolean;
  /** Proportion of the player width (0-1) to consider the center zone for tap-to-play/pause on mobile. Default: { start: 0.4, end: 0.6 } */
  centerZoneX?: { start: number; end: number };
  /** Proportion of the player height (0-1) to consider the center zone for tap-to-play/pause on mobile. Default: { start: 0.4, end: 0.6 } */
  centerZoneY?: { start: number; end: number };
  /** Callback triggered when the underlying core Player/YoutubePlayer instance is ready. */
  onPlayerReady?: (player: PlayerControls) => void;
  /** Configurable log level for the centralized logger. Default: "none" */
  logLevel?: LogLevel;
  /** Visual debug helper to show mobile/touch interactive seek & play zones. Default: false */
  debugTouchZones?: boolean;
  /** URL of the poster image to display before playback starts. */
  poster?: string;
  /** Detailed customization options to toggle UI elements like settings gear, volume bar, fullscreen toggle, time display, etc. */
  customization?: PlayerCustomization;
};

// ─── HlsPlayer Component Types ───────────────────────────────────────────────

export type HlsPlayerRenderControlsProps = {
  player: PlayerControls | null;
  state: PlayerSnapshot | null;
  progress: number;
  buffered: number;
  seekRelative: (direction: -1 | 1) => void;
  formatTime: (seconds: number) => string;
};

export type HlsPlayerProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "className" | "controls" | "src" | "style"
> &
  BasePlayerProps & {
    /** The DOM root element. */
    root?: HTMLElement | null;
    /** Optional CSS class name to style the raw HTML5 video element. */
    videoClassName?: string;
    /** Custom render function to completely replace the standard controls with a custom layout. */
    renderControls?: (props: HlsPlayerRenderControlsProps) => ReactNode;
    /** Token fetcher function for authenticated streams. Automatically gets called before loading source or during token refresh. */
    tokenFetcher?: TokenFetcher;
    /** Configuration options for live streams, including latency controls, sync thresholds, and explicit DVR/seeking enablement. */
    live?: import("@playerkit/core").LiveConfig;
  };

// ─── Mp4Player Component Types ──────────────────────────────────────────────
// MP4 is a progressive format — it does not support live streaming, DVR
// windows, latency tuning, or any of the HLS live semantics. The `live`
// prop is intentionally absent from `Mp4PlayerProps`.

export type Mp4PlayerProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "className" | "controls" | "src" | "style"
> &
  BasePlayerProps & {
    /** The DOM root element. */
    root?: HTMLElement | null;
    /** Optional CSS class name to style the raw HTML5 video element. */
    videoClassName?: string;
    /** Custom render function to completely replace the standard controls with a custom layout. */
    renderControls?: (props: HlsPlayerRenderControlsProps) => ReactNode;
    /** Token fetcher function for authenticated MP4 sources. Automatically gets called before loading source or during token refresh. */
    tokenFetcher?: TokenFetcher;
  };

// ─── YoutubePlayer Component Types ───────────────────────────────────────────
// YouTube supports live streams (via the YouTube IFrame API), so we
// re-introduce the `live` config for YoutubePlayerProps.

export type YoutubePlayerProps = BasePlayerProps & {
  /** Configuration options for live streams, including latency controls, sync thresholds, and explicit DVR/seeking enablement. */
  live?: import("@playerkit/core").LiveConfig;
};

// ─── Player (Master) Component Types ─────────────────────────────────────────

export type PlayerProps = HlsPlayerProps;

// ─── React Hooks Option/Result Types ─────────────────────────────────────────

export type UseHlsPlayerOptions = Omit<
  CreatePlayerOptions,
  "video" | "root"
> & {
  root?: HTMLElement | null;
  tokenFetcher?: TokenFetcher;
};

export type UseHlsPlayerResult = {
  player: Player | null;
  state: PlayerSnapshot | null;
  rootRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export type UseMp4PlayerOptions = Omit<
  CreatePlayerOptions,
  "video" | "root" | "live"
> & {
  root?: HTMLElement | null;
  tokenFetcher?: TokenFetcher;
};

export type UseMp4PlayerResult = {
  player: Mp4PlayerEngine | null;
  state: PlayerSnapshot | null;
  rootRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export type UseYoutubePlayerOptions = {
  src: string;
  autoPlay?: boolean;
  startTime?: number;
  security?: { disableDevOptions?: boolean };
  /** The DOM element where the YouTube iframe will be injected.
   * Must be an element inside the rendered component tree (e.g. a div ref). */
  containerRef: RefObject<HTMLDivElement | null>;
  /**
   * The outer player wrapper element to use for requestFullscreen().
   * Should be the `.pk-player` root div so all React event handlers
   * (onClick, onPointerMove, etc.) stay inside the fullscreen layer.
   */
  fullscreenRef?: RefObject<HTMLDivElement | null>;
  logLevel?: LogLevel;
  /** Configuration options for live streams, including latency controls, sync thresholds, and explicit DVR/seeking enablement. */
  live?: import("@playerkit/core").LiveConfig;
};

export type UseYoutubePlayerResult = {
  player: YoutubePlayerEngine | null;
  state: PlayerSnapshot | null;
};

export type UsePlayerTouchGesturesOptions = {
  seekStep: number;
  showControls: () => void;
  triggerHaptic: () => void;
  state?: PlayerSnapshot | null;
  player: PlayerControls | null;
  centerZoneX?: { start: number; end: number };
  centerZoneY?: { start: number; end: number };
  showCenterPlayFeedback: (action: "play" | "pause") => void;
  showSeekFeedback: (side: "left" | "right", seconds: number) => void;
};

export type UsePlayerMouseInteractionsOptions = {
  showControls: () => void;
  state?: PlayerSnapshot | null;
  isReady?: boolean;
  player: PlayerControls | null;
  enabled?: boolean;
};

export type UsePlayerRelativeSeekOptions = {
  seekStep: number;
  state?: PlayerSnapshot | null;
  player: PlayerControls | null;
  showSeekFeedback: (side: "left" | "right", seconds: number) => void;
};

export type UsePlayerKeyboardOptions = {
  player: PlayerControls | null;
  state: PlayerSnapshot | null;
  seekRelative: (direction: -1 | 1) => void;
  showControls: () => void;
  toggleStretch: () => void;
  toggleShortcuts?: () => void;
  enabled?: boolean;
};

export type UseControlsVisibilityOptions = {
  state: PlayerSnapshot | null;
  theme: string;
  autoHideDelay: number;
};

// ─── Sub-Component Option/Props Types ────────────────────────────────────────

export type BufferingSpinnerProps = {
  hasError: boolean;
  isBuffering: boolean;
};

export type CenterOverlayProps = {
  seekStep: number;
  hasError: boolean;
  isPlaying: boolean;
  isBuffering?: boolean;
  controlsVisible: boolean;
  onPlayToggle: () => void;
  centerOverlayGap?: number;
  showCenterOverlay: boolean;
  onSeek: (direction: -1 | 1) => void;
  isLive?: boolean;
  dvr?: boolean;
};

export type CenterPlayFeedbackType = {
  id: number;
  action: "play" | "pause";
};

export type CenterPlayFeedbackProps = {
  feedback: CenterPlayFeedbackType | null;
};

export type ErrorOverlayProps = {
  error: PlayerError | null;
  onRetry?: () => void;
};

export type LiveBadgeProps = {
  isLive: boolean;
  hasError: boolean;
  isAtLiveEdge: boolean;
  controlsVisible: boolean;
  onSeekToLive: () => void;
};

export type SecurityLockOverlayProps = {
  isActive: boolean;
};

export type SeekFeedbackType = {
  id: number;
  seconds: number;
  side: "left" | "right";
};

export type SeekFeedbackOverlayProps = {
  feedback: SeekFeedbackType | null;
  /** When true, positions seek feedback at top-left/top-right (mobile portrait). Default: false */
  isMobilePortrait?: boolean;
};

export type TouchDiagnosticOverlayProps = {
  isActive: boolean;
  centerZoneX?: { start: number; end: number };
  centerZoneY?: { start: number; end: number };
};

export type VideoViewProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "controls" | "playsInline"
> & {
  poster?: string;
  videoClassName?: string;
  objectFit?: PlayerObjectFit;
};

export type HudEvent = {
  type: "volume" | "speed" | "mute" | "play" | "pause";
  value?: string;
  id: number;
};

export type HudFeedbackProps = {
  state: PlayerSnapshot | null;
};

export type ShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type YoutubeVideoViewProps = {
  videoId?: string;
  posterUrl?: string;
  showPoster?: boolean;
  isBuffering?: boolean;
  error: PlayerError | null;
  debugTouchZones?: boolean;
  objectFit?: PlayerObjectFit;
  isDevtoolsDetected?: boolean;
  isMobilePortrait?: boolean;
  player: YoutubePlayerEngine | null;
  seekFeedback: SeekFeedbackType | null;
  centerZoneX?: { start: number; end: number };
  centerZoneY?: { start: number; end: number };
  centerPlayFeedback: CenterPlayFeedbackType | null;
};
