# @nurav/player-core

A headless video player engine supporting **HLS and YouTube** that works with any JavaScript framework — or no framework at all.

This package handles video playback, quality switching, live streams, authentication, and fullscreen — all without any user interface. The `Player` class auto-detects whether a source is an HLS stream or a YouTube video and routes it to the appropriate engine automatically. You can use it directly, or pair it with `@nurav/player-ui` (UI components) and `@nurav/player-react` (the complete React player).

```bash
# npm
npm install @nurav/player-core

# yarn
yarn add @nurav/player-core

# pnpm
pnpm add @nurav/player-core

# bun
bun add @nurav/player-core
```

---

## Quick Start

The fastest way to get a video playing:

```html
<video id="my-video" controls></video>

<script type="module">
  import { Player } from "@nurav/player-core";

  const video = document.getElementById("my-video");
  const player = new Player({
    video,
    src: "https://example.com/stream.m3u8",
  });
</script>
```

That's it. The video will load and start playing.

---

## What Can You Do With This?

| Feature                | HLS | YouTube | Description                                                |
| ---------------------- | :-: | :-----: | ---------------------------------------------------------- |
| 🎬 **Play / Pause**    | ✅  |   ✅    | Control playback programmatically                          |
| ⏪ **Seek**            | ✅  |   ✅    | Jump to any point in the video                             |
| 🔊 **Volume**          | ✅  |   ✅    | Adjust volume, mute/unmute                                 |
| 🎯 **Quality**         | ✅  |   ❌    | Auto-select or manually pick video quality (HLS only)      |
| 🔴 **Live Streams**    | ✅  |   ✅    | Live state, latency, and "go live" detection               |
| 📼 **DVR**             | ✅  |   ✅    | Seek back in a live stream (HLS & YouTube Live)            |
| 🔐 **Token Auth**      | ✅  |   ❌    | Play protected streams that need authentication (HLS only) |
| 📡 **Low-Latency HLS** | ✅  |   ❌    | Low-latency mode (HLS only)                                |
| 🖥️ **Fullscreen**      | ✅  |   ✅    | Enter/exit fullscreen mode                                 |
| 📐 **Video Fit**       | ✅  |   ✅    | Toggle between "fit to screen" and "fill screen"           |
| ⏩ **Playback Speed**  | ✅  |   ✅    | Change speed (0.25x, 1x, 2x, etc.)                         |
| 🎧 **Events**          | ✅  |   ✅    | Listen for play, pause, error, quality changes, and more   |
| 📺 **YouTube Engine**  | ❌  |   ✅    | Plays YouTube URLs and bare video IDs via the IFrame API   |

---

## Installation

```bash
# npm
npm install @nurav/player-core

# yarn
yarn add @nurav/player-core

# pnpm
pnpm add @nurav/player-core

# bun
bun add @nurav/player-core
```

No other packages are required. This works in any JavaScript project (React, Vue, Svelte, vanilla JS, etc.).

---

## Creating a Player

```ts
import { Player } from "@nurav/player-core";

const video = document.querySelector("video")!;

const player = new Player({
  video, // Required: a <video> element
  src: "...", // Required: HLS stream URL or YouTube URL/ID
});
```

### All Options

```ts
const player = new Player({
  video: HTMLVideoElement, // (required) The <video> element
  src: "...", // (required) HLS stream URL, YouTube URL, or YouTube video ID
  type: "hls" | "youtube", // Force a specific engine; auto-detects if omitted
  autoPlay: false, // Start playing automatically?
  startTime: 0, // Start at this time (seconds)
  keyboard: false, // Enable keyboard shortcuts
  tokenFetcher: undefined, // For protected HLS streams (see below; not used for YouTube)

  // Live stream tuning
  live: {
    syncDuration: 5, // Seconds behind live edge to show "Go Live" (default: 5)
    lowLatency: false, // Enable low-latency HLS mode (HLS only)
    dvr: undefined, // Force-enable/disable seekable DVR mode (optional)
  },

  // Security / anti-inspection
  security: {
    disableDevOptions: false, // Block DevTools, context menus, drag, hotkeys (default: false)
  },
});
```

---

## Basic Usage Examples

### Play / Pause

```ts
await player.play();
player.pause();
await player.togglePlay();
```

### Seek (Jump to a Time)

```ts
// Go to 2 minutes and 30 seconds
player.seek(150);

// For live streams: jump to the latest moment
player.seekToLive();
```

