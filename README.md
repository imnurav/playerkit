# KGS HLS Player Monorepo

A high-performance, beautifully styled, and production-ready HLS player built for Khan Global Studies. The monorepo uses a modular architecture with a framework-agnostic engine, a polished React binding layer, and a YouTube-style customizable UI with responsive layouts, gesture controls, and secure tokenized authentication.

---

## Repository Structure

```
├── apps
│   ├── docs                  # Detailed technical documentation for each package
│   └── playground            # Interactive React + Vite dev playground & emulator
│
└── packages
    ├── player-core           # Headless, framework-agnostic player playback controller
    ├── player-react          # React components, gestures, keyboard, and layout orchestrators
    ├── player-ui             # Reusable UI controls, volume, timeline, icons, and themes
    └── shared                # Core workspace utility functions (e.g. time formatting)
```

---

## 🛠️ Monorepo Development (For Contributors)

This repository uses **pnpm workspaces** and **Turborepo** to orchestrate dependencies and builds.

### Quickstart

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Run Interactive Playground**
   Starts the React + Vite playground containing the real-time telemetry HUD and device emulators.

   ```bash
   pnpm dev
   ```

   Open `http://localhost:5173` in your browser.

3. **Build All Packages**
   Runs `tsup` across all packages to generate production-ready bundles in `/dist`.

   ```bash
   pnpm build
   ```

4. **Additional Scripts**
   - **Format Code**: `pnpm format` (uses Prettier)
   - **Typecheck & Lint**: `pnpm lint` (runs `tsc` and ESLint checks)
   - **Clean Build Artifacts**: `pnpm clean`

---

## 📦 Package Installation (For Users)

To integrate the KGS HLS Player into your own React application, install the packages from your package manager:

```bash
# Using npm
npm install @nurav/player-react @nurav/player-ui @nurav/player-core

# Using pnpm
pnpm add @nurav/player-react @nurav/player-ui @nurav/player-core

# Using yarn
yarn add @nurav/player-react @nurav/player-ui @nurav/player-core
```

---

## 🚀 Getting Started & Integration

### 1. Import Player and Load CSS Styles

> [!IMPORTANT]  
> The player layout and animations rely on BEM-styled stylesheets from `@nurav/player-ui`. You **must** import the CSS stylesheet at your application's entry point (e.g., `main.tsx`, `_app.tsx`, or `index.css`) to prevent the player from looking broken.

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles"; // Loads the compiled player styling bundle
```

### 2. Basic Playback Usage

Create a simple player with standard controls and native HLS stream support:

```tsx
import { HlsPlayer } from "@nurav/player-react";
import "@nurav/player-ui/styles";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: "800px", aspectRatio: "16/9" }}>
      <HlsPlayer
        src="https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
        autoPlay
        muted={false}
      />
    </div>
  );
}
```

### 3. Token-Based Secure Stream Authentication (`TokenFetcher`)

For protected HLS streams (e.g. KGS premium API course videos or Akamai secure CDNs), pass a `tokenFetcher` callback. The player automatically fetches the tokenized URL before loading the source.

```tsx
import { HlsPlayer, type TokenFetcher } from "@nurav/player-react";
import "@nurav/player-ui/styles";

// Capture the videoId inside the component or fetcher closure
const videoId = 527697;

const tokenFetcher: TokenFetcher = async ({ src, signal }) => {
  const response = await fetch(
    `https://api.khanglobalstudies.com/v4/courses/video/${videoId}`,
    { signal },
  );

  const data = await response.json();

  if (!data.video_url) {
    // This custom error message is automatically parsed and displayed to the user
    throw new Error(data.message || "Unauthorized access to stream");
  }

  // Return the authenticated streaming URL, optional expiry time, and custom headers
  return {
    url: data.video_url,
    expiresIn: data.expires_in, // Optional: auto-refreshes token prior to expiry
  };
};

export default function CourseVideo() {
  return (
    <HlsPlayer
      src="placeholder-source-url"
      tokenFetcher={tokenFetcher}
      autoPlay
    />
  );
}
```

#### Authentication Error Flow

If `tokenFetcher` throws an error:

1. The player stops loading the HLS stream.
2. A premium fatal error state is set with `category: "auth"`.
3. The custom error message (e.g., _"Access denied..."_) is displayed in a glassmorphic overlay.
4. A **"Retry"** button is presented to the user to re-attempt token fetching and playback.

---

## 🎨 Theme and Customization

Customize colors using theme variable overrides and show/hide elements using the `customization` configuration object.

### Styling with CSS Custom Properties (`themeOverrides`)

You can tweak colors and sizes directly:

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  themeOverrides={{
    "--vp-accent": "#ec4899", // Neon pink primary accent
    "--vp-accent-contrast": "#ffffff", // Text color on top of accent background
    "--vp-radius": "12px", // Rounded corners for the player
    "--vp-video-bg": "#000000", // Solid black background
  }}
/>
```

### Element Customization (`customization`)

Customize control components:

```tsx
<HlsPlayer
  src="https://example.com/stream.m3u8"
  customization={{
    showPlayButton: true,
    showTimeDisplay: true,
    showSettings: true,
    showFullscreen: true,
    showCenterOverlay: true, // Play/Pause feedback overlay in the center
    showObjectFitButton: true, // Toggles between Fit/Contain and Stretch/Fill
    volumeControl: "vertical", // 'vertical' popup, 'horizontal' inline bar, or 'hidden'
    objectFit: "contain", // Default video fit style
  }}
/>
```

---

## 🕹️ Keyboard Shortcuts

When the player container receives focus, users can control playback using standard media keys:

| Key           | Action                                                 |
| ------------- | ------------------------------------------------------ |
| `Space`       | Toggle Play / Pause                                    |
| `F`           | Toggle Fullscreen                                      |
| `M`           | Toggle Mute                                            |
| `Arrow Left`  | Seek backward (by `seekStep` seconds, default: 10s)    |
| `Arrow Right` | Seek forward (by `seekStep` seconds, default: 10s)     |
| `Arrow Up`    | Increase volume                                        |
| `Arrow Down`  | Decrease volume                                        |
| `S`           | Toggle video stretch (contain / fill object-fit modes) |
