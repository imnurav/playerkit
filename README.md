# PlayerKit

A modular, production-grade video player. It supports HLS streams, YouTube videos, and progressive MP4 playback with full UI and security feature parity. It ships as three packages that work together — a headless playback engine, a polished React integration layer, and a fully-customizable UI component library.

---

## Packages

| Package            | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `@playerkit/core`  | Framework-agnostic HLS, YouTube & MP4 engine. No React dependency.      |
| `@playerkit/react` | React hooks, orchestrator `<Player>` and format-specific subcomponents. |
| `@playerkit/ui`    | UI controls, icons, themes, CSS variables.                              |

---

## Installation

Install all three packages together:

```bash
# npm
npm install @playerkit/react @playerkit/ui @playerkit/core

# yarn
yarn add @playerkit/react @playerkit/ui @playerkit/core

# pnpm
pnpm add @playerkit/react @playerkit/ui @playerkit/core

# bun
bun add @playerkit/react @playerkit/ui @playerkit/core
```

> **Peer dependencies** — React 18 or 19 must already be installed.

---

## Quick Start

### Drop in the player

The main `<Player>` component automatically detects the media type (HLS, YouTube, or progressive MP4) based on the `src` URL or video ID. Styling is **automatically loaded** inside the player component itself—you do not need to manually import CSS at your app entry point.

```tsx
import { Player } from "@playerkit/react";

function App() {
  return (
    <Player
      src="https://example.com/stream.m3u8" // Or a YouTube URL / Video ID
      style={{ width: "100%", maxWidth: 900 }}
    />
  );
}
```

### Force a specific format with `type`

The `<Player>` orchestrator auto-detects the media type from the `src` URL. Pass `type` to skip detection entirely:

```tsx
import { Player } from "@playerkit/react";

// Always treat src as an HLS stream
<Player src="https://example.com/stream.m3u8" type="hls" />

// Always treat src as a YouTube video
<Player src="dQw4w9WgXcQ" type="youtube" />

// Always treat src as a progressive MP4 video
<Player src="https://example.com/video.mp4" type="mp4" />
```

### Specialized Players

If you want to enforce a specific format and optimize code-splitting, you can import specialized player components directly:

```tsx
// 1. HLS Player (bundles only HLS engine & HLS CSS)
import { HlsPlayer } from "@playerkit/react";
// 2. YouTube Player (bundles only YouTube iframe wrapper & YouTube CSS)
import { YoutubePlayer } from "@playerkit/react";
// 3. MP4 Player (bundles only MP4 engine & MP4 CSS)
import { Mp4Player } from "@playerkit/react";
```

#### `<HlsPlayer>`

Use `HlsPlayer` when you know the source is always an HLS stream. It accepts a `poster` prop to show a thumbnail before playback begins.

```tsx
import { HlsPlayer } from "@playerkit/react";

<HlsPlayer
  src="https://example.com/stream.m3u8"
  poster="https://example.com/thumbnail.jpg"
  autoPlay
  muted
/>;
```

#### `<YoutubePlayer>`

`YoutubePlayer` is a first-class exported component for YouTube content. It accepts a full YouTube URL **or** a bare video ID.

````tsx
import { YoutubePlayer } from "@playerkit/react";

// Full URL
<YoutubePlayer
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  style={{ width: "100%", maxWidth: 900 }}
/>

// Bare video ID
<YoutubePlayer
  src="dQw4w9WgXcQ"
  autoPlay
  muted
/>

---

## Styling & Modular CSS

`@playerkit/ui` ships **four separate CSS files** so each player bundle only pulls in what it needs:

| File | Contents | Auto-imported by |
| ---- | -------- | ---------------- |
| `@playerkit/ui/styles/common.css` | Shared controls, progress bar, overlays | `<HlsPlayer>`, `<YoutubePlayer>`, `<Mp4Player>`, `<Player>` |
| `@playerkit/ui/styles/hls.css` | Native HLS `<video>` element overrides | `<HlsPlayer>`, `<Player>` (when HLS) |
| `@playerkit/ui/styles/youtube.css` | YouTube iframe scaling & poster handling | `<YoutubePlayer>`, `<Player>` (when YouTube) |
| `@playerkit/ui/styles/mp4.css` | Progressive MP4 `<video>` element overrides | `<Mp4Player>`, `<Player>` (when MP4) |

