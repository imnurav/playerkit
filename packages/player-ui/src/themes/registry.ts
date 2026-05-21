import type { PlayerIconMap } from "../icons";
import type { ReactNode } from "react";

export type ThemeControlProps = {
  buffered: number;
  isMobile: boolean;
  onControlsInteraction?: () => void;
  onSettingsOpenChange?: (open: boolean) => void;
  playbackRates: number[];
  player: import("@varun/player-core").Player | null;
  progress: number;
  seekRelative: (direction: -1 | 1) => void;
  state: import("@varun/player-core").PlayerSnapshot | null;
  controlsVisible?: boolean;
};

export type ThemeDefinition = {
  name: string;
  ControlComponent: (props: ThemeControlProps) => ReactNode;
  iconOverrides?: Partial<PlayerIconMap>;
  styles?: string;
};

const themeRegistry = new Map<string, ThemeDefinition>();

export function registerTheme(definition: ThemeDefinition) {
  themeRegistry.set(definition.name, definition);
}

export function getTheme(name: string): ThemeDefinition | undefined {
  return themeRegistry.get(name);
}

export function getAllThemeStyles(): string {
  const styles: string[] = [];
  for (const theme of themeRegistry.values()) {
    if (theme.styles) styles.push(theme.styles);
  }
  return styles.join("\n");
}

export function getAllThemeNames(): string[] {
  return Array.from(themeRegistry.keys());
}