### Volume Control

```ts
// Set volume to 50%
player.setVolume(0.5);

// Mute / unmute
player.mute();
player.unmute();
```

### Playback Speed

```ts
// Play at 2x speed
player.setPlaybackRate(2);

// Slow down to 0.5x
player.setPlaybackRate(0.5);
```

### Quality

```ts
// Auto (let HLS.js decide based on network)
player.setQuality("auto");

// Pick a specific quality level by ID
player.setQuality(2);
```

### Fullscreen

```ts
await player.enterFullscreen();
await player.exitFullscreen();
await player.toggleFullscreen();
```

### Switch to a Different Video

```ts
player.setSource({
  src: "https://other-site.com/stream.m3u8",
  autoPlay: true,
});
```

### Clean Up

```ts
player.destroy();
```

---

## Reading Player State

You can get the current state at any time:

```ts
const state = player.getState();
console.log(state.currentTime); // Current position in seconds
console.log(state.isPlaying); // true/false
console.log(state.duration); // Total video length
console.log(state.isLive); // Is this a live stream?
```

### Full State Object

```ts
{
  src: string,                      // Current source URL or YouTube ID
  type: "hls" | "youtube",         // Which engine is active
  isReady: boolean,                 // Player is initialized
  isPlaying: boolean,               // Currently playing
  isMuted: boolean,                 // Audio muted?
  isFullscreen: boolean,            // Fullscreen mode?
  isBuffering: boolean,             // Currently loading/buffering
  isStretched: boolean,             // Video fill mode?
  currentTime: number,              // Current playback position (seconds)
  duration: number,                 // Total video duration (seconds)
  volume: number,                   // 0.0 to 1.0
  previousVolume: number,           // Volume before mute
  playbackRate: number,             // Current speed (1 = normal)
  selectedQuality: number | "auto", // "auto" or quality level ID (HLS only)
  activeQuality: number | null,     // Currently active quality level (HLS only)
  qualities: QualityLevel[],        // Available quality options (HLS only; [] for YouTube)
  buffered: BufferedRange[],        // Buffered time ranges
  bufferedEnd: number,              // How much is buffered (seconds)
  bufferedPercent: number,          // 0 to 100
  isLive: boolean,                  // Is this a live stream?
  isAtLiveEdge: boolean,            // Playing at the live edge
  liveLatency: number,              // Seconds behind live
  dvr: boolean,                     // Can seek back in live stream? (HLS only)
  seekableStart: number,            // Start of seekable range
  seekableEnd: number,              // End of seekable range (live edge)
  error: PlayerError | null,        // Last error, if any
  isDevtoolsDetected: boolean,      // true when DevTools are detected (security mode)
}
```

### Listen for State Changes

```ts
// Subscribe to ALL changes
const unsub = player.subscribe((state) => {
  console.log("State changed:", state);
});

// Stop listening when you're done
unsub();
```

---

## Events

You can listen to specific events:

```ts
// When playback starts
player.on("play", (state) => {
  console.log("Video is playing at", state.currentTime);
});

// When an error occurs
player.on("error", (error) => {
  console.error("Something went wrong:", error.message);
});

// When the video quality changes
player.on("qualitychange", (quality) => {
  console.log("Quality changed to", quality);
});

// Every time the playback position updates
player.on("timeupdate", (state) => {
  console.log("Current time:", state.currentTime);
});

// When the video ends
player.on("ended", (state) => {
  console.log("Video finished");
});

// When loading/buffering starts
player.on("waiting", (state) => {
  console.log("Buffering...");
});

// When loading finishes
player.on("playing", (state) => {
  console.log("Ready to play");
});
```

### All Available Events

