# @nurav/player-react

React component for the KGS HLS Player. Provides a drop-in `<HlsPlayer>` component with full controls, gesture handling, keyboard shortcuts, and a customizable UI.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         <HlsPlayer />                             │
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │  useHlsPlayer │  │  PlayerControls │  │  Overlay Components │ │
│  │  (core bridge)│  │  (UI layer)     │  │  (buffering/error)  │ │
│  └──────────────┘  └────────────────┘  └──────────────────────┘ │
│                                                                  │
│  ┌───────────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ usePlayerGestures  │  │ usePlayerTimeline  │  useControls   │ │
│  │ (touch/mouse)     │  │ (progress/buffer)│  │  Visibility    │ │
│  └───────────────────┘  └───────────────┘  └──────────────────┘ │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ usePlayerKeyboard │                                           │
│  └──────────────────┘                                           │
└──────────────────────────────────────────────────────────────────┘
```

## How It Works

### Data Flow

```
User Input (click/touch/keyboard)
        │
        ▼
Gesture/Keyboard Hooks  ──►  Controls Visibility
        │                              │
        ▼                              ▼
  @nurav/player-core              UI Overlays
  (Player class)             (settings, feedback, etc.)
        │
        ▼
  PlayerSnapshot (state)
        │
        ▼
  Timeline Hooks ──► Progress/Buffered %
        │
        ▼
  PlayerControls (re-render)
```

### Component Tree

```
<div.vp-player>                         ← root ref, keyboard focus
  <div.vp-player__clip>
    <video />                           ← <VideoView>
    <BufferingSpinner />
    <ErrorOverlay />
    <SeekFeedbackOverlay />
    <CenterPlayFeedback />
    <div.vp-player__gradient />
  </div>

  <LiveBadge />                         ← "Go Live" floating button

  <CenterOverlay />                     ← Play/Pause + Seek buttons

  <PlayerControls>                      ← Control bar
    <ProgressBar />
    <TimeDisplay />
    <VolumeControl />
    <SettingsPanel />
  </PlayerControls>
</div>
```

## Basic Usage

> [!IMPORTANT]  
> The player layout and animations rely on the BEM-styled stylesheets from `@nurav/player-ui`. You **must** import the CSS stylesheet at your application's entry point or component file to prevent the player controls and overlays from being invisible or broken.

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles"; // Import player CSS styles

function Player() {
  return (
    <div style={{ width: "100%", maxWidth: "800px", aspectRatio: "16/9" }}>
      <HlsPlayer
        src="https://example.com/stream.m3u8"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Token Auth Usage

For protected streams (e.g. KGS API), provide a `tokenFetcher` callback. The developer captures metadata like `videoId` in their closure:

```tsx
import { HlsPlayer, type TokenFetcher } from "@nurav/player-react";
import "@nurav/player-ui/styles";

const videoId = 527697;
const tokenFetcher: TokenFetcher = async ({ signal }) => {
  const res = await fetch(
    `https://api.khanglobalstudies.com/v4/courses/video/${videoId}`,
    { signal },
  );
  const data = await res.json();
  if (!data.video_url) {
    throw new Error(data.message || `API error (status: ${data.status})`);
  }
  return { url: data.video_url };
};

function Player() {
  return <HlsPlayer src="placeholder" tokenFetcher={tokenFetcher} autoPlay />;
}
```

The token fetcher runs only once per `src` change — the React hook stabilizes it via `useRef`.

## All Props

### Core

| Prop             | Type            | Default  | Description                                |
| ---------------- | --------------- | -------- | ------------------------------------------ |
| `src`            | `string`        | required | HLS stream URL                             |
| `autoPlay`       | `boolean`       | `false`  | Auto-play on load                          |
| `muted`          | `boolean`       | `false`  | Start muted                                |
| `poster`         | `string`        | —        | Poster image URL                           |
| `startTime`      | `number`        | —        | Start playback at this time (seconds)      |
| `className`      | `string`        | —        | Additional CSS class for player container  |
| `videoClassName` | `string`        | —        | Additional CSS class for `<video>` element |
| `style`          | `CSSProperties` | —        | Inline styles for player container         |

### Stream Configuration

| Prop               | Type           | Default                              | Description                              |
| ------------------ | -------------- | ------------------------------------ | ---------------------------------------- |
| `lowLatency`       | `boolean`      | `false`                              | Enable low-latency HLS mode              |
| `liveSyncDuration` | `number`       | `3`                                  | Seconds threshold for "at live edge"     |
| `tokenFetcher`     | `TokenFetcher` | —                                    | Auth token fetcher for protected streams |
| `playbackRates`    | `number[]`     | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]` | Available playback speeds                |

### UI Configuration

| Prop             | Type                  | Default | Description                                        |
| ---------------- | --------------------- | ------- | -------------------------------------------------- |
| `controls`       | `boolean`             | `true`  | Show control bar                                   |
| `keyboard`       | `boolean`             | `true`  | Enable keyboard shortcuts                          |
| `seekStep`       | `number`              | `10`    | Seconds per seek action                            |
| `theme`          | `"kgs"`               | `"kgs"` | Theme preset                                       |
| `themeOverrides` | `ThemeVars`           | —       | CSS custom property overrides (e.g. `--vp-accent`) |
| `customization`  | `PlayerCustomization` | —       | Fine-grained element visibility                    |

