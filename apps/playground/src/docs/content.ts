// ─── Version & Types ──────────────────────────────────────────────────────────

export const DOCS_VERSION = "0.0.1";

export type DocBlock =
  | { type: "text"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "code"; lang: string; code: string; filename?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | {
      type: "callout";
      variant: "note" | "tip" | "warn" | "caution";
      text: string;
    }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "divider" };

export interface DocSection {
  id: string;
  title: string;
  content: DocBlock[];
}

export interface DocPackage {
  id: string;
  package: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: "react" | "core" | "ui";
  sections: DocSection[];
}

// ─── player-react ─────────────────────────────────────────────────────────────

const playerReact: DocPackage = {
  id: "react",
  package: "@playerkit/react",
  title: "react",
  description: "Complete React player components for HLS, YouTube, and progressive MP4",
  badge: "React",
  badgeColor: "react",
  sections: [
    {
      id: "react-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "text",
          text: "A complete, ready-to-use React video player for **HLS streams**, **YouTube videos**, and **progressive MP4s**. Drop in `<HlsPlayer>`, `<YoutubePlayer>`, `<Mp4Player>`, or the auto-detecting `<Player>` orchestrator — give it a source URL and get a fully functional player with controls, gestures, keyboard shortcuts, and customizable themes.",
        },
        { type: "heading", level: 3, text: "Install" },
        {
          type: "code",
          lang: "bash",
          code: `# npm\nnpm install @playerkit/react @playerkit/core @playerkit/ui\n\n# yarn\nyarn add @playerkit/react @playerkit/core @playerkit/ui\n\n# pnpm\npnpm add @playerkit/react @playerkit/core @playerkit/ui`,
        },
        { type: "heading", level: 3, text: "Drop it in" },
        {
          type: "text",
          text: "The `<Player>` orchestrator auto-detects HLS vs YouTube from the `src` URL. Styling is **automatically loaded** — no manual CSS import needed.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { Player } from "@playerkit/react";\n\nfunction App() {\n  return (\n    <Player\n      src="https://example.com/stream.m3u8"\n      style={{ width: "100%", maxWidth: 900 }}\n    />\n  );\n}`,
        },
      ],
    },
    {
      id: "react-what-you-get",
      title: "What You Get",
      content: [
        {
          type: "text",
          text: "When you use `<Player />` (or specialized `<HlsPlayer />` / `<YoutubePlayer />`), you get all of this out of the box:",
        },
        {
          type: "table",
          headers: ["Feature", "Description"],
          rows: [
            ["🎬 Play/Pause", "Click the video or press Space"],
            ["⏪⏩ Seek", "Drag the progress bar or use arrow keys"],
            ["🔊 Volume", "Slider with mute toggle"],
            ["⚙️ Settings", "Speed picker (all); quality switcher (HLS only)"],
            ["🖥️ Fullscreen", "Toggle fullscreen mode"],
            ["⌨️ Keyboard", "Space, F, M, arrows, S"],
            ["📱 Mobile", "Tap zones, swipe gestures, bottom sheet settings"],
            [
              "🔴 Live Streams",
              'DVR support, live edge indicator, "Go Live" button',
            ],
            ["🔐 Token Auth", "Play protected HLS streams"],
            ["🎨 Themes", "Custom colors and styles via CSS variables"],
            ["🔄 Auto Buffering", "Shows loading spinner when buffering"],
          ],
        },
      ],
    },
    {
      id: "react-css",
      title: "CSS & Styling",
      content: [
        {
          type: "text",
          text: "Player components **automatically load** the modular styles they require:",
        },
        {
          type: "list",
          items: [
            "`<HlsPlayer>` imports `common.css` and `hls.css`",
            "`<YoutubePlayer>` imports `common.css` and `youtube.css`",
            "`<Mp4Player>` imports `common.css` and `mp4.css`",
            "The master `<Player>` uses React `lazy` to only import the CSS needed for the detected format",
          ],
        },
        {
          type: "callout",
          variant: "note",
          text: "Do **not** manually import both `hls.css` and `youtube.css` unless you render multiple players in the same app. Each component already brings in what it needs.",
        },
        {
          type: "text",
          text: "For custom controls or bundlers that don't support CSS side-effects, import manually:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `// Core: variables, control bar, progress, volume, settings, overlays\nimport "@playerkit/ui/styles/common.css";\n\n// HLS-specific (only when using <HlsPlayer>)\nimport "@playerkit/ui/styles/hls.css";\n\n// YouTube-specific (only when using <YoutubePlayer>)\nimport "@playerkit/ui/styles/youtube.css";\n\n// MP4-specific (only when using <Mp4Player>)\nimport "@playerkit/ui/styles/mp4.css";\n\n// Or the full monolithic bundle:\nimport "@playerkit/ui/styles"; Scoped styling files can be imported individually.`,
        },
      ],
    },
    {
      id: "react-hls-player",
      title: "HlsPlayer",
      content: [
        {
          type: "text",
          text: "Use `<HlsPlayer>` when you know the source is always an HLS stream. The YouTube engine and its CSS are completely tree-shaken from your bundle.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { HlsPlayer } from "@playerkit/react";\n\n<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  poster="https://example.com/thumbnail.jpg"\n  autoPlay\n  muted\n/>`,
        },
        { type: "heading", level: 3, text: "With Poster & Start Time" },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  poster="https://example.com/thumbnail.jpg"\n  startTime={120} // Start at 2 minutes\n/>`,
        },
        { type: "heading", level: 3, text: "Custom Colors" },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  themeOverrides={{\n    "--pk-accent": "#ec4899", // Pink accent\n    "--pk-radius": "12px",\n  }}\n/>`,
        },
        { type: "heading", level: 3, text: "Custom Playback Speeds" },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  playbackRates={[0.5, 1, 1.5, 2, 3]}\n/>`,
        },
        { type: "heading", level: 3, text: "Access the Player API" },
        {
          type: "code",
          lang: "tsx",
          code: `import { useRef } from "react";\nimport { HlsPlayer } from "@playerkit/react";\nimport type { Player } from "@playerkit/core";\n\nfunction PlayerWithControls() {\n  const playerRef = useRef<Player>(null);\n\n  return (\n    <div>\n      <HlsPlayer ref={playerRef} src="https://example.com/stream.m3u8" />\n      <button onClick={() => playerRef.current?.togglePlay()}>Play/Pause</button>\n      <button onClick={() => playerRef.current?.setPlaybackRate(2)}>2x Speed</button>\n      <button onClick={() => playerRef.current?.seekToLive()}>Go Live</button>\n    </div>\n  );\n}`,
        },
      ],
    },
    {
      id: "react-youtube-player",
      title: "YoutubePlayer",
      content: [
        {
          type: "text",
          text: "`<YoutubePlayer>` is a first-class exported component, equal in status to `<HlsPlayer>`. Use it when you only embed YouTube content — the HLS engine is fully tree-shaken.",
        },
        {
          type: "text",
          text: "It accepts a full YouTube watch URL, a YouTube-nocookie embed URL, or just the bare video ID:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { YoutubePlayer } from "@playerkit/react";\n\n// Full YouTube URL\n<YoutubePlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" autoPlay />\n\n// Bare video ID\n<YoutubePlayer src="dQw4w9WgXcQ" autoPlay />\n\n// GDPR-friendly nocookie embed\n<YoutubePlayer src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" />`,
        },
        { type: "heading", level: 3, text: "YoutubePlayer Props" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`src`",
              "`string`",
              "**required**",
              "YouTube URL, nocookie embed URL, or bare video ID",
            ],
            [
              "`autoPlay`",
              "`boolean`",
              "`false`",
              "Start playing automatically",
            ],
            ["`muted`", "`boolean`", "`false`", "Start muted"],
            [
              "`controls`",
              "`boolean`",
              "`true`",
              "Show the built-in YouTube controls inside the iframe",
            ],
            [
              "`poster`",
              "`string`",
              "—",
              "Custom poster/thumbnail shown before the video starts",
            ],
            [
              "`className`",
              "`string`",
              "—",
              "Extra CSS class for the player container",
            ],
            [
              "`style`",
              "`CSSProperties`",
              "—",
              "Inline styles for the player container",
            ],
            [
              "`customization`",
              "`PlayerCustomization`",
              "—",
              "Show/hide specific controls",
            ],
            ["`themeOverrides`", "`ThemeVars`", "—", "CSS variable overrides"],
            [
              "`onPlayerReady`",
              "`(player) => void`",
              "—",
              "Called when the YouTube player is ready",
            ],
            [
              "`renderControls`",
              "`(props) => ReactNode`",
              "—",
              "Replace the entire control bar",
            ],
          ],
        },
      ],
    },
    {
      id: "react-mp4-player",
      title: "Mp4Player",
      content: [
        {
          type: "text",
          text: "Use `<Mp4Player>` when you know the source is always a progressive video file (MP4, WebM, Ogg). The HLS and YouTube engines and their resources are tree-shaken from your bundle.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { Mp4Player } from "@playerkit/react";\n\n<Mp4Player\n  src="https://example.com/video.mp4"\n  poster="https://example.com/thumbnail.jpg"\n  autoPlay\n  muted\n/>`,
        },
        { type: "heading", level: 3, text: "Mp4Player Props" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`src`",
              "`string`",
              "**required**",
              "Progressive video URL (MP4, WebM, Ogg)",
            ],
            [
              "`autoPlay`",
              "`boolean`",
              "`false`",
              "Start playing automatically",
            ],
            ["`muted`", "`boolean`", "`false`", "Start muted"],
            [
              "`controls`",
              "`boolean`",
              "`true`",
              "Show the built-in control bar",
            ],
            [
              "`poster`",
              "`string`",
              "—",
              "Custom poster/thumbnail URL",
            ],
            [
              "`className`",
              "`string`",
              "—",
              "Extra CSS class for the player container",
            ],
            [
              "`style`",
              "`CSSProperties`",
              "—",
              "Inline styles for the player container",
            ],
            [
              "`customization`",
              "`PlayerCustomization`",
              "—",
              "Show/hide specific controls",
            ],
            ["`themeOverrides`", "`ThemeVars`", "—", "CSS variable overrides"],
            [
              "`onPlayerReady`",
              "`(player) => void`",
              "—",
              "Called when the MP4 player is ready",
            ],
            [
              "`renderControls`",
              "`(props) => ReactNode`",
              "—",
              "Replace the entire control bar",
            ],
          ],
        },
      ],
    },
    {
      id: "react-all-props",
      title: "All Props",
      content: [
        { type: "heading", level: 3, text: "Core" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`src`",
              "`string`",
              "**required**",
              "Source URL (HLS `.m3u8`, YouTube link/video ID, or progressive MP4)",
            ],
            [
              "`type`",
              '`"hls" | "youtube" | "mp4"`',
              "—",
              "Explicitly enforce playback format (auto-detects if omitted)",
            ],
            [
              "`autoPlay`",
              "`boolean`",
              "`false`",
              "Start playing automatically",
            ],
            ["`muted`", "`boolean`", "`false`", "Start muted"],
            [
              "`poster`",
              "`string`",
              "—",
              "Thumbnail/poster image URL (HLS/MP4 only)",
            ],
            ["`startTime`", "`number`", "—", "Start at this time in seconds"],
            ["`className`", "`string`", "—", "Extra CSS class for the player"],
            [
              "`videoClassName`",
              "`string`",
              "—",
              "Extra CSS class for the `<video>` element (HLS/MP4 only)",
            ],
            [
              "`style`",
              "`CSSProperties`",
              "—",
              "Inline styles for the player container",
            ],
          ],
        },
        { type: "heading", level: 3, text: "Stream Configuration" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`lowLatency`",
              "`boolean`",
              "`false`",
              "Enable low-latency HLS mode",
            ],
            [
              "`liveSyncDuration`",
              "`number`",
              "`5`",
              'Seconds behind live to show "Go Live"',
            ],
            [
              "`tokenFetcher`",
              "`TokenFetcher`",
              "—",
              "Auth function for protected streams (HLS/MP4 only)",
            ],
            [
              "`playbackRates`",
              "`number[]`",
              "`[0.25...2]`",
              "Available speed options",
            ],
            [
              "`live`",
              "`LiveConfig`",
              "`{}`",
              "Live engine settings: `{ syncDuration?, lowLatency? }`",
            ],
          ],
        },
        { type: "heading", level: 3, text: "UI Configuration" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            ["`controls`", "`boolean`", "`true`", "Show the control bar"],
            ["`keyboard`", "`boolean`", "`true`", "Enable keyboard shortcuts"],
            [
              "`seekStep`",
              "`number`",
              "`10`",
              "Seconds to seek per arrow press",
            ],
            ["`theme`", '`"default"`', '`"default"`', "Theme to use"],
            ["`themeOverrides`", "`ThemeVars`", "—", "Custom CSS colors"],
            [
              "`customization`",
              "`PlayerCustomization`",
              "—",
              "Show/hide specific controls",
            ],
            [
              "`centerIconScale`",
              "`number`",
              "`1`",
              "Scales the center play/pause icon",
            ],
            [
              "`disableDevOptions`",
              "`boolean`",
              "`false`",
              "Block DevTools, F12, drag, context menus. Auto-resumes.",
            ],
          ],
        },
        { type: "heading", level: 3, text: "Advanced" },
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`centerZoneX`",
              "`{ start, end }`",
              "`{ start: 0.4, end: 0.6 }`",
              "Horizontal tap-to-play zone",
            ],
            [
              "`centerZoneY`",
              "`{ start, end }`",
              "`{ start: 0.4, end: 0.6 }`",
              "Vertical tap-to-play zone",
            ],
            [
              "`onPlayerReady`",
              "`(player) => void`",
              "—",
              "Called when player is ready",
            ],
            [
              "`renderControls`",
              "`(props) => ReactNode`",
              "—",
              "Replace the entire control bar",
            ],
            ["`root`", "`HTMLElement`", "—", "Element for fullscreen API"],
          ],
        },
      ],
    },
    {
      id: "react-token-auth",
      title: "Token Auth",
      content: [
        {
          type: "text",
          text: "For secure, signed streams, provide a `tokenFetcher` function. The player calls it before loading the video and automatically refreshes the token before it expires.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { HlsPlayer, type TokenFetcher } from "@playerkit/react";\n\nconst tokenFetcher: TokenFetcher = async ({ signal }) => {\n  const res = await fetch("https://api.example.com/video-token", { signal });\n  const data = await res.json();\n  if (!data.video_url) throw new Error(data.message || "Access denied");\n  return {\n    url: data.video_url,\n    expiresIn: data.expires_in, // player auto-refreshes before expiry\n  };\n};\n\nfunction CourseVideo({ videoId }: { videoId: string }) {\n  return (\n    <HlsPlayer\n      src={\`https://api.example.com/video/\${videoId}\`}\n      tokenFetcher={tokenFetcher}\n      autoPlay\n      muted\n    />\n  );\n}`,
        },
      ],
    },
    {
      id: "react-security",
      title: "Enterprise Security",
      content: [
        {
          type: "text",
          text: "Protect streams from scraping by enabling `disableDevOptions`. When active, the player launches multiple defense layers:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer src="https://example.com/stream.m3u8" disableDevOptions={true} />`,
        },
        {
          type: "list",
          items: [
            "**Event Interception** — blocks F12, view source, inspect, right-click/context menu, and asset drag-and-drop",
            "**Active Checking Traps** — monitors browser resize (side-docked panels >250px) and debugger timing loops (>200ms thread halt)",
            "**Lock Screen** — pauses playback and shows a frosted glassmorphic security overlay",
            "**Auto-Resume** — when DevTools are closed, the lock clears and playback resumes automatically",
          ],
        },
      ],
    },
    {
      id: "react-custom-controls",
      title: "Custom Controls",
      content: [
        {
          type: "text",
          text: "Replace the entire control bar with your own UI using the `renderControls` prop:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  renderControls={({ player, state, seekRelative, formatTime }) => (\n    <div style={{ display: "flex", gap: 8, padding: 8, background: "#222" }}>\n      <button onClick={() => player?.togglePlay()}>\n        {state?.isPlaying ? "⏸" : "▶"}\n      </button>\n      <input\n        type="range"\n        min={0}\n        max={state?.duration || 0}\n        value={state?.currentTime || 0}\n        onChange={(e) => player?.seek(Number(e.target.value))}\n        style={{ flex: 1 }}\n      />\n      <span style={{ color: "#fff" }}>\n        {formatTime(state?.currentTime || 0)}\n      </span>\n    </div>\n  )}\n/>`,
        },
      ],
    },
    {
      id: "react-keyboard",
      title: "Keyboard Shortcuts",
      content: [
        {
          type: "table",
          headers: ["Key", "Action"],
          rows: [
            ["`Space`", "Play / Pause"],
            ["`F`", "Toggle fullscreen"],
            ["`M`", "Mute / Unmute"],
            ["`←`", "Seek backward (10s by default)"],
            ["`→`", "Seek forward (10s by default)"],
            ["`↑`", "Volume up"],
            ["`↓`", "Volume down"],
            ["`S`", "Toggle stretch / fit"],
          ],
        },
      ],
    },
    {
      id: "react-hooks",
      title: "Headless Hooks",
      content: [
        {
          type: "text",
          text: "If you don't want the built-in UI, use our React hooks directly to build a fully custom player.",
        },
        { type: "heading", level: 3, text: "useHlsPlayer (HLS streams)" },
        {
          type: "code",
          lang: "tsx",
          code: `import { useHlsPlayer } from "@playerkit/react";\n\nfunction CustomPlayer() {\n  const { player, state, error, rootRef, videoRef } = useHlsPlayer({\n    src: "https://example.com/stream.m3u8",\n    autoPlay: true,\n  });\n\n  return (\n    <div ref={rootRef} style={{ width: 640, height: 360, position: "relative" }}>\n      <video ref={videoRef} style={{ width: "100%", height: "100%" }} />\n      <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff" }}>\n        {state?.isPlaying ? "▶ Playing" : "⏸ Paused"}\n        {" | "}\n        {state?.currentTime?.toFixed(1)}s / {state?.duration?.toFixed(1)}s\n      </div>\n      {error && <div style={{ color: "red", padding: 8 }}>Error: {error.message}</div>}\n    </div>\n  );\n}`,
        },
        {
          type: "heading",
          level: 3,
          text: "useYoutubePlayer (YouTube videos)",
        },
        {
          type: "text",
          text: "`useYoutubePlayer` requires two refs: one for the container element where the iframe is injected (`containerRef`), and one for the fullscreen root (`fullscreenRef`). The `src` accepts a video ID, YouTube URL, or nocookie embed URL.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { useYoutubePlayer } from "@playerkit/react";\nimport { useRef } from "react";\n\nfunction CustomYoutubePlayer() {\n  const containerRef = useRef<HTMLDivElement>(null);\n  const rootRef = useRef<HTMLDivElement>(null);\n\n  const { player, state } = useYoutubePlayer({\n    src: "dQw4w9WgXcQ",    // Video ID, YouTube URL, or nocookie embed URL\n    containerRef,           // Element where iframe will be injected\n    fullscreenRef: rootRef, // Element to use for fullscreen\n    autoPlay: false,\n    muted: false,\n  });\n\n  return (\n    <div ref={rootRef} style={{ position: "relative", width: 640, height: 360 }}>\n      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />\n      <div style={{ position: "absolute", bottom: 10, left: 10, color: "#fff" }}>\n        <button onClick={() => player?.togglePlay()}>\n          {state?.isPlaying ? "Pause" : "Play"}\n        </button>\n        <span>Volume: {Math.round((state?.volume ?? 0) * 100)}%</span>\n      </div>\n    </div>\n  );\n}`,
        },
        {
          type: "heading",
          level: 3,
          text: "useMp4Player (progressive MP4s)",
        },
        {
          type: "text",
          text: "`useMp4Player` mounts an `Mp4Player` headless engine against a managed `<video>` element ref. It returns the same state structure and control methods as `useHlsPlayer`.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { useMp4Player } from "@playerkit/react";\n\nfunction CustomPlayer() {\n  const { player, state, error, rootRef, videoRef } = useMp4Player({\n    src: "https://example.com/video.mp4",\n    autoPlay: true,\n  });\n\n  return (\n    <div ref={rootRef} style={{ width: 640, height: 360, position: "relative" }}>\n      <video ref={videoRef} style={{ width: "100%", height: "100%" }} />\n      <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff" }}>\n        {state?.isPlaying ? "▶ Playing" : "⏸ Paused"}\n        {" | "}\n        {state?.currentTime?.toFixed(1)}s / {state?.duration?.toFixed(1)}s\n      </div>\n      {error && <div style={{ color: "red", padding: 8 }}>Error: {error.message}</div>}\n    </div>\n  );\n}`,
        },
      ],
    },
    {
      id: "react-customization",
      title: "Customization Reference",
      content: [
        { type: "heading", level: 3, text: "PlayerCustomization" },
        {
          type: "text",
          text: "Fine-tune which controls are visible via the `customization` prop:",
        },
        {
          type: "code",
          lang: "ts",
          code: `type PlayerCustomization = {\n  showPlayButton?: boolean;      // Show/hide play button. Default: true\n  showTimeDisplay?: boolean;     // Show/hide time & duration. Default: true\n  showSettings?: boolean;        // Show/hide settings gear. Default: true\n  showFullscreen?: boolean;      // Show/hide fullscreen toggle. Default: true\n  showCenterOverlay?: boolean;   // Show/hide center overlay. Default: true\n  showObjectFitButton?: boolean; // Show/hide fit/stretch toggle. Default: true\n  volumeControl?: "vertical" | "horizontal" | "hidden"; // Default: "vertical"\n  centerOverlayGap?: number;     // Gap between center buttons in px. Default: 80\n  objectFit?: "contain" | "cover" | "fill"; // Default: "contain"\n  centerIconScale?: number;      // Scale multiplier for center icon. Default: 1\n};`,
        },
        { type: "heading", level: 3, text: "ThemeVars (CSS Variables)" },
        {
          type: "table",
          headers: ["Variable", "Default", "What It Changes"],
          rows: [
            [
              "`--pk-accent`",
              "`#2e3192`",
              "Primary color (buttons, progress bar)",
            ],
            ["`--pk-accent-contrast`", "`#ffffff`", "Text color on accent"],
            [
              "`--pk-surface`",
              "`rgb(2 6 23 / 0.76)`",
              "Control bar background",
            ],
            ["`--pk-border`", "`rgb(148 163 184 / 0.26)`", "Border color"],
            ["`--pk-text`", "`#f8fafc`", "Text color"],
            ["`--pk-muted`", "`#cbd5e1`", "Muted/secondary text"],
            ["`--pk-radius`", "`8px`", "Border radius"],
            ["`--pk-control-radius`", "`8px`", "Control button radius"],
            ["`--pk-video-bg`", "`#020617`", "Video area background"],
          ],
        },
      ],
    },
    {
      id: "react-typescript",
      title: "TypeScript",
      content: [
        {
          type: "text",
          text: "All types are exported from their respective packages:",
        },
        {
          type: "code",
          lang: "ts",
          code: `import type { PlayerControls } from "@playerkit/core";\nimport type {\n  PlayerProps,        // Props for <Player> orchestrator\n  HlsPlayerProps,     // Props accepted by <HlsPlayer>\n  YoutubePlayerProps, // Props accepted by <YoutubePlayer>\n  Mp4PlayerProps,     // Props accepted by <Mp4Player>\n  useMp4Player,       // React hook for headless MP4 player\n  TokenFetcher,\n  PlayerCustomization,\n  ThemeVars,\n} from "@playerkit/react";`,
        },
      ],
    },
    {
      id: "react-troubleshooting",
      title: "Troubleshooting",
      content: [
        {
          type: "table",
          headers: ["Problem", "Solution"],
          rows: [
            [
              "Player is invisible / no controls show",
              "Check if your bundler supports CSS side-effects or manually import `@playerkit/ui/styles/common.css` alongside `hls.css`, `youtube.css`, or `mp4.css`",
            ],
            [
              "Controls show but video doesn't load",
              "For HLS, `src` must end in `.m3u8`. For YouTube, must be a valid watch link or video ID. For MP4, must be a progressive video file (e.g. ending in `.mp4`).",
            ],
            [
              '"Access denied" error',
              "You need a `tokenFetcher` for protected HLS streams",
            ],
            [
              "Video stutters or buffers a lot",
              "Try the `lowLatency` prop or check network connection",
            ],
            [
              "Player is too small / large",
              "Set `width` and `aspectRatio` via the `style` prop",
            ],
          ],
        },
      ],
    },
  ],
};

