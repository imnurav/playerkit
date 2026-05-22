import type { PlayerThemeName, PlayerCustomization } from "@varun/player-ui";
import { HlsPlayer } from "@varun/player-react";
import { useState } from "react";
import "./App.css";

const sources = [
  {
    label: "Live video (DVR)",
    // src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    src: "https://stream-kgs.akamaized.net/hls/kgss-1779427836-v573443.m3u8"
  },
  {
    label: "Sintel",
    src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  },
  {
    label: "Live",
    src: "http://192.168.1.11:8888/live/test/index.m3u8",
  },
  {
    label: "KGS Stream",
    src: "https://kgs-new-v1.akamaized.net/kv3/mar-2025/201684/kgss-1740969834-v201684.m3u8?hdnts=exp=1779199454~acl=/kv3/mar-2025/201684/*~data=ttl=10800~hmac=2d4a95108c34bfbc5635e445a2bee437250fc0f941063a61aa7bf5e5ffae89ea",
  },
];

const themes: { name: PlayerThemeName; label: string; color: string }[] = [
  { name: "kgs", label: "KGS", color: "#020887" },
  { name: "default", label: "Default", color: "#38bdf8" },
  { name: "netflix", label: "Netflix", color: "#e50914" },
  { name: "youtube", label: "YouTube", color: "#ff0000" },
  { name: "hotstar", label: "Hotstar", color: "#1f80e0" },
  { name: "prime", label: "Prime", color: "#00a8e0" },
];

type ViewportId = "desktop" | "tablet" | "phone" | "small";

type Viewport = {
  id: ViewportId;
  label: string;
  w: number | null;
  h: number | null;
  device: boolean;
};

const viewports: Viewport[] = [
  { id: "desktop", label: "Desktop", w: null, h: null, device: false },
  { id: "tablet", label: "Tablet", w: 768, h: 1024, device: true },
  { id: "phone", label: "Phone", w: 390, h: 844, device: true },
  { id: "small", label: "Small", w: 320, h: 568, device: true },
];

