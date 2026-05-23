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
    className?: string;
    videoClassName?: string;
    controls?: boolean;
    onPlayerReady?: (player: Player) => void;
    poster?: string;
    renderControls?: (props: HlsPlayerRenderControlsProps) => ReactNode;
    seekStep?: number;
    theme?: HlsPlayerTheme;
    themeOverrides?: HlsPlayerThemeOverrides;
    playbackRates?: number[];
    /** Token fetcher for authenticated streams */
    tokenFetcher?: TokenFetcher;
    /** Seconds threshold to consider "at live edge" */
    liveSyncDuration?: number;
    /** Enable low-latency HLS mode */
    lowLatency?: boolean;
    /** Fine-grained control over which UI elements are visible */
    customization?: PlayerCustomization;
    /** Proportion of the player width (0-1) to consider the center zone for tap-to-play/pause on mobile (both touch & click). Default: { start: 0.4, end: 0.6 } (20% middle strip) */
    centerZoneX?: { start: number; end: number };
    /** Proportion of the player height (0-1) to consider the center zone for tap-to-play/pause on mobile (both touch & click). Default: { start: 0.4, end: 0.6 } (20% middle strip) */
    centerZoneY?: { start: number; end: number };
  };