// ─── player-core ──────────────────────────────────────────────────────────────

const playerCore: DocPackage = {
  id: "core",
  package: "@playerkit/core",
  title: "core",
  description: "Framework-agnostic HLS, YouTube & MP4 engine",
  badge: "Core",
  badgeColor: "core",
  sections: [
    {
      id: "core-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "text",
          text: "A headless video player engine supporting **HLS, YouTube, and progressive MP4** — works with any JavaScript framework, or no framework at all. Handles playback, quality switching, live streams, authentication, and fullscreen without any UI.",
        },
        {
          type: "code",
          lang: "bash",
          code: `npm install @playerkit/core`,
        },
        {
          type: "code",
          lang: "ts",
          code: `import { Player } from "@playerkit/core";\n\nconst video = document.querySelector("video")!;\nconst player = new Player({\n  video,\n  src: "https://example.com/stream.m3u8",\n});\n// That's it — the video loads and plays.`,
        },
      ],
    },
    {
      id: "core-creating",
      title: "Creating a Player",
      content: [
        {
          type: "text",
          text: "The `Player` class auto-detects HLS vs YouTube from the `src` and routes to the correct engine. Pass `type` to force a specific engine:",
        },
        {
          type: "code",
          lang: "ts",
          code: `const player = new Player({\n  video: HTMLVideoElement, // (required) The <video> element\n  src: "...",             // (required) HLS stream URL, YouTube URL/ID, or MP4 URL\n  type: "hls",            // Force engine ("hls" | "youtube" | "mp4") — auto-detects if omitted\n  autoPlay: false,\n  startTime: 0,\n  keyboard: false,\n  tokenFetcher: undefined, // For protected streams\n\n  live: {\n    syncDuration: 5,  // Seconds behind live edge to show "Go Live" (HLS only)\n    lowLatency: false, // Enable low-latency HLS mode (HLS only)\n  },\n\n  security: {\n    disableDevOptions: false, // Block DevTools, context menus, hotkeys\n  },\n});`,
        },
      ],
    },
    {
      id: "core-usage",
      title: "Basic Usage",
      content: [
        { type: "heading", level: 3, text: "Play / Pause" },
        {
          type: "code",
          lang: "ts",
          code: `await player.play();\nplayer.pause();\nawait player.togglePlay();`,
        },
        { type: "heading", level: 3, text: "Seek" },
        {
          type: "code",
          lang: "ts",
          code: `player.seek(150);       // Seek to 2:30\nplayer.seekToLive();    // Jump to live edge`,
        },
        { type: "heading", level: 3, text: "Volume" },
        {
          type: "code",
          lang: "ts",
          code: `player.setVolume(0.5);  // 50%\nplayer.mute();\nplayer.unmute();`,
        },
        { type: "heading", level: 3, text: "Speed" },
        {
          type: "code",
          lang: "ts",
          code: `player.setPlaybackRate(2);   // 2x\nplayer.setPlaybackRate(0.5); // 0.5x`,
        },
        { type: "heading", level: 3, text: "Quality (HLS only)" },
        {
          type: "code",
          lang: "ts",
          code: `player.setQuality("auto"); // Auto-select\nplayer.setQuality(2);      // Pick level by ID`,
        },
        { type: "heading", level: 3, text: "Fullscreen" },
        {
          type: "code",
          lang: "ts",
          code: `await player.enterFullscreen();\nawait player.exitFullscreen();\nawait player.toggleFullscreen();`,
        },
        { type: "heading", level: 3, text: "Switch Source" },
        {
          type: "code",
          lang: "ts",
          code: `player.setSource({\n  src: "https://other-site.com/stream.m3u8",\n  autoPlay: true,\n});`,
        },
        { type: "heading", level: 3, text: "Cleanup" },
        {
          type: "code",
          lang: "ts",
          code: `player.destroy();`,
        },
      ],
    },
    {
      id: "core-state",
      title: "Player State",
      content: [
        { type: "heading", level: 3, text: "Reading State" },
        {
          type: "code",
          lang: "ts",
          code: `const state = player.getState();\nconsole.log(state.currentTime); // Current position\nconsole.log(state.isPlaying);   // true/false\nconsole.log(state.isLive);      // Live stream?`,
        },
        { type: "heading", level: 3, text: "Subscribing to Changes" },
        {
          type: "code",
          lang: "ts",
          code: `const unsub = player.subscribe((state) => {\n  console.log("State changed:", state);\n});\n\nunsub(); // Stop listening`,
        },
        { type: "heading", level: 3, text: "Full State Object" },
        {
          type: "code",
          lang: "ts",
          code: `{\n  type: "hls" | "youtube" | "mp4", // Which engine is active\n  src: string,                 // Current source URL\n  isReady: boolean,\n  isPlaying: boolean,\n  isMuted: boolean,\n  isFullscreen: boolean,\n  isBuffering: boolean,\n  isStretched: boolean,\n  currentTime: number,\n  duration: number,\n  volume: number,              // 0.0 to 1.0\n  previousVolume: number,\n  playbackRate: number,\n  selectedQuality: number | "auto", // HLS only\n  activeQuality: number | null,     // HLS only\n  qualities: QualityLevel[],        // HLS only\n  buffered: BufferedRange[],\n  bufferedEnd: number,\n  bufferedPercent: number,\n  isLive: boolean,\n  isAtLiveEdge: boolean,\n  liveLatency: number,\n  dvr: boolean,               // HLS only\n  seekableStart: number,\n  seekableEnd: number,\n  error: PlayerError | null,\n  isDevtoolsDetected: boolean,\n}`,
        },
      ],
    },
    {
      id: "core-events",
      title: "Events",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `player.on("play",  (state) => console.log("Playing"));\nplayer.on("pause", (state) => console.log("Paused"));\nplayer.on("error", (error) => console.error(error.message));\nplayer.on("qualitychange", (q) => console.log("Quality:", q));\nplayer.on("timeupdate", (state) => console.log(state.currentTime));\nplayer.on("ended", () => console.log("Video finished"));`,
        },
        { type: "heading", level: 3, text: "All Events" },
        {
          type: "table",
          headers: ["Event", "Fires When", "Payload"],
          rows: [
            ["`ready`", "Player is initialized and ready", "PlayerState"],
            ["`play`", "Playback started", "PlayerState"],
            ["`pause`", "Playback paused", "PlayerState"],
            [
              "`playing`",
              "Video is actually playing (after buffering)",
              "PlayerState",
            ],
            ["`waiting`", "Video is buffering/waiting for data", "PlayerState"],
            ["`seeking`", "A seek started", "PlayerState"],
            ["`seeked`", "Seek completed", "PlayerState"],
            [
              "`timeupdate`",
              "Current time changed (fires frequently)",
              "PlayerState",
            ],
            ["`volumechange`", "Volume or mute state changed", "PlayerState"],
            ["`fullscreenchange`", "Fullscreen toggled", "boolean"],
            [
              "`qualitychange`",
              "Video quality changed (HLS only)",
              "QualityLevel",
            ],
            [
              "`qualitieschange`",
              "Available qualities changed (HLS only)",
              "QualityLevel[]",
            ],
            [
              "`livestatechange`",
              "Live stream metrics changed",
              "LiveStateChange",
            ],
            ["`sourcechange`", "Source URL changed", "string"],
            ["`ended`", "Playback finished", "PlayerState"],
            ["`error`", "An error occurred", "PlayerError"],
            ["`destroy`", "Player was destroyed", "void"],
            ["`statechange`", "Any state changed", "PlayerState"],
          ],
        },
      ],
    },
    {
      id: "core-token-auth",
      title: "Token Auth",
      content: [
        {
          type: "text",
          text: "For Akamai tokenized or other protected HLS streams, use `tokenFetcher`. The player calls it before loading and auto-refreshes before expiry.",
        },
        {
          type: "code",
          lang: "ts",
          code: `import type { TokenFetcher } from "@playerkit/core";\n\nconst tokenFetcher: TokenFetcher = async ({ src, signal }) => {\n  const response = await fetch("/api/get-token", {\n    method: "POST",\n    body: JSON.stringify({ url: src }),\n    signal,\n  });\n  const data = await response.json();\n  return {\n    url: data.signedUrl,       // The authenticated URL\n    expiresIn: data.expiresIn, // (optional) Seconds until token expires\n    headers: data.headers,     // (optional) Custom HTTP headers\n  };\n};\n\nconst player = new Player({ video, src: "...", tokenFetcher });`,
        },
      ],
    },
    {
      id: "core-youtube",
      title: "YouTube Sources",
      content: [
        {
          type: "text",
          text: "The core engine auto-detects YouTube sources and routes to the YouTube IFrame API engine. Supported formats:",
        },
        {
          type: "table",
          headers: ["Format", "Example"],
          rows: [
            [
              "YouTube watch URL",
              "`https://www.youtube.com/watch?v=dQw4w9WgXcQ`",
            ],
            ["YouTube short URL", "`https://youtu.be/dQw4w9WgXcQ`"],
            [
              "Nocookie embed URL",
              "`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`",
            ],
            [
              "Bare video ID (with `type`)",
              '`dQw4w9WgXcQ` + `type: "youtube"`',
            ],
          ],
        },
        {
          type: "code",
          lang: "ts",
          code: `// Auto-detected from URL\nconst player = new Player({ video, src: "https://youtu.be/dQw4w9WgXcQ" });\n\n// Force YouTube engine for bare video IDs\nconst player = new Player({\n  video,\n  src: "dQw4w9WgXcQ",\n  type: "youtube",\n});`,
        },
        { type: "heading", level: 3, text: "Feature Availability for YouTube" },
        {
          type: "table",
          headers: ["Feature", "Available", "Notes"],
          rows: [
            ["`setQuality()`", "❌", "YouTube controls its own quality"],
            ["`tokenFetcher`", "❌", "Not applicable for YouTube"],
            ["`live.lowLatency`", "❌", "Not applicable for YouTube"],
            ["`dvr`", "❌", "No DVR scrubbing on YouTube"],
            ["`setPlaybackRate()`", "✅", "Works via the IFrame API"],
            ["`isLive`", "✅", "Detected for YouTube live streams"],
            ["`isAtLiveEdge`", "✅", "Tracked for YouTube live streams"],
            ["`liveLatency`", "✅", "Available for YouTube live streams"],
          ],
        },
      ],
    },
    {
      id: "core-live",
      title: "Live Streams",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `const state = player.getState();\nif (state.isLive) {\n  console.log("Latency:", state.liveLatency, "seconds behind live");\n  console.log("At live edge?", state.isAtLiveEdge);\n}\n\nplayer.seekToLive(); // Jump to latest moment`,
        },
        { type: "heading", level: 3, text: "Live Edge Detection (Hysteresis)" },
        {
          type: "table",
          headers: ["Latency", "Badge", "Description"],
          rows: [
            ["0–2.5s", "LIVE (green)", "Within half the sync threshold"],
            [
              "2.5–5s",
              "(grey, no change)",
              "Hysteresis band — prevents ping-ponging",
            ],
            ["5s+", "⚡ Go Live", "Behind the live edge"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: 'The badge also updates while paused via a 1-second polling interval, so pausing correctly shows "Go Live" once you fall behind.',
        },
      ],
    },
    {
      id: "core-architecture",
      title: "Architecture",
      content: [
        {
          type: "text",
          text: "The player has two engines that share the same event and state contract:",
        },
        {
          type: "list",
          items: [
            "**HLS Engine** — built on `hls.js`, composed of 8 specialized manager classes",
            "**YouTube Engine** — a single self-contained wrapper around the YouTube IFrame API",
            "**MP4 Engine** — progressive MP4 engine wrapper that re-uses shared managers (Security, Fullscreen, Keyboard, Network, Error, Store)",
          ],
        },
        { type: "heading", level: 3, text: "HLS Engine Managers" },
        {
          type: "callout",
          variant: "note",
          text: "The 8 managers below apply to the HLS engine only. The YouTube engine is a single self-contained class that emits the same events and state shape.",
        },
        {
          type: "table",
          headers: ["Manager", "Responsibility"],
          rows: [
            ["`HlsManager`", "hls.js init, error recovery, quality switching"],
            ["`LiveManager`", "Live edge detection, DVR mode, pause polling"],
            [
              "`ErrorManager`",
              "Centralized HTTP and stream error classification and recovery",
            ],
            ["`AuthManager`", "Token fetch, refresh, header injection"],
            ["`NetworkManager`", "Online/offline detection + auto-retry"],
            ["`FullscreenManager`", "Fullscreen API across browsers"],
            ["`KeyboardManager`", "Keyboard shortcuts (Space, arrows, etc.)"],
            [
              "`SecurityManager`",
              "Active protection traps, F12 shields, context menus, auto-resume",
            ],
          ],
        },
        { type: "heading", level: 3, text: "Key Design Principles" },
        {
          type: "list",
          items: [
            "**Event-driven** — All state changes flow through `patchState()` which updates the store and emits `statechange`",
            "**Single source of truth** — `LiveManager.evaluate()` is the only writer of `isAtLiveEdge` and `liveLatency`",
            "**Segment spike dampening** — 3 consecutive high-latency readings required before entering DVR mode",
            "**Atomic state writes** — `timeupdate` merges all fields into one `patchState()` call",
            "**Auto speed-reset** — player resets `playbackRate → 1×` when reaching live edge at elevated speed",
            "**Unified surface** — Both engines implement the same event and state contract, so all adapters work with either engine",
          ],
        },
      ],
    },
    {
      id: "core-typescript",
      title: "TypeScript",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `import type {\n  Player,\n  PlayerState,\n  PlayerSnapshot,\n  PlayerError,\n  TokenFetcher,\n  QualityLevel,\n  PlayerControls,\n  BufferedRange,\n} from "@playerkit/core";`,
        },
      ],
    },
  ],
};