| Event              | When Does It Fire?                          | Payload                |
| ------------------ | ------------------------------------------- | ---------------------- |
| `ready`            | Player is initialized and ready             | PlayerState            |
| `play`             | Playback started                            | PlayerState            |
| `pause`            | Playback paused                             | PlayerState            |
| `playing`          | Video is actually playing (after buffering) | PlayerState            |
| `waiting`          | Video is buffering/waiting for data         | PlayerState            |
| `seeking`          | User or code started a seek                 | PlayerState            |
| `seeked`           | Seek completed                              | PlayerState            |
| `timeupdate`       | Current time changed (fires frequently)     | PlayerState            |
| `durationchange`   | Video duration changed                      | PlayerState            |
| `volumechange`     | Volume or mute state changed                | PlayerState            |
| `fullscreenchange` | Fullscreen toggled                          | boolean                |
| `qualitychange`    | Video quality changed                       | QualityLevel or "auto" |
| `qualitieschange`  | Available qualities changed                 | QualityLevel[]         |
| `livestatechange`  | Live stream metrics changed                 | LiveStateChange        |
| `sourcechange`     | Source URL changed                          | string                 |
| `ended`            | Playback finished                           | PlayerState            |
| `error`            | An error occurred                           | PlayerError            |
| `destroy`          | Player was destroyed                        | void                   |
| `statechange`      | Any state changed                           | PlayerState            |

---

## Working with Protected Streams (Token Auth)

If your video requires authentication (for example, an Akamai tokenized stream), use a `tokenFetcher`:

```ts
import type { TokenFetcher } from "@nurav/player-core";

const tokenFetcher: TokenFetcher = async ({ src, signal }) => {
  // Call your API to get a signed URL
  const response = await fetch("/api/get-token", {
    method: "POST",
    body: JSON.stringify({ url: src }),
    signal,
  });
  const data = await response.json();

  // Return the signed URL
  return {
    url: data.signedUrl, // The new authenticated URL
    expiresIn: data.expiresIn, // (optional) Seconds until token expires
    headers: data.customHeaders, // (optional) Custom HTTP headers
  };
};

const player = new Player({
  video,
  src: "https://protected-site.com/stream.m3u8",
  tokenFetcher,
});
```

The player will:

1. Call your `tokenFetcher` before loading the video
2. Use the returned URL (and headers) to load the stream
3. Automatically refresh the token before it expires (if you provide `expiresIn`)

---

## Working with YouTube Sources

The `Player` class automatically detects YouTube sources and routes them to the YouTube engine (backed by the YouTube IFrame API). No extra configuration is needed for standard YouTube URLs.

### Supported Source Formats

The engine recognises a source as YouTube if it matches **any** of the following:

| Format                           | Example                                              |
| -------------------------------- | ---------------------------------------------------- |
| `youtube.com` watch URL          | `https://www.youtube.com/watch?v=dQw4w9WgXcQ`        |
| `youtu.be` short URL             | `https://youtu.be/dQw4w9WgXcQ`                       |
| `youtube-nocookie.com` embed URL | `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ` |
| Bare 11-character video ID       | `dQw4w9WgXcQ`                                        |

If you pass a bare video ID you **must** set `type: "youtube"` so the player does not try to load it as an HLS stream:

```ts
// YouTube watch URL — auto-detected
const player = new Player({
  video: document.querySelector("video")!,
  src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
});

// YouTube nocookie embed — auto-detected
const player = new Player({
  video,
  src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
});

// Bare video ID — must force the engine
const player = new Player({
  video,
  src: "dQw4w9WgXcQ",
  type: "youtube", // Required when src is a bare video ID
});
```

You can also use `type` to **force** a specific engine and skip auto-detection entirely:

```ts
const player = new Player({
  video,
  src: "https://example.com/stream.m3u8",
  type: "hls", // Skip detection; always use the HLS engine
});
```

### Feature Availability for YouTube

| Feature                    | Available? | Notes                                     |
| -------------------------- | :--------: | ----------------------------------------- |
| `setQuality()` / `quality` |     ❌     | YouTube controls its own quality          |
| `tokenFetcher`             |     ❌     | Not applicable to YouTube playback        |
| `live.lowLatency`          |     ❌     | Not applicable to YouTube playback        |
| `dvr` / seek back in live  |     ✅     | Checked and resolved via dynamic background probing      |
| `setPlaybackRate()`        |     ✅     | Works normally                            |
| `isLive`                   |     ✅     | Reflects live stream status               |
| `isAtLiveEdge`             |     ✅     | Reflects live edge status                 |
| `liveLatency`              |     ✅     | Reflects latency for YouTube live streams |

---

## Working with Live Streams

```ts
// Check if the current stream is live
const state = player.getState();
if (state.isLive) {
  console.log("This is a live stream");
  console.log("Latency:", state.liveLatency, "seconds behind live");
  console.log("At live edge?", state.isAtLiveEdge);
}

// Jump to the latest moment
player.seekToLive();
```

### Live Edge Detection

