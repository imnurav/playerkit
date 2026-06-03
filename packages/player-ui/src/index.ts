// ─── Components ──────────────────────────────────────────────────────────────
export {
  ProgressBar,
  TimeDisplay,
  MobileTopBar,
  ControlButton,
  VolumeControl,
  SettingsPanel,
} from "./components";

// ─── Icons ───────────────────────────────────────────────────────────────────
export {
  IconPlay,
  IconPause,
  IconRewind,
  IconVolume,
  IconForward,
  IconMaximize,
  IconMinimize,
  IconSettings,
  IconVolumeOff,
  usePlayerIcons,
  PlayerIconProvider,
} from "./icons";

export type { PlayerIconProps, IconComponent, PlayerIconMap } from "./icons";

// ─── Theme System ────────────────────────────────────────────────────────────
export type {
  ThemeVars,
  ThemeConfig,
  ControlsLayout,
  ControlsPreset,
  PlayerThemeName,
  PlayerCustomization,
} from "./themes";

export { themes, getThemeConfig, getThemeNames } from "./themes";

// ─── Component Props ─────────────────────────────────────────────────────────
export type {
  PlayerObjectFit,
  ProgressBarProps,
  TimeDisplayProps,
  MobileTopBarProps,
  ControlButtonProps,
  VolumeControlProps,
  SettingsPanelProps,
  PlayerControlsProps,
  PlayerIconProviderProps,
} from "./types";

export { PlayerControls } from "./PlayerControls";

// ─── Utilities ───────────────────────────────────────────────────────────────
export { formatPlayerTime } from "./format";
