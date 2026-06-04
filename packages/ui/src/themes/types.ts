// ─── Theme Types ─────────────────────────────────────────────────────────────

/**
 * Available theme names.
 */
export type PlayerThemeName = "default";

/**
 * Layout configuration for controls — determines which elements are shown
 * and how controls appear for desktop vs mobile viewports.
 */
export type ControlsLayout = {
  /** Show the large center play/pause button */
  centerPlay: boolean;
  /** CSS class applied to the controls container */
  controlsClassName: string;
  /** Show "loaded X%" text next to the time display */
  showLoadedText: boolean;
  /** How the settings panel is presented */
  settingsMode: "inline" | "menu";
  /**
   * Where the progress bar appears:
   * - "above"  → full-width row above control buttons (default, stacked)
   * - "inline" → inside the control row, between play and time (single-row)
   */
  progressPosition: "above" | "inline";
  /** Show volume control on desktop */
  showVolume: boolean;
  /** Show rewind/forward buttons on desktop */
  showSeekButtons: boolean;
};

/**
 * Controls preset with auto-hide and responsive layouts.
 */
export type ControlsPreset = {
  /** Milliseconds before controls auto-hide during playback */
  autoHideDelay: number;
  /** Desktop layout */
  desktop: ControlsLayout;
  /** Mobile layout */
  mobile: ControlsLayout;
};

/**
 * CSS custom property overrides for theming.
 */
export type ThemeVars = Partial<
  Record<
    | "--pk-accent"
    | "--pk-accent-contrast"
    | "--pk-surface"
    | "--pk-border"
    | "--pk-text"
    | "--pk-muted"
    | "--pk-radius"
    | "--pk-control-radius"
    | "--pk-video-bg",
    string
  >
>;

/**
 * Full theme configuration combining CSS class, layout controls, and CSS vars.
 */
export type ThemeConfig = {
  name: PlayerThemeName;
  /** CSS class applied to the root .pk-player element */
  className: string;
  /** Controls layout & auto-hide configuration */
  controls: ControlsPreset;
  /** CSS custom property values for this theme */
  vars: ThemeVars;
};

/**
 * Developer-facing customization options.
 * These override theme defaults and let consumers fine-tune the UI.
 *
 * @example
 * ```tsx
 * <HlsPlayer
 *   src="..."
 *   customization={{
 *     showPlayButton: true,
 *     showCenterOverlay: true,
 *     volumeControl: "horizontal",
 *     centerOverlayGap: 32,
 *   }}
 * />
 * ```
 */
export type PlayerCustomization = {
  /** Show/hide the play/pause button in the bottom control bar (default: true) */
  showPlayButton?: boolean;
  /** Show/hide the time display in the control bar (default: true) */
  showTimeDisplay?: boolean;
  /** Show/hide the settings gear button (default: true) */
  showSettings?: boolean;
  /** Show/hide the fullscreen button (default: true) */
  showFullscreen?: boolean;
  /**
   * Volume control appearance:
   * - "horizontal" → slider next to mute button (default for desktop)
   * - "vertical"   → slider pops up vertically on hover
   * - "hidden"     → no volume control shown
   */
  volumeControl?: "horizontal" | "vertical" | "hidden";
  /**
   * Show/hide the center overlay (play/pause + seek forward/backward).
   * Default follows theme config `centerPlay`.
   */
  showCenterOverlay?: boolean;
  /** Gap between center overlay buttons in pixels (default: theme-dependent) */
  centerOverlayGap?: number;
  /** Show/hide the video fit toggle button in the control bar (default: true) */
  showObjectFitButton?: boolean;
  /**
   * How the video fits its container:
   * - "contain" → fits inside, keeps aspect ratio, may show black bars (default)
   * - "cover"   → fills container, keeps aspect ratio, may crop edges
   * - "fill"    → stretches to fill, ignores aspect ratio
   */
  objectFit?: "contain" | "cover" | "fill";
};
