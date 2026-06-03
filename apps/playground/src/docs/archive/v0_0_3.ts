import type { DocPackage } from "../content";

// ─── player-react v0.0.3 ──────────────────────────────────────────────────────
const playerReactV03: DocPackage = {
  id: "player-react",
  package: "@nurav/player-react",
  title: "player-react",
  description: "React component for HLS video playback",
  badge: "React",
  badgeColor: "react",
  sections: [
    {
      id: "react-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "text",
          text: "A complete, ready-to-use React video player component for **HLS streams**. Drop in `<HlsPlayer>` — give it a stream URL and get a fully functional player with controls, gestures, keyboard shortcuts, and customizable themes.",
        },
        { type: "heading", level: 3, text: "Install" },
        {
          type: "code",
          lang: "bash",
          code: `# npm\nnpm install @nurav/player-react @nurav/player-core @nurav/player-ui\n\n# yarn\nyarn add @nurav/player-react @nurav/player-core @nurav/player-ui\n\n# pnpm\npnpm add @nurav/player-react @nurav/player-core @nurav/player-ui`,
        },
        { type: "heading", level: 3, text: "Drop it in" },
        {
          type: "text",
          text: "Import the HlsPlayer and the monolithic CSS bundle `@nurav/player-ui/styles` directly in your component.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { HlsPlayer } from "@nurav/player-react";\nimport "@nurav/player-ui/styles"; // Loads the UI styling\n\nfunction App() {\n  return (\n    <HlsPlayer\n      src="https://example.com/stream.m3u8"\n      style={{ width: "100%", maxWidth: 800 }}\n    />\n  );\n}`,
        },
      ],
    },
    {
      id: "react-what-you-get",
      title: "What You Get",
      content: [
        {
          type: "text",
          text: "When you use `<HlsPlayer />`, you get all of this out of the box:",
        },
        {
          type: "table",
          headers: ["Feature", "Description"],
          rows: [
            ["🎬 Play/Pause", "Click the video or press Space"],
            ["⏪⏩ Seek", "Drag the progress bar or use arrow keys"],
            ["🔊 Volume", "Slider with mute toggle"],
            ["⚙️ Settings", "Speed and quality picker (HLS quality ABR)"],
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
          text: "In v0.0.3, player components require the monolithic CSS bundle to be imported once in your app:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `// Import this in your main component or App.tsx\nimport "@nurav/player-ui/styles";`,
        },
      ],
    },
    {
      id: "react-hls-player",
      title: "HlsPlayer Examples",
      content: [
        {
          type: "text",
          text: "Configure aspect ratios, posters, and starting times easily:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { HlsPlayer } from "@nurav/player-react";\n\n<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  poster="https://example.com/thumbnail.jpg"\n  startTime={120} // Starts at 2 minutes\n  autoPlay\n  muted\n/>`,
        },
        { type: "heading", level: 3, text: "Custom Colors" },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer\n  src="https://example.com/stream.m3u8"\n  themeOverrides={{\n    "--vp-accent": "#ec4899",\n    "--vp-radius": "12px",\n  }}\n/>`,
        },
        { type: "heading", level: 3, text: "Access the Player API via Ref" },
        {
          type: "code",
          lang: "tsx",
          code: `import { useRef } from "react";\nimport { HlsPlayer } from "@nurav/player-react";\nimport type { Player } from "@nurav/player-core";\n\nfunction CustomControls() {\n  const playerRef = useRef<Player>(null);\n\n  return (\n    <div>\n      <HlsPlayer ref={playerRef} src="https://example.com/stream.m3u8" />\n      <button onClick={() => playerRef.current?.togglePlay()}>Toggle</button>\n    </div>\n  );\n}`,
        },
      ],
    },
    {
      id: "react-all-props",
      title: "All Props",
      content: [
        {
          type: "table",
          headers: ["Prop", "Type", "Default", "Description"],
          rows: [
            [
              "`src`",
              "`string`",
              "**required**",
              "Source HLS stream `.m3u8` URL",
            ],
            [
              "`autoPlay`",
              "`boolean`",
              "`false`",
              "Start playing automatically",
            ],
            ["`muted`", "`boolean`", "`false`", "Start muted"],
            ["`poster`", "`string`", "—", "Thumbnail/poster image URL"],
            ["`startTime`", "`number`", "—", "Start at this time in seconds"],
            ["`className`", "`string`", "—", "Extra CSS class for the player"],
            ["`style`", "`CSSProperties`", "—", "Inline styles for the player"],
            [
              "`lowLatency`",
              "`boolean`",
              "`false`",
              "Enable low-latency ABR mode",
            ],
            [
              "`liveSyncDuration`",
              "`number`",
              "`5`",
              "Live offset sync target",
            ],
            [
              "`tokenFetcher`",
              "`TokenFetcher`",
              "—",
              "Token authentication helper",
            ],
            ["`controls`", "`boolean`", "`true`", "Show/hide control bar"],
            ["`keyboard`", "`boolean`", "`true`", "Enable keyboard hotkeys"],
            ["`seekStep`", "`number`", "`10`", "Seconds to seek per key press"],
            ["`theme`", '`"kgs"`', '`"kgs"`', "Visual controls theme"],
            ["`themeOverrides`", "`ThemeVars`", "—", "CSS overrides"],
            [
              "`customization`",
              "`PlayerCustomization`",
              "—",
              "Select controls visibility",
            ],
            [
              "`disableDevOptions`",
              "`boolean`",
              "`false`",
              "Block browser inspector panels",
            ],
            ["`onPlayerReady`", "`(player) => void`", "—", "On ready callback"],
            [
              "`renderControls`",
              "`(props) => ReactNode`",
              "—",
              "Replace control bar",
            ],
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
          text: "For Akamai signed streams, provide `tokenFetcher`. The player automatically fetches and refreshes credentials before expiration:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { HlsPlayer, type TokenFetcher } from "@nurav/player-react";\n\nconst tokenFetcher: TokenFetcher = async ({ signal }) => {\n  const res = await fetch("https://api.example.com/video-token", { signal });\n  const data = await res.json();\n  return {\n    url: data.video_url,\n    expiresIn: data.expires_in,\n  };\n};`,
        },
      ],
    },
    {
      id: "react-security",
      title: "Enterprise Security",
      content: [
        {
          type: "text",
          text: "Enabling `disableDevOptions` triggers background inspectors that halt execution when DevTools are opened:",
        },
        {
          type: "code",
          lang: "tsx",
          code: `<HlsPlayer src="https://example.com/stream.m3u8" disableDevOptions={true} />`,
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
            ["`←` / `→`", "Seek backward / forward (10s)"],
            ["`↑` / `↓`", "Volume up / down"],
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
          text: "In v0.0.3, only `@nurav/player-react` provides `useHlsPlayer` hook for building HLS controls without default UIs.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import { useHlsPlayer } from "@nurav/player-react";\n\nfunction CustomPlayer() {\n  const { player, state, rootRef, videoRef } = useHlsPlayer({\n    src: "https://example.com/stream.m3u8",\n  });\n\n  return (\n    <div ref={rootRef}>\n      <video ref={videoRef} />\n      <button onClick={() => player?.togglePlay()}>Play</button>\n    </div>\n  );\n}`,
        },
      ],
    },
  ],
};

