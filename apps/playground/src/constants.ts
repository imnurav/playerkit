import type { Source, Viewport, AccentColor } from "./types";

export const SOURCES: Source[] = [
  {
    label: "Live Video (DVR)",
    src: "https://stream-kgs.akamaized.net/hls/kgss-1779427836-v573443.m3u8",
  },
  {
    label: "KGS Stream (Expired Token)",
    src: "https://kgs-new-v1.akamaized.net/kv3/mar-2025/201684/kgss-1740969834-v201684.m3u8?hdnts=exp=1740969834~acl=/kv3/mar-2025/201684/*~data=ttl=10800~hmac=2d4a95108c34bfbc5635e445a2bee437250fc0f941063a61aa7bf5e5ffae89ea",
  },
  {
    label: "Error: 404 Stream Not Found",
    src: "https://stream-kgs.akamaized.net/hls/kgss-1779427836-v573443-broken-nonexistent-999.m3u8",
  },
  {
    label: "Error: Invalid Domain Name",
    src: "https://invalid-domain-name-that-does-not-exist.com/stream.m3u8",
  },
  {
    label: "Error: Empty Stream URL",
    src: "   ",
  },
  {
    label: "Correct Stream (Sintel VOD)",
    src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  }
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
  { label: "Sky Cool", value: "#0ea5e9" }
];