// ─── player-ui ────────────────────────────────────────────────────────────────

const playerUi: DocPackage = {
  id: "ui",
  package: "@playerkit/ui",
  title: "ui",
  description: "Ready-made React UI components and theme system",
  badge: "UI",
  badgeColor: "ui",
  sections: [
    {
      id: "ui-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "callout",
          variant: "note",
          text: "This package only provides UI components. For a complete working player, use `@playerkit/react` instead. Use `@playerkit/ui` only if you're building custom player controls.",
        },
        {
          type: "code",
          lang: "bash",
          code: `npm install @playerkit/ui react react-dom`,
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { PlayerControls, formatPlayerTime } from "@playerkit/ui";\nimport "@playerkit/ui/styles/common.css"; // Don't forget!\n\nfunction MyControls({ state, player }) {\n  return (\n    <PlayerControls\n      state={state}\n      player={player}\n      progress={50}\n      buffered={70}\n      seekRelative={(percent) => player.seek(percent * state.duration)}\n      formatTime={formatPlayerTime}\n    />\n  );\n}`,
        },
      ],
    },
    {
      id: "ui-css",
      title: "CSS Imports",
      content: [
        {
          type: "text",
          text: "The player UI **will not render correctly** without the stylesheets. The CSS is split into three focused files so you only load what you need:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `// 1. Core: CSS variables, control bar, progress, volume,\n//    settings panel, buffering spinner, error overlay, live badge, center overlay.\nimport "@playerkit/ui/styles/common.css";\n\n// 2. HLS-specific: <video> sizing, object-fit, background fill.\nimport "@playerkit/ui/styles/hls.css";\n\n// 3. YouTube-specific: iframe scaling wrapper, custom poster overlay.\nimport "@playerkit/ui/styles/youtube.css";\n\n// 4. MP4-specific: sizing overrides for progressive video element.\nimport "@playerkit/ui/styles/mp4.css";\n\n// Or the full monolithic bundle:\nimport "@playerkit/ui/styles";`,
        },
        { type: "heading", level: 3, text: "CSS File → Component Mapping" },
        {
          type: "table",
          headers: ["CSS File", "What It Styles"],
          rows: [
            [
              "`common.css`",
              "`PlayerControls`, `ProgressBar`, `TimeDisplay`, `VolumeControl`, `SettingsPanel`, `ControlButton`, `MobileTopBar` (all core controls, variables, overlays)",
            ],
            [
              "`youtube.css`",
              "`pk-youtube-clip` (YouTube iframe scaling), `pk-youtube-poster` (custom poster overlay)",
            ],
            [
              "`hls.css`",
              "`pk-player__video` sizing overrides for native `<video>` element",
            ],
            [
              "`mp4.css`",
              "`pk-player__video` sizing overrides for progressive `<video>` element (identical layout to `hls.css`)",
            ],
          ],
        },
      ],
    },
    {
      id: "ui-components",
      title: "Components",
      content: [
        {
          type: "table",
          headers: ["Component", "What It Does"],
          rows: [
            [
              "`PlayerControls`",
              "Complete control bar: play, seek, volume, settings, fullscreen",
            ],
            ["`ProgressBar`", "Buffered/played progress with draggable slider"],
            ["`TimeDisplay`", "Current time / duration (e.g. `1:23 / 5:00`)"],
            ["`VolumeControl`", "Volume slider — horizontal or vertical popup"],
            [
              "`SettingsPanel`",
              "Speed and quality picker with sliding sub-menus",
            ],
            ["`ControlButton`", "Styled icon button for custom actions"],
            [
              "`MobileTopBar`",
              "Top bar with settings, fullscreen, and fit toggle for mobile",
            ],
          ],
        },
        { type: "heading", level: 3, text: "PlayerControls" },
        {
          type: "code",
          lang: "tsx",
          code: `<PlayerControls\n  state={playerState}         // The player state object\n  player={playerInstance}     // The player instance\n  progress={bufferedPercent}  // 0–100, how much is buffered\n  buffered={bufferedPercent}\n  seekRelative={(pct) => {}}  // Called when user drags the progress bar\n  formatTime={(s) => string}  // Formats seconds into "1:23"\n  customization={{}}          // Show/hide specific controls\n  themeOverrides={{}}         // Override CSS colors\n/>`,
        },
        { type: "heading", level: 3, text: "ProgressBar" },
        {
          type: "code",
          lang: "tsx",
          code: `<ProgressBar\n  progress={currentTime}   // Current time in seconds\n  duration={totalDuration}\n  buffered={bufferedEnd}\n  onSeek={(seconds) => player.seek(seconds)}\n/>`,
        },
        { type: "heading", level: 3, text: "VolumeControl" },
        {
          type: "code",
          lang: "tsx",
          code: `<VolumeControl\n  volume={0.7}                        // 0.0 to 1.0\n  previousVolume={1}\n  onChange={(value) => player.setVolume(value)}\n  onMute={() => player.mute()}\n  onUnmute={() => player.unmute()}\n  variant="horizontal" // "horizontal" | "vertical"\n/>`,
        },
      ],
    },
    {
      id: "ui-theming",
      title: "Theming",
      content: [
        { type: "heading", level: 3, text: "Theme Overrides" },
        {
          type: "code",
          lang: "tsx",
          code: `<PlayerControls\n  themeOverrides={{\n    "--pk-accent": "#ec4899",    // Pink accent color\n    "--pk-surface": "transparent",\n    "--pk-radius": "12px",\n  }}\n  // ...\n/>`,
        },
        { type: "heading", level: 3, text: "Available CSS Variables" },
        {
          type: "callout",
          variant: "note",
          text: "All CSS variables use the `--pk-` prefix and are scoped to the `.pk-player` root element — they won't leak into the rest of your application.",
        },
        {
          type: "table",
          headers: ["Variable", "Default", "What It Changes"],
          rows: [
            ["`--pk-accent`", "`#2e3192`", "Primary color (buttons, progress)"],
            ["`--pk-accent-contrast`", "`#ffffff`", "Text color on accent"],
            [
              "`--pk-surface`",
              "`rgb(2 6 23 / 0.76)`",
              "Control bar background",
            ],
            ["`--pk-border`", "`rgb(148 163 184 / 0.26)`", "Border color"],
            ["`--pk-text`", "`#f8fafc`", "Text color"],
            ["`--pk-muted`", "`#cbd5e1`", "Muted/secondary text"],
            ["`--pk-radius`", "`8px`", "Border radius"],
            ["`--pk-control-radius`", "`8px`", "Control button radius"],
            ["`--pk-video-bg`", "`#020617`", "Video area background"],
          ],
        },
        { type: "heading", level: 3, text: "Hiding Specific Controls" },
        {
          type: "code",
          lang: "tsx",
          code: `<PlayerControls\n  customization={{\n    showPlayButton: true,\n    showTimeDisplay: true,\n    showSettings: false,       // Hide gear button\n    showFullscreen: true,\n    volumeControl: "hidden",   // Hide volume control\n  }}\n  // ...\n/>`,
        },
      ],
    },
    {
      id: "ui-customization-type",
      title: "PlayerCustomization Type",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `type PlayerCustomization = {\n  /** Show/hide the play/pause button. Default: true */\n  showPlayButton?: boolean;\n\n  /** Show/hide the current time and duration display. Default: true */\n  showTimeDisplay?: boolean;\n\n  /** Show/hide the settings gear button. Default: true */\n  showSettings?: boolean;\n\n  /** Show/hide the fullscreen toggle button. Default: true */\n  showFullscreen?: boolean;\n\n  /** Show/hide the center tap-to-play overlay. Default: true */\n  showCenterOverlay?: boolean;\n\n  /** Show/hide the stretch/fit toggle button. Default: true */\n  showObjectFitButton?: boolean;\n\n  /**\n   * Volume slider style.\n   * - "vertical" — floating vertical popup (default)\n   * - "horizontal" — inline horizontal slider\n   * - "hidden" — no volume control rendered\n   */\n  volumeControl?: "vertical" | "horizontal" | "hidden";\n\n  /** Gap in pixels between buttons in the center overlay. Default: 80 */\n  centerOverlayGap?: number;\n\n  /**\n   * How the video is fitted inside its container.\n   * - "contain" — letterbox / pillarbox (default)\n   * - "cover" — crop to fill\n   * - "fill" — stretch to fill\n   */\n  objectFit?: "contain" | "cover" | "fill";\n\n  /** Scale factor applied to the center play icon. Default: 1 */\n  centerIconScale?: number;\n};`,
        },
      ],
    },
    {
      id: "ui-custom-icons",
      title: "Custom Icons",
      content: [
        {
          type: "text",
          text: "Replace all player icons using the icon provider:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { PlayerIconProvider, type PlayerIconMap } from "@playerkit/ui";\n\nconst myIcons: PlayerIconMap = {\n  Play:       () => <span>▶</span>,\n  Pause:      () => <span>⏸</span>,\n  Settings:   () => <span>⚙️</span>,\n  VolumeHigh: () => <span>🔊</span>,\n  VolumeLow:  () => <span>🔉</span>,\n  VolumeOff:  () => <span>🔇</span>,\n  Maximize:   () => <span>⛶</span>,\n  Minimize:   () => <span>⤡</span>,\n};\n\nfunction App() {\n  return (\n    <PlayerIconProvider icons={myIcons}>\n      <YourPlayer />\n    </PlayerIconProvider>\n  );\n}`,
        },
      ],
    },
    {
      id: "ui-css-classes",
      title: "CSS Class Reference",
      content: [
        {
          type: "text",
          text: "All classes follow BEM naming with the `pk-` prefix:",
        },
        {
          type: "table",
          headers: ["Class", "Element"],
          rows: [
            ["`pk-player`", "Root player container"],
            ["`pk-controls`", "Control bar"],
            ["`pk-progress`", "Progress bar wrapper"],
            ["`pk-progress__track`", "Progress track"],
            ["`pk-progress__filled`", "Played portion"],
            ["`pk-progress__buffered`", "Buffered portion"],
            ["`pk-volume`", "Volume control"],
            ["`pk-volume--vertical`", "Vertical popup volume"],
            ["`pk-center-overlay`", "Center play/pause overlay"],
            ["`pk-buffering`", "Buffering overlay"],
            ["`pk-live-badge`", "Live stream indicator"],
            ["`pk-live-badge--active`", "Live badge active state"],
            ["`pk-live-badge--behind`", "Live badge behind edge"],
            ["`pk-error-overlay`", "Error overlay"],
            ["`pk-settings-dropdown`", "Desktop dropdown"],
            ["`pk-settings-sheet`", "Mobile bottom sheet"],
            ["`pk-security-overlay`", "DevTools security lock overlay"],
            [
              "`pk-youtube-clip`",
              "Absolute-fill scaling wrapper for YouTube iframe (`youtube.css`)",
            ],
            [
              "`pk-youtube-poster`",
              "Custom poster overlay before YouTube iframe loads (`youtube.css`)",
            ],
          ],
        },
      ],
    },
    {
      id: "ui-typescript",
      title: "TypeScript",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `import type {\n  PlayerControlsProps,\n  ProgressBarProps,\n  TimeDisplayProps,\n  VolumeControlProps,\n  SettingsPanelProps,\n  ControlButtonProps,\n  MobileTopBarProps,\n  PlayerIconMap,\n  ThemeVars,\n  PlayerCustomization,\n} from "@playerkit/ui";`,
        },
      ],
    },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const DOCS_PACKAGES: DocPackage[] = [playerReact, playerCore, playerUi];

// Flat search index: { pkg, sectionId, sectionTitle, text }
export interface SearchEntry {
  pkg: string;
  pkgId: string;
  sectionId: string;
  sectionTitle: string;
  text: string;
}

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const pkg of DOCS_PACKAGES) {
    for (const section of pkg.sections) {
      const texts: string[] = [section.title];
      for (const block of section.content) {
        if (block.type === "text") texts.push(block.text);
        else if (block.type === "heading") texts.push(block.text);
        else if (block.type === "code") texts.push(block.code);
        else if (block.type === "list") texts.push(...block.items);
        else if (block.type === "callout") texts.push(block.text);
        else if (block.type === "table") {
          for (const row of block.rows) texts.push(row.join(" "));
        }
      }
      entries.push({
        pkg: pkg.title,
        pkgId: pkg.id,
        sectionId: section.id,
        sectionTitle: section.title,
        text: texts.join(" ").toLowerCase(),
      });
    }
  }
  return entries;
}
