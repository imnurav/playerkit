# @playerkit/react

A complete, ready-to-use React HLS video player component. Drop it in, give it a stream URL, and you get a fully functional video player with controls, gestures, keyboard shortcuts, and customizable themes.

This package bundles `@playerkit/core` (video engine) and `@playerkit/ui` (UI components) into one easy-to-use component.

```bash
# npm
npm install @playerkit/react @playerkit/core @playerkit/ui

# yarn
yarn add @playerkit/react @playerkit/core @playerkit/ui

# pnpm
pnpm add @playerkit/react @playerkit/core @playerkit/ui

# bun
bun add @playerkit/react @playerkit/core @playerkit/ui
```

---

## Quick Start

The simplest way is to use the orchestrator `<Player>` component. It automatically detects the type of media (HLS vs YouTube) and renders the correct player format. Styling is **automatically loaded** inside the component:

```tsx
import { Player } from "@playerkit/react";

function App() {
  return (
    <Player
      src="https://example.com/stream.m3u8" // Or a YouTube URL / Video ID
      style={{ width: "100%", maxWidth: 800 }}
    />
  );
}
```

---

## What You Get

When you use `<Player />` (or specialized `<HlsPlayer />` / `<YoutubePlayer />`), you get all of this out of the box:

| Feature               | Description                                        |
| --------------------- | -------------------------------------------------- |
| 🎬 **Play/Pause**     | Click the video or press Space                     |
| ⏪⏩ **Seek**         | Drag the progress bar or use arrow keys            |
| 🔊 **Volume**         | Slider with mute toggle                            |
| ⚙️ **Settings**       | Speed and quality picker (HLS & YouTube speed)     |
| 🖥️ **Fullscreen**     | Toggle fullscreen mode                             |
| ⌨️ **Keyboard**       | Space (play/pause), F (fullscreen), arrows (seek)  |
| 📱 **Mobile**         | Tap zones, swipe gestures, bottom sheet settings   |
| 🎯 **Touch Gestures** | Tap to play/pause, swipe to seek                   |
| 🔴 **Live Streams**   | DVR support, live edge indicator, "Go Live" button |
| 🔐 **Token Auth**     | Play protected HLS streams                         |
| 🎨 **Themes**         | Custom colors and styles                           |
| 🔄 **Auto Buffering** | Shows loading spinner when buffering               |

---

## Installation

```bash
# npm
npm install @playerkit/react @playerkit/core @playerkit/ui

# yarn
yarn add @playerkit/react @playerkit/core @playerkit/ui

# pnpm
pnpm add @playerkit/react @playerkit/core @playerkit/ui

# bun
bun add @playerkit/react @playerkit/core @playerkit/ui
```

This automatically installs `@playerkit/core` and `@playerkit/ui`.

### CSS Stylesheet Imports

Starting with v0.0.3, player components **automatically load** the modular styles they require:

- `<HlsPlayer>` imports `common.css` and `hls.css`
- `<YoutubePlayer>` imports `common.css` and `youtube.css`
- The master `<Player>` uses React `lazy` loading to only import the CSS relevant to the loaded stream format.

If you are building custom controls or your bundler doesn't support nested CSS imports, you can import modular CSS files manually:

```tsx
// Core variables, control bar, Settings panel, Error/Buffering overlays
import "@playerkit/ui/styles/common.css";

// Styles specific to native video elements
import "@playerkit/ui/styles/hls.css";

// Styles specific to YouTube iframe wrappers
import "@playerkit/ui/styles/youtube.css";
```

---

## Simple Examples

### Orchestrator Player (Auto-detects HLS vs YouTube)

```tsx
import { Player } from "@playerkit/react";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. HLS Stream */}
      <Player src="https://example.com/live/stream.m3u8" />

      {/* 2. YouTube Video */}
      <Player src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
    </div>
  );
}
```

### Format-Specific Players

If you want to enforce a specific format and ensure that the other engine's bundle and CSS side-effects are completely tree-shaken, import them directly:

```tsx
import { HlsPlayer, YoutubePlayer } from "@playerkit/react";

function VideoPlayer() {
  return (
    <div style={{ width: "100%", maxWidth: 800 }}>
      {/* Specifically HLS */}
      <HlsPlayer src="https://example.com/live/stream.m3u8" />

      {/* Specifically YouTube */}
      <YoutubePlayer src="dQw4w9WgXcQ" />
    </div>
  );
}
```

### Auto-Play (Muted)

```tsx
<Player src="dQw4w9WgXcQ" autoPlay muted />
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
    "--pk-accent": "#ec4899", // Pink accent
    "--pk-radius": "12px",
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
import { HlsPlayer } from "@playerkit/react";
import type { Player } from "@playerkit/core";

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

| Prop             | Type                 | Default      | Description                                                  |
| ---------------- | -------------------- | ------------ | ------------------------------------------------------------ |
| `src`            | `string`             | **required** | Source URL (HLS `.m3u8` or YouTube link / video ID)          |
| `type`           | `"hls" \| "youtube"` | —            | Explicitly enforce playback format (auto-detects if omitted) |
| `autoPlay`       | `boolean`            | `false`      | Start playing automatically                                  |
| `muted`          | `boolean`            | `false`      | Start muted                                                  |
| `poster`         | `string`             | —            | Thumbnail/poster image URL                                   |
| `startTime`      | `number`             | —            | Start at this time (seconds)                                 |
| `className`      | `string`             | —            | Extra CSS class for the player                               |
| `videoClassName` | `string`             | —            | Extra CSS class for the `<video>` element (HLS only)         |
| `style`          | `CSSProperties`      | —            | Inline styles for the player container                       |

### Stream Configuration

| Prop            | Type           | Default                              | Description                                                                                       |
| --------------- | -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `tokenFetcher`  | `TokenFetcher` | —                                    | Auth function for protected streams                                                               |
| `playbackRates` | `number[]`     | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]` | Available speeds                                                                                  |
| `live`          | `LiveConfig`   | `{}`                                 | Live engine settings: `{ syncDuration?: number, lowLatency?: boolean, dvr?: boolean }` (optional) |

