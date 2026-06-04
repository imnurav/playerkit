# @playerkit/ui

Ready-made React UI components for video players — progress bar, volume control, settings panel, and a theme system.

This package gives you the visual controls for a video player. It's designed to work with `@playerkit/core` (the video engine) and is automatically included when you install `@playerkit/react`.

```bash
# npm
npm install @playerkit/ui react react-dom

# yarn
yarn add @playerkit/ui react react-dom

# pnpm
pnpm add @playerkit/ui react react-dom

# bun
bun add @playerkit/ui react react-dom
```

---

## Quick Start

> **Note:** This package only provides UI components. If you want a complete working player, use `@playerkit/react` instead. Use this package only if you're building custom player controls.

```tsx
import { PlayerControls, formatPlayerTime } from "@playerkit/ui";
import "@playerkit/ui/styles/common.css"; // ← Don't forget the core CSS!

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
npm install @playerkit/ui react react-dom

# yarn
yarn add @playerkit/ui react react-dom

# pnpm
pnpm add @playerkit/ui react react-dom

# bun
bun add @playerkit/ui react react-dom
```

> `@playerkit/core` is a direct dependency and will be installed automatically.

You also need React 18+:

```bash
npm install react react-dom
```

### Import the CSS

The player UI **will not render correctly** without the stylesheets. Starting with v0.0.3, the CSS has been split so you only load what you need.

Import the stylesheets once in your app depending on the target player format:

```tsx
// 1. Core styles (always required for player-ui controls)
import "@playerkit/ui/styles/common.css";

// 2. Native video-tag style overrides (required for HLS player UI)
import "@playerkit/ui/styles/hls.css";

// 3. YouTube iframe scaling & poster overrides (required for YouTube player UI)
import "@playerkit/ui/styles/youtube.css";
```

Alternatively, you can import the full, backwards-compatible monolithic bundle:

```tsx
import "@playerkit/ui/styles";
```

All CSS classes use the `pk-` prefix (e.g., `pk-controls`, `pk-progress`, `pk-volume`) so they won't conflict with your existing styles.

---

## Components

### PlayerControls

The main control bar. It includes play/pause, seek buttons, progress bar, time display, volume, settings, and fullscreen.

```tsx
import { PlayerControls, formatPlayerTime } from "@playerkit/ui";

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
import { ProgressBar } from "@playerkit/ui";

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
import { TimeDisplay, formatPlayerTime } from "@playerkit/ui";

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
import { VolumeControl } from "@playerkit/ui";

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
import { SettingsPanel } from "@playerkit/ui";

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
import { ControlButton } from "@playerkit/ui";

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
import { MobileTopBar } from "@playerkit/ui";

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
    "--pk-accent": "#ec4899", // Pink accent color
    "--pk-surface": "transparent", // Transparent control bar
    "--pk-radius": "12px", // Rounded corners
  }}
/>
```

### Available CSS Variables

| Variable               | Default                   | What It Changes                   |
| ---------------------- | ------------------------- | --------------------------------- |
| `--pk-accent`          | `#2e3192`                 | Primary color (buttons, progress) |
| `--pk-accent-contrast` | `#ffffff`                 | Text color on accent              |
| `--pk-surface`         | `rgb(2 6 23 / 0.76)`      | Control bar background            |
| `--pk-border`          | `rgb(148 163 184 / 0.26)` | Border color                      |
| `--pk-text`            | `#f8fafc`                 | Text color                        |
| `--pk-muted`           | `#cbd5e1`                 | Muted/secondary text              |
| `--pk-radius`          | `8px`                     | Border radius                     |
| `--pk-control-radius`  | `8px`                     | Control button radius             |
| `--pk-video-bg`        | `#020617`                 | Video area background             |

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
import { PlayerIconProvider, type PlayerIconMap } from "@playerkit/ui";

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

All classes follow BEM naming with the `pk-` prefix:

| Class                     | Element                                           |
| ------------------------- | ------------------------------------------------- |
| `pk-player`               | Root player container                             |
| `pk-controls`             | Control bar                                       |
| `pk-controls--flush`      | Control bar without background                    |
| `pk-progress`             | Progress bar wrapper                              |
| `pk-progress__track`      | Progress track                                    |
| `pk-progress__filled`     | Played portion                                    |
| `pk-progress__buffered`   | Buffered portion                                  |
| `pk-volume`               | Volume control                                    |
| `pk-volume--vertical`     | Vertical popup volume                             |
| `pk-volume__popup`        | Volume popup container                            |
| `pk-icon-button`          | Icon button                                       |
| `pk-center-overlay`       | Center play/pause overlay                         |
| `pk-center-btn`           | Center play/pause button                          |
| `pk-center-btn--play`     | Large play button                                 |
| `pk-center-btn--seek`     | Small seek button                                 |
| `pk-buffering`            | Buffering overlay                                 |
| `pk-buffering__spinner`   | Spinning loader                                   |
| `pk-live-badge`           | Live stream indicator                             |
| `pk-live-badge--active`   | Live badge active                                 |
| `pk-live-badge--behind`   | Live badge behind edge                            |
| `pk-live-dot`             | Live indicator dot                                |
| `pk-live-top`             | Live badge top position                           |
| `pk-time`                 | Time display                                      |
| `pk-player__video`        | Video element                                     |
| `pk-player__clip`         | Clip container                                    |
| `pk-player__gradient`     | Bottom gradient overlay                           |
| `pk-tap-layer`            | Touch tap layer                                   |
| `pk-seek-to-live`         | Seek to live button                               |
| `pk-seek-to-live--live`   | Active live state                                 |
| `pk-seek-to-live--hidden` | Hidden state                                      |
| `pk-seek-feedback`        | Seek feedback overlay                             |
| `pk-seek-feedback--left`  | Left seek feedback                                |
| `pk-seek-feedback--right` | Right seek feedback                               |
| `pk-center-action`        | Center action overlay                             |
| `pk-error-overlay`        | Error overlay                                     |
| `pk-settings-*`           | All settings panel elements                       |
| `pk-settings-dropdown`    | Desktop dropdown                                  |
| `pk-settings-sheet`       | Mobile bottom sheet                               |
| `pk-settings-slide`       | Sliding sub-view                                  |
| `pk-security-overlay`     | DevTools security lock overlay                    |
| `pk-security-overlay__*`  | Security lock sub-elements (title, icon, message) |
| `pk-touch-diagnostic`     | Touch diagnostic grid overlay                     |
| `pk-touch-diagnostic__*`  | Left, right, and center touch zones               |
| `pk-youtube-clip`         | Scaling wrapper for YouTube video player          |
| `pk-youtube-poster`       | Custom poster overlay for YouTube player          |

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
} from "@playerkit/ui";
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
