# @nurav/player-react

A complete, ready-to-use React HLS video player component. Drop it in, give it a stream URL, and you get a fully functional video player with controls, gestures, keyboard shortcuts, and customizable themes.

This package bundles `@nurav/player-core` (video engine) and `@nurav/player-ui` (UI components) into one easy-to-use component.

```bash
npm install @nurav/player-react
```

---

## Quick Start

The simplest possible player — just one line:

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles"; // ← Required! Loads the CSS

function App() {
  return (
    <HlsPlayer
      src="https://example.com/stream.m3u8"
      style={{ width: "100%", maxWidth: 800 }}
    />
  );
}
```

That's all you need. Your video will load with play/pause, seek, volume, settings, and fullscreen controls.

---

## What You Get

When you use `<HlsPlayer />`, you get all of this out of the box:

| Feature               | Description                                        |
| --------------------- | -------------------------------------------------- |
| 🎬 **Play/Pause**     | Click the video or press Space                     |
| ⏪⏩ **Seek**         | Drag the progress bar or use arrow keys            |
| 🔊 **Volume**         | Slider with mute toggle                            |
| ⚙️ **Settings**       | Speed and quality picker                           |
| 🖥️ **Fullscreen**     | Toggle fullscreen mode                             |
| ⌨️ **Keyboard**       | Space (play/pause), F (fullscreen), arrows (seek)  |
| 📱 **Mobile**         | Tap zones, swipe gestures, bottom sheet settings   |
| 🎯 **Touch Gestures** | Tap to play/pause, swipe to seek                   |
| 🔴 **Live Streams**   | DVR support, live edge indicator, "Go Live" button |
| 🔐 **Token Auth**     | Play protected streams                             |
| 🎨 **Themes**         | Custom colors and styles                           |
| 🔄 **Auto Buffering** | Shows loading spinner when buffering               |

---

## Installation

```bash
npm install @nurav/player-react
```

This automatically installs `@nurav/player-core` and `@nurav/player-ui`.

### Load the CSS

The player will be invisible without this import. Add it once in your app:

```tsx
// At the top of your main component or App.tsx
import "@nurav/player-ui/styles";
```

---

## Simple Examples

### Basic Player

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles";

function VideoPlayer() {
  return (
    <div style={{ width: "100%", maxWidth: 800 }}>
      <HlsPlayer
        src="https://example.com/live/stream.m3u8"
        style={{ width: "100%", aspectRatio: "16 / 9" }}
      />
    </div>
  );
}
```

### Auto-Play (Muted)

```tsx
<HlsPlayer src="https://example.com/stream.m3u8" autoPlay muted />
```

### With Poster Image

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  poster="https://example.com/thumbnail.jpg"
/>
```

### Start at a Specific Time

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  startTime={120} // Start at 2 minutes
/>
```

### Custom Colors

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  themeOverrides={{
    "--vp-accent": "#ec4899", // Pink accent
    "--vp-radius": "12px",
  }}
/>
```

### Custom Playback Speeds

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  playbackRates={[0.5, 1, 1.5, 2, 3]}
/>
```

### With Player Ref (Accessing Player API)

```tsx
import { useRef } from "react";
import { HlsPlayer } from "@nurav/player-react";
import type { Player } from "@nurav/player-core";

function PlayerWithControls() {
  const playerRef = useRef<Player>(null);

  return (
    <div>
      <HlsPlayer ref={playerRef} src="https://example.com/stream.m3u8" />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => playerRef.current?.togglePlay()}>
          Play/Pause
        </button>
        <button onClick={() => playerRef.current?.setPlaybackRate(2)}>
          2x Speed
        </button>
        <button onClick={() => playerRef.current?.seekToLive()}>Go Live</button>
      </div>
    </div>
  );
}
```

---

## All Props

### Core

| Prop             | Type            | Default      | Description                               |
| ---------------- | --------------- | ------------ | ----------------------------------------- |
| `src`            | `string`        | **required** | HLS stream URL (`.m3u8`)                  |
| `autoPlay`       | `boolean`       | `false`      | Start playing automatically               |
| `muted`          | `boolean`       | `false`      | Start muted                               |
| `poster`         | `string`        | —            | Thumbnail/poster image URL                |
| `startTime`      | `number`        | —            | Start at this time (seconds)              |
| `className`      | `string`        | —            | Extra CSS class for the player            |
| `videoClassName` | `string`        | —            | Extra CSS class for the `<video>` element |
| `style`          | `CSSProperties` | —            | Inline styles for the player container    |

### Stream Configuration

