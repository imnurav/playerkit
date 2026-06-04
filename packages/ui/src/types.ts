import type {
  PlayerSnapshot,
  PlayerControls as PlayerControlsInterface,
} from "@playerkit/core";
import type {
  ControlsLayout,
  PlayerThemeName,
  PlayerCustomization,
} from "./themes/types";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { PlayerIconMap } from "./icons/icon-types";

export type PlayerObjectFit = "contain" | "cover" | "fill";

export type PlayerControlsProps = {
  buffered: number;
  progress: number;
  isMobile: boolean;
  player: PlayerControlsInterface | null;
  playbackRates: number[];
  theme?: PlayerThemeName;
  controlsVisible?: boolean;
  state: PlayerSnapshot | null;
  onControlsInteraction?: () => void;
  seekRelative: (direction: -1 | 1) => void;
  onSettingsOpenChange?: (open: boolean) => void;
  /** Developer customization overrides */
  customization?: PlayerCustomization;
  objectFit?: PlayerObjectFit;
  /** Callback when user clicks video fit toggle */
  onObjectFitChange?: (fit: PlayerObjectFit) => void;
};

export type ControlRowProps = {
  isMobile: boolean;
  player: PlayerControlsInterface | null;
  showSettings: boolean;
  layout: ControlsLayout;
  playbackRates: number[];
  openSettings: () => void;
  closeSettings: () => void;
  state: PlayerSnapshot | null;
  progressBar: ReactNode;
  customization?: PlayerCustomization;
  objectFit?: PlayerObjectFit;
  seekRelative: (direction: -1 | 1) => void;
  gearRef: React.RefObject<HTMLButtonElement | null>;
  onObjectFitChange?: (fit: PlayerObjectFit) => void;
};

export type ControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
};

export type MobileTopBarProps = {
  controlsVisible?: boolean;
  onOpenSettings: () => void;
  state: PlayerSnapshot | null;
  player: PlayerControlsInterface | null;
  customization?: PlayerCustomization;
  objectFit?: PlayerObjectFit;
  onObjectFitChange?: (fit: PlayerObjectFit) => void;
};

export type ProgressBarProps = {
  buffered: number;
  progress: number;
  duration: number;
  className?: string;
  currentTime: number;
  player: PlayerControlsInterface | null;
  state?: PlayerSnapshot | null;
};

export type SettingsPanelProps = {
  playbackRates: number[];
  player: PlayerControlsInterface | null;
  state: PlayerSnapshot | null;
  onClose: () => void;
  isMobile: boolean;
  mode?: "dropdown" | "sheet";
  themeClass?: string;
};

export type TimeDisplayProps = {
  currentTime: number;
  duration: number;
  isLive?: boolean;
  className?: string;
};

export type VolumeControlProps = {
  player: PlayerControlsInterface | null;
  state: PlayerSnapshot | null;
  className?: string;
};

export type PlayerIconProviderProps = {
  icons?: Partial<PlayerIconMap>;
  children: ReactNode;
};
