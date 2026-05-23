import type { ThemeConfig, PlayerThemeName } from "./types";

/**
 * All built-in theme configurations.
 * KGS is the only active premium theme (designed for EdTech platforms).
 */
export const themes: Record<PlayerThemeName, ThemeConfig> = {
  kgs: {
    name: "kgs",
    className: "vp-theme-kgs",
    controls: {
      autoHideDelay: 3000,
      desktop: {
        centerPlay: true,
        controlsClassName: "vp-controls vp-controls--flush",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "inline",
        showVolume: true,
        showSeekButtons: false,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls vp-controls--flush",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "inline",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#6366f1",
      "--vp-accent-contrast": "#ffffff",
      "--vp-surface": "transparent",
      "--vp-border": "transparent",
      "--vp-text": "#ffffff",
      "--vp-muted": "rgba(255, 255, 255, 0.7)",
      "--vp-radius": "8px",
      "--vp-control-radius": "0",
      "--vp-video-bg": "#0a0a0a",
    },
  },
};

/**
 * Get a theme configuration by name. Falls back to KGS if not found.
 */
export function getThemeConfig(name: PlayerThemeName = "kgs"): ThemeConfig {
  return themes[name] || themes.kgs;
}

/**
 * Get all available theme names.
 */
export function getThemeNames(): PlayerThemeName[] {
  return Object.keys(themes) as PlayerThemeName[];
}
