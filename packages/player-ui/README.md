# @nurav/player-ui

Ready-made React UI components for video players — progress bar, volume control, settings panel, and a theme system.

This package gives you the visual controls for a video player. It's designed to work with `@nurav/player-core` (the video engine) and is automatically included when you install `@nurav/player-react`.

```bash
# npm
npm install @nurav/player-ui react react-dom

# yarn
yarn add @nurav/player-ui react react-dom

# pnpm
pnpm add @nurav/player-ui react react-dom

# bun
bun add @nurav/player-ui react react-dom
```

---

## Quick Start

> **Note:** This package only provides UI components. If you want a complete working player, use `@nurav/player-react` instead. Use this package only if you're building custom player controls.

```tsx
import { PlayerControls, formatPlayerTime } from "@nurav/player-ui";
import "@nurav/player-ui/styles"; // ← Don't forget the CSS!

function MyControls({ state, player }) {
  return (
    <PlayerControls
      state={state}
      player={player}
      progress={50}
      buffered={70}
      seekRelative={(percent) => player.seek(percent * state.duration)}
      formatTime={formatPlayerTime}
    />
  );
}
```

---

## What's Included

| Component             | What It Does                                                    |
| --------------------- | --------------------------------------------------------------- |
| 🎛️ **PlayerControls** | Complete control bar (play, seek, volume, settings, fullscreen) |
| 📊 **ProgressBar**    | Shows buffered/filled progress with a draggable slider          |
| ⏱️ **TimeDisplay**    | Shows current time / duration (e.g. `1:23 / 5:00`)              |
| 🔊 **VolumeControl**  | Volume slider — horizontal or vertical popup                    |
| ⚙️ **SettingsPanel**  | Speed and quality picker with sliding sub-menus                 |
| 🔘 **ControlButton**  | Styled icon button for custom actions                           |
| 📱 **MobileTopBar**   | Top bar with settings, fullscreen, and video fit for mobile     |

---

## Installation

```bash
# npm
npm install @nurav/player-ui react react-dom

# yarn
yarn add @nurav/player-ui react react-dom

# pnpm
pnpm add @nurav/player-ui react react-dom

# bun
bun add @nurav/player-ui react react-dom
```

> `@nurav/player-core` is a direct dependency and will be installed automatically.

You also need React 18+:

```bash
npm install react react-dom
```

### Import the CSS

The player **will not render correctly** without the stylesheet. Import it once in your app:

```tsx
// At your app's entry point
import "@nurav/player-ui/styles";
```

All CSS classes use the `vp-` prefix (e.g., `vp-controls`, `vp-progress`, `vp-volume`) so they won't conflict with your existing styles.

---

## Components

### PlayerControls

The main control bar. It includes play/pause, seek buttons, progress bar, time display, volume, settings, and fullscreen.

```tsx
import { PlayerControls, formatPlayerTime } from "@nurav/player-ui";

<PlayerControls
  state={playerState} // The player state object
  player={playerInstance} // The player instance (for play/pause/etc.)
  progress={bufferedPercent} // 0–100, how much is buffered
  buffered={bufferedPercent} // 0–100, currently buffered
  seekRelative={(percent) => {}} // Called when user drags the progress bar
  formatTime={(seconds) => string} // Formats seconds into "1:23" or "1:23:45"
  customization={{}} // Show/hide specific controls (optional)
  themeOverrides={{}} // Override CSS colors (optional)
/>;
```

### ProgressBar

A draggable progress bar showing buffered and played sections:

```tsx
import { ProgressBar } from "@nurav/player-ui";

<ProgressBar
  progress={currentTime} // Current time in seconds
  duration={totalDuration} // Total video length in seconds
  buffered={bufferedEnd} // How much is buffered (seconds)
  onSeek={(seconds) => player.seek(seconds)}
  className="" // Optional extra CSS class
/>;
```

### TimeDisplay

Shows current time and duration in a formatted way:

```tsx
import { TimeDisplay, formatPlayerTime } from "@nurav/player-ui";

<TimeDisplay
  currentTime={120} // 2 minutes → "2:00"
  duration={300} // 5 minutes → "5:00"
  formatTime={formatPlayerTime}
  className=""
/>;
```

