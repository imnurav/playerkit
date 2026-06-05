import React, { useState, useEffect, useCallback, useRef } from "react";
import { isYoutubeUrl, type PlayerControls } from "@playerkit/core";
import { HlsPlayer, YoutubePlayer } from "@playerkit/react";
import type { PlayerCustomization } from "@playerkit/ui";
import type { Viewport } from "../types";
import { IconRotate } from "../icons";

interface DeviceSimulatorProps {
  src: string;
  muted: boolean;
  poster: string;
  seekStep: number;
  videoId?: string;
  autoPlay: boolean;
  landscape: boolean;
  viewport: Viewport;
  accentColor: string;
  lowLatency: boolean;
  customRates: boolean;
  frameW: number | null;
  frameH: number | null;
  useTokenAuth?: boolean;
  isMobileScreen: boolean;
  playerIframeUrl: string;
  liveSyncDuration: number;
  centerIconScale?: number;
  disableDevOptions: boolean;
  customization: PlayerCustomization;
  setLandscape?: (landscape: boolean) => void;
  setActivePlayer: (player: PlayerControls | null) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

// Hook to measure element size in real time using ResizeObserver
function useElementSize<T extends HTMLElement>(): [
  React.RefCallback<T>,
  { width: number; height: number },
] {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node !== null) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });
      resizeObserver.observe(node);
      observerRef.current = resizeObserver;
    }
  }, []);
  return [ref, size];
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = React.memo(
  (props) => {
    const {
      landscape,
      viewport,
      frameW,
      frameH,
      iframeRef,
      playerIframeUrl,
      src,
      accentColor,
      lowLatency,
      autoPlay,
      muted,
      poster,
      customRates,
      disableDevOptions,
      seekStep,
      liveSyncDuration,
      customization,
      setActivePlayer,
      setLandscape,
      videoId,
      useTokenAuth,
      centerIconScale,
    } = props;
    const [sceneRef, sceneSize] = useElementSize<HTMLDivElement>();
    const [timeStr, setTimeStr] = useState("09:41");

    // Keep mock clock updated
    useEffect(() => {
      const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        setTimeStr(`${hours}:${minutes}`);
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, []);

    // Compute fitted sizes based on available container dimensions
    // Ensure available dimensions are at least 100px to avoid dividing by 0 or negative scale
    const availW = Math.max(100, sceneSize.width - 48);
    const availH = Math.max(100, sceneSize.height - 48);

    // Bezel width is 16px on each side (total 32px bezel padding & border)
    const outerW = frameW ? frameW + 32 : availW;
    const outerH = frameH ? frameH + 32 : availH;

    let targetW = outerW;
    let targetH = outerH;

    if (viewport.device && frameW && frameH) {
      const scaleW = availW / outerW;
      const scaleH = availH / outerH;

      let scale: number;

      if (landscape) {
        // In landscape, we want it to fit the height to prevent vertical scrolling
        scale = Math.min(scaleW, scaleH, 1);
      } else {
        // In portrait, we enforce a minimum scale of 0.8 to prevent it looking too small.
        // If it overflows the vertical height, the container scrolls vertically.
        scale = Math.min(scaleW, Math.max(0.8, scaleH), 1);
      }

      // Clamp the scale so it never collapses to 0 under extreme constraints
      scale = Math.max(0.5, scale);

      targetW = Math.round(outerW * scale);
      targetH = Math.round(outerH * scale);
    }

    // Symmetrical thin bezel safe area calculations
    const isPortraitDevice = viewport.device && !landscape;
    const safeAreaTop = isPortraitDevice ? 34 : 0;
    const safeAreaBottom = isPortraitDevice ? 16 : 0;

    return (
      <div className="pg-scene-wrapper" ref={sceneRef}>
        {viewport.device ? (
          /* Sandboxed Mobile Device Shell */
          <div className="pg-device-scene">
            <div
              className="pg-device-wrapper"
              style={{
                width: `${targetW}px`,
                height: `${targetH}px`,
              }}
            >
              <div
                className={`pg-device-frame ${landscape ? "is-landscape" : ""}`}
              >
                {/* Speaker Grill / Top bezel details (styled absolutely) */}
                <div className="pg-device-speaker" />

                {/* Screen */}
                <div className="pg-device-screen">
                  {/* Screen Glare Highlight */}
                  <div className="pg-device-screen-glare" />

                  {/* Mock Phone Status Bar - Hidden in landscape to maximize video viewport */}
                  {!landscape && (
                    <div className="pg-device-status-bar">
                      <span className="pg-status-time">{timeStr}</span>
                      <div className="pg-status-island-overlay" />
                      <div className="pg-status-icons">
                        <svg
                          className="pg-status-icon"
                          width="16"
                          height="10"
                          viewBox="0 0 17 11"
                          fill="currentColor"
                        >
                          <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                          <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
                          <rect x="8" y="4" width="2.5" height="7" rx="0.5" />
                          <rect x="12" y="2" width="2.5" height="9" rx="0.5" />
                          <rect x="16" y="0" width="2.5" height="11" rx="0.5" />
                        </svg>
                        <svg
                          className="pg-status-icon"
                          width="14"
                          height="10"
                          viewBox="0 0 16 12"
                          fill="currentColor"
                        >
                          <path d="M8 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-4.2-4.2a1 1 0 0 1 0-1.4 8 8 0 0 1 11.3 0 1 1 0 0 1-1.4 1.4 6 6 0 0 0-8.5 0zm-2.8-2.8a1 1 0 0 1 0-1.4 12 12 0 0 1 17 0 1 1 0 0 1-1.4 1.4 10 10 0 0 0-14.2 0z" />
                        </svg>
                        <svg
                          className="pg-status-icon"
                          width="20"
                          height="10"
                          viewBox="0 0 22 11"
                          fill="currentColor"
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            width="18"
                            height="10"
                            rx="2.5"
                            fill="none"
                            stroke="currentColor"
                          />
                          <rect
                            x="2.5"
                            y="2.5"
                            width="11"
                            height="6"
                            rx="1.5"
                            fill="currentColor"
                          />
                          <path d="M19.5 3.5h1v4h-1z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Sandboxed Iframe Player Container */}
                  <div className="pg-player-iframe-container">
                    <iframe
                      ref={iframeRef}
                      src={playerIframeUrl}
                      className="pg-player-iframe"
                      title="Mobile player preview"
                      allow="autoplay"
                      onLoad={() => {
                        // Send initial config on load to ensure sync
                        const config = {
                          src,
                          accentColor,
                          lowLatency,
                          autoPlay,
                          muted,
                          customRates,
                          disableDevOptions,
                          seekStep,
                          liveSyncDuration,
                          customization,
                          centerIconScale,
                          safeAreaTop,
                          safeAreaBottom,
                        };
                        iframeRef.current?.contentWindow?.postMessage(
                          { type: "UPDATE_PLAYGROUND_CONFIG", config },
                          "*",
                        );
                      }}
                    />
                  </div>

                  {/* Mock On-Screen Home Indicator Bar Area */}
                  {!landscape && (
                    <div className="pg-device-screen-homebar-area">
                      <div className="pg-device-screen-homebar" />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Rotate button overlay on the device frame ── */}
              {setLandscape && (
                <button
                  type="button"
                  className={`pg-device-rotate-btn ${landscape ? "is-landscape" : ""}`}
                  onClick={() => setLandscape(!landscape)}
                  title={
                    landscape ? "Switch to portrait" : "Switch to landscape"
                  }
                >
                  <IconRotate />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Premium Fluid Desktop Inline Player */
          <div className="pg-desktop-scene">
            {isYoutubeUrl(src) ? (
              <YoutubePlayer
                key={src}
                src={src}
                autoPlay={autoPlay}
                seekStep={seekStep}
                poster={poster || undefined}
                playbackRates={
                  customRates
                    ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]
                    : undefined
                }
                disableDevOptions={disableDevOptions}
                customization={customization}
                themeOverrides={{
                  "--pk-accent": accentColor,
                  ...(centerIconScale && centerIconScale !== 1.0
                    ? {
                      "--pk-center-play-size": `${(4.0 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-play-icon-size": `${(1.71 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-seek-size": `${(3.0 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-seek-icon-size": `${(1.28 * centerIconScale).toFixed(2)}em`,
                    }
                    : {}),
                }}
                className="pg-player"
                onPlayerReady={(player) => {
                  setActivePlayer(player);
                }}
              />
            ) : (
              <HlsPlayer
                key={src}
                src={src}
                poster={
                  poster ||
                  "https://assets.khanglobalstudies.com/x/Images/logos/logo.avif?w=256&d=www.khanglobalstudies.com&q=100"
                }
                {...(useTokenAuth && videoId
                  ? {
                    tokenFetcher: async ({ signal }) => {
                      const res = await fetch(
                        `https://api.khanglobalstudies.com/v4/courses/video/${videoId}`,
                        { signal },
                      );
                      const data = await res.json();
                      if (!data.video_url) {
                        throw new Error(
                          data.message ||
                          `API error (status: ${data.status || res.status})`,
                        );
                      }
                      return { url: data.video_url };
                    },
                  }
                  : {})}
                autoPlay={autoPlay}
                muted={muted}
                live={{
                  lowLatency,
                  syncDuration: liveSyncDuration,
                }}
                seekStep={seekStep}
                playbackRates={
                  customRates
                    ? [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]
                    : undefined
                }
                disableDevOptions={disableDevOptions}
                customization={customization}
                themeOverrides={{
                  "--pk-accent": accentColor,
                  ...(centerIconScale && centerIconScale !== 1.0
                    ? {
                      "--pk-center-play-size": `${(4.0 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-play-icon-size": `${(1.71 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-seek-size": `${(3.0 * centerIconScale).toFixed(2)}em`,
                      "--pk-center-seek-icon-size": `${(1.28 * centerIconScale).toFixed(2)}em`,
                    }
                    : {}),
                }}
                className="pg-player"
                onPlayerReady={(player) => {
                  setActivePlayer(player);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

DeviceSimulator.displayName = "DeviceSimulator";