// SVG icons
const IconRotate = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconDesktop = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
const IconTablet = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconPhone = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconSmall = () => (
  <svg
    width="14"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const viewportIcons: Record<ViewportId, React.ReactNode> = {
  desktop: <IconDesktop />,
  tablet: <IconTablet />,
  phone: <IconPhone />,
  small: <IconSmall />,
};

function App() {
  const [src, setSrc] = useState(sources[0].src);
  const [theme, setTheme] = useState<PlayerThemeName>("kgs");
  const [viewportId, setViewportId] = useState<ViewportId>("desktop");
  const [landscape, setLandscape] = useState(false);

  // Customization state
  const [customization, setCustomization] = useState<PlayerCustomization>({
    showPlayButton: true,
    showTimeDisplay: true,
    showSettings: true,
    showFullscreen: true,
    showCenterOverlay: true,
    showObjectFitButton: true,
    volumeControl: "horizontal",
    centerOverlayGap: 80,
  });

  const updateCustomization = <K extends keyof PlayerCustomization>(
    key: K,
    value: PlayerCustomization[K],
  ) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  };

  // Reset orientation when switching viewport
  const handleViewportChange = (id: ViewportId) => {
    setViewportId(id);
    setLandscape(false);
  };

  const viewport = viewports.find((v) => v.id === viewportId)!;
  const activeTheme = themes.find((t) => t.name === theme)!;

  // When landscape, swap w/h
  const frameW = landscape ? viewport.h : viewport.w;
  const frameH = landscape ? viewport.w : viewport.h;

  // URL for the mobile iframe — player.html patches touch APIs before React mounts
  const playerIframeUrl = `/player.html?src=${encodeURIComponent(src)}&theme=${encodeURIComponent(theme)}`;

  return (
    <div className="pg-shell">
      {/* ── Sidebar ── */}
      <aside className="pg-sidebar">
        <div className="pg-logo">
          <span className="pg-logo-mark">▶</span>
          <span>HLS Playground</span>
        </div>

        <nav className="pg-nav">
          {/* Source */}
          <section className="pg-section">
            <h2 className="pg-section-title">Source</h2>
            <div className="pg-source-list">
              {sources.map((s) => (
                <button
                  key={s.src}
                  type="button"
                  className={`pg-source-btn ${s.src === src ? "is-active" : ""}`}
                  onClick={() => setSrc(s.src)}
                >
                  <span className="pg-source-dot" />
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section className="pg-section">
            <h2 className="pg-section-title">Theme</h2>
            <div className="pg-theme-list">
              {themes.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  className={`pg-theme-btn ${t.name === theme ? "is-active" : ""}`}
                  onClick={() => setTheme(t.name)}
                  style={{ "--theme-color": t.color } as React.CSSProperties}
                >
                  <span className="pg-theme-swatch" />
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* Viewport */}
          <section className="pg-section">
            <h2 className="pg-section-title">Viewport</h2>
            <div className="pg-viewport-list">
              {viewports.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`pg-viewport-btn ${v.id === viewportId ? "is-active" : ""}`}
                  onClick={() => handleViewportChange(v.id)}
                >
                  {viewportIcons[v.id]}
                  <span>{v.label}</span>
                  {v.w && <span className="pg-viewport-size">{v.w}px</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Customization */}
          <section className="pg-section">
            <h2 className="pg-section-title">Customization</h2>
            <div className="pg-custom-list">
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showPlayButton}
                  onChange={(e) =>
                    updateCustomization("showPlayButton", e.target.checked)
                  }
                />
                <span>Play Button</span>
              </label>
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showTimeDisplay}
                  onChange={(e) =>
                    updateCustomization("showTimeDisplay", e.target.checked)
                  }
                />
                <span>Time Display</span>
              </label>
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showSettings}
                  onChange={(e) =>
                    updateCustomization("showSettings", e.target.checked)
                  }
                />
                <span>Settings</span>
              </label>
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showFullscreen}
                  onChange={(e) =>
                    updateCustomization("showFullscreen", e.target.checked)
                  }
                />
                <span>Fullscreen</span>
              </label>
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showCenterOverlay}
                  onChange={(e) =>
                    updateCustomization("showCenterOverlay", e.target.checked)
                  }
                />
                <span>Center Overlay</span>
              </label>
              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={customization.showObjectFitButton}
                  onChange={(e) =>
                    updateCustomization("showObjectFitButton", e.target.checked)
                  }
                />
                <span>Fit Button</span>
              </label>
              <label className="pg-toggle">
                <span>Volume</span>
                <select
                  value={customization.volumeControl}
                  onChange={(e) =>
                    updateCustomization(
                      "volumeControl",
                      e.target.value as "horizontal" | "vertical" | "hidden",
                    )
                  }
                  className="pg-select"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <label className="pg-toggle">
                <span>Overlay Gap</span>
                <input
                  type="range"
                  min={16}
                  max={80}
                  value={customization.centerOverlayGap ?? 36}
                  onChange={(e) =>
                    updateCustomization(
                      "centerOverlayGap",
                      Number(e.target.value),
                    )
                  }
                  className="pg-range"
                />
                <span className="pg-range-value">
                  {customization.centerOverlayGap}px
                </span>
              </label>
              <label className="pg-toggle">
                <span>Video Fit</span>
                <select
                  value={customization.objectFit ?? "contain"}
                  onChange={(e) =>
                    updateCustomization(
                      "objectFit",
                      e.target.value as "contain" | "cover" | "fill",
                    )
                  }
                  className="pg-select"
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill (Stretch)</option>
                </select>
              </label>
            </div>
          </section>
        </nav>

        {/* Footer info */}
        <div className="pg-sidebar-footer">
          {viewport.w ? (
            <div className="pg-info-chip">
              {frameW} × {frameH}px
            </div>
          ) : (
            <div className="pg-info-chip">Fluid</div>
          )}
          <div className="pg-info-chip" style={{ color: activeTheme.color }}>
            {activeTheme.label}
          </div>
        </div>
      </aside>

      {/* ── Preview area ── */}
      <main className="pg-preview">
        {/* Rotate button — only for device frames */}
        {viewport.device && (
          <button
            type="button"
            className={`pg-rotate-btn ${landscape ? "is-landscape" : ""}`}
            onClick={() => setLandscape((l) => !l)}
            title={landscape ? "Switch to portrait" : "Switch to landscape"}
          >
            <IconRotate />
            {landscape ? "Portrait" : "Landscape"}
          </button>
        )}
        {viewport.device ? (
          /* ─ Device frame ─ */
          <div className="pg-device-scene">
            <div
              className={`pg-device-frame ${landscape ? "is-landscape" : ""}`}
              style={{
                width: `${frameW}px`,
                height: `${frameH}px`,
              }}
            >
              {/* notch */}
              <div className="pg-device-notch" />
              {/* screen */}
              <div className="pg-device-screen">
                <iframe
                  key={playerIframeUrl}
                  src={playerIframeUrl}
                  className="pg-player-iframe"
                  title="Mobile player preview"
                  allow="autoplay"
                />
              </div>
              {/* home bar */}
              <div className="pg-device-homebar" />
            </div>
          </div>
        ) : (
          /* ─ Desktop preview ─ */
          <div className="pg-desktop-scene">
            <HlsPlayer
              autoPlay
              controls
              src={src}

              // tokenFetcher={async () => {
              //   // Example token fetcher for authenticated streams (e.g. Akamai)
              //   const res = await fetch("/api/video/token", {
              //     method: "POST",
              //     body: JSON.stringify({ url: src }),
              //   });
              //   const { video_url, token } = await res.json();
              //   return { url: `${video_url}?${token}` };
              // }}
              theme={theme}
              className="pg-player"
              customization={customization}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
