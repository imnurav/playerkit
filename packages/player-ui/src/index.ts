// ─── Components ──────────────────────────────────────────────────────────────
export {
  ProgressBar,
  TimeDisplay,
  MobileTopBar,
  ControlButton,
  VolumeControl,
  SettingsPanel,
} from "./components";

export type {
  ProgressBarProps,
  TimeDisplayProps,
  MobileTopBarProps,
  ControlButtonProps,
  VolumeControlProps,
  SettingsPanelProps,
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

// ─── Controls ────────────────────────────────────────────────────────────────
export type { PlayerControlsProps } from "./player-controls";
export { PlayerControls } from "./player-controls";

// ─── Utilities ───────────────────────────────────────────────────────────────
export { formatPlayerTime } from "./format";

// ─── CSS Imports (bundled by tsup) ───────────────────────────────────────────
// These are re-exported from the themes index
