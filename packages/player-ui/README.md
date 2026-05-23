# @nurav/player-ui

UI component library for the KGS HLS Player. Provides a complete set of player controls, settings panels, progress bar, volume control, and a theme system — all framework-agnostic React components.

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    PlayerControls                          │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐ │
│  │ ProgressBar  │  │ TimeDisplay  │  │   VolumeControl  │ │
│  └─────────────┘  └─────────────┘  └───────────────────┘ │
│                                                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │                 SettingsPanel                      │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Speed Picker │  │Quality Picker│               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐                       │
│  │ MobileTopBar │  │ ControlButton│                       │
│  └─────────────┘  └──────────────┘                       │
└───────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│    Theme System      │
│  (configs / vars)   │
└─────────────────────┘
```

## How It Works

### Component Hierarchy

```
PlayerControls
├── MobileTopBar (mobile only — settings, fullscreen, fit)
├── ProgressBar (inline or stacked)
├── ControlRow
│   ├── Play/Pause button
│   ├── Seek forward/back buttons
│   ├── ProgressBar (inline layout)
│   ├── TimeDisplay
│   ├── VolumeControl (horizontal or vertical)
│   ├── Settings anchor + SettingsPanel
│   ├── ObjectFit toggle
│   └── Fullscreen toggle
└── SettingsPanel
    ├── Main menu → Speed / Quality sub-views
    ├── Speed sub-view (playback rates)
    └── Quality sub-view (ABR levels)
```

### Settings Panel Navigation

The settings panel uses a YouTube-style sliding panel:

```
┌───────────────────────────────┐
│  Main View                    │
│  ┌─────────────────────┐      │
│  │ ⚡ Speed    Normal › │      │
│  ├─────────────────────┤      │
│  │ 🎬 Quality   Auto › │      │
│  └─────────────────────┘      │
└───────────────────────────────┘
         │ click Speed              │ click Quality
         ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐
│  ← Speed              │  │  ← Quality            │
│  ─────────────────    │  │  ─────────────────    │
│  ✓ Normal  (1x)      │  │  ✓ Auto               │
│    0.25x              │  │    1080p              │
│    0.5x               │  │    720p               │
│    0.75x              │  │    480p               │
│    1.25x              │  │    360p               │
│    1.5x               │  │                     │
│    2x                 │  │                     │
└───────────────────────┘  └───────────────────────┘
```

Three slides sit side-by-side in a flexbox track at 300% width. When the view changes, the track slides horizontally:

```tsx
<div
  className="vp-settings-slider-track"
  style={{
    transform: `translateX(${
      view === "main" ? "0%" : view === "speed" ? "-33.333%" : "-66.666%"
    })`,
  }}
>
  <div className="vp-settings-slide">{/* Main */}</div>
  <div className="vp-settings-slide">{/* Speed */}</div>
  <div className="vp-settings-slide">{/* Quality */}</div>
</div>
```

The container height is dynamically measured using `scrollHeight` of the active slide, capped at `50vh` of the viewport. This gives:

- **Main view**: Compact height matching the 2 options
- **Speed/Quality sub-views**: Expands to show all options, capped at half the screen

On mobile, the settings appear as a **bottom sheet** that slides up from below. On desktop, they appear as a **dropdown** anchored to the gear button, or a **centered overlay** for non-dropdown usage.

### Layout System

Each theme defines a controls preset:

```ts
type ControlsLayout = {
  centerPlay: boolean;
  controlsClassName: string;
  showLoadedText: boolean;
  settingsMode: "inline" | "menu";
  progressPosition: "above" | "inline";
  showVolume: boolean;
  showSeekButtons: boolean;
};

