// ─── Theme System ────────────────────────────────────────────────────────────
// Unified theme configuration — replaces the old registry + player-themes split.
export { themes, getThemeConfig, getThemeNames } from "./configs";

export type {
  ThemeVars,
  ThemeConfig,
  ControlsLayout,
  ControlsPreset,
  PlayerThemeName,
  PlayerCustomization,
} from "./types";

// Import theme CSS — these are bundled by tsup
import "../styles/themes/default.css";
import "../styles/themes/youtube.css";
import "../styles/themes/netflix.css";
import "../styles/themes/hotstar.css";
import "../styles/themes/prime.css";
import "../styles/animations.css";
import "../styles/themes/kgs.css";
import "../styles/player.css";
