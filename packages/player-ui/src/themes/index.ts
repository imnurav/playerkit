// ─── Theme System ────────────────────────────────────────────────────────────
// Unified theme configuration — KGS Theme Only.
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
import "../styles/animations.css";
import "../styles/themes/kgs.css";
import "../styles/player.css";