Output: `2:00 / 5:00`

### VolumeControl

```tsx
import { VolumeControl } from "@nurav/player-ui";

<VolumeControl
  volume={0.7} // 0.0 to 1.0
  previousVolume={1} // Volume before muting
  onChange={(value) => player.setVolume(value)}
  onMute={() => player.mute()}
  onUnmute={() => player.unmute()}
  variant="horizontal" // "horizontal" | "vertical"
/>;
```

### SettingsPanel

A settings panel with speed and quality controls. Supports desktop dropdown and mobile bottom sheet:

```tsx
import { SettingsPanel } from "@nurav/player-ui";

<SettingsPanel
  playbackRate={1} // Current speed
  availableRates={[0.25, 0.5, 1, 1.5, 2]} // Available speeds
  onRateChange={(rate) => player.setPlaybackRate(rate)}
  selectedQuality="auto" // "auto" or quality ID
  qualities={
    [
      /* array of quality levels */
    ]
  }
  onQualityChange={(id) => player.setQuality(id)}
  onClose={() => {
    /* close the panel */
  }}
/>;
```

### ControlButton

A styled button that wraps any icon:

```tsx
import { ControlButton } from "@nurav/player-ui";

<ControlButton
  label="Play" // Accessible label
  icon={<svg>...</svg>} // Your SVG icon
  onClick={() => {}} // Click handler
  variant="default" // "default" | "primary"
  active // Highlight state
/>;
```

### MobileTopBar

A top bar for mobile layouts with settings, fullscreen, and fit controls:

```tsx
import { MobileTopBar } from "@nurav/player-ui";

<MobileTopBar
  /* Controls */
  onToggleFullscreen={() => {}}
  onToggleStretch={() => {}}
  /* Settings panel */
  playbackRate={1}
  availableRates={[0.25, 0.5, 1, 1.5, 2]}
  onRateChange={(rate) => {}}
  selectedQuality="auto"
  qualities={[]}
  onQualityChange={(id) => {}}
/>;
```

---

## Customizing the Look

### Theme Overrides

You can change colors and spacing by passing `themeOverrides`:

```tsx
<PlayerControls
  state={state}
  player={player}
  progress={50}
  buffered={70}
  seekRelative={fn}
  formatTime={formatPlayerTime}
  themeOverrides={{
    "--vp-accent": "#ec4899", // Pink accent color
    "--vp-surface": "transparent", // Transparent control bar
    "--vp-radius": "12px", // Rounded corners
  }}
/>
```

### Available CSS Variables

| Variable               | Default                   | What It Changes                   |
| ---------------------- | ------------------------- | --------------------------------- |
| `--vp-accent`          | `#2e3192`                 | Primary color (buttons, progress) |
| `--vp-accent-contrast` | `#ffffff`                 | Text color on accent              |
| `--vp-surface`         | `rgb(2 6 23 / 0.76)`      | Control bar background            |
| `--vp-border`          | `rgb(148 163 184 / 0.26)` | Border color                      |
| `--vp-text`            | `#f8fafc`                 | Text color                        |
| `--vp-muted`           | `#cbd5e1`                 | Muted/secondary text              |
| `--vp-radius`          | `8px`                     | Border radius                     |
| `--vp-control-radius`  | `8px`                     | Control button radius             |
| `--vp-video-bg`        | `#020617`                 | Video area background             |

### Hiding Specific Controls

Use the `customization` prop to show/hide individual controls:

```tsx
<PlayerControls
  state={state}
  player={player}
  progress={50}
  buffered={70}
  seekRelative={fn}
  formatTime={formatPlayerTime}
  customization={{
    showPlayButton: true, // Show play/pause
    showTimeDisplay: true, // Show time
    showSettings: true, // Show settings gear
    showFullscreen: true, // Show fullscreen toggle
    volumeControl: "vertical", // "horizontal" | "vertical" | "hidden"
  }}
/>
```

---

## Custom Icons

You can replace all player icons using the icon provider:

