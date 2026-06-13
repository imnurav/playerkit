import type { PlayerObjectFit, HlsPlayerProps } from "@playerkit/react";
import { getMergedQueryParams, stripQuotes } from "../lib/queryParams";
import { isYoutubeUrl, isMp4Url } from "@playerkit/core";
import { buildKgsTokenFetcher } from "../lib/kgsAuth";
import { useState, useEffect, useMemo } from "react";
import { IconPlay } from "../icons/index";
import "./StandalonePlayer.css";
import { HlsPlayer, Mp4Player, YoutubePlayer } from "@playerkit/react";

// ─── Config parsing ───────────────────────────────────────────────────────────

function parseConfig() {
  const p = getMergedQueryParams();

  return {
    src: stripQuotes(p.get("src") ?? ""),
    videoId: stripQuotes(p.get("videoId") ?? ""),
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
        showCenterOverlay: p.get("mobileShowCenterOverlay") === "true",
      },
    },
    centerIconScale: p.get("centerIconScale")
      ? Number(p.get("centerIconScale"))
      : 1.0,
  };
}

type Config = ReturnType<typeof parseConfig>;

// ─── Safe-area sync ───────────────────────────────────────────────────────────

function applySafeArea(top: number, bottom: number) {
  document.documentElement.style.setProperty("--safe-area-top", `${top}px`);
  document.documentElement.style.setProperty(
    "--safe-area-bottom",
    `${bottom}px`,
  );
}

// ─── Theme helpers ────────────────────────────────────────────────────────────

function buildThemeOverrides(config: Config) {
  const { accentColor, centerIconScale } = config;
  return {
    "--pk-accent": accentColor,
    ...(centerIconScale !== 1.0
      ? {
          "--pk-center-play-size": `${(4.0 * centerIconScale).toFixed(2)}em`,
          "--pk-center-play-icon-size": `${(1.71 * centerIconScale).toFixed(2)}em`,
          "--pk-center-seek-size": `${(3.0 * centerIconScale).toFixed(2)}em`,
          "--pk-center-seek-icon-size": `${(1.28 * centerIconScale).toFixed(2)}em`,
        }
      : {}),
  };
}

// ─── Placeholder ─────────────────────────────────────────────────────────────

function NoSourcePlaceholder() {
  return (
    <div className="standalone-fallback-container">
      <div className="standalone-fallback-card">
        <IconPlay className="standalone-fallback-icon" />
        <h2 className="standalone-fallback-title">No Player Source Provided</h2>
        <p className="standalone-fallback-desc">
          Please provide a valid stream URL or video ID. E.g.:
          <br />
          <code className="standalone-fallback-code">
            /player?src=YOUR_STREAM_URL
          </code>
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StandalonePlayer() {
  const [config, setConfig] = useState<Config>(parseConfig);

  // Handle live config updates pushed from the parent playground window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PLAYGROUND_CONFIG") {
        setConfig(event.data.config as Config);
        const { safeAreaTop = 0, safeAreaBottom = 0 } = event.data.config;
        applySafeArea(safeAreaTop, safeAreaBottom);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Apply safe-area CSS variables from initial URL params
  useEffect(() => {
    const p = getMergedQueryParams();
    applySafeArea(
      Number(p.get("safeAreaTop") ?? 0),
      Number(p.get("safeAreaBottom") ?? 0),
    );
  }, []);

  /**
   * KGS token fetcher — built only when a videoId is present.
   * Memoised so HlsPlayer is not re-mounted on every render.
   */
  const kgsTokenFetcher = useMemo(
    () => (config.videoId ? buildKgsTokenFetcher(config.videoId) : undefined),
    [config.videoId],
  );

  /**
   * When a videoId is provided with no src, pass `""` so the tokenFetcher
   * fetches the URL. When a signed src is present alongside a videoId, pass
   * it directly for immediate playback (refresh still handled by tokenFetcher).
   */
  const effectiveSrc = config.videoId && !config.src ? "" : config.src;

  const themeOverrides = buildThemeOverrides(config);

  const onPlayerReady: HlsPlayerProps["onPlayerReady"] = (player) => {
    const unsub = player.subscribe((state) => {
      window.parent.postMessage({ type: "PLAYER_STATE", state }, "*");
    });
    return () => unsub();
  };

  if (!effectiveSrc && !config.videoId) return <NoSourcePlaceholder />;

  // 1. YouTube
  if (isYoutubeUrl(effectiveSrc)) {
    return (
      <YoutubePlayer
        src={effectiveSrc}
        theme="default"
        controls
        autoPlay={config.autoPlay}
        seekStep={config.seekStep}
        playbackRates={
          config.customRates
            ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]
            : undefined
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

  // 2. Progressive MP4 / WebM / OGG / M4V / data: / blob: sources
  if (isMp4Url(effectiveSrc)) {
    return (
      <Mp4Player
        src={effectiveSrc}
        theme="default"
        controls
        autoPlay={config.autoPlay}
        muted={config.muted}
        seekStep={config.seekStep}
        playbackRates={
          config.customRates
            ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]
            : undefined
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

  // 3. HLS (default fallback)
  return (
    <HlsPlayer
      src={effectiveSrc}
      tokenFetcher={kgsTokenFetcher}
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
