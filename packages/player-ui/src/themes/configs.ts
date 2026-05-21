import type { ThemeConfig, PlayerThemeName } from "./types";

/**
 * All built-in theme configurations.
 * KGS is the default theme (designed for EdTech platforms).
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

  default: {
    name: "default",
    className: "vp-theme-default",
    controls: {
      autoHideDelay: 2600,
      desktop: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: true,
        settingsMode: "inline",
        progressPosition: "above",
        showVolume: true,
        showSeekButtons: true,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#38bdf8",
      "--vp-accent-contrast": "#082f49",
      "--vp-surface": "rgb(2 6 23 / 0.76)",
      "--vp-border": "rgb(148 163 184 / 0.26)",
      "--vp-text": "#f8fafc",
      "--vp-muted": "#cbd5e1",
      "--vp-radius": "8px",
      "--vp-control-radius": "8px",
      "--vp-video-bg": "#020617",
    },
  },

  netflix: {
    name: "netflix",
    className: "vp-theme-netflix",
    controls: {
      autoHideDelay: 2200,
      desktop: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: true,
        showSeekButtons: true,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#e50914",
      "--vp-accent-contrast": "#ffffff",
      "--vp-surface": "rgb(0 0 0 / 0.72)",
      "--vp-border": "rgb(255 255 255 / 0.16)",
      "--vp-text": "#ffffff",
      "--vp-muted": "#d1d5db",
      "--vp-radius": "4px",
      "--vp-control-radius": "4px",
      "--vp-video-bg": "#000000",
    },
  },

  youtube: {
    name: "youtube",
    className: "vp-theme-youtube",
    controls: {
      autoHideDelay: 2400,
      desktop: {
        centerPlay: false,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: true,
        showSeekButtons: true,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#ff0033",
      "--vp-accent-contrast": "#ffffff",
      "--vp-surface": "rgb(15 15 15 / 0.82)",
      "--vp-border": "rgb(255 255 255 / 0.12)",
      "--vp-text": "#ffffff",
      "--vp-muted": "#e5e5e5",
      "--vp-radius": "0px",
      "--vp-control-radius": "999px",
      "--vp-video-bg": "#000000",
    },
  },

  hotstar: {
    name: "hotstar",
    className: "vp-theme-hotstar",
    controls: {
      autoHideDelay: 2800,
      desktop: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: true,
        showSeekButtons: true,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#1f80e0",
      "--vp-accent-contrast": "#ffffff",
      "--vp-surface": "rgb(8 19 43 / 0.84)",
      "--vp-border": "rgb(96 165 250 / 0.2)",
      "--vp-text": "#f8fbff",
      "--vp-muted": "#b8c7df",
      "--vp-radius": "8px",
      "--vp-control-radius": "10px",
      "--vp-video-bg": "#050b18",
    },
  },

  prime: {
    name: "prime",
    className: "vp-theme-prime",
    controls: {
      autoHideDelay: 2600,
      desktop: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: true,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: true,
        showSeekButtons: true,
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vp-controls",
        showLoadedText: false,
        settingsMode: "menu",
        progressPosition: "above",
        showVolume: false,
        showSeekButtons: false,
      },
    },
    vars: {
      "--vp-accent": "#00a8e1",
      "--vp-accent-contrast": "#001018",
      "--vp-surface": "rgb(0 22 40 / 0.82)",
      "--vp-border": "rgb(0 168 225 / 0.28)",
      "--vp-text": "#ffffff",
      "--vp-muted": "#c7d7e8",
      "--vp-radius": "6px",
      "--vp-control-radius": "6px",
      "--vp-video-bg": "#000b14",
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
