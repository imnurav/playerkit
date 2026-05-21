import type { PlayerThemeName } from "@varun/player-ui";
import { HlsPlayer } from "@varun/player-react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

const params = new URLSearchParams(window.location.search);
const src = params.get("src") ?? "";
const theme = (params.get("theme") ?? "default") as PlayerThemeName;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HlsPlayer
      src={src}
      theme={theme}
      controls
      autoPlay
      style={{ width: "100%", height: "100%" }}
    />
  </StrictMode>,
);