// ─── player-core v0.0.3 ──────────────────────────────────────────────────────
const playerCoreV03: DocPackage = {
  id: "player-core",
  package: "@nurav/player-core",
  title: "player-core",
  description: "Headless HLS video player engine",
  badge: "Core",
  badgeColor: "core",
  sections: [
    {
      id: "core-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "text",
          text: "A headless framework-agnostic player engine designed strictly for **HLS streams**.",
        },
        {
          type: "code",
          lang: "bash",
          code: `npm install @nurav/player-core`,
        },
        {
          type: "code",
          lang: "ts",
          code: `import { Player } from "@nurav/player-core";\n\nconst video = document.querySelector("video")!;\nconst player = new Player({\n  video,\n  src: "https://example.com/stream.m3u8",\n});`,
        },
      ],
    },
    {
      id: "core-usage",
      title: "API Methods",
      content: [
        {
          type: "code",
          lang: "ts",
          code: `player.play();\nplayer.pause();\nplayer.seek(120);\nplayer.setVolume(0.8);\nplayer.setPlaybackRate(1.5);\nplayer.setQuality(2); // Set HLS bandwidth level`,
        },
      ],
    },
  ],
};

// ─── player-ui v0.0.3 ────────────────────────────────────────────────────────
const playerUiV03: DocPackage = {
  id: "player-ui",
  package: "@nurav/player-ui",
  title: "player-ui",
  description: "Styling and UI controls for players",
  badge: "UI Theme",
  badgeColor: "ui",
  sections: [
    {
      id: "ui-quick-start",
      title: "Quick Start",
      content: [
        {
          type: "text",
          text: "Ships standard control bars and styles. Require importing `@nurav/player-ui/styles` once to make React controls visible.",
        },
        {
          type: "code",
          lang: "tsx",
          code: `import "@nurav/player-ui/styles";`,
        },
      ],
    },
  ],
};

export const DOCS_PACKAGES_V0_0_3: DocPackage[] = [
  playerReactV03,
  playerCoreV03,
  playerUiV03,
];