`<HlsPlayer>` auto-imports `common.css` + `hls.css`. `<YoutubePlayer>` auto-imports `common.css` + `youtube.css`. `<Mp4Player>` auto-imports `common.css` + `mp4.css`. The orchestrator `<Player>` lazy-loads whichever set is needed based on the detected or forced format.

If your project requires manual CSS importing (such as when building a completely headless custom player using our hooks), you can import the stylesheet segments individually:

```tsx
// Core variables, control bar, Settings panel, Error/Buffering overlays
import "@playerkit/ui/styles/common.css";

// Styles specific to the native HTML5 video element (HLS Player)
import "@playerkit/ui/styles/hls.css";

// Styles specific to the YouTube iframe API layer
import "@playerkit/ui/styles/youtube.css";

// Styles specific to the progressive video element (MP4 Player)
import "@playerkit/ui/styles/mp4.css";
````

Alternatively, you can import the full, backwards-compatible monolithic bundle:

```tsx
import "@playerkit/ui/styles";
```

---

## Props Reference

The orchestrator `<Player>` (also exported as `<Player>`) accepts all props listed below. Format-specific props like `tokenFetcher` and `live` only apply to HLS streams, while standard attributes apply to both formats.

### Player Props

| Prop                | Type                       | Default                              | Description                                                                                                   |
| ------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `src`               | `string`                   | —                                    | Source URL (HLS stream `.m3u8`, YouTube URL/ID, or progressive MP4)                                           |
| `type`              | `"hls" \| "youtube" \| "mp4"`| —                                    | Force a specific playback format instead of auto-detecting from the `src`                                     |
| `autoPlay`          | `boolean`                  | `false`                              | Start playing as soon as possible                                                                             |
| `muted`             | `boolean`                  | `false`                              | Begin muted (required for autoplay in most browsers)                                                          |
| `controls`          | `boolean`                  | `true`                               | Show the built-in control bar                                                                                 |
| `poster`            | `string`                   | —                                    | Thumbnail URL shown before playback begins (HLS/MP4 only)                                                     |
| `theme`             | `string`                   | `"default"`                          | Theme name                                                                                                    |
| `seekStep`          | `number`                   | `10`                                 | Keyboard / tap seek amount in seconds                                                                         |
| `playbackRates`     | `number[]`                 | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]` | Available speed options shown in settings                                                                     |
| `keyboard`          | `boolean`                  | `true`                               | Enable keyboard shortcuts                                                                                     |
| `tokenFetcher`      | `TokenFetcher`             | —                                    | Async function to resolve secure stream URLs                                                                  |
| `live`              | `LiveOptions`              | `{}`                                 | Live stream engine settings (see below)                                                                       |
| `customization`     | `PlayerCustomization`      | `{}`                                 | Hide/show UI elements                                                                                         |
| `themeOverrides`    | `Record<string, string>`   | `{}`                                 | CSS variable overrides (branding)                                                                             |
| `style`             | `CSSProperties`            | —                                    | Inline styles on the root element                                                                             |
| `className`         | `string`                   | —                                    | CSS class on the root element                                                                                 |
| `onPlayerReady`     | `(player: Player) => void` | —                                    | Called when player instance is ready                                                                          |
| `disableDevOptions` | `boolean`                  | `false`                              | Enable active protection to block DevTools, context menus, drag-and-drop, and hotkeys. Auto-resumes on close. |

---

### `live` options

```ts
type LiveOptions = {
  syncDuration?: number; // Seconds behind live edge before "Go Live" shows (default: 5)
  lowLatency?: boolean; // Enable hls.js Low-Latency HLS mode (default: false)
  dvr?: boolean; // Force-enable/disable seekable DVR mode (optional; YouTube Live auto-probes if omitted)
};
```

---

### `customization` options

