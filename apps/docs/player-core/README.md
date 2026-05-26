# @nurav/player-core

A headless HLS video player engine that works with any JavaScript framework — or no framework at all.

This package handles video playback, quality switching, live streams, authentication, and fullscreen — all without any user interface. You can use it directly, or pair it with `@nurav/player-ui` (UI components) and `@nurav/player-react` (the complete React player).

```bash
# Using pnpm
pnpm add @nurav/player-core

# Using npm
npm install @nurav/player-core

# Using yarn
yarn add @nurav/player-core
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

| Feature               | Description                                              |
| --------------------- | -------------------------------------------------------- |
| 🎬 **Play / Pause**   | Control playback programmatically                        |
| ⏪ **Seek**           | Jump to any point in the video                           |
| 🔊 **Volume**         | Adjust volume, mute/unmute                               |
| 🎯 **Quality**        | Auto-select or manually pick video quality               |
| 🔴 **Live Streams**   | Works with live HLS streams, DVR, and "go live"          |
| 🔐 **Token Auth**     | Play protected streams that need authentication          |
| 🖥️ **Fullscreen**     | Enter/exit fullscreen mode                               |
| 📐 **Video Fit**      | Toggle between "fit to screen" and "fill screen"         |
| ⏩ **Playback Speed** | Change speed (0.25x, 1x, 2x, etc.)                       |
| 🎧 **Events**         | Listen for play, pause, error, quality changes, and more |

---

## Installation

```bash
# Using pnpm
pnpm add @nurav/player-core

# Using npm
npm install @nurav/player-core

# Using yarn
yarn add @nurav/player-core
```

No other packages are required. This works in any JavaScript project (React, Vue, Svelte, vanilla JS, etc.).

---

## Creating a Player

```ts
import { Player } from "@nurav/player-core";

const video = document.querySelector("video")!;

const player = new Player({
  video, // Required: a <video> element
  src: "...", // Required: URL to your .m3u8 HLS stream
});
```

### All Options

```ts
const player = new Player({
  video: HTMLVideoElement, // (required) The <video> element
  src: "https://.../stream.m3u8", // (required) HLS stream URL
  autoPlay: false, // Start playing automatically?
  lowLatency: false, // Enable low-latency HLS mode
  liveSyncDuration: 5, // Seconds behind live edge to show "Go Live" (default: 5)
  startTime: 0, // Start at this time (seconds)
  keyboard: false, // Enable keyboard shortcuts
  tokenFetcher: undefined, // For protected streams (see below)
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
  src: string,                      // Current source URL
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
  selectedQuality: number | "auto", // "auto" or quality level ID
  activeQuality: number | null,     // Currently active quality level
  qualities: QualityLevel[],        // Available quality options
  buffered: BufferedRange[],        // Buffered time ranges
  bufferedEnd: number,              // How much is buffered (seconds)
  bufferedPercent: number,          // 0 to 100
  isLive: boolean,                  // Is this a live stream?
  isAtLiveEdge: boolean,            // Playing at the live edge
  liveLatency: number,              // Seconds behind live
  dvr: boolean,                     // Can seek back in live stream?
  seekableStart: number,            // Start of seekable range
  seekableEnd: number,              // End of seekable range (live edge)
  error: PlayerError | null,        // Last error, if any
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
  const response = await fetch("/api/get-token", {
    method: "POST",
    body: JSON.stringify({ url: src }),
    signal,
  });
  const data = await response.json();

  return {
    url: data.signedUrl,
    expiresIn: data.expiresIn,
    headers: data.customHeaders,
  };
};

const player = new Player({
  video,
  src: "https://protected-site.com/stream.m3u8",
  tokenFetcher,
});
```

---

## Working with Live Streams

```ts
const state = player.getState();
if (state.isLive) {
  console.log("This is a live stream");
  console.log("Latency:", state.liveLatency, "seconds behind live");
  console.log("At live edge?", state.isAtLiveEdge);
}

player.seekToLive();
```

### Live Edge Detection

The player tracks live edge position with **latency-based hysteresis**:

| Latency | Badge   | Description                       |
| ------- | ------- | --------------------------------- |
| 0–2.5s  | LIVE    | Within half the sync threshold    |
| 2.5–5s  | (grey)  | No change — prevents ping-ponging |
| 5s+     | Go Live | Behind the live edge              |

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

The player is composed of **6 specialized managers**:

| Manager               | Responsibility                                 |
| --------------------- | ---------------------------------------------- |
| **HlsManager**        | hls.js init, error recovery, quality switching |
| **LiveManager**       | Live edge detection, DVR mode, pause polling   |
| **AuthManager**       | Token fetch, refresh, header injection         |
| **FullscreenManager** | Fullscreen API across browsers                 |
| **NetworkManager**    | Online/offline detection + auto-retry          |
| **KeyboardManager**   | Keyboard shortcuts (Space, arrows, etc.)       |

Key design principles:

- **Event-driven**: All state changes flow through `patchState()` which updates the `PlayerStore` and emits `statechange`.
- **Callback-based managers**: Managers receive callbacks instead of accessing `EventEmitter.emit()` directly.
- **No time-based live edge**: Uses **actual latency** with hysteresis — not timestamp snapshots or boolean flags.
- **Quality in HlsManager**: `HlsManager` owns all quality control — `QualityManager` has been removed.

---

## License

MIT