The player tracks live edge position with **latency-based hysteresis**:

| Latency | Badge   | Description                       |
| ------- | ------- | --------------------------------- |
| 0–2.5s  | LIVE    | Within half the sync threshold    |
| 2.5–5s  | (grey)  | No change — prevents ping-ponging |
| 5s+     | Go Live | Behind the live edge, caught up?  |

The badge also updates while paused via a 1-second polling interval, so pausing the video will correctly show "Go Live" once you fall behind.

---

## TypeScript

All types are included. You can import them:

```ts
import type {
  Player,
  PlayerState,
  PlayerSnapshot,
  PlayerError,
  TokenFetcher,
  QualityLevel,
  PlayerControls,
  BufferedRange,
} from "@nurav/player-core";
```

---

## Architecture (How It Works)

```
                     ┌──────────────┐
                     │  Your Code   │
                     └──────┬───────┘
                            │
               ┌────────────▼────────────┐
               │        Player           │
               │  (main public API)      │
               └──┬─────┬────┬─────┬─────┘
                  │     │    │     │
       ┌──────────┘  ┌──┘    └──┐  └──────────┐
       ▼             ▼          ▼             ▼
┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐
│ HlsMgr   │ │ PlayerStore│ │ AuthMgr  │ │ LiveMgr  │
│ (hls.js, │ │ (state)    │ │ (tokens) │ │ (DVR,    │
│  quality)│ └────────────┘ └──────────┘ │  latency)│
└──────────┘                             └──────────┘
       │                                        │
       ▼                                        ▼
┌──────────────┐                       ┌──────────────┐
│ FullscreenMgr│                       │ NetworkMgr   │
│              │                       │ (online/off) │
└──────────────┘                       └──────────────┘
```

The player is built around **two engines** that share a common interface:

- **HLS engine** — powered by hls.js and composed of **8 specialized managers**, each with a single responsibility (see table below). This engine handles HLS streams, quality switching, token auth, DVR, and low-latency playback.
- **YouTube engine** — a self-contained wrapper around the **YouTube IFrame API**. It emits the same events and produces the same state shape as the HLS engine, so consumers never need to know which engine is active. HLS-specific features (quality levels, `tokenFetcher`, `lowLatency`, DVR) are no-ops for this engine.

The `Player` class inspects the `src` (and the optional `type` override) at construction time and instantiates the correct engine. The `state.type` field always tells you which engine is currently active.

### HLS Engine Managers

> [!NOTE]
> The managers below apply to the **HLS engine only**. The YouTube engine is a single self-contained class and does not use this manager architecture.

| Manager               | File                    | Responsibility                                                              |
| --------------------- | ----------------------- | --------------------------------------------------------------------------- |
| **HlsManager**        | `hls-manager.ts`        | hls.js init, error recovery, quality switching                              |
| **LiveManager**       | `live-manager.ts`       | Live edge detection, DVR mode, pause polling                                |
| **ErrorManager**      | `error-manager.ts`      | Centralized HTTP and stream error classification and recovery               |
| **AuthManager**       | `auth-manager.ts`       | Token fetch, refresh, header injection                                      |
| **NetworkManager**    | `network-manager.ts`    | Online/offline detection + auto-retry                                       |
| **FullscreenManager** | `fullscreen-manager.ts` | Fullscreen API across browsers                                              |
| **KeyboardManager**   | `keyboard-manager.ts`   | Keyboard shortcuts (Space, arrows, etc.)                                    |
| **SecurityManager**   | `security-manager.ts`   | Active protection traps, F12 hotkey shields, context menus, and auto-resume |

Key design principles:

- **Event-driven**: The `Player` class extends `EventEmitter`. All state changes flow through `patchState()` which updates the `PlayerStore` and emits a `statechange` event.
- **Callback-based managers**: Managers receive callbacks (e.g. `onFatalError`, `onLevelUpdated`) instead of accessing `EventEmitter.emit()` directly, making them independently testable.
- **No time-based live edge**: Live edge detection uses **actual latency** (`liveEdge - currentTime`) with hysteresis, not timestamp snapshots or boolean flags.
- **Quality context**: `HlsManager` owns all quality control — `QualityManager` has been removed.
- **Unified surface**: Both the HLS and YouTube engines implement the same event and state contract, so all framework adapters (`@nurav/player-react`, etc.) work with either engine without modification.

---

## License

MIT