```ts
type PlayerCustomization = {
  showPlayButton?: boolean; // Play/pause button (default: true)
  showTimeDisplay?: boolean; // Time & duration text (default: true)
  showSettings?: boolean; // Quality/speed gear menu (default: true)
  showFullscreen?: boolean; // Fullscreen button (default: true)
  showCenterOverlay?: boolean; // Center tap-to-seek overlay (default: true)
  showObjectFitButton?: boolean; // Stretch/fit toggle (default: true)
  volumeControl?: "vertical" | "horizontal" | "hidden"; // default: "vertical"
  centerOverlayGap?: number; // Gap around center overlay in px (default: 80)
  centerIconScale?: number; // Scale multiplier for the center play/pause icon (default: 1)
  objectFit?: "contain" | "cover" | "fill"; // default: "contain"
  mobile?: {
    showCenterOverlay?: boolean; // Show center gestures overlay on mobile (default: false)
  };
};
```

---

## Live Stream Features

The player has a fully rethought live engine:

### LIVE / Go Live badge

- **LIVE** (green) — you are within `live.syncDuration` seconds of the live edge
- **⚡ Go Live** — you have drifted behind; tap to jump back instantly

### Auto speed-reset

If you set playback speed to **2×** to catch up to a live stream, the player **automatically resets it back to 1×** the moment you reach the live edge — preventing the stream from running ahead and causing constant buffering.

### DVR scrubbing

If the stream has a DVR window, you can scrub back in time. The player shows the full seekable window and lets you seek back with the progress bar.

- **HLS Streams**: DVR bounds are parsed directly from the manifest index.
- **YouTube Live**: Probed programmatically via a background active probe ~1.4 seconds after playback starts.
  - **Seekable (DVR enabled)**: Full scrubbing, sliding, seek buttons, and the "Go Live" badge are active.
  - **Non-Seekable (Run-only-live)**: The progress bar is disabled, the seek thumb is hidden, and controls are simplified to prevent invalid seek jumps.
  - **Zero Layout Shifts**: Controls are synchronized and hidden for the first 1.4 seconds of playback while the probe runs, ensuring they fade in directly in their correct state.

---

## Token Authentication

For secure, signed streams:

```tsx
import { HlsPlayer } from "@playerkit/react";
import type { TokenFetcher } from "@playerkit/react";

const tokenFetcher: TokenFetcher = async ({ src, signal }) => {
  // Call your backend to exchange a video ID for a signed URL
  const res = await fetch("/api/video-token", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: src }),
  });
  const data = await res.json();
  if (!data.video_url) throw new Error(data.message ?? "Token fetch failed");
  return {
    url: data.video_url,
    expiresIn: data.expires_in, // optional: player auto-refreshes before expiry
  };
};

function CourseVideo({ videoId }: { videoId: string }) {
  return (
    <HlsPlayer
      src={`https://api.example.com/video/${videoId}`}
      tokenFetcher={tokenFetcher}
      autoPlay
      muted
    />
  );
}
```

---

## Enterprise-Grade Security (Secure Dev Shield)

Enable strict protection for intellectual property and broadcast streams via the `disableDevOptions` prop:

```tsx
<HlsPlayer
  src="https://example.com/secure-stream.m3u8"
  disableDevOptions={true}
/>
```

### Protection Shield Measures:

1. **Right-Click Block**: Disables standard browser context menu inside the player container.
2. **Asset Drag Prevention**: Drops all `dragstart` events to prevent isolating posters or streams.
3. **Inspector Hotkey Shield**: Cancels F12, Inspect, Element Pickers, Source Views, and Save hotkeys (`F12`, `Cmd+Opt+I`, `Ctrl+Shift+J`, `Cmd+S`, etc.).
4. **CSS Protection Overrides**: Injects dynamic selectors (`user-select: none`, `pointer-events: none` on the raw video element) to prevent text selection and direct network capture.
5. **Active Checking Loops**:
   - **Horizontal Resize Check**: Detects docked developer consoles (left/right) when the difference is greater than `250px`.
   - **Debugger Timing Loop**: Periodically triggers background breakpoint timing checks. Halting execution for `>200ms` instantly registers a lock state.
6. **Actions & Auto-Recovery**:
   - **Lock Screen**: The video pauses, and a frosted glassmorphic overlay locks the screen with the alert `"SECURITY LOCK ACTIVE: Developer Tools Detected"`.
   - **Automatic Resume**: When developer tools are **closed**, the engine instantly lifts the lock overlay and **resumes video streaming** (`play()`) automatically.

---

## Branding / Theme Overrides

Override CSS variables to match your brand:

```tsx
<HlsPlayer
  src="..."
  theme="default"
  themeOverrides={{
    "--pk-accent": "#e91e63", // Main accent color (progress bar, buttons)
    "--pk-bg": "rgba(0,0,0,0.85)", // Control bar background
    "--pk-text": "#ffffff", // Text color
    "--pk-radius": "12px", // Border radius
  }}
