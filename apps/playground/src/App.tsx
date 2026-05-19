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

function App() {
  const [src, setSrc] = useState(sources[0].src);
  const [theme, setTheme] = useState<PlayerThemeName>("default");

  return (
    <main className="app-shell">
      <section className="player-panel">
        <HlsPlayer src={src} theme={theme} className="playground-player" />

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
      </section>
    </main>
  );
}

export default App;
