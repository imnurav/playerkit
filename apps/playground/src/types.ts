import type { PlayerCustomization } from "@nurav/player-ui";

export type ViewportId = "desktop" | "tablet" | "phone" | "small";

export interface Viewport {
  id: ViewportId;
  label: string;
  w: number | null;
  h: number | null;
  device: boolean;
}

export interface Source {
  label: string;
  src: string;
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
  seekStep: number;
  liveSyncDuration: number;
  customization: PlayerCustomization;
}
