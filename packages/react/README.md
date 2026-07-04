# @playerkit/react

A complete, ready-to-use React video player for **HLS streams**, **YouTube videos**, and **progressive MP4s**. Drop in `<HlsPlayer>`, `<YoutubePlayer>`, `<Mp4Player>`, or the auto-detecting `<Player>` orchestrator — give it a source URL and get a fully functional player with controls, gestures, keyboard shortcuts, and customizable themes.

This package bundles `@playerkit/core` (video engine) and `@playerkit/ui` (UI components) into one easy-to-use set of components.

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

The simplest way is to use the orchestrator `<Player>` component. It automatically detects the type of media (HLS, YouTube, or progressive MP4) and renders the correct player format. Styling is **automatically loaded** inside the component:

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

| Feature               | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| 🎬 **Play/Pause**     | Click the video or press Space                                                                       |
| ⏪⏩ **Seek**         | Drag the progress bar or use arrow keys                                                              |
| 🔊 **Volume**         | Slider with mute toggle                                                                              |
| ⚙️ **Settings**       | Speed picker (all); quality switcher (HLS only — YouTube/MP4 do not expose manual quality selection) |
| 🖥️ **Fullscreen**     | Toggle fullscreen mode                                                                               |
| ⌨️ **Keyboard**       | Space (play/pause), F (fullscreen), arrows (seek)                                                    |
| 📱 **Mobile**         | Tap zones, swipe gestures, bottom sheet settings                                                     |
| 🎯 **Touch Gestures** | Tap to play/pause, swipe to seek                                                                     |
| 🔴 **Live Streams**   | DVR support, live edge indicator, "Go Live" button                                                   |
| 🔐 **Token Auth**     | Play protected HLS streams                                                                           |
| 🎨 **Themes**         | Custom colors and styles                                                                             |
| 🔄 **Auto Buffering** | Shows loading spinner when buffering                                                                 |

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
- `<Mp4Player>` imports `common.css` and `mp4.css`
- The master `<Player>` uses React `lazy` loading to only import the CSS relevant to the loaded stream format.

> **Note:** Do **not** manually import both `hls.css` and `youtube.css` unless you render multiple formats in the same app. Each component already brings in what it needs.

If you are building custom controls or your bundler doesn't support nested CSS imports, you can import modular CSS files manually:

```tsx
// Core variables, control bar, Settings panel, Error/Buffering overlays
import "@playerkit/ui/styles/common.css";

// Styles specific to native video elements (only needed when using <HlsPlayer>)
import "@playerkit/ui/styles/hls.css";

// Styles specific to YouTube iframe wrappers (only needed when using <YoutubePlayer>)
import "@playerkit/ui/styles/youtube.css";

// Styles specific to progressive video elements (only needed when using <Mp4Player>)
import "@playerkit/ui/styles/mp4.css";
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

### `HlsPlayer` — HLS-Specific Player

Use `<HlsPlayer>` when you only deal with HLS streams. The YouTube engine and its CSS are completely tree-shaken from the bundle.

```tsx
import { HlsPlayer } from "@playerkit/react";

function VideoPlayer() {
  return (
    <HlsPlayer
      src="https://example.com/live/stream.m3u8"
      autoPlay
      muted
      poster="https://example.com/thumbnail.jpg"
    />
  );
}
```

### `YoutubePlayer` — YouTube-Specific Player

`<YoutubePlayer>` is a first-class export just like `<HlsPlayer>`. Use it when you only embed YouTube content — the HLS engine and its CSS are completely tree-shaken from the bundle.

It accepts a full YouTube watch URL, a YouTube-nocookie embed URL, or just the bare video ID:

```tsx
import { YoutubePlayer } from "@playerkit/react";

// With a full YouTube video URL:
<YoutubePlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" autoPlay />

// With just the video ID:
<YoutubePlayer src="dQw4w9WgXcQ" autoPlay />

// With a nocookie embed URL (GDPR-friendly):
<YoutubePlayer src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" />
```

#### `YoutubePlayer` Props

`<YoutubePlayer>` accepts a focused subset of the main player props:

| Prop             | Type                               | Default      | Description                                                  |
| ---------------- | ---------------------------------- | ------------ | ------------------------------------------------------------ |
| `src`            | `string`                           | **required** | YouTube URL, nocookie embed URL, or bare video ID            |
| `autoPlay`       | `boolean`                          | `false`      | Start playing automatically                                  |
| `muted`          | `boolean`                          | `false`      | Start muted                                                  |
| `controls`       | `boolean`                          | `true`       | Show the built-in YouTube controls inside the iframe         |
| `poster`         | `string`                           | —            | Custom poster/thumbnail shown before the video starts        |
| `className`      | `string`                           | —            | Extra CSS class for the player container                     |
| `style`          | `CSSProperties`                    | —            | Inline styles for the player container                       |
| `customization`  | `PlayerCustomization`              | —            | Show/hide specific controls                                  |
| `themeOverrides` | `ThemeVars`                        | —            | CSS variable overrides                                       |
| `onPlayerReady`  | `(player: PlayerControls) => void` | —            | Called when the YouTube player is ready                      |
| `renderControls` | `(props) => ReactNode`             | —            | Replace the entire control bar with a custom render function |

### `Mp4Player` — MP4-Specific Player

Use `<Mp4Player>` when you only play progressive video files (MP4, WebM, Ogg). The YouTube and HLS engines and their styles are tree-shaken.

```tsx
import { Mp4Player } from "@playerkit/react";

