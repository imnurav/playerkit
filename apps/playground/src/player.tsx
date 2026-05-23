import { HlsPlayer } from "@nurav/player-react";
import { createRoot } from "react-dom/client";
import { StrictMode, useState, useEffect } from "react";

export function PlayerApp() {
  const [config, setConfig] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      src: params.get("src") ?? "",
      accentColor: params.get("accentColor") ?? "#2e3192",
      lowLatency: params.get("lowLatency") === "true",
      autoPlay: params.get("autoPlay") !== "false",
      muted: params.get("muted") === "true",
      customRates: params.get("customRates") === "true",
      seekStep: params.get("seekStep") ? Number(params.get("seekStep")) : 10,
      liveSyncDuration: params.get("liveSyncDuration") ? Number(params.get("liveSyncDuration")) : 3,
      customization: {
        showPlayButton: params.get("showPlayButton") !== "false",
        showTimeDisplay: params.get("showTimeDisplay") !== "false",
        showSettings: params.get("showSettings") !== "false",
        showFullscreen: params.get("showFullscreen") !== "false",
        showCenterOverlay: params.get("showCenterOverlay") !== "false",
        showObjectFitButton: params.get("showObjectFitButton") !== "false",
        volumeControl: (params.get("volumeControl") ?? "vertical") as "horizontal" | "vertical" | "hidden",
        centerOverlayGap: params.get("centerOverlayGap") ? Number(params.get("centerOverlayGap")) : 80,
        objectFit: (params.get("objectFit") ?? "contain") as "contain" | "cover" | "fill",
      }
    };
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_PLAYGROUND_CONFIG") {
        setConfig(event.data.config);
        const { safeAreaTop = 0, safeAreaBottom = 0 } = event.data.config;
        document.documentElement.style.setProperty("--safe-area-top", `${safeAreaTop}px`);
        document.documentElement.style.setProperty("--safe-area-bottom", `${safeAreaBottom}px`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const safeAreaTop = params.get("safeAreaTop") || "0";
    const safeAreaBottom = params.get("safeAreaBottom") || "0";
    document.documentElement.style.setProperty("--safe-area-top", `${safeAreaTop}px`);
    document.documentElement.style.setProperty("--safe-area-bottom", `${safeAreaBottom}px`);
  }, []);

  return (
    <HlsPlayer
      src={config.src}
      theme="kgs"
      controls
      autoPlay={config.autoPlay}
      lowLatency={config.lowLatency}
      muted={config.muted}
      seekStep={config.seekStep}
      liveSyncDuration={config.liveSyncDuration}
      playbackRates={config.customRates ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5] : undefined}
      customization={config.customization}
      themeOverrides={{
        "--vp-accent": config.accentColor,
      }}
      style={{ width: "100%", height: "100%" }}
      onPlayerReady={(player) => {
        const unsub = player.subscribe((state) => {
          window.parent.postMessage({ type: "PLAYER_STATE", state }, "*");
        });
        return () => unsub();
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlayerApp />
  </StrictMode>,
);
