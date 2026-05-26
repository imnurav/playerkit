# @nurav/player-react

A complete, premium, ready-to-use React HLS video player component. Powered by `@nurav/player-core` (HLS video engine) and `@nurav/player-ui` (UI components/styling). Drop it in, provide a stream source, and get a fully functional, mobile-friendly live/VOD player.

---

## Installation

Install `@nurav/player-react` along with its peer dependencies using your preferred package manager:

```bash
# Using pnpm
pnpm add @nurav/player-react @nurav/player-core @nurav/player-ui

# Using npm
npm install @nurav/player-react @nurav/player-core @nurav/player-ui

# Using yarn
yarn add @nurav/player-react @nurav/player-core @nurav/player-ui
```

---

## Quick Start

Import the player and its stylesheet to get up and running:

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles"; // Required styling stylesheet

function App() {
  return (
    <div style={{ width: "100%", maxWidth: "800px", aspectRatio: "16/9" }}>
      <HlsPlayer
        src="https://example.com/live/stream.m3u8"
        autoPlay
        controls
      />
    </div>
  );
}
```

---

## Simplified Props API Reference

### Core Props
- `src` (`string`, **Required**): The HLS stream source URL (`.m3u8`).
- `controls` (`boolean`, Optional, Default: `true`): Toggle the display of control overlays and progress bars.
- `autoPlay` (`boolean`, Optional, Default: `false`): Enable/disable autoplay behavior.
- `poster` (`string`, Optional): Image URL displayed while video buffers or before play.
- `onPlayerReady` (`(player: Player) => void`, Optional): Access the underlying player controller instance.

### Customization & Layout Props
- `theme` (`"kgs" | "default"`, Optional, Default: `"kgs"`): Preset theme config.
- `themeOverrides` (`Record<string, string>`, Optional): Override CSS variables (e.g. `{"--vp-accent": "#2e3192"}`).
- `playbackRates` (`number[]`, Optional): Customize playback speed options.
- `seekStep` (`number`, Optional, Default: `10`): Double tap or keyboard seek interval (in seconds).
- `customization` (`PlayerCustomization`, Optional): Clean options to toggle specific buttons like volume control, settings panel, fullscreen button.

### Live Configuration
- `live` (`LiveConfig`, Optional):
  - `syncDuration` (`number`): Max seconds behind live edge to consider "Go Live" edge.
  - `lowLatency` (`boolean`): Enable low-latency live mode optimizations.

---

## License

MIT
