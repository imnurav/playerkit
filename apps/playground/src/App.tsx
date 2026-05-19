import type { PlayerThemeName } from "@varun/player-themes";
import { HlsPlayer } from "@varun/player-react";
import { useState } from "react";
import "./App.css";

const sources = [
  {
    label: "Mux test stream",
    src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  },
  {
    label: "Sintel adaptive",
    src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  },
  { label: "Live stream", src: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8" },
];

const themes: PlayerThemeName[] = ["default", "netflix", "youtube", "hotstar", "prime"];

const viewports = [
  { label: "Desktop", width: "100%" },
  { label: "Phone", width: "375px" },
  { label: "Small Phone", width: "320px" },
];

function App() {
  const [src, setSrc] = useState(sources[0].src);
  const [theme, setTheme] = useState<PlayerThemeName>("default");
  const [viewport, setViewport] = useState("100%");

  const isMobilePreview = viewport !== "100%";

  return (
    <main className="app-shell">
      <section className="player-panel">
        <div className="player-wrapper" style={{ maxWidth: viewport, marginInline: isMobilePreview ? "0 auto" : "0" }}>
          <HlsPlayer src={src} theme={'prime'} className="playground-player" />
        </div>

        <div className="option-row">
          {sources.map((source) => (
            <button
              key={source.src}
              type="button"
              className={source.src === src ? "is-active" : ""}
              onClick={() => setSrc(source.src)}
            >
              {source.label}
            </button>
          ))}
        </div>

        <div className="option-row">
          {themes.map((themeName) => (
            <button
              key={themeName}
              type="button"
              className={themeName === theme ? "is-active" : ""}
              onClick={() => setTheme(themeName)}
            >
              {themeName}
            </button>
          ))}
        </div>

        <div className="option-row">
          <span className="option-label">Viewport:</span>
          {viewports.map((v) => (
            <button
              key={v.width}
              type="button"
              className={v.width === viewport ? "is-active" : ""}
              onClick={() => setViewport(v.width)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
