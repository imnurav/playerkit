# @nurav/player-core

Core HLS player engine — framework-agnostic headless playback controller with built-in HLS.js integration, quality management, authentication, and fullscreen handling.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Player Class                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  HLS.js   │  │  PlayerStore  │  │  EventEmitter     │  │
│  │  wrapper  │  │  (state mgmt) │  │  (typed events)   │  │
│  └──────────┘  └──────────────┘  └────────────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ AuthManager  │  │ QualityManager │  │ Fullscreen  │  │
│  │ (token/akamai)│  │ (ABR quality)  │  │  Manager     │  │
│  └──────────────┘  └────────────────┘  └─────────────┘  │
│                                                          │
│  ┌────────────────┐                                     │
│  │ KeyboardManager │  (optional, disabled in React)      │
│  └────────────────┘                                     │
└──────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Player Initialization

```ts
import { Player } from "@nurav/player-core";

const player = new Player({
  video: document.querySelector("video")!,
  src: "https://example.com/stream.m3u8",
  autoPlay: true,
});
```

The `Player` class:

1. Wraps HLS.js for playback (with native HLS fallback for Safari)
2. Maintains a reactive `PlayerStore` that tracks all playback state
3. Emits typed events via `EventEmitter` for each state change
4. Integrates optional managers for auth, quality, fullscreen, keyboard

### 2. Player State

State is managed by `PlayerStore` which produces a `PlayerSnapshot` — an immutable, fully-typed object with every playback metric:

```ts
type PlayerSnapshot = Readonly<{
  src: string;
  isReady: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  isStretched: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  previousVolume: number;
  playbackRate: number;
  selectedQuality: number | "auto";
  activeQuality: number | null;
  qualities: QualityLevel[];
  buffered: BufferedRange[];
  bufferedEnd: number;
  bufferedPercent: number;
  isLive: boolean;
  isAtLiveEdge: boolean;
  liveLatency: number;
  dvr: boolean;
  seekableStart: number;
  seekableEnd: number;
  error: PlayerError | null;
}>;
```

Subscribe to state changes:

```ts
const unsub = player.subscribe((state) => {
  console.log(state.currentTime, state.isPlaying);
});
```

Or listen to specific events:

```ts
player.on("play", (state) => {});
player.on("error", (error) => {});
player.on("qualitychange", (quality) => {});
```

Get state synchronously:

```ts
const state = player.getState();
```

### 3. Player Controls API

```ts
// Playback
await player.play();
player.pause();
await player.togglePlay();

// Seeking
player.seek(120.5); // Go to 2:00
player.seekToLive(); // Jump to live edge (live streams only)

// Volume
player.setVolume(0.8);
player.mute();
player.unmute();

// Speed & Quality
player.setPlaybackRate(1.5);
player.setQuality("auto"); // Auto ABR
player.setQuality(3); // Specific quality level ID

// Source switching
player.setSource({ src: "https://...m3u8", autoPlay: true });

// Fullscreen
await player.enterFullscreen();
await player.exitFullscreen();
await player.toggleFullscreen();

// Stretch toggle
player.toggleStretch();

// Error recovery
player.retry(); // Re-load current source after fatal error

// Destroy
player.destroy();
```

### 4. Authentication (TokenFetcher)

For protected streams (e.g. Akamai tokenized HLS or KGS API):

```ts
import type { TokenFetcher } from "@nurav/player-core";

// Example 1: Direct URL token fetch
const tokenFetcher: TokenFetcher = async ({ src, signal }) => {
  const res = await fetch("/api/token", {
    method: "POST",
    body: JSON.stringify({ url: src }),
    signal,
  });
  const { url, expiresIn, headers } = await res.json();
  return { url, expiresIn, headers };
};

// Example 2: KGS API — videoId captured in closure
const videoId = 527697;
const tokenFetcher: TokenFetcher = async ({ signal }) => {
  const res = await fetch(
    `https://api.khanglobalstudies.com/v4/courses/video/${videoId}`,
    { signal },
  );
  const data = await res.json();
  if (!data.video_url) {
    // Throws with the API's error message (e.g. "Access denied...")
    throw new Error(data.message || `API error (status: ${data.status})`);
  }
  return { url: data.video_url };
};

const player = new Player({
  video,
  src,
  tokenFetcher,
});
```

The `AuthManager` handles:

- Token fetching before HLS.js loads the source
- Auto-refresh when tokens are near expiry (`expiresIn`)
- Passing custom headers via HLS.js `xhrSetup`
- Error propagation — any `Error` thrown by the token fetcher is surfaced with its `.message` as the player error (auth category)

**Error handling:** If the token fetcher throws (e.g. API returns `{"message":"Access denied","status":403}`), the player sets a fatal error with `category: "auth"` and the error message. The error overlay displays the message and offers a "Retry" button.

### 5. Quality Management

The `QualityManager` wraps HLS.js `levels` and provides:

- Automatic ABR (default)
- Manual quality override via `setQuality(id)`
- Quality level metadata (width, height, bitrate, label)

### 6. HLS.js Integration

The internal HLS wrapper handles:

- Creating HLS.js instances with production-optimized config
- Attaching media and loading sources
- Native HLS fallback detection (`canUseNativeHls`)
- Destroy and cleanup lifecycle

## Public API

```ts
export { Player } from "./core/player";
export { AuthManager } from "./managers/auth-manager";
export type { PlayerState };
export type { PlayerSnapshot };
export type { PlayerControls };
export type { PlayerError };
export type { PlayerErrorCategory };
export type { PlayerEventMap };
export type { PlayerEventName };
export type { QualityLevel };
export type { TokenFetcher };
export type { TokenFetcherOptions };
export type { TokenResult };
export type { CreatePlayerOptions };
export type { SourceOptions };
export type { Unsubscribe };
export type { BufferedRange };
```

## Events Reference

| Event              | Payload                  | Description                     |
| ------------------ | ------------------------ | ------------------------------- |
| `ready`            | `PlayerState`            | Player initialized and ready    |
| `play`             | `PlayerState`            | Playback started                |
| `pause`            | `PlayerState`            | Playback paused                 |
| `playing`          | `PlayerState`            | Actual playback after buffering |
| `waiting`          | `PlayerState`            | Buffering / waiting for data    |
| `seeking`          | `PlayerState`            | Seek initiated                  |
| `seeked`           | `PlayerState`            | Seek completed                  |
| `timeupdate`       | `PlayerState`            | Current time changed            |
| `durationchange`   | `PlayerState`            | Duration changed                |
| `volumechange`     | `PlayerState`            | Volume or mute changed          |
| `fullscreenchange` | `boolean`                | Fullscreen toggled              |
| `qualitychange`    | `QualityLevel \| "auto"` | Quality changed                 |
| `qualitieschange`  | `QualityLevel[]`         | Available qualities changed     |
| `livestatechange`  | `LiveStateChange`        | Live stream metrics changed     |
| `sourcechange`     | `string`                 | Source URL changed              |
| `ended`            | `PlayerState`            | Playback ended                  |
| `error`            | `PlayerError`            | Error occurred                  |
| `destroy`          | `void`                   | Player destroyed                |
| `statechange`      | `PlayerState`            | Any state change                |
