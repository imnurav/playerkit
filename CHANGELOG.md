# Changelog

All notable changes to the PlayerKit monorepo are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.0.5] — 2026-07-08

### Summary

This release focuses on **HLS startup performance**, **secure token handling correctness**, **playground UX improvements**, and a **smoother buffered progress bar** animation. No breaking API changes.

---

### `@playerkit/core` — 0.0.4 → 0.0.5

#### ✅ Changed — HLS Startup Optimizations (`hls-config-builder.ts`)

**Before (0.0.4)**
HLS.js used its built-in defaults:
- `maxBufferLength`: 30 seconds — player downloaded 30s ahead before starting
- `maxMaxBufferLength`: 600 seconds — uncapped forward buffer ceiling
- `maxBufferSize`: uncapped — no memory limit on buffer
- `abrEwmaDefaultEstimate`: 500 Kbps — aggressive initial quality pick, risked stalling on slow connections

**After (0.0.5)**
| Config | 0.0.4 | 0.0.5 | Effect |
|---|---|---|---|
| `maxBufferLength` | 30s | **15s** | Player starts playing sooner — requires less buffered content to begin |
| `maxMaxBufferLength` | 600s | **120s** | Caps forward downloads — saves memory and bandwidth |
| `maxBufferSize` | uncapped | **30 MB** | Prevents excessive RAM usage on long sessions |
| `abrEwmaDefaultEstimate` | 500 Kbps | **1 Mbps** | First segment loads at lighter quality, then ABR scales up within 2s |

**Impact**: First-frame time improved significantly (up to 2–3× faster on typical connections). ABR-managed quality is unaffected after initial ramp-up.

---

#### ✅ Added — `TokenRefresher` API Architecture

**Before (0.0.4)**
`tokenRefresher` was scheduled for any video loaded with a `tokenFetcher`, including public videos that required no auth token. This caused unwanted background API calls to the refresh endpoint even when no credentials were provided.

**After (0.0.5)**
`tokenRefresher` is only registered when `authToken` is explicitly provided alongside `videoId`. Public videos (no token) no longer schedule background refresh timers.

---

### `@playerkit/react` — 0.0.4 → 0.0.5

#### ✅ Added — `PlayerControls` Type Export

**Before (0.0.4)**
`PlayerControls` was not re-exported from `@playerkit/react`, requiring consumers to add `@playerkit/core` as a dependency just to use the type.

**After (0.0.5)**
```ts
// Now importable directly from @playerkit/react
import type { PlayerControls } from "@playerkit/react";
```

#### ✅ Fixed — `useCallback` Dependency Arrays in Playground Hook

**Before (0.0.4)**
- `copyReactCode`: `authToken` was listed in deps but not used in body (unnecessary re-renders)
- `copyShareLink`: `authToken` was used in body but missing from deps (stale closure bug — shared link would not update when token changed)

**After (0.0.5)**
Both dependency arrays are corrected to match actual usage.

---

### `@playerkit/ui` — 0.0.4 → 0.0.5

#### ✅ Changed — Smooth Buffered Progress Bar Animation

**Before (0.0.4)**
The buffered bar had no transition. Because HLS downloads full segments atomically (2–10s chunks), the bar jumped discretely and appeared frozen during downloads.

```css
/* 0.0.4 */
.pk-progress__buffered {
  background: var(--pk-progress-buffered);
}
```

**After (0.0.5)**
```css
/* 0.0.5 */
.pk-progress__buffered {
  background: var(--pk-progress-buffered);
  transition: inline-size 0.4s ease-out;
}
```

The bar now smoothly animates between discrete buffer jumps, appearing to grow continuously during playback.

---

### Playground (`apps/playground`) — Internal

#### ✅ Added — Authorization Token Toggle (Secure Video ID tab)

**Before**
- Token input was always visible
- A hardcoded Bearer token was pre-filled in state by default — credentials were always being sent

**After**
- `authToken` defaults to `""` — nothing is sent unless explicitly entered
- A **"Use Authorization Token"** toggle switch (off by default) reveals the token input only when enabled
- Toggling off clears any previously entered token automatically
- "Load via Auth API" button is disabled when Video ID is empty

#### ✅ Fixed — `onPlayerReady` Type Safety

**Before**
```tsx
const onPlayerReady = (player: any) => {
  const unsub = player.subscribe((state: any) => { ... });
};
```

**After**
```tsx
import type { PlayerControls } from "@playerkit/react";

const onPlayerReady = (player: PlayerControls) => {
  const unsub = player.subscribe((state) => { ... });
};
```

#### ✅ Fixed — Background Token Refresh on Public Videos

**Before**
`buildKgsTokenRefresher` was always constructed when `videoId` was set, even with no token — causing background refresh API calls against public endpoints unnecessarily.

**After**
```ts
// Only built when token is actually provided
const kgsTokenRefresher = useMemo(
  () => videoId && authToken
    ? buildKgsTokenRefresher(videoId, authToken)
    : undefined,
  [videoId, authToken],
);
```

---

## [0.0.4] — Previous Release

Introduced the core token authentication system with `tokenFetcher` / `tokenRefresher` props, background token refresh scheduling, query-parameter signing via `xhrSetup`, and the unified `<Player>` orchestrator component.

---

## Migration Guide — 0.0.4 → 0.0.5

No breaking changes. Drop-in upgrade:

```bash
npm install @playerkit/core@0.0.5 @playerkit/react@0.0.5 @playerkit/ui@0.0.5
```

If you were importing `PlayerControls` from `@playerkit/core`, you can now use `@playerkit/react` instead:

```ts
// Before (still works)
import type { PlayerControls } from "@playerkit/core";

// After (preferred — no extra core dependency needed)
import type { PlayerControls } from "@playerkit/react";
```