| Prop               | Type           | Default                              | Description                          |
| ------------------ | -------------- | ------------------------------------ | ------------------------------------ |
| `lowLatency`       | `boolean`      | `false`                              | Enable low-latency HLS mode          |
| `liveSyncDuration` | `number`       | `3`                                  | Seconds behind live = "at live edge" |
| `tokenFetcher`     | `TokenFetcher` | —                                    | Auth function for protected streams  |
| `playbackRates`    | `number[]`     | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]` | Available speeds                     |

### UI Configuration

| Prop             | Type                  | Default | Description                     |
| ---------------- | --------------------- | ------- | ------------------------------- |
| `controls`       | `boolean`             | `true`  | Show the control bar            |
| `keyboard`       | `boolean`             | `true`  | Enable keyboard shortcuts       |
| `seekStep`       | `number`              | `10`    | Seconds to seek per arrow press |
| `theme`          | `"kgs"`               | `"kgs"` | Theme to use                    |
| `themeOverrides` | `ThemeVars`           | —       | Custom CSS colors               |
| `customization`  | `PlayerCustomization` | —       | Show/hide specific controls     |

### Advanced

| Prop             | Type                   | Default                    | Description                     |
| ---------------- | ---------------------- | -------------------------- | ------------------------------- |
| `centerZoneX`    | `{ start, end }`       | `{ start: 0.4, end: 0.6 }` | Horizontal zone for tap-to-play |
| `centerZoneY`    | `{ start, end }`       | `{ start: 0.4, end: 0.6 }` | Vertical zone for tap-to-play   |
| `onPlayerReady`  | `(player) => void`     | —                          | Called when player is ready     |
| `renderControls` | `(props) => ReactNode` | —                          | Replace the entire control bar  |
| `root`           | `HTMLElement`          | —                          | Element for fullscreen API      |

---

## Token Auth (Protected Streams)

If your video requires authentication, provide a `tokenFetcher`:

```tsx
import { HlsPlayer, type TokenFetcher } from "@nurav/player-react";

const videoId = 527697;

const tokenFetcher: TokenFetcher = async ({ signal }) => {
  const res = await fetch(`https://api.example.com/video/${videoId}`, {
    signal,
  });
  const data = await res.json();
  if (!data.video_url) {
    throw new Error(data.message || "Access denied");
  }
  return { url: data.video_url };
};

function Player() {
  return <HlsPlayer src="placeholder" tokenFetcher={tokenFetcher} autoPlay />;
}
```

---

## Custom Controls

You can replace the entire control bar with your own:

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  renderControls={({ player, state, seekRelative, formatTime }) => (
    <div style={{ display: "flex", gap: 8, padding: 8, background: "#222" }}>
      <button onClick={() => player?.togglePlay()}>
        {state?.isPlaying ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        min={0}
        max={state?.duration || 0}
        value={state?.currentTime || 0}
        onChange={(e) => player?.seek(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ color: "#fff" }}>
        {formatTime(state?.currentTime || 0)}
      </span>
    </div>
  )}
/>
```

---

## Keyboard Shortcuts

| Key     | Action                         |
| ------- | ------------------------------ |
| `Space` | Play / Pause                   |
| `F`     | Toggle fullscreen              |
| `M`     | Mute / Unmute                  |
| `←`     | Seek backward (10s by default) |
| `→`     | Seek forward (10s by default)  |
| `↑`     | Volume up                      |
| `↓`     | Volume down                    |
| `S`     | Toggle stretch / fit           |

---

## Using the Hooks (Headless)

If you don't want the built-in UI, you can use the `useHlsPlayer` hook:

```tsx
import { useHlsPlayer } from "@nurav/player-react";

function CustomPlayer() {
  const { player, state, error, rootRef, videoRef } = useHlsPlayer({
    src: "https://example.com/stream.m3u8",
    autoPlay: true,
  });

  return (
    <div
      ref={rootRef}
      style={{ width: 640, height: 360, position: "relative" }}
    >
      <video ref={videoRef} style={{ width: "100%", height: "100%" }} />

      <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff" }}>
        {state?.isPlaying ? "▶ Playing" : "⏸ Paused"}
        {" | "}
        {state?.currentTime?.toFixed(1)}s / {state?.duration?.toFixed(1)}s
      </div>

      {error && (
        <div style={{ color: "red", padding: 8 }}>Error: {error.message}</div>
      )}
    </div>
  );
}
```

---

## Customization Reference

### PlayerCustomization

Fine-tune which controls are visible:

```ts
type PlayerCustomization = {
  showPlayButton?: boolean; // Show play/pause in control bar
  showTimeDisplay?: boolean; // Show current time / duration
  showSettings?: boolean; // Show settings gear button
  showFullscreen?: boolean; // Show fullscreen toggle
  showCenterOverlay?: boolean; // Show center play/pause overlay
  showObjectFitButton?: boolean; // Show video fit toggle
  volumeControl?: "horizontal" | "vertical" | "hidden";
  centerOverlayGap?: number; // Gap between center buttons (px)
  objectFit?: "contain" | "cover" | "fill";
};
```

### ThemeVars (CSS Variables)

Override any visual property:

```ts
type ThemeVars = {
  "--vp-accent"?: string; // Primary color
  "--vp-accent-contrast"?: string; // Text color on accent
  "--vp-surface"?: string; // Control bar background
  "--vp-border"?: string; // Border color
  "--vp-text"?: string; // Text color
  "--vp-muted"?: string; // Secondary text
  "--vp-radius"?: string; // Border radius
  "--vp-control-radius"?: string; // Button radius
  "--vp-video-bg"?: string; // Video background
};
```

---

## TypeScript

All types are exported:

```ts
import type { Player } from "@nurav/player-core";
import type {
  TokenFetcher,
  PlayerCustomization,
  ThemeVars,
} from "@nurav/player-react";
```

---

## Troubleshooting

| Problem                                | Solution                                        |
| -------------------------------------- | ----------------------------------------------- |
| Player is invisible / no controls show | Did you `import "@nurav/player-ui/styles"`?     |
| Controls show but video doesn't load   | Check the `src` URL. Must end in `.m3u8`        |
| "Access denied" error                  | You need a `tokenFetcher` for protected streams |
| Video stutters or buffers a lot        | Try `lowLatency` prop or check network speed    |
| Player is too small / large            | Set `width` and `aspectRatio` via `style` prop  |

---

## License

MIT