type ControlsPreset = {
  autoHideDelay: number;
  desktop: ControlsLayout;
  mobile: ControlsLayout;
};
```

**`progressPosition: "above"`**: Progress bar in a separate row above the controls (only in PlayerControls, currently unused in KGS theme)

**`progressPosition: "inline"`**: Progress bar inside the control row (KGS theme default)

```
┌──────────────────────────────────┐
│ ▶ ⏪   ████████████░░░  1:23 🔲 │
└──────────────────────────────────┘
```

### Theme System

Themes provide:

1. **CSS class name** — applied to the player root (e.g. `vp-theme-kgs`)
2. **CSS custom properties** — injected as inline styles via `ThemeVars`
3. **Controls preset** — layout configuration for desktop and mobile

KGS theme config:

```ts
{
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
      /* same layout but showVolume: false, showSeekButtons: false */
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
}
```

Built-in themes include only `kgs`. You can override any CSS variable via `themeOverrides` prop on `<HlsPlayer>`.

### Icon System

Icons are injected via React context (`PlayerIconProvider`), allowing custom icon sets:

```tsx
import { PlayerIconProvider, type PlayerIconMap } from "@nurav/player-ui";

const myIcons: PlayerIconMap = {
  Play: () => <span>▶</span>,
  Pause: () => <span>⏸</span>,
  VolumeLow: () => <span>🔉</span>,
  VolumeHigh: () => <span>🔊</span>,
  Settings: () => <span>⚙</span>,
};

<PlayerIconProvider icons={myIcons}>
  <HlsPlayer src="..." />
</PlayerIconProvider>;
```

The volume icon changes dynamically based on the current level:

- **`VolumeOff`** — muted or volume === 0
- **`VolumeLow`** — volume < 0.5 (1 sound wave)
- **`VolumeHigh`** — volume >= 0.5 (2 sound waves)

### Components

- **ProgressBar** — Track with buffered/filled segments + native range input for seeking. No CSS transitions on the filled bar for instant seek response.
- **TimeDisplay** — Formatted current time / duration with live badge support
- **VolumeControl** — Horizontal slider or vertical popup slider with dynamic volume icons
- **SettingsPanel** — Sliding sub-views for speed and quality selection with desktop dropdown, bottom sheet, and centered overlay modes
- **MobileTopBar** — Top bar with settings, fullscreen, and video fit controls (mobile only)
- **ControlButton** — Styled button with SVG icon support
- **Responsive Behavior** — The UI adapts to screen width (DesktopDropdown vs MobileBottomSheet settings).

---

## Styling & CSS Loading

All styles use BEM naming with the `vp-` prefix.

Styles reside in `src/styles/player.css` and are compiled by `tsup` into `dist/index.css`. The package exports this stylesheet via the `styles` export field.

To load the player styles:

```tsx
import "@nurav/player-ui/styles";
```

### BEM CSS Classes

```
vp-player           — Root container
vp-controls         — Control bar
vp-progress         — Progress bar
vp-volume           — Volume control
vp-volume--vertical — Vertical popup volume
vp-volume__popup    — Volume popup container
vp-settings-*       — Settings panel & sub-views
vp-icon-button      — Icon buttons
vp-center-overlay   — Center play/pause overlay
vp-live-badge       — Live stream indicator
vp-buffering        — Buffering spinner
vp-error-overlay    — Error overlay
```

---

## Public API

```ts
// Components
export {
  PlayerControls,
  ProgressBar,
  TimeDisplay,
  MobileTopBar,
  ControlButton,
  VolumeControl,
  SettingsPanel,
};

// Icons
export {
  PlayerIconProvider,
  usePlayerIcons,
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  IconVolume,
  IconVolumeLow,
  IconVolumeHigh,
  IconVolumeOff,
  IconMaximize,
  IconMinimize,
  IconSettings,
};

// Themes
export { themes, getThemeConfig, getThemeNames };

// Utilities
export { formatPlayerTime } from "./format";

// Types
export type {
  PlayerControlsProps,
  ProgressBarProps,
  TimeDisplayProps,
  MobileTopBarProps,
  ControlButtonProps,
  VolumeControlProps,
  SettingsPanelProps,
};
export type { PlayerIconProps, IconComponent, PlayerIconMap };
export type {
  ThemeVars,
  ThemeConfig,
  ControlsLayout,
  ControlsPreset,
  PlayerThemeName,
  PlayerCustomization,
};
```
