import { preloadYouTubeApi } from "@playerkit/core";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Root } from "./Root.tsx";
import "./index.css";

// Start loading YouTube API + warm up connections ASAP, before React renders
preloadYouTubeApi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
