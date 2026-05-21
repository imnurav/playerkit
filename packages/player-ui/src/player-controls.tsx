import type { Player, PlayerSnapshot } from "@varun/player-core";
import type {
  PlayerControlsLayoutPreset,
  PlayerThemeName,
} from "@varun/player-themes";
import { getTheme } from "./themes";
import { PlayerIconProvider } from "./icons";
import { usePlayerControlPreset } from "./use-control-preset";

export type PlayerControlsProps = {
  buffered: number;
  desktopPreset: PlayerControlsLayoutPreset;
  mobilePreset: PlayerControlsLayoutPreset;
  onControlsInteraction?: () => void;
  onSettingsOpenChange?: (open: boolean) => void;
  playbackRates: number[];
  player: Player | null;
  progress: number;
  seekRelative: (direction: -1 | 1) => void;
  state: PlayerSnapshot | null;
  theme?: PlayerThemeName;
  isMobile: boolean;
  controlsVisible?: boolean;
};

export function PlayerControls({
  buffered,
  desktopPreset,
  mobilePreset,
  onControlsInteraction,
  onSettingsOpenChange,
  playbackRates,
  player,
  progress,
  seekRelative,
  state,
  theme = "default",
  isMobile,
  controlsVisible,
}: PlayerControlsProps) {
  const themeDef = getTheme(theme);

  const activePreset = usePlayerControlPreset({
    autoHideDelay: 0,
    desktop: desktopPreset,
    mobile: mobilePreset,
  });

  const commonProps = {
    buffered,
    isMobile,
    onControlsInteraction,
    onSettingsOpenChange,
    playbackRates,
    player,
    progress,
    seekRelative,
    state,
    controlsVisible,
  };

  // Use the registered theme's ControlComponent with icon overrides
  const ControlComponent = themeDef?.ControlComponent;
  if (!ControlComponent) {
    return null;
  }

  return (
    <PlayerIconProvider icons={themeDef.iconOverrides}>
      <ControlComponent {...commonProps} />
    </PlayerIconProvider>
  );
}
