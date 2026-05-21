export type {
  PlayerControlVariant,
  PlayerControlSize,
  PlayerControlClassOptions,
} from "./control-variants";

export { getPlayerControlClassName } from "./control-variants";

// Components
export {
  ControlButton,
  ProgressBar,
  VolumeControl,
  TimeDisplay,
  MobileTopBar,
  SettingsPanel,
} from "./components";

export type {
  ControlButtonProps,
  ProgressBarProps,
  VolumeControlProps,
  TimeDisplayProps,
  MobileTopBarProps,
  SettingsPanelProps,
} from "./components";

// Icons
export {
  PlayerIconProvider,
  usePlayerIcons,
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconMinimize,
  IconSettings,
} from "./icons";

export type { PlayerIconProps, IconComponent, PlayerIconMap } from "./icons";

// Theme system
export { registerTheme, getTheme, getAllThemeStyles } from "./themes";

export type { ThemeDefinition, ThemeControlProps } from "./themes";

// Styles
export { basePlayerStyles } from "./styles";

// Utilities
export { formatPlayerTime } from "./format";

// Controls
export { PlayerControls } from "./player-controls";
export type { PlayerControlsProps } from "./player-controls";

// Control preset hook
export { usePlayerControlPreset } from "./use-control-preset";