function VideoPlayer() {
  return (
    <Mp4Player
      src="https://example.com/video.mp4"
      autoPlay
      muted
      poster="https://example.com/thumbnail.jpg"
    />
  );
}
```

#### `Mp4Player` Props

`<Mp4Player>` accepts standard player controls configuration:

| Prop             | Type                               | Default      | Description                                                  |
| ---------------- | ---------------------------------- | ------------ | ------------------------------------------------------------ |
| `src`            | `string`                           | **required** | Progressive video URL (MP4, WebM, Ogg)                       |
| `autoPlay`       | `boolean`                          | `false`      | Start playing automatically                                  |
| `muted`          | `boolean`                          | `false`      | Start muted                                                  |
| `controls`       | `boolean`                          | `true`       | Show the built-in control bar                                |
| `poster`         | `string`                           | —            | Custom poster/thumbnail shown before the video starts        |
| `className`      | `string`                           | —            | Extra CSS class for the player container                     |
| `style`          | `CSSProperties`                    | —            | Inline styles for the player container                       |
| `customization`  | `PlayerCustomization`              | —            | Show/hide specific controls                                  |
| `themeOverrides` | `ThemeVars`                        | —            | CSS variable overrides                                       |
| `onPlayerReady`  | `(player: PlayerControls) => void` | —            | Called when the MP4 player is ready                          |
| `renderControls` | `(props) => ReactNode`             | —            | Replace the entire control bar with a custom render function |

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

| Prop             | Type                          | Default      | Description                                                         |
| ---------------- | ----------------------------- | ------------ | ------------------------------------------------------------------- |
| `src`            | `string`                      | **required** | Source URL (HLS `.m3u8`, YouTube link/video ID, or progressive MP4) |
| `type`           | `"hls" \| "youtube" \| "mp4"` | —            | Explicitly enforce playback format (auto-detects if omitted)        |
| `autoPlay`       | `boolean`                     | `false`      | Start playing automatically                                         |
| `muted`          | `boolean`                     | `false`      | Start muted                                                         |
| `poster`         | `string`                      | —            | Thumbnail/poster image URL (HLS/MP4 only)                           |
| `startTime`      | `number`                      | —            | Start at this time (seconds)                                        |
| `className`      | `string`                      | —            | Extra CSS class for the player                                      |
| `videoClassName` | `string`                      | —            | Extra CSS class for the `<video>` element (HLS/MP4 only)            |
| `style`          | `CSSProperties`               | —            | Inline styles for the player container                              |

### Stream Configuration

| Prop            | Type           | Default                              | Description                                                                                       |
| --------------- | -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `tokenFetcher`  | `TokenFetcher` | —                                    | Auth function for protected streams (HLS/MP4 only)                                                |
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
| `centerIconScale`   | `number`              | `1`         | Scales the center play/pause overlay icon. Useful for larger or smaller screens. |
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

`useYoutubePlayer` requires two refs: one for the container element where the YouTube iframe is injected (`containerRef`), and one for the element used as the fullscreen root (`fullscreenRef`/`rootRef`). The `src` accepts a video ID, a full YouTube URL, or a nocookie embed URL.

```tsx
import { useYoutubePlayer } from "@playerkit/react";
import { useRef } from "react";

function CustomYoutubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { player, state } = useYoutubePlayer({
    src: "dQw4w9WgXcQ", // Video ID, YouTube URL, or nocookie embed URL
    containerRef, // Element where iframe will be injected
    fullscreenRef: rootRef, // Element to use for fullscreen
    autoPlay: false,
    muted: false,
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
          {state?.isPlaying ? "Pause" : "Play"}
        </button>
        <span>Volume: {Math.round((state?.volume ?? 0) * 100)}%</span>
        {state?.isPlaying !== undefined && (
          <span> | {state.isPlaying ? "Playing" : "Paused"}</span>
        )}
      </div>
    </div>
  );
}
```

### 3. `useMp4Player` (for progressive MP4s)

```tsx
import { useMp4Player } from "@playerkit/react";

function CustomMp4Player() {
  const { player, state, error, rootRef, videoRef } = useMp4Player({
    src: "https://example.com/video.mp4",
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
  mobile?: {
    showCenterOverlay?: boolean; // Show center gestures overlay on mobile (default: false)
  };
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
  PlayerProps, // Props for the <Player> / <Player> orchestrator
  HlsPlayerProps, // Props accepted by <HlsPlayer>
  YoutubePlayerProps, // Props accepted by <YoutubePlayer>
  Mp4PlayerProps, // Props accepted by <Mp4Player>
  useMp4Player, // React hook for headless MP4 player
  TokenFetcher,
  PlayerCustomization,
  ThemeVars,
} from "@playerkit/react";
```

---

## Troubleshooting

| Problem                                | Solution                                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Player is invisible / no controls show | Check if your bundler supports CSS side-effects or manually import `@playerkit/ui/styles/common.css` alongside `@playerkit/ui/styles/hls.css`, `youtube.css`, or `mp4.css`   |
| Controls show but video doesn't load   | Verify the `src` URL. For HLS, it must end in `.m3u8`. For YouTube, it must be a valid watch link or video ID. For MP4, it must end in `.mp4` or a valid progressive stream. |
| "Access denied" error                  | You need a `tokenFetcher` for protected HLS/MP4 streams                                                                                                                      |
| Video stutters or buffers a lot        | Try the `lowLatency` prop or check network connection                                                                                                                        |
| Player is too small / large            | Set `width` and `aspectRatio` via the `style` prop                                                                                                                           |

---

## License

MIT