/>
```

---

## Using Hooks Directly (Headless React)

For a custom UI, you can skip the default player component wrappers and use our headless React hooks directly.

### 1. `useHlsPlayer` (for HLS streams)

```tsx
import { useHlsPlayer } from "@playerkit/react";

function CustomHlsPlayer() {
  const { rootRef, videoRef, player, state, error } = useHlsPlayer({
    src: "https://example.com/stream.m3u8",
    autoPlay: true,
  });

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <video ref={videoRef} style={{ width: "100%" }} />
      <div>
        <button onClick={() => player?.togglePlay()}>
          {state?.isPlaying ? "Pause" : "Play"}
        </button>
        {state?.isLive && !state.isAtLiveEdge && (
          <button onClick={() => player?.seekToLive()}>⚡ Go Live</button>
        )}
        <span>Speed: {state?.playbackRate}×</span>
        {error && <p>Error: {error.message}</p>}
      </div>
    </div>
  );
}
```

### 2. `useYoutubePlayer` (for YouTube streams)

```tsx
import { useYoutubePlayer } from "@playerkit/react";
import { useRef } from "react";

function CustomYoutubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { player, state } = useYoutubePlayer({
    src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    containerRef,
    fullscreenRef: rootRef,
    autoPlay: true,
  });

  return (
    <div
      ref={rootRef}
      style={{ position: "relative", width: 640, height: 360 }}
    >
      {/* The YouTube iframe will be dynamically injected here */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", bottom: 10, left: 10 }}>
        <button onClick={() => player?.togglePlay()}>
          {state?.isPlaying ? "Pause" : "Play"}
        </button>
        <span>Volume: {Math.round((state?.volume ?? 0) * 100)}%</span>
      </div>
    </div>
  );
}
```

### 3. `useMp4Player` (for progressive MP4s)

```tsx
import { useMp4Player } from "@playerkit/react";

function CustomMp4Player() {
  const { rootRef, videoRef, player, state, error } = useMp4Player({
    src: "https://example.com/video.mp4",
    autoPlay: true,
  });

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <video ref={videoRef} style={{ width: "100%" }} />
      <div>
        <button onClick={() => player?.togglePlay()}>
          {state?.isPlaying ? "Pause" : "Play"}
        </button>
        <span>Speed: {state?.playbackRate}×</span>
        {error && <p>Error: {error.message}</p>}
      </div>
    </div>
  );
}
```

---

## Using the Core Engine (Framework-Agnostic)

For vanilla JS, Vue, Svelte, or any non-React framework:

```ts
import { Player } from "@playerkit/core";

const video = document.querySelector("video")!;

const player = new Player({
  video,
  src: "https://example.com/stream.m3u8",
  autoPlay: true,
  live: {
    syncDuration: 5,
    lowLatency: false,
  },
});

// Subscribe to state changes
const unsub = player.subscribe((state) => {
  console.log("isPlaying:", state.isPlaying);
  console.log("isAtLiveEdge:", state.isAtLiveEdge);
  console.log("liveLatency:", state.liveLatency);
});

// Controls
player.play();
player.pause();
player.seek(120); // seek to 2:00
player.seekToLive(); // jump to live edge
player.setVolume(0.8);
player.setPlaybackRate(1.5);
player.setQuality("auto");

// Listen to events
player.on("error", (err) => {
  console.error(`[${err.category}]`, err.message);
});

