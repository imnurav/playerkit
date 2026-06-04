import type { Source, Viewport, AccentColor } from "./types";

export const SOURCES: Source[] = [
  // ── YouTube ──────────────────────────────────────────────────────────────
  {
    category: "youtube",
    label: "NASA | Thermonuclear Art – The Sun in 4K",
    src: "https://www.youtube-nocookie.com/embed/6tmbeLTHC_0",
    description:
      "Stunning 4K footage of the Sun captured by NASA's Solar Dynamics Observatory",
  },
  {
    category: "youtube",
    label: "Google Project Astra – Multimodal AI Demo",
    src: "https://www.youtube.com/watch?v=nDsJg43nKUA",
    description:
      "Official Google demonstration of the Gemini-powered real-time assistant",
  },
  {
    category: "youtube",
    label: "Aaj Tak News Live (DVR Enabled 🟢)",
    src: "https://www.youtube.com/watch?v=Io-G_aiF8HA",
    description:
      "Live news channel stream with DVR support (allows seeking and scrubbing back)",
  },
  {
    category: "youtube",
    label: "Sky News Live (DVR Disabled 🔴)",
    src: "https://www.youtube.com/watch?v=YDvsBbKfLPA",
    description:
      "Live news channel stream without DVR support (progress bar disabled & locked at 100%)",
  },

  // ── HLS Live ─────────────────────────────────────────────────────────────
  {
    category: "hls-live",
    label: "Apple Bipbop (fMP4)",
    src: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    description: "Apple's official HLS reference test stream in fragmented MP4",
  },
  {
    category: "hls-live",
    label: "NASA TV (Public Live)",
    src: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
    description: "NASA public live TV stream via Akamai CDN",
  },
  {
    category: "hls-live",
    label: "Akamai Multi-rate Live",
    src: "https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8",
    description: "Multi-bitrate live HLS stream hosted on Akamai",
  },

  // ── HLS VOD ──────────────────────────────────────────────────────────────
  {
    category: "hls-vod",
    label: "Tears of Steel",
    src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/teears-of-steel.ism/.m3u8",
    description: "Blender open-movie served via Unified Streaming",
  },
  {
    category: "hls-vod",
    label: "Big Buck Bunny",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Classic open-source animation served via Mux test CDN",
  },

  // ── Error / Edge-case ────────────────────────────────────────────────────
  {
    category: "error",
    label: "KGS — Expired Token (Auth Error)",
    src: "https://kgs-new-v1.akamaized.net/kv3/mar-2025/201684/kgss-1740969834-v201684.m3u8?hdnts=exp=1740969834~acl=/kv3/mar-2025/201684/*~data=ttl=10800~hmac=2d4a95108c34bfbc5635e445a2bee437250fc0f941063a61aa7bf5e5ffae89ea",
    description: "Real KGS stream with an expired token — triggers auth error",
  },
  {
    category: "error",
    label: "404 — Stream Not Found",
    src: "https://stream-kgs.akamaized.net/hls/kgss-1779427836-v573443-broken-nonexistent-999.m3u8",
    description: "Non-existent stream path — triggers 404 network error",
  },
  {
    category: "error",
    label: "Invalid Domain",
    src: "https://invalid-domain-name-that-does-not-exist.com/stream.m3u8",
    description:
      "Points to a non-existent domain — triggers DNS resolution failure",
  },
  {
    category: "error",
    label: "Empty URL",
    src: "   ",
    description: "Blank/whitespace-only URL — tests empty src handling",
  },
];

export const VIEWPORTS: Viewport[] = [
  { id: "desktop", label: "Desktop", w: null, h: null, device: false },
  { id: "tablet", label: "Tablet", w: 768, h: 1024, device: true },
  { id: "phone", label: "Phone", w: 390, h: 844, device: true },
  { id: "small", label: "Small", w: 320, h: 568, device: true },
];

export const ACCENT_COLORS: AccentColor[] = [
  { label: "KGS Blue", value: "#2e3192" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Emerald", value: "#10b981" },
  { label: "Hot Rose", value: "#ec4899" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Sky Cool", value: "#0ea5e9" },
];
