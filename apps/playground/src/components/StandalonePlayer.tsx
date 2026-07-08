import { buildKgsTokenFetcher, buildKgsTokenRefresher } from "../lib/kgsAuth";
import type { PlayerObjectFit } from "@playerkit/react";
import { getMergedQueryParams, stripQuotes } from "../lib/queryParams";
import { Player } from "@playerkit/react";
import type { PlayerControls } from "@playerkit/react";
import { useEffect, useMemo } from "react";
import { IconPlay } from "../icons/index";
import "./StandalonePlayer.css";

// ─── Config parsing ───────────────────────────────────────────────────────────

function parseConfig() {
  const p = getMergedQueryParams();

  return {
    src: stripQuotes(p.get("src") ?? ""),
    videoId: stripQuotes(p.get("videoId") ?? ""),
    authToken: stripQuotes(p.get("authToken") ?? ""),
    accentColor: p.get("accentColor") ?? "#2e3192",
    lowLatency: p.get("lowLatency") === "true",
    autoPlay: p.get("autoPlay") !== "false",
    muted: p.get("muted") === "true",
    customRates: p.get("customRates") === "true",
    disableDevOptions: p.get("disableDevOptions") === "true",
    debugTouchZones: p.get("debugTouchZones") === "true",
    poster: p.get("poster") ?? "",
    seekStep: p.get("seekStep") ? Number(p.get("seekStep")) : 10,
    liveSyncDuration: p.get("liveSyncDuration")
      ? Number(p.get("liveSyncDuration"))
      : 3,
    customization: {
      showPlayButton: p.get("showPlayButton") === "true",
      showTimeDisplay: p.get("showTimeDisplay") !== "false",
      showSettings: p.get("showSettings") !== "false",
      showFullscreen: p.get("showFullscreen") !== "false",
      showCenterOverlay: p.get("showCenterOverlay") !== "false",
      showObjectFitButton: p.get("showObjectFitButton") !== "false",
      volumeControl: (p.get("volumeControl") ?? "vertical") as
        | "horizontal"
        | "vertical"
        | "hidden",
      centerOverlayGap: p.get("centerOverlayGap")
        ? Number(p.get("centerOverlayGap"))
        : 80,
      objectFit: (p.get("objectFit") ?? "contain") as PlayerObjectFit,
      mobile: {
        showCenterOverlay: p.get("mobileShowCenterOverlay") !== "false",
      },
    },
    safeAreaTop: p.get("safeAreaTop") ? Number(p.get("safeAreaTop")) : 0,
    safeAreaBottom: p.get("safeAreaBottom")
      ? Number(p.get("safeAreaBottom"))
      : 0,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applySafeArea(top: number, bottom: number) {
  const root = document.documentElement;
  root.style.setProperty("--safe-area-top", `${top}px`);
  root.style.setProperty("--safe-area-bottom", `${bottom}px`);
}

function buildThemeOverrides(config: ReturnType<typeof parseConfig>) {
  const overrides: Record<string, string> = {
    "--pk-accent": config.accentColor,
  };

  const scale = Number(getMergedQueryParams().get("centerIconScale") ?? 1.0);
  if (scale !== 1.0) {
    overrides["--pk-center-play-size"] = `${(4.0 * scale).toFixed(2)}em`;
    overrides["--pk-center-play-icon-size"] = `${(1.71 * scale).toFixed(2)}em`;
    overrides["--pk-center-seek-size"] = `${(3.0 * scale).toFixed(2)}em`;
    overrides["--pk-center-seek-icon-size"] = `${(1.28 * scale).toFixed(2)}em`;
  }

  return overrides;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function NoSourcePlaceholder() {
  return (
    <div className="pg-standalone-error">
      <div className="pg-standalone-error-card">
        <div className="pg-error-icon-wrapper">
          <IconPlay className="pg-error-icon" />
        </div>
        <h3 className="pg-error-title">No Media Source</h3>
        <p className="pg-error-message">
          Provide a video stream URL (HLS / MP4) or a Youtube video URL/ID in
          the playground panel to start playback.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function StandalonePlayer() {
  const config = useMemo(() => parseConfig(), []);

  // Apply safe-area CSS variables from initial URL params
  useEffect(() => {
    applySafeArea(config.safeAreaTop, config.safeAreaBottom);
  }, [config.safeAreaTop, config.safeAreaBottom]);

  const kgsTokenFetcher = useMemo(
    () => (config.videoId ? buildKgsTokenFetcher(config.videoId, config.authToken) : undefined),
    [config.videoId, config.authToken],
  );

  const kgsTokenRefresher = useMemo(
    () =>
      config.videoId && config.authToken
        ? buildKgsTokenRefresher(config.videoId, config.authToken)
        : undefined,
    [config.videoId, config.authToken],
  );

  const effectiveSrc = config.videoId && !config.src ? "" : config.src;
  const themeOverrides = buildThemeOverrides(config);

  const onPlayerReady = (player: PlayerControls) => {
    const unsub = player.subscribe((state) => {
      window.parent.postMessage({ type: "PLAYER_STATE", state }, "*");
    });
    return () => unsub();
  };

  if (!effectiveSrc && !config.videoId) return <NoSourcePlaceholder />;

  return (
    <Player
      src={effectiveSrc}
      tokenFetcher={kgsTokenFetcher}
      tokenRefresher={kgsTokenRefresher}
      theme="default"
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
      themeOverrides={themeOverrides}
      style={{ width: "100%", height: "100%" }}
      onPlayerReady={onPlayerReady}
    />
  );
}