// Cleanup
player.destroy();
unsub();
```

---

## Error Handling

Errors surface via the `error` state field and the `"error"` event. Each error has a `category`:

| Category  | Meaning                     |
| --------- | --------------------------- |
| `source`  | Bad URL, 404, empty src     |
| `auth`    | Token fetch failed, 401/403 |
| `network` | No internet, can't connect  |
| `server`  | 5xx from stream server      |
| `media`   | Browser can't decode format |
| `unknown` | Unclassified hls.js error   |

```tsx
<HlsPlayer
  src="..."
  onPlayerReady={(player) => {
    player.on("error", (err) => {
      if (err.category === "auth") {
        redirectToLogin();
      } else {
        showToast(`Playback error: ${err.message}`);
      }
    });
  }}
/>
```

---

## Keyboard Shortcuts

| Key     | Action                                |
| ------- | ------------------------------------- |
| `Space` | Play / Pause                          |
| `F`     | Toggle fullscreen                     |
| `M`     | Mute / Unmute                         |
| `← →`   | Seek backward / forward by `seekStep` |
| `↑ ↓`   | Volume up / down                      |
| `S`     | Toggle stretch / fit                  |

---

## Architecture

The `@playerkit/core` engine is composed of **8 specialized managers**:

| Manager             | Responsibility                                                              |
| ------------------- | --------------------------------------------------------------------------- |
| `HlsManager`        | hls.js lifecycle, quality levels, error recovery                            |
| `LiveManager`       | Live detection, DVR window, pause polling, speed-reset                      |
| `ErrorManager`      | Error creation, HTTP classification, state + event emit                     |
| `AuthManager`       | Token fetch, refresh before expiry, XHR header injection                    |
| `NetworkManager`    | Online/offline events, auto-retry on reconnect                              |
| `FullscreenManager` | Fullscreen API, cross-browser                                               |
| `KeyboardManager`   | Keyboard shortcut bindings                                                  |
| `SecurityManager`   | Active protection traps, F12 hotkey shields, context menus, and auto-resume |

Key principles:

- **Single source of truth** — `LiveManager.evaluate()` is the only writer of `isAtLiveEdge` and `liveLatency`
- **Segment spike dampening** — 3 consecutive high-latency readings required before entering DVR mode (prevents segment boundary oscillation)
- **Centralized errors** — `ErrorManager` owns all error construction, classification, and emission
- **Atomic state writes** — `timeupdate` merges all fields into one `patchState()` call, no double React renders
- **Auto speed-reset** — player auto-resets `playbackRate → 1×` when catching live edge at elevated speed

---

## Development

```bash
# Install all workspace dependencies
pnpm install

# Start the interactive playground
pnpm dev        # → http://localhost:5173

# Build all packages
pnpm build

# Type-check only
pnpm typecheck
```

### Playground (`apps/playground/`)

The playground is a fully-featured interactive sandbox for testing the player with different streams and configurations in real time.

The playground's `Source` type includes a `category` field for explicit stream classification:

```ts
type Source = {
  label: string;
  src: string;
  category: "youtube" | "hls-live" | "hls-vod" | "error";
};
```

This lets the playground group and filter its built-in stream library by format and behaviour (live, VOD, or intentionally broken error-case streams).

---

## Monorepo Structure

```
hls-player/
├── apps/
│   ├── playground/          # Vite + React interactive dev sandbox
│   └── docs/                # Per-package documentation
│       ├── core/
│       ├── react/
│       └── ui/
│
└── packages/
    ├── core/                # Framework-agnostic engine
    │   └── src/
    │       ├── core/        # Player, Store, EventEmitter, HLS wrapper
    │       ├── managers/    # 8 manager classes
    │       ├── types/       # TypeScript types
    │       └── utils/       # Helpers (clamp, getLiveEdge, etc.)
    │
    ├── react/               # React layer
    │   └── src/
    │       ├── components/  # HlsPlayer, YoutubePlayer, Player components
    │       ├── hooks/       # useHlsPlayer, useYoutubePlayer, usePlayerState
    │       └── utils/
    │
    └── ui/                  # UI + styles
        └── src/
            ├── components/  # Controls, Settings, Live badge, etc.
            ├── themes/      # CSS variable themes
            └── icons/
```

---

## License

MIT
