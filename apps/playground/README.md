# PlayerKit Playground

An interactive development and demonstration playground for the PlayerKit. Test real streams, tweak every configuration option, and copy the generated React code.

## What's New in v0.0.6

- **✨ Testing Environment Upgraded:** The Playground now automatically tests the new continuous buffer track UI and the completely rewritten debounced buffering logic. 
- **✨ Scrubbing Sandbox:** Test the new interactive hover timestamp tooltips in the progress bar, and violently scrub the video to test the new stability improvements (the buffering spinner correctly suppresses itself during active scrubbing).
- **✨ Mobile Touch Testing:** You can use the Debug Touch Zones overlay to perfectly visualize the new strict boundaries locking the double-tap seek feature firmly into the left and right 40% zones.

## Getting Started

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start the playground dev server
pnpm dev

# Open http://localhost:5173 in your browser
```

## Architecture

The playground is built with React + TypeScript + Vite inside a Turborepo monorepo. It communicates with the player via:

1. **Inline rendering** — on desktop, the `<HlsPlayer>` component is rendered directly in the page
2. **Iframe sandboxing** — for device viewports (tablet, phone, small), the player is embedded in an `<iframe>` pointing to `player.html` with query params for configuration

### Key Files

| File                                 | Purpose                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| `src/App.tsx`                        | Main playground layout — sidebar + preview canvas + telemetry HUD   |
| `src/player.tsx`                     | Standalone player entry for iframe sandboxing                       |
| `src/hooks/usePlayground.ts`         | All playground state management, URL param parsing, code generation |
| `src/components/Sidebar.tsx`         | Collapsible configuration panel                                     |
| `src/components/DeviceSimulator.tsx` | Iframe-based device viewport renderer                               |
| `src/components/TelemetryHud.tsx`    | Real-time player state monitor                                      |
| `src/components/MobileHeader.tsx`    | Mobile/tablet top bar                                               |
| `src/constants.ts`                   | Source URLs, viewport presets, accent colors                        |

## Usage

### Selecting a Source

The sidebar provides pre-configured test streams covering:

- **Live Video (DVR)** — A live HLS stream with DVR seekable range
- **Secure Stream (Expired Token)** — Demonstrates authentication failure with an expired Akamai token
- **Error: 404 Stream Not Found** — Demonstrates a fatal error with proper error overlay
- **Error: Invalid Domain Name** — Demonstrates a network error
- **Error: Empty Stream URL** — Demonstrates error handling for empty/invalid sources
- **Correct Stream (Sintel VOD)** — A reliable VOD test stream

You can also paste a custom stream URL in the text input.

### Token Authentication

Under **Video Stream Library**, enter a **Video ID** (e.g. `527697`) and click **"Load via Token API"** (indigo button). The player fetches `https://api.khanglobalstudies.com/v4/courses/video/{videoId}` and uses the returned `video_url` for playback.

If the API returns an error (e.g. `{"message":"Access denied","status":403}`), the error is displayed with the API's message in the error overlay.

### Configuration Options

| Option                    | Description                            | Default                    |
| ------------------------- | -------------------------------------- | -------------------------- |
| **Auto Play**             | Auto-play the video on load            | `true`                     |
| **Muted**                 | Start playback muted                   | `false`                    |
| **Low Latency**           | Enable low-latency HLS mode            | `true`                     |
| **Custom Playback Rates** | Use extended speed options (0.5x–2.5x) | `false`                    |
| **Seek Step**             | Seconds per seek button/tap            | `10`                       |
| **Live Sync Duration**    | Seconds threshold for "at live edge"   | `5`                        |
| **Accent Color**          | Theme accent color                     | `#2e3192` (PlayerKit Blue) |

#### UI Customization

