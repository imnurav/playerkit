import type { PlayerCustomization, PlayerObjectFit } from "@playerkit/ui";
import type { PlayerControls, PlayerSnapshot } from "@playerkit/core";
import { useState, useEffect, useRef, useCallback } from "react";
import { SOURCES, VIEWPORTS } from "../constants";
import type { ViewportId } from "../types";

export function usePlayground() {
  // Helper to parse query params inside state initializers
  const getQueryParam = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    const query = new URLSearchParams(window.location.search);
    return query.get(key);
  };

  const [src, setSrc] = useState(() => {
    return getQueryParam("src") || SOURCES[0]?.src || "";
  });
  const [customSrc, setCustomSrc] = useState(() => {
    const qSrc = getQueryParam("src");
    if (qSrc && !SOURCES.some((s) => s.src === qSrc)) {
      return qSrc;
    }
    return "";
  });
  const [viewportId, setViewportId] = useState<ViewportId>("desktop");
  const [landscape, setLandscape] = useState(false);

  // God-Level Customizations & Engine State
  const [accentColor, setAccentColor] = useState(() => {
    return getQueryParam("accentColor") || "#2e3192";
  });
  const [customColorText, setCustomColorText] = useState(() => {
    return getQueryParam("accentColor") || "";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 1024;
  });
  const [lowLatency, setLowLatency] = useState(() => {
    const qLL = getQueryParam("lowLatency");
    return qLL ? qLL === "true" : true;
  });
  const [autoPlay, setAutoPlay] = useState(() => {
    const qAP = getQueryParam("autoPlay");
    return qAP ? qAP === "true" : true;
  });
  const [muted, setMuted] = useState(() => {
    const qMute = getQueryParam("muted");
    return qMute ? qMute === "true" : false;
  });
  const [customRates, setCustomRates] = useState(() => {
    const qRates = getQueryParam("customRates");
    return qRates ? qRates === "true" : false;
  });
  const [disableDevOptions, setDisableDevOptions] = useState(() => {
    const qDev = getQueryParam("disableDevOptions");
    return qDev ? qDev === "true" : false;
  });
  const [debugTouchZones, setDebugTouchZones] = useState(() => {
    const qZone = getQueryParam("debugTouchZones");
    return qZone ? qZone === "true" : false;
  });
  const [poster, setPoster] = useState(() => {
    return getQueryParam("poster") || "";
  });
  const [seekStep, setSeekStep] = useState(() => {
    const qSeek = getQueryParam("seekStep");
    return qSeek ? Number(qSeek) : 10;
  });
  const [liveSyncDuration, setLiveSyncDuration] = useState(() => {
    const qSync = getQueryParam("liveSyncDuration");
    return qSync ? Number(qSync) : 5;
  });

  // Token Auth
  const [videoId, setVideoId] = useState(() => {
    return getQueryParam("videoId") || "";
  });
  const [useTokenAuth, setUseTokenAuth] = useState(() => {
    const q = getQueryParam("useTokenAuth");
    return q ? q === "true" : false;
  });
  const [centerIconScale, setCenterIconScale] = useState(() => {
    const q = getQueryParam("centerIconScale");
    return q ? Number(q) : 1.0;
  });

  // Player State Visualization State
  const [playerState, setPlayerState] = useState<PlayerSnapshot | null>(null);
  const [activePlayer, setActivePlayer] = useState<PlayerControls | null>(null);

  // Interaction feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Mobile layout detection for UI drawer behaviour
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 1024;
  });

  // Visual UI Customization Flags
  const [customization, setCustomization] = useState<PlayerCustomization>(
    () => {
      const qPlay = getQueryParam("showPlayButton");
      const qVol = getQueryParam("volumeControl");
      const qGap = getQueryParam("centerOverlayGap");
      const qFit = getQueryParam("objectFit");
      return {
        showPlayButton: qPlay === "true",
        showTimeDisplay: true,
        showSettings: true,
        showFullscreen: true,
        showCenterOverlay: true,
        showObjectFitButton: true,
        volumeControl:
          (qVol as "horizontal" | "vertical" | "hidden") || "vertical",
        centerOverlayGap: qGap ? Number(qGap) : 80,
        objectFit: (qFit as PlayerObjectFit) || "contain",
      };
    },
  );

  const [isHudExpanded, setIsHudExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 768;
  });

  // Helper properties and safe-area variables declared early to avoid TDZ (temporal dead zone)
  const viewport = VIEWPORTS.find((v) => v.id === viewportId)!;
  const frameW = landscape ? viewport.h : viewport.w;
  const frameH = landscape ? viewport.w : viewport.h;

  const isPortraitDevice = viewport.device && !landscape;
  const safeAreaTop = isPortraitDevice ? 34 : 0;
  const safeAreaBottom = isPortraitDevice ? 16 : 0;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync state to iframe when customizers change dynamically without reloading iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    const config = {
      src,
      accentColor,
      lowLatency,
      autoPlay,
      muted,
      customRates,
      disableDevOptions,
      debugTouchZones,
      poster,
      seekStep,
      liveSyncDuration,
      customization,
      centerIconScale,
      safeAreaTop,
      safeAreaBottom,
    };
    iframeRef.current.contentWindow.postMessage(
      { type: "UPDATE_PLAYGROUND_CONFIG", config },
      "*",
    );
  }, [
    src,
    muted,
    autoPlay,
    seekStep,
    lowLatency,
    accentColor,
    customRates,
    safeAreaTop,
    customization,
    safeAreaBottom,
    centerIconScale,
    liveSyncDuration,
    disableDevOptions,
    debugTouchZones,
    poster,
  ]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobileScreen(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Default to drawer closed on mobile/tablet
      } else {
        setIsSidebarOpen(true); // Default to open sidebar on desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen for iframe state post messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PLAYER_STATE") {
        setPlayerState(event.data.state);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!activePlayer) return;
    if (viewportId === "desktop" || isMobileScreen) {
      const unsub = activePlayer.subscribe((state) => {
        setPlayerState(state);
      });
      return () => unsub();
    }
    return;
  }, [activePlayer, viewportId, isMobileScreen]);

  // Action callbacks that reset player metrics on user interactions to prevent stale data
  const changeSrc = useCallback(
    (newSrc: string) => {
      setSrc(newSrc);
      if (!isMobileScreen) {
        setPlayerState(null);
        setActivePlayer(null);
      }
    },
    [isMobileScreen],
  );

  const changeViewportId = useCallback(
    (id: ViewportId) => {
      setViewportId(id);
      if (!isMobileScreen) {
        setPlayerState(null);
        setActivePlayer(null);
      }
    },
    [isMobileScreen],
  );

  // Reset all options to default state
  const handleReset = useCallback(() => {
    setSrc(SOURCES[0]?.src || "");
    setCustomSrc("");
    setAccentColor("#2e3192");
    setCustomColorText("");
    setLowLatency(true);
    setAutoPlay(true);
    setMuted(false);
    setCustomRates(false);
    setDisableDevOptions(false);
    setDebugTouchZones(false);
    setPoster("");
    setSeekStep(10);
    setLiveSyncDuration(3);
    setVideoId("");
    setUseTokenAuth(false);
    setPlayerState(null);
    setActivePlayer(null);
    setCustomization({
      showPlayButton: false,
      showTimeDisplay: true,
      showSettings: true,
      showFullscreen: true,
      showCenterOverlay: true,
      showObjectFitButton: true,
      volumeControl: "vertical",
      centerOverlayGap: 80,
      objectFit: "contain",
    });
    setCenterIconScale(1.0);
  }, []);

  // Copy HlsPlayer React initialization code snippet
  const copyReactCode = useCallback(() => {
    const tokenLine =
      useTokenAuth && videoId
        ? `\n  tokenFetcher={async ({ signal }) => {\n    const res = await fetch(\n      \`https://api.khanglobalstudies.com/v4/courses/video/\${${videoId}}\`,\n      { signal },\n    );\n    const data = await res.json();\n    return { url: data.video_url };\n  }}`
        : "";
    const overridesLines = [
      `"--pk-accent": "${accentColor}"`,
      centerIconScale !== 1.0
        ? `"--pk-center-play-size": "${(4.0 * centerIconScale).toFixed(2)}em"`
        : "",
      centerIconScale !== 1.0
        ? `"--pk-center-play-icon-size": "${(1.71 * centerIconScale).toFixed(2)}em"`
        : "",
      centerIconScale !== 1.0
        ? `"--pk-center-seek-size": "${(3.0 * centerIconScale).toFixed(2)}em"`
        : "",
      centerIconScale !== 1.0
        ? `"--pk-center-seek-icon-size": "${(1.28 * centerIconScale).toFixed(2)}em"`
        : "",
    ]
      .filter(Boolean)
      .join(",\n    ");

    const code = `<HlsPlayer
  src="${src}"${tokenLine}
  theme="default"
  autoPlay={${autoPlay}}
  muted={${muted}}
  lowLatency={${lowLatency}}
  seekStep={${seekStep}}
  disableDevOptions={${disableDevOptions}}
  debugTouchZones={${debugTouchZones}}${poster ? `\n  poster="${poster}"` : ""}
  liveSyncDuration={${liveSyncDuration}}
  playbackRates={${customRates ? "[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]" : "undefined"}}
  themeOverrides={{
    ${overridesLines}
  }}
  customization={{
    showPlayButton: ${customization.showPlayButton},
    showTimeDisplay: ${customization.showTimeDisplay},
    showSettings: ${customization.showSettings},
    showFullscreen: ${customization.showFullscreen},
    showCenterOverlay: ${customization.showCenterOverlay},
    showObjectFitButton: ${customization.showObjectFitButton},
    volumeControl: "${customization.volumeControl}",
    centerOverlayGap: ${customization.centerOverlayGap},
    objectFit: "${customization.objectFit}"
  }}
/>`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [
    src,
    accentColor,
    autoPlay,
    muted,
    lowLatency,
    seekStep,
    liveSyncDuration,
    customRates,
    disableDevOptions,
    customization,
    useTokenAuth,
    videoId,
    centerIconScale,
    debugTouchZones,
    poster,
  ]);

  // Copy shareable custom URL
  const copyShareLink = useCallback(() => {
    const shareUrl =
      `${window.location.origin}${window.location.pathname}?src=${encodeURIComponent(src)}` +
      `&accentColor=${encodeURIComponent(accentColor)}` +
      `&lowLatency=${lowLatency}` +
      `&autoPlay=${autoPlay}` +
      `&muted=${muted}` +
      `&customRates=${customRates}` +
      `&disableDevOptions=${disableDevOptions}` +
      `&debugTouchZones=${debugTouchZones}` +
      `&poster=${encodeURIComponent(poster)}` +
      `&seekStep=${seekStep}` +
      `&liveSyncDuration=${liveSyncDuration}` +
      `&useTokenAuth=${useTokenAuth}` +
      `&videoId=${videoId}` +
      `&centerIconScale=${centerIconScale}` +
      `&volumeControl=${customization.volumeControl}` +
      `&centerOverlayGap=${customization.centerOverlayGap}` +
      `&objectFit=${customization.objectFit}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }, [
    src,
    accentColor,
    autoPlay,
    muted,
    lowLatency,
    seekStep,
    liveSyncDuration,
    customRates,
    disableDevOptions,
    debugTouchZones,
    poster,
    customization,
    useTokenAuth,
    videoId,
    centerIconScale,
  ]);

  // Build sandboxed iframe URL with embedded state query params
  const playerIframeUrl =
    `/player.html?src=${encodeURIComponent(src)}` +
    `&accentColor=${encodeURIComponent(accentColor)}` +
    `&lowLatency=${lowLatency}` +
    `&autoPlay=${autoPlay}` +
    `&muted=${muted}` +
    `&customRates=${customRates}` +
    `&disableDevOptions=${disableDevOptions}` +
    `&debugTouchZones=${debugTouchZones}` +
    `&poster=${encodeURIComponent(poster)}` +
    `&seekStep=${seekStep}` +
    `&liveSyncDuration=${liveSyncDuration}` +
    `&showPlayButton=${customization.showPlayButton}` +
    `&showTimeDisplay=${customization.showTimeDisplay}` +
    `&showSettings=${customization.showSettings}` +
    `&showFullscreen=${customization.showFullscreen}` +
    `&showCenterOverlay=${customization.showCenterOverlay}` +
    `&showObjectFitButton=${customization.showObjectFitButton}` +
    `&volumeControl=${customization.volumeControl}` +
    `&centerOverlayGap=${customization.centerOverlayGap}` +
    `&objectFit=${customization.objectFit}` +
    `&centerIconScale=${centerIconScale}` +
    `&safeAreaTop=${safeAreaTop}` +
    `&safeAreaBottom=${safeAreaBottom}`;

  return {
    src,
    setSrc: changeSrc,
    customSrc,
    setCustomSrc,
    viewportId,
    setViewportId: changeViewportId,
    landscape,
    setLandscape,
    accentColor,
    setAccentColor,
    customColorText,
    setCustomColorText,
    isSidebarOpen,
    setIsSidebarOpen,
    lowLatency,
    setLowLatency,
    autoPlay,
    setAutoPlay,
    muted,
    setMuted,
    customRates,
    setCustomRates,
    disableDevOptions,
    setDisableDevOptions,
    debugTouchZones,
    setDebugTouchZones,
    poster,
    setPoster,
    seekStep,
    setSeekStep,
    liveSyncDuration,
    setLiveSyncDuration,
    videoId,
    setVideoId,
    useTokenAuth,
    setUseTokenAuth,
    playerState,
    activePlayer,
    setActivePlayer,
    copiedCode,
    copiedShare,
    isMobileScreen,
    customization,
    setCustomization,
    iframeRef,
    handleReset,
    copyReactCode,
    copyShareLink,
    viewport,
    frameW,
    frameH,
    playerIframeUrl,
    isHudExpanded,
    setIsHudExpanded,
    centerIconScale,
    setCenterIconScale,
  };
}
