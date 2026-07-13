import { StandalonePlayer } from "./components/StandalonePlayer";
import { preloadYouTubeApi } from "@playerkit/core";
import { createRoot } from "react-dom/client";

// Start loading YouTube API + warm up connections ASAP, before React renders
preloadYouTubeApi();

createRoot(document.getElementById("root")!).render(<StandalonePlayer />);