| Option                  | Description                           | Default    |
| ----------------------- | ------------------------------------- | ---------- |
| **Show Play Button**    | Show play/pause in control bar        | `true`     |
| **Show Time Display**   | Show current time / duration          | `true`     |
| **Show Settings**       | Show the settings gear button         | `true`     |
| **Show Fullscreen**     | Show fullscreen toggle                | `true`     |
| **Show Center Overlay** | Show center play/pause + seek buttons | `true`     |
| **Show Object Fit**     | Show video fit toggle button          | `true`     |
| **Volume Control**      | Volume slider mode                    | `vertical` |
| **Center Overlay Gap**  | Gap between center buttons (px)       | `80`       |
| **Object Fit**          | Default video fit mode                | `contain`  |

### Device Simulation

Switch between presets to test responsive behavior:

| Viewport | Width     | Height    |
| -------- | --------- | --------- |
| Desktop  | Full page | Full page |
| Tablet   | 768px     | 1024px    |
| Phone    | 390px     | 844px     |
| Small    | 320px     | 568px     |

Toggle **Landscape** to rotate device viewports.

### Telemetry HUD

The real-time developer HUD displays every field from the player's `PlayerSnapshot` state, updating on each frame:

- Playback state (playing, buffering, muted, fullscreen)
- Current time, duration, volume, playback rate
- Quality information (selected, active, available levels)
- Live stream metrics (latency, DVR range, at-live-edge)
- Error state (if any)

### Sharing

- **Copy Code** — Copies the full `<HlsPlayer>` React component code with all current settings
- **Copy Share Link** — Generates a URL with all configuration encoded as query params

## Player URL Parameters

When rendering via iframe (`player.html`), all configuration is passed as URL query parameters:

| Parameter                 | Type                                 | Default    | Example             |
| ------------------------- | ------------------------------------ | ---------- | ------------------- |
| `src`                     | string (URL-encoded)                 | —          | `https%3A%2F%2F...` |
| `accentColor`             | hex color                            | `#2e3192`  | `%232e3192`         |
| `lowLatency`              | `true` / `false`                     | `true`     | `true`              |
| `autoPlay`                | `true` / `false`                     | `true`     | `true`              |
| `muted`                   | `true` / `false`                     | `false`    | `false`             |
| `customRates`             | `true` / `false`                     | `false`    | `false`             |
| `disableDevOptions`       | `true` / `false`                     | `false`    | `false`             |
| `debugTouchZones`         | `true` / `false`                     | `false`    | `false`             |
| `poster`                  | string (URL-encoded)                 | —          | `https%3A%2F%2F...` |
| `seekStep`                | number                               | `10`       | `10`                |
| `liveSyncDuration`        | number                               | `5`        | `5`                 |
| `showPlayButton`          | `true` / `false`                     | `true`     | `true`              |
| `showTimeDisplay`         | `true` / `false`                     | `true`     | `true`              |
| `showSettings`            | `true` / `false`                     | `true`     | `true`              |
| `showFullscreen`          | `true` / `false`                     | `true`     | `true`              |
| `showCenterOverlay`       | `true` / `false`                     | `true`     | `true`              |
| `showObjectFitButton`     | `true` / `false`                     | `true`     | `true`              |
| `mobileShowCenterOverlay` | `true` / `false`                     | `false`    | `false`             |
| `volumeControl`           | `horizontal` / `vertical` / `hidden` | `vertical` | `vertical`          |
| `centerOverlayGap`        | number (px)                          | `80`       | `80`                |
| `objectFit`               | `contain` / `cover` / `fill`         | `contain`  | `contain`           |
| `centerIconScale`         | number                               | `1.0`      | `1.2`               |
| `safeAreaTop`             | number (px)                          | `0`        | `34`                |
| `safeAreaBottom`          | number (px)                          | `0`        | `16`                |
| `useTokenAuth`            | `true` / `false`                     | `false`    | `false`             |
| `videoId`                 | number                               | —          | `582007`            |

## Keyboard Shortcuts

When the player has focus:

| Key           | Action                   |
| ------------- | ------------------------ |
| `Space`       | Toggle play/pause        |
| `F`           | Toggle fullscreen        |
| `M`           | Toggle mute              |
| `Arrow Left`  | Seek backward            |
| `Arrow Right` | Seek forward             |
| `Arrow Up`    | Volume up                |
| `Arrow Down`  | Volume down              |
| `S`           | Toggle stretch/fill mode |
