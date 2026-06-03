import type { PlayerCustomization } from "@nurav/player-ui";

export type ViewportId = "desktop" | "tablet" | "phone" | "small";

/** Explicit category for each source — no heuristic guessing */
export type SourceCategory = "youtube" | "hls-live" | "hls-vod" | "error";

export interface Source {
  label: string;
  src: string;
  /** Explicit type tag — determines which group this source appears under */
  category: SourceCategory;
  /** Optional description shown as tooltip */
  description?: string;
}

export interface Viewport {
  id: ViewportId;
  label: string;
  w: number | null;
  h: number | null;
  device: boolean;
}

export interface AccentColor {
  label: string;
  value: string;
}

export interface PlaygroundConfig {
  src: string;
  accentColor: string;
  lowLatency: boolean;
  autoPlay: boolean;
  muted: boolean;
  customRates: boolean;
  disableDevOptions: boolean;
  seekStep: number;
  liveSyncDuration: number;
  customization: PlayerCustomization;
}
