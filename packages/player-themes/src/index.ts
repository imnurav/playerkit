export type PlayerThemeName =
  | "default"
  | "netflix"
  | "youtube"
  | "hotstar"
  | "prime";

export type PlayerControlsLayoutPreset = {
  centerPlay: boolean;
  controlsClassName: string;
  showLoadedText: boolean;
  settingsMode: "inline" | "menu";
};

export type PlayerControlsPreset = {
  autoHideDelay: number;
  desktop: PlayerControlsLayoutPreset;
  mobile: PlayerControlsLayoutPreset;
};

export type PlayerThemeVars = Partial<
  Record<
    | "--vhp-accent"
    | "--vhp-accent-contrast"
    | "--vhp-surface"
    | "--vhp-border"
    | "--vhp-text"
    | "--vhp-muted"
    | "--vhp-radius"
    | "--vhp-control-radius"
    | "--vhp-video-bg",
    string
  >
>;

export type PlayerTheme = {
  name: PlayerThemeName;
  className: string;
  controls: PlayerControlsPreset;
  vars: PlayerThemeVars;
};

export const playerThemes: Record<PlayerThemeName, PlayerTheme> = {
  default: {
    name: "default",
    className: "vhp-theme-default",
    controls: {
      autoHideDelay: 2600,
      desktop: {
        centerPlay: true,
        controlsClassName: "vhp-controls-default vhp-controls-desktop-default",
        showLoadedText: true,
        settingsMode: "inline",
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vhp-controls-default vhp-controls-mobile-default",
        showLoadedText: false,
        settingsMode: "menu",
      },
    },
    vars: {
      "--vhp-accent": "#38bdf8",
      "--vhp-accent-contrast": "#082f49",
      "--vhp-surface": "rgb(2 6 23 / 0.76)",
      "--vhp-border": "rgb(148 163 184 / 0.26)",
      "--vhp-text": "#f8fafc",
      "--vhp-muted": "#cbd5e1",
      "--vhp-radius": "8px",
      "--vhp-control-radius": "8px",
      "--vhp-video-bg": "#020617",
    },
  },
  netflix: {
    name: "netflix",
    className: "vhp-theme-netflix",
    controls: {
      autoHideDelay: 2200,
      desktop: {
        centerPlay: true,
        controlsClassName: "vhp-controls-netflix vhp-controls-desktop-netflix",
        showLoadedText: false,
        settingsMode: "menu",
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vhp-controls-netflix vhp-controls-mobile-netflix",
        showLoadedText: false,
        settingsMode: "menu",
      },
    },
    vars: {
      "--vhp-accent": "#e50914",
      "--vhp-accent-contrast": "#ffffff",
      "--vhp-surface": "rgb(0 0 0 / 0.72)",
      "--vhp-border": "rgb(255 255 255 / 0.16)",
      "--vhp-text": "#ffffff",
      "--vhp-muted": "#d1d5db",
      "--vhp-radius": "4px",
      "--vhp-control-radius": "4px",
      "--vhp-video-bg": "#000000",
    },
  },
  youtube: {
    name: "youtube",
    className: "vhp-theme-youtube",
    controls: {
      autoHideDelay: 2400,
      desktop: {
        centerPlay: false,
        controlsClassName: "vhp-controls-youtube vhp-controls-desktop-youtube",
        showLoadedText: false,
        settingsMode: "menu",
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vhp-controls-youtube vhp-controls-mobile-youtube",
        showLoadedText: false,
        settingsMode: "menu",
      },
    },
    vars: {
      "--vhp-accent": "#ff0033",
      "--vhp-accent-contrast": "#ffffff",
      "--vhp-surface": "rgb(15 15 15 / 0.82)",
      "--vhp-border": "rgb(255 255 255 / 0.12)",
      "--vhp-text": "#ffffff",
      "--vhp-muted": "#e5e5e5",
      "--vhp-radius": "0px",
      "--vhp-control-radius": "999px",
      "--vhp-video-bg": "#000000",
    },
  },
  hotstar: {
    name: "hotstar",
    className: "vhp-theme-hotstar",
    controls: {
      autoHideDelay: 2800,
      desktop: {
        centerPlay: true,
        controlsClassName: "vhp-controls-hotstar vhp-controls-desktop-hotstar",
        showLoadedText: false,
        settingsMode: "menu",
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vhp-controls-hotstar vhp-controls-mobile-hotstar",
        showLoadedText: false,
        settingsMode: "menu",
      },
    },
    vars: {
      "--vhp-accent": "#1f80e0",
      "--vhp-accent-contrast": "#ffffff",
      "--vhp-surface": "rgb(8 19 43 / 0.84)",
      "--vhp-border": "rgb(96 165 250 / 0.2)",
      "--vhp-text": "#f8fbff",
      "--vhp-muted": "#b8c7df",
      "--vhp-radius": "8px",
      "--vhp-control-radius": "10px",
      "--vhp-video-bg": "#050b18",
    },
  },
  prime: {
    name: "prime",
    className: "vhp-theme-prime",
    controls: {
      autoHideDelay: 2600,
      desktop: {
        centerPlay: true,
        controlsClassName: "vhp-controls-prime vhp-controls-desktop-prime",
        showLoadedText: true,
        settingsMode: "menu",
      },
      mobile: {
        centerPlay: true,
        controlsClassName: "vhp-controls-prime vhp-controls-mobile-prime",
        showLoadedText: false,
        settingsMode: "menu",
      },
    },
    vars: {
      "--vhp-accent": "#00a8e1",
      "--vhp-accent-contrast": "#001018",
      "--vhp-surface": "rgb(0 22 40 / 0.82)",
      "--vhp-border": "rgb(0 168 225 / 0.28)",
      "--vhp-text": "#ffffff",
      "--vhp-muted": "#c7d7e8",
      "--vhp-radius": "6px",
      "--vhp-control-radius": "6px",
      "--vhp-video-bg": "#000b14",
    },
  },
};

export const defaultPlayerTheme = playerThemes.default;

export function getPlayerTheme(theme: PlayerThemeName = "default") {
  return playerThemes[theme] || playerThemes.default;
}
