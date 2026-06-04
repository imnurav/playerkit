import type { ThemeConfig, PlayerThemeName } from "./types";

/**
 * All built-in theme configurations.
 * Default is the main theme.
 */
export const themes: Record<PlayerThemeName, ThemeConfig> = {
  default: {
    name: "default",
    className: "pk-theme-default",
    controls: {
      autoHideDelay: 3000,
      desktop: {
        centerPlay: true,
        showVolume: true,
        settingsMode: "menu",
        showLoadedText: false,
        showSeekButtons: false,
        progressPosition: "inline",
        controlsClassName: "pk-controls pk-controls--flush",
      },
      mobile: {
        centerPlay: true,
        showVolume: false,
        settingsMode: "menu",
        showLoadedText: false,
        showSeekButtons: false,
        progressPosition: "inline",
        controlsClassName: "pk-controls pk-controls--flush",
      },
    },
    vars: {
      "--pk-radius": "8px",
      "--pk-text": "#ffffff",
      "--pk-accent": "#6366f1",
      "--pk-control-radius": "0",
      "--pk-video-bg": "#0a0a0a",
      "--pk-border": "transparent",
      "--pk-surface": "transparent",
      "--pk-accent-contrast": "#ffffff",
      "--pk-muted": "rgba(255, 255, 255, 0.7)",
    },
  },
};

/**
 * Get a theme configuration by name. Falls back to default if not found.
 */
export function getThemeConfig(name: PlayerThemeName = "default"): ThemeConfig {
  return themes[name] || themes.default;
}

/**
 * Get all available theme names.
 */
export function getThemeNames(): PlayerThemeName[] {
  return Object.keys(themes) as PlayerThemeName[];
}
