# KGS HLS Player

A modular, production-grade HLS video player built for Khan Global Studies. It ships as three packages that work together — a headless playback engine, a polished React integration layer, and a fully-customizable UI component library.

---

## Packages

| Package               | Description                                         |
| --------------------- | --------------------------------------------------- |
| `@nurav/player-core`  | Framework-agnostic HLS engine. No React dependency. |
| `@nurav/player-react` | React hooks and the `<HlsPlayer>` component.        |
| `@nurav/player-ui`    | UI controls, icons, themes, CSS variables.          |

---

## Installation

Install all three packages together:

```bash
# npm
npm install @nurav/player-react @nurav/player-ui @nurav/player-core

# yarn
yarn add @nurav/player-react @nurav/player-ui @nurav/player-core

# pnpm
pnpm add @nurav/player-react @nurav/player-ui @nurav/player-core

# bun
bun add @nurav/player-react @nurav/player-ui @nurav/player-core
```

> **Peer dependencies** — React 18 or 19 must already be installed.

---

## Quick Start

### 1. Import the CSS (required)

```tsx
import "@nurav/player-ui/styles";
```

Add this once at your app entry point (e.g. `main.tsx` / `_app.tsx`).

### 2. Drop in the player

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles";

function App() {
  return (
    <HlsPlayer
      src="https://example.com/stream.m3u8"
      style={{ width: "100%", maxWidth: 900 }}
    />
  );
}
```

---

## Props Reference

### `<HlsPlayer>` — all props

| Prop                | Type                       | Default                              | Description                                                                                                   |
| ------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `src`               | `string`                   | —                                    | HLS stream URL (`.m3u8`)                                                                                      |
| `autoPlay`          | `boolean`                  | `false`                              | Start playing as soon as possible                                                                             |
| `muted`             | `boolean`                  | `false`                              | Begin muted (required for autoplay in most browsers)                                                          |
| `controls`          | `boolean`                  | `true`                               | Show the built-in control bar                                                                                 |
| `theme`             | `string`                   | `"kgs"`                              | Theme name                                                                                                    |
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
  objectFit?: "contain" | "cover" | "fill"; // default: "contain"
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

---

## Token Authentication

For secure, signed streams:

```tsx
import { HlsPlayer } from "@nurav/player-react";
import type { TokenFetcher } from "@nurav/player-react";

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
  theme="kgs"
  themeOverrides={{
    "--vp-accent": "#e91e63", // Main accent color (progress bar, buttons)
    "--vp-bg": "rgba(0,0,0,0.85)", // Control bar background
    "--vp-text": "#ffffff", // Text color
    "--vp-radius": "12px", // Border radius
  }}
/>
```

---

## Using the Hook Directly

For custom UI, use `useHlsPlayer` and build your own controls:

```tsx
import { useHlsPlayer } from "@nurav/player-react";

function CustomPlayer() {
  const { rootRef, videoRef, player, state, error } = useHlsPlayer({
    src: "https://example.com/stream.m3u8",
    autoPlay: true,
  });

  return (
    <div ref={rootRef}>
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

---

## Using the Core Engine (Framework-Agnostic)

For vanilla JS, Vue, Svelte, or any non-React framework:

```ts
import { Player } from "@nurav/player-core";

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

The `@nurav/player-core` engine is composed of **8 specialized managers**:

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

---

## Monorepo Structure

```
hls-player/
├── apps/
│   └── playground/          # Vite + React dev sandbox
│
└── packages/
    ├── player-core/         # Framework-agnostic engine
    │   └── src/
    │       ├── core/        # Player, Store, EventEmitter, HLS wrapper
    │       ├── managers/    # 8 manager classes
    │       ├── types/       # TypeScript types
    │       └── utils/       # Helpers (clamp, getLiveEdge, etc.)
    │
    ├── player-react/        # React layer
    │   └── src/
    │       ├── components/  # HlsPlayer component
    │       ├── hooks/       # useHlsPlayer, usePlayerState
    │       └── utils/
    │
    └── player-ui/           # UI + styles
        └── src/
            ├── components/  # Controls, Settings, Live badge, etc.
            ├── themes/      # CSS variable themes
            └── icons/
```

---

## License

MIT