```tsx
import { PlayerIconProvider, type PlayerIconMap } from "@nurav/player-ui";

const myIcons: PlayerIconMap = {
  Play: () => <span>▶</span>,
  Pause: () => <span>⏸</span>,
  Settings: () => <span>⚙️</span>,
  VolumeHigh: () => <span>🔊</span>,
  VolumeLow: () => <span>🔉</span>,
  VolumeOff: () => <span>🔇</span>,
  Maximize: () => <span>⛶</span>,
  Minimize: () => <span>⤡</span>,
};

function App() {
  return (
    <PlayerIconProvider icons={myIcons}>
      <YourPlayer />
    </PlayerIconProvider>
  );
}
```

---

## CSS Class Reference

All classes follow BEM naming with the `vp-` prefix:

| Class                     | Element                        |
| ------------------------- | ------------------------------ |
| `vp-player`               | Root player container          |
| `vp-controls`             | Control bar                    |
| `vp-controls--flush`      | Control bar without background |
| `vp-progress`             | Progress bar wrapper           |
| `vp-progress__track`      | Progress track                 |
| `vp-progress__filled`     | Played portion                 |
| `vp-progress__buffered`   | Buffered portion               |
| `vp-volume`               | Volume control                 |
| `vp-volume--vertical`     | Vertical popup volume          |
| `vp-volume__popup`        | Volume popup container         |
| `vp-icon-button`          | Icon button                    |
| `vp-center-overlay`       | Center play/pause overlay      |
| `vp-center-btn`           | Center play/pause button       |
| `vp-center-btn--play`     | Large play button              |
| `vp-center-btn--seek`     | Small seek button              |
| `vp-buffering`            | Buffering overlay              |
| `vp-buffering__spinner`   | Spinning loader                |
| `vp-live-badge`           | Live stream indicator          |
| `vp-live-badge--active`   | Live badge active              |
| `vp-live-badge--behind`   | Live badge behind edge         |
| `vp-live-dot`             | Live indicator dot             |
| `vp-live-top`             | Live badge top position        |
| `vp-time`                 | Time display                   |
| `vp-player__video`        | Video element                  |
| `vp-player__clip`         | Clip container                 |
| `vp-player__gradient`     | Bottom gradient overlay        |
| `vp-tap-layer`            | Touch tap layer                |
| `vp-seek-to-live`         | Seek to live button            |
| `vp-seek-to-live--live`   | Active live state              |
| `vp-seek-to-live--hidden` | Hidden state                   |
| `vp-seek-feedback`        | Seek feedback overlay          |
| `vp-seek-feedback--left`  | Left seek feedback             |
| `vp-seek-feedback--right` | Right seek feedback            |
| `vp-center-action`        | Center action overlay          |
| `vp-error-overlay`        | Error overlay                  |
| `vp-settings-*`           | All settings panel elements    |
| `vp-settings-dropdown`    | Desktop dropdown               |
| `vp-settings-sheet`       | Mobile bottom sheet            |
| `vp-settings-slide`       | Sliding sub-view               |

---

## TypeScript

```tsx
import type {
  PlayerControlsProps,
  ProgressBarProps,
  TimeDisplayProps,
  VolumeControlProps,
  SettingsPanelProps,
  ControlButtonProps,
  MobileTopBarProps,
  PlayerIconProps,
  PlayerIconMap,
  IconComponent,
  ThemeVars,
  ThemeConfig,
  ControlsLayout,
  ControlsPreset,
  PlayerThemeName,
  PlayerCustomization,
} from "@nurav/player-ui";
```

---

## Public API

```
Components:     PlayerControls, ProgressBar, TimeDisplay, MobileTopBar,
                ControlButton, VolumeControl, SettingsPanel

Icons:          PlayerIconProvider, usePlayerIcons, IconPlay, IconPause,
                IconRewind, IconForward, IconVolume, IconVolumeLow,
                IconVolumeHigh, IconVolumeOff, IconMaximize, IconMinimize,
                IconSettings

Utilities:      formatPlayerTime(seconds) → "1:23" or "1:23:45"

Themes:         themes, getThemeConfig(name), getThemeNames()
```

---

## License

MIT
