import type { ReactNode, VideoHTMLAttributes } from "react";
import type { Player, PlayerSnapshot, TokenFetcher } from "@nurav/player-core";
import type {
  PlayerThemeName,
  ThemeVars,
  PlayerCustomization,
} from "@nurav/player-ui";
import type { UseHlsPlayerOptions } from "./useHlsPlayer";

export type HlsPlayerTheme = PlayerThemeName;
export type HlsPlayerThemeOverrides = ThemeVars;

export type HlsPlayerRenderControlsProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  progress: number;
  buffered: number;
  seekRelative: (direction: -1 | 1) => void;
  formatTime: (seconds: number) => string;
};

export type HlsPlayerProps = UseHlsPlayerOptions &
  Omit<
    VideoHTMLAttributes<HTMLVideoElement>,
    "autoPlay" | "className" | "controls" | "src"
  > & {
    /** Optional CSS class name to style the outer container of the player. */
    className?: string;
    /** Optional CSS class name to style the raw HTML5 video element. */
    videoClassName?: string;
    /** Whether the player control bar and floating controls are enabled. Default: true */
    controls?: boolean;
    /** Callback triggered when the underlying core Player instance is initialized. Useful for calling methods programmatically. */
    onPlayerReady?: (player: Player) => void;
    /** URL of the poster image to display while the video is loading. */
    poster?: string;
    /** Custom render function to completely replace the standard controls with a custom layout. */
    renderControls?: (props: HlsPlayerRenderControlsProps) => ReactNode;
    /** Number of seconds to seek backward/forward on seek keypress or double-tap gestures. Default: 10 */
    seekStep?: number;
    /** Predefined player theme name. Defaults to "kgs" */
    theme?: HlsPlayerTheme;
    /** CSS custom properties to override theme variables (e.g. `--vp-accent`). */
    themeOverrides?: HlsPlayerThemeOverrides;
    /** Array of custom playback speed values available in the settings menu. */
    playbackRates?: number[];
    /** Token fetcher function for authenticated streams. Automatically gets called before loading source or during token refresh. */
    tokenFetcher?: TokenFetcher;
    /** @deprecated Use `live.syncDuration` instead */
    liveSyncDuration?: number;
    /** @deprecated Use `live.lowLatency` instead */
    lowLatency?: boolean;
    /** Configuration options for live streams, including latency controls and sync thresholds. */
    live?: import("@nurav/player-core").LiveConfig;
    /** Detailed customization options to toggle UI elements like settings gear, volume bar, fullscreen toggle, time display, etc. */
    customization?: PlayerCustomization;
    /** Proportion of the player width (0-1) to consider the center zone for tap-to-play/pause on mobile. Default: { start: 0.4, end: 0.6 } */
    centerZoneX?: { start: number; end: number };
    /** Proportion of the player height (0-1) to consider the center zone for tap-to-play/pause on mobile. Default: { start: 0.4, end: 0.6 } */
    centerZoneY?: { start: number; end: number };
    /** Active protection to block developer tools, shortcut keys, dragging, and context menus. Default: false */
    disableDevOptions?: boolean;
  };
