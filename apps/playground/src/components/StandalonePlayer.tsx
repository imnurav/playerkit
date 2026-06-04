import { HlsPlayer, YoutubePlayer } from "@nurav/player-react";
import type { PlayerObjectFit } from "@nurav/player-react";
import { isYoutubeUrl } from "@nurav/player-core";
import { useState, useEffect } from "react";
import "./StandalonePlayer.css";

// Helper to parse query parameters from both standard search query and hash query
function getMergedQueryParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);

  // Parse parameters from hash if present (e.g., #/player?src=...)
  const hash = window.location.hash;
  if (hash.includes("?")) {
    const hashQuery = hash.split("?")[1];
    const hashParams = new URLSearchParams(hashQuery);
    for (const [key, value] of hashParams.entries()) {
      params.set(key, value);
    }
  }

  return params;
}

export function StandalonePlayer() {
  const [config, setConfig] = useState(() => {
    const params = getMergedQueryParams();
    // Strip quotes if they were added (e.g., src="url" or src='url')
    let rawSrc = params.get("src") ?? "";
    if (
      (rawSrc.startsWith('"') && rawSrc.endsWith('"')) ||
      (rawSrc.startsWith("'") && rawSrc.endsWith("'"))
    ) {
      rawSrc = rawSrc.slice(1, -1);
    }

    return {
      src: rawSrc,
      accentColor: params.get("accentColor") ?? "#2e3192",
      lowLatency: params.get("lowLatency") === "true",
      autoPlay: params.get("autoPlay") !== "false",
      muted: params.get("muted") === "true",
      customRates: params.get("customRates") === "true",
      disableDevOptions: params.get("disableDevOptions") === "true",
      debugTouchZones: params.get("debugTouchZones") === "true",
      poster: params.get("poster") ?? "",
      seekStep: params.get("seekStep") ? Number(params.get("seekStep")) : 10,
      liveSyncDuration: params.get("liveSyncDuration")
        ? Number(params.get("liveSyncDuration"))
        : 3,
      customization: {
        showPlayButton: params.get("showPlayButton") === "true",
        showTimeDisplay: params.get("showTimeDisplay") !== "false",
        showSettings: params.get("showSettings") !== "false",
        showFullscreen: params.get("showFullscreen") !== "false",
        showCenterOverlay: params.get("showCenterOverlay") !== "false",
        showObjectFitButton: params.get("showObjectFitButton") !== "false",
        volumeControl: (params.get("volumeControl") ?? "vertical") as
          | "horizontal"
          | "vertical"
          | "hidden",
        centerOverlayGap: params.get("centerOverlayGap")
          ? Number(params.get("centerOverlayGap"))
          : 80,
        objectFit: (params.get("objectFit") ?? "contain") as PlayerObjectFit,
      },
      centerIconScale: params.get("centerIconScale")
        ? Number(params.get("centerIconScale"))
        : 1.0,
    };
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_PLAYGROUND_CONFIG") {
        setConfig(event.data.config);
        const { safeAreaTop = 0, safeAreaBottom = 0 } = event.data.config;
        document.documentElement.style.setProperty(
          "--safe-area-top",
          `${safeAreaTop}px`,
        );
        document.documentElement.style.setProperty(
          "--safe-area-bottom",
          `${safeAreaBottom}px`,
        );
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const params = getMergedQueryParams();
    const safeAreaTop = params.get("safeAreaTop") || "0";
    const safeAreaBottom = params.get("safeAreaBottom") || "0";
    document.documentElement.style.setProperty(
      "--safe-area-top",
      `${safeAreaTop}px`,
    );
    document.documentElement.style.setProperty(
      "--safe-area-bottom",
      `${safeAreaBottom}px`,
    );
  }, []);

  const isYt = isYoutubeUrl(config.src);

  // If no source is provided, show a premium placeholder
  if (!config.src) {
    return (
      <div className="standalone-fallback-container">
        <div className="standalone-fallback-card">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="standalone-fallback-icon"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <h2 className="standalone-fallback-title">
            No Player Source Provided
          </h2>
          <p className="standalone-fallback-desc">
            Please provide a valid stream URL or YouTube ID. E.g.:
            <br />
            <code className="standalone-fallback-code">
              /player?src=YOUR_STREAM_URL
            </code>
          </p>
        </div>
      </div>
    );
  }

  return isYt ? (
    <YoutubePlayer
      src={config.src}
      theme="kgs"
      controls
      autoPlay={config.autoPlay}
      seekStep={config.seekStep}
      playbackRates={
        config.customRates ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5] : undefined
      }
      disableDevOptions={config.disableDevOptions}
      debugTouchZones={config.debugTouchZones}
      poster={config.poster || undefined}
      customization={config.customization}
      themeOverrides={{
        "--vp-accent": config.accentColor,
        ...(config.centerIconScale !== 1.0
          ? {
              "--vp-center-play-size": `${(4.0 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-play-icon-size": `${(1.71 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-seek-size": `${(3.0 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-seek-icon-size": `${(1.28 * config.centerIconScale).toFixed(2)}em`,
            }
          : {}),
      }}
      style={{ width: "100%", height: "100%" }}
      onPlayerReady={(player) => {
        const unsub = player.subscribe((state) => {
          window.parent.postMessage({ type: "PLAYER_STATE", state }, "*");
        });
        return () => unsub();
      }}
    />
  ) : (
    <HlsPlayer
      src={config.src}
      theme="kgs"
      controls
      autoPlay={config.autoPlay}
      live={{
        lowLatency: config.lowLatency,
        syncDuration: config.liveSyncDuration,
      }}
      muted={config.muted}
      seekStep={config.seekStep}
      playbackRates={
        config.customRates ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5] : undefined
      }
      disableDevOptions={config.disableDevOptions}
      debugTouchZones={config.debugTouchZones}
      poster={config.poster || undefined}
      customization={config.customization}
      themeOverrides={{
        "--vp-accent": config.accentColor,
        ...(config.centerIconScale !== 1.0
          ? {
              "--vp-center-play-size": `${(4.0 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-play-icon-size": `${(1.71 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-seek-size": `${(3.0 * config.centerIconScale).toFixed(2)}em`,
              "--vp-center-seek-icon-size": `${(1.28 * config.centerIconScale).toFixed(2)}em`,
            }
          : {}),
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