### Advanced

| Prop             | Type                             | Default                    | Description                                             |
| ---------------- | -------------------------------- | -------------------------- | ------------------------------------------------------- |
| `centerZoneX`    | `{ start: number; end: number }` | `{ start: 0.4, end: 0.6 }` | Horizontal center zone for tap-to-play (proportion 0–1) |
| `centerZoneY`    | `{ start: number; end: number }` | `{ start: 0.4, end: 0.6 }` | Vertical center zone for tap-to-play (proportion 0–1)   |
| `onPlayerReady`  | `(player: Player) => void`       | —                          | Called when player instance is ready                    |
| `renderControls` | `(props) => ReactNode`           | —                          | Custom control bar renderer                             |
| `root`           | `HTMLElement`                    | —                          | Root element for fullscreen API                         |

## PlayerCustomization

```ts
type PlayerCustomization = {
  showPlayButton?: boolean; // Show play/pause in control bar (default: true)
  showTimeDisplay?: boolean; // Show current time / duration (default: true)
  showSettings?: boolean; // Show settings gear button (default: true)
  showFullscreen?: boolean; // Show fullscreen toggle (default: true)
  showCenterOverlay?: boolean; // Show center play/pause + seek overlay (default: true)
  showObjectFitButton?: boolean; // Show video fit toggle (default: true)
  volumeControl?: "horizontal" | "vertical" | "hidden"; // (default: "vertical")
  centerOverlayGap?: number; // Gap between center overlay buttons in px (default: 80)
  objectFit?: "contain" | "cover" | "fill"; // Default video fit (default: "contain")
};
```

## Theme Overrides

Override CSS custom properties via `themeOverrides`:

```tsx
<HlsPlayer
  src="..."
  themeOverrides={{
    "--vp-accent": "#ec4899",
    "--vp-surface": "transparent",
    "--vp-radius": "12px",
  }}
/>
```

Available tokens from the type `ThemeVars`:

| Token                  | Default       | Description            |
| ---------------------- | ------------- | ---------------------- |
| `--vp-accent`          | `#6366f1`     | Primary accent color   |
| `--vp-accent-contrast` | `#ffffff`     | Text on accent         |
| `--vp-surface`         | `transparent` | Control bar background |
| `--vp-border`          | `transparent` | Border color           |
| `--vp-text`            | `#ffffff`     | Primary text           |
| `--vp-muted`           | `rgba(...)`   | Muted text             |
| `--vp-radius`          | `8px`         | Border radius          |
| `--vp-control-radius`  | `0`           | Control button radius  |
| `--vp-video-bg`        | `#0a0a0a`     | Video background       |

## Custom Controls

Replace the entire control bar:

```tsx
<HlsPlayer
  src="..."
  renderControls={({
    player,
    state,
    progress,
    buffered,
    seekRelative,
    formatTime,
  }) => (
    <div className="my-custom-controls">
      <button onClick={() => player?.togglePlay()}>
        {state?.isPlaying ? "Pause" : "Play"}
      </button>
      <input
        type="range"
        min={0}
        max={state?.duration || 0}
        value={state?.currentTime || 0}
        onChange={(e) => player?.seek(Number(e.target.value))}
      />
      <span>{formatTime(state?.currentTime || 0)}</span>
    </div>
  )}
/>
```

## Player Ref

Access the core player instance:

```tsx
import { useRef } from "react";
import type { Player } from "@nurav/player-core";

function PlayerWithRef() {
  const playerRef = useRef<Player>(null);

  const handleClick = () => {
    playerRef.current?.setPlaybackRate(2);
  };

  return (
    <>
      <HlsPlayer ref={playerRef} src="..." />
      <button onClick={handleClick}>2x Speed</button>
    </>
  );
}
```

## Hooks API

For headless usage without the `<HlsPlayer>` component:

```tsx
import { useHlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles"; // Import CSS if relying on BEM class layouts

function CustomPlayer() {
  const { player, state, error, rootRef, videoRef } = useHlsPlayer({
    src: "https://...m3u8",
    autoPlay: true,
  });

  return (
    <div ref={rootRef} style={{ width: 640, height: 360 }}>
      <video ref={videoRef} />
      <div>
        {state?.isPlaying ? "▶️" : "⏸️"} {state?.currentTime?.toFixed(1)}s
      </div>
    </div>
  );
}
```

## Keyboard Shortcuts

| Key           | Action                             |
| ------------- | ---------------------------------- |
| `Space`       | Toggle play/pause                  |
| `F`           | Toggle fullscreen                  |
| `M`           | Toggle mute                        |
| `Arrow Left`  | Seek backward (`seekStep` seconds) |
| `Arrow Right` | Seek forward (`seekStep` seconds)  |
| `Arrow Up`    | Volume up                          |
| `Arrow Down`  | Volume down                        |
| `S`           | Toggle stretch/fill                |