### UI Configuration

| Prop                | Type                  | Default     | Description                                                                      |
| ------------------- | --------------------- | ----------- | -------------------------------------------------------------------------------- |
| `controls`          | `boolean`             | `true`      | Show the control bar                                                             |
| `keyboard`          | `boolean`             | `true`      | Enable keyboard shortcuts                                                        |
| `seekStep`          | `number`              | `10`        | Seconds to seek per arrow press                                                  |
| `theme`             | `string`              | `"default"` | Theme to use                                                                     |
| `themeOverrides`    | `ThemeVars`           | —           | Custom CSS colors                                                                |
| `customization`     | `PlayerCustomization` | —           | Show/hide specific controls                                                      |
| `disableDevOptions` | `boolean`             | `false`     | Block DevTools, F12 hotkeys, dragging, and context menus. Auto-resumes on close. |

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
import { HlsPlayer, type TokenFetcher } from "@playerkit/react";

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

## Enterprise Security (Secure Dev Shield)

Protect your video streams and learning assets from scraping or unauthorized access by enabling the `disableDevOptions` prop:

```tsx
<HlsPlayer src="https://example.com/stream.m3u8" disableDevOptions={true} />
```

When active, the player launches multiple layers of defense:

1. **Event Interception**: Blocks F12, view source, element selection, inspect tools, right-clicks/context menus, and asset drag-and-drop.
2. **Active Checking Traps**: Periodically monitors browser resizing (detecting side-docked panels `>250px`) and runs `debugger;` statement execution timing loops. If thread halt is detected (`>200ms`), the player enters a lock state.
3. **Actions & Auto-Recovery**:
   - **Lock Screen**: Pauses playback, toggles the store's `isDevtoolsDetected` state to `true`, and renders a blurred glassmorphic security overlay.
   - **Auto-Resume**: As soon as developer tools are **closed**, the player automatically clears the lock state and **resumes video playback** instantly.

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

If you don't want the built-in UI, you can use our React hooks directly to build a custom player.

### 1. `useHlsPlayer` (for HLS streams)

```tsx
import { useHlsPlayer } from "@playerkit/react";

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

### 2. `useYoutubePlayer` (for YouTube videos)

```tsx
import { useYoutubePlayer } from "@playerkit/react";
import { useRef } from "react";

function CustomYoutubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { player, state } = useYoutubePlayer({
    src: "dQw4w9WgXcQ",
    containerRef,
    fullscreenRef: rootRef,
    autoPlay: true,
  });

  return (
    <div
      ref={rootRef}
      style={{ position: "relative", width: 640, height: 360 }}
    >
      {/* YouTube iframe is injected inside this element */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{ position: "absolute", bottom: 10, left: 10, color: "#fff" }}
      >
        <button onClick={() => player?.togglePlay()}>
          {state?.isPlaying ? "⏸" : "▶"}
        </button>
        <span>Volume: {Math.round((state?.volume ?? 0) * 100)}%</span>
      </div>
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
  "--pk-accent"?: string; // Primary color
  "--pk-accent-contrast"?: string; // Text color on accent
  "--pk-surface"?: string; // Control bar background
  "--pk-border"?: string; // Border color
  "--pk-text"?: string; // Text color
  "--pk-muted"?: string; // Secondary text
  "--pk-radius"?: string; // Border radius
  "--pk-control-radius"?: string; // Button radius
  "--pk-video-bg"?: string; // Video background
};
```

---

## TypeScript

All types are exported:

```ts
import type { PlayerControls } from "@playerkit/core";
import type {
  PlayerProps,
  HlsPlayerProps,
  YoutubePlayerProps,
  TokenFetcher,
  PlayerCustomization,
  ThemeVars,
} from "@playerkit/react";
```

---

## Troubleshooting

| Problem                                | Solution                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Player is invisible / no controls show | Check if your bundler supports CSS side-effects or manually import `@playerkit/ui/styles/common.css` alongside `@playerkit/ui/styles/hls.css` or `youtube.css` |
| Controls show but video doesn't load   | Verify the `src` URL. For HLS, it must end in `.m3u8`. For YouTube, it must be a valid watch link or video ID.                                                 |
| "Access denied" error                  | You need a `tokenFetcher` for protected HLS streams                                                                                                            |
| Video stutters or buffers a lot        | Try the `lowLatency` prop or check network connection                                                                                                          |
| Player is too small / large            | Set `width` and `aspectRatio` via the `style` prop                                                                                                             |

---

## License

MIT
