import React, { useState, useCallback } from "react";
import type { Source, AccentColor, ViewportId, Viewport } from "../types";
import type { PlayerCustomization } from "@nurav/player-ui";
import { VIEWPORTS } from "../constants";
import {
  IconChevronLeft,
  IconCode,
  IconShare,
  IconChevron,
  IconRotate,
  IconDesktop,
  IconTablet,
  IconPhone,
  IconSmall,
} from "../icons";

interface SidebarProps {
  src: string;
  setSrc: (src: string) => void;
  customSrc: string;
  setCustomSrc: (src: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  customColorText: string;
  setCustomColorText: (text: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  lowLatency: boolean;
  setLowLatency: (low: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (auto: boolean) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  customRates: boolean;
  setCustomRates: (rates: boolean) => void;
  disableDevOptions: boolean;
  setDisableDevOptions: (disabled: boolean) => void;
  seekStep: number;
  setSeekStep: (step: number) => void;
  liveSyncDuration: number;
  setLiveSyncDuration: (duration: number) => void;
  videoId: string;
  setVideoId: (id: string) => void;
  useTokenAuth: boolean;
  setUseTokenAuth: (use: boolean) => void;
  customization: PlayerCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<PlayerCustomization>>;
  handleReset: () => void;
  copyReactCode: () => void;
  copyShareLink: () => void;
  copiedCode: boolean;
  copiedShare: boolean;
  isMobileScreen: boolean;
  sources: Source[];
  accentColors: AccentColor[];
  viewportId: ViewportId;
  setViewportId: (id: ViewportId) => void;
  landscape: boolean;
  setLandscape: (landscape: boolean) => void;
  viewport: Viewport;
  isLive?: boolean;
  centerIconScale: number;
  setCenterIconScale: (scale: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(
  ({
    src,
    isLive = false,
    setSrc,
    customSrc,
    setCustomSrc,
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
    seekStep,
    setSeekStep,
    liveSyncDuration,
    setLiveSyncDuration,
    videoId,
    setVideoId,
    setUseTokenAuth,
    customization,
    setCustomization,
    handleReset,
    copyReactCode,
    copyShareLink,
    copiedCode,
    copiedShare,
    isMobileScreen,
    sources,
    accentColors,
    viewportId,
    setViewportId,
    landscape,
    setLandscape,
    viewport,
    centerIconScale,
    setCenterIconScale,
  }) => {
    const [expandedSections, setExpandedSections] = useState<
      Record<string, boolean>
    >({
      simulator: true,
      library: true,
      theme: true,
      ui: true,
      engine: false,
      integration: false,
    });

    const viewportIcons: Record<ViewportId, React.ReactNode> = {
      desktop: <IconDesktop />,
      tablet: <IconTablet />,
      phone: <IconPhone />,
      small: <IconSmall />,
    };

    const toggleSection = useCallback((section: string) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const updateCustomization = <K extends keyof PlayerCustomization>(
      key: K,
      value: PlayerCustomization[K],
    ) => {
      setCustomization((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <aside
        className={`pg-sidebar ${isSidebarOpen ? "is-open" : "is-closed"}`}
      >
        <div className="pg-logo">
          <span className="pg-logo-mark">▶</span>
          <span className="pg-logo-text">HLS Playground</span>
        </div>

        <nav className="pg-nav">
          {/* Simulator Modes Section */}
          <section className="pg-section">
            <div
              className={`pg-section-header ${expandedSections.simulator ? "is-expanded" : ""}`}
              onClick={() => toggleSection("simulator")}
            >
              <h2 className="pg-section-title">Viewport / Simulator Mode</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.simulator ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-sidebar-viewports-grid">
                  {VIEWPORTS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`pg-sidebar-viewport-btn ${v.id === viewportId ? "is-active" : ""}`}
                      onClick={() => {
                        setViewportId(v.id);
                        setLandscape(false);
                      }}
                    >
                      <span className="pg-sidebar-viewport-icon">
                        {viewportIcons[v.id]}
                      </span>
                      <div className="pg-sidebar-viewport-info">
                        <span className="pg-sidebar-viewport-label">
                          {v.label}
                        </span>
                        {v.w && (
                          <span className="pg-sidebar-viewport-resolution">
                            {v.w} × {v.h}px
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {viewport.device && (
                  <button
                    type="button"
                    className={`pg-sidebar-rotate-btn ${landscape ? "is-landscape" : ""}`}
                    onClick={() => setLandscape(!landscape)}
                    title={
                      landscape ? "Switch to portrait" : "Switch to landscape"
                    }
                  >
                    <IconRotate />
                    <span>
                      Rotate Device ({landscape ? "Landscape" : "Portrait"})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Streams Section */}
          <section className="pg-section">
            <div
              className={`pg-section-header ${expandedSections.library ? "is-expanded" : ""}`}
              onClick={() => toggleSection("library")}
            >
              <h2 className="pg-section-title">Video Stream Library</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.library ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-source-list">
                  {sources.map((s) => (
                    <button
                      key={s.src}
                      type="button"
                      className={`pg-source-btn ${s.src === src ? "is-active" : ""}`}
                      onClick={() => {
                        setSrc(s.src);
                        if (isMobileScreen) setIsSidebarOpen(false);
                      }}
                    >
                      <span className="pg-source-dot" />
                      <span className="pg-source-label">{s.label}</span>
                    </button>
                  ))}

                  <div className="pg-custom-source">
                    <input
                      type="text"
                      placeholder="Paste custom .m3u8 URL..."
                      value={customSrc}
                      onChange={(e) => setCustomSrc(e.target.value)}
                      className="pg-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customSrc.trim()) {
                          setUseTokenAuth(false);
                          setSrc(customSrc.trim());
                          if (isMobileScreen) setIsSidebarOpen(false);
                        }
                      }}
                      className="pg-primary-btn"
                    >
                      Load Custom Stream
                    </button>
                  </div>

                  <div
                    className="pg-custom-source"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Video ID (e.g. 527697)"
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      className="pg-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (videoId.trim()) {
                          setUseTokenAuth(true);
                          setSrc(`kgs://video/${videoId.trim()}`);
                          if (isMobileScreen) setIsSidebarOpen(false);
                        }
                      }}
                      className="pg-primary-btn"
                      style={{
                        background: "var(--vp-accent, #6366f1)",
                        color: "#fff",
                      }}
                    >
                      Load via KGS API
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="pg-section">
            <div
              className={`pg-section-header ${expandedSections.theme ? "is-expanded" : ""}`}
              onClick={() => toggleSection("theme")}
            >
              <h2 className="pg-section-title">Dynamic Brand Colors</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.theme ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-theme-grid">
                  <div className="pg-presets-wrapper">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`pg-color-swatch ${accentColor === color.value ? "is-active" : ""}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => {
                          setAccentColor(color.value);
                          setCustomColorText(color.value);
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>

                  <div className="pg-custom-color-row">
                    <div className="pg-color-input-wrapper">
                      <input
                        type="color"
                        value={
                          accentColor.startsWith("#") &&
                          accentColor.length === 7
                            ? accentColor
                            : "#2e3192"
                        }
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          setCustomColorText(e.target.value);
                        }}
                        className="pg-color-picker"
                      />
                      <input
                        type="text"
                        placeholder="#2e3192"
                        value={customColorText}
                        onChange={(e) => {
                          setCustomColorText(e.target.value);
                          if (
                            e.target.value.startsWith("#") &&
                            e.target.value.length === 7
                          ) {
                            setAccentColor(e.target.value);
                          }
                        }}
                        className="pg-color-text-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UI Customizations */}
          <section className="pg-section">
            <div
              className={`pg-section-header ${expandedSections.ui ? "is-expanded" : ""}`}
              onClick={() => toggleSection("ui")}
            >
              <h2 className="pg-section-title">UI Customizations</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.ui ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-custom-list">
                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={!!customization.showPlayButton}
                      onChange={(e) =>
                        updateCustomization("showPlayButton", e.target.checked)
                      }
                    />
                    <span className="pg-toggle-label">Play/Pause Control</span>
                  </label>

                  {!isLive && (
                    <label className="pg-toggle">
                      <input
                        type="checkbox"
                        checked={!!customization.showTimeDisplay}
                        onChange={(e) =>
                          updateCustomization(
                            "showTimeDisplay",
                            e.target.checked,
                          )
                        }
                      />
                      <span className="pg-toggle-label">
                        Time & Duration Display
                      </span>
                    </label>
                  )}

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={!!customization.showSettings}
                      onChange={(e) =>
                        updateCustomization("showSettings", e.target.checked)
                      }
                    />
                    <span className="pg-toggle-label">
                      Settings Menu (Gear)
                    </span>
                  </label>

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={!!customization.showFullscreen}
                      onChange={(e) =>
                        updateCustomization("showFullscreen", e.target.checked)
                      }
                    />
                    <span className="pg-toggle-label">Fullscreen Toggle</span>
                  </label>

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={!!customization.showCenterOverlay}
                      onChange={(e) =>
                        updateCustomization(
                          "showCenterOverlay",
                          e.target.checked,
                        )
                      }
                    />
                    <span className="pg-toggle-label">Center Gestures HUD</span>
                  </label>

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={!!customization.showObjectFitButton}
                      onChange={(e) =>
                        updateCustomization(
                          "showObjectFitButton",
                          e.target.checked,
                        )
                      }
                    />
                    <span className="pg-toggle-label">Object Fit button</span>
                  </label>

                  <div className="pg-select-group">
                    <span className="pg-select-label">Volume Layout</span>
                    <select
                      value={customization.volumeControl ?? "vertical"}
                      onChange={(e) =>
                        updateCustomization(
                          "volumeControl",
                          e.target.value as
                            | "horizontal"
                            | "vertical"
                            | "hidden",
                        )
                      }
                      className="pg-select"
                    >
                      <option value="vertical">Vertical Popout</option>
                      <option value="horizontal">Horizontal Slider</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  <div className="pg-slider-group">
                    <div className="pg-slider-header">
                      <span className="pg-slider-label">Overlay Spacing</span>
                      <span className="pg-slider-value">
                        {customization.centerOverlayGap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={120}
                      value={customization.centerOverlayGap ?? 80}
                      onChange={(e) =>
                        updateCustomization(
                          "centerOverlayGap",
                          Number(e.target.value),
                        )
                      }
                      className="pg-range"
                    />
                  </div>

                  <div className="pg-slider-group">
                    <div className="pg-slider-header">
                      <span className="pg-slider-label">
                        Center Gestures Scale
                      </span>
                      <span className="pg-slider-value">
                        {centerIconScale.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={centerIconScale}
                      onChange={(e) =>
                        setCenterIconScale(Number(e.target.value))
                      }
                      className="pg-range"
                    />
                  </div>

                  <div className="pg-select-group">
                    <span className="pg-select-label">Video Fit Scale</span>
                    <select
                      value={customization.objectFit ?? "contain"}
                      onChange={(e) =>
                        updateCustomization(
                          "objectFit",
                          e.target.value as "contain" | "cover" | "fill",
                        )
                      }
                      className="pg-select"
                    >
                      <option value="contain">Contain (16:9 Letterbox)</option>
                      <option value="cover">Cover (Fill Aspect crop)</option>
                      <option value="fill">Fill (Stretch full canvas)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Engine Parameters */}
          <section className="pg-section">
            <div
              className={`pg-section-header ${expandedSections.engine ? "is-expanded" : ""}`}
              onClick={() => toggleSection("engine")}
            >
              <h2 className="pg-section-title">HLS Engine Settings</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.engine ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-custom-list">
                  {isLive && (
                    <label className="pg-toggle">
                      <input
                        type="checkbox"
                        checked={lowLatency}
                        onChange={(e) => setLowLatency(e.target.checked)}
                      />
                      <span className="pg-toggle-label">Low Latency Mode</span>
                    </label>
                  )}

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                    />
                    <span className="pg-toggle-label">Autoplay Stream</span>
                  </label>

                  <label className="pg-toggle">
                    <input
                      type="checkbox"
                      checked={muted}
                      onChange={(e) => setMuted(e.target.checked)}
                    />
                    <span className="pg-toggle-label">Default Mute</span>
                  </label>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      margin: "4px 0",
                    }}
                  >
                    <label
                      className="pg-toggle"
                      style={{ margin: 0, padding: 0 }}
                    >
                      <input
                        type="checkbox"
                        checked={customRates}
                        onChange={(e) => setCustomRates(e.target.checked)}
                      />
                      <span className="pg-toggle-label">
                        Custom Speeds Preset
                      </span>
                    </label>
                    <p
                      style={{
                        margin: "2px 0 0 48px",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.4,
                      }}
                    >
                      Adds 1.75× and 2.5× speed options inside the player
                      settings (click gear icon &gt; Speed).
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      margin: "4px 0",
                    }}
                  >
                    <label
                      className="pg-toggle"
                      style={{ margin: 0, padding: 0 }}
                    >
                      <input
                        type="checkbox"
                        checked={disableDevOptions}
                        onChange={(e) => setDisableDevOptions(e.target.checked)}
                      />
                      <span
                        className="pg-toggle-label"
                        style={{ color: "#f87171", fontWeight: 600 }}
                      >
                        Secure Dev Shield
                      </span>
                    </label>
                    <p
                      style={{
                        margin: "2px 0 0 48px",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.4,
                      }}
                    >
                      Blocks right-click, F12/inspect hotkeys, and active
                      DevTools traps. Automatically pauses stream on open and
                      resumes playing instantly once closed.
                    </p>
                  </div>

                  {isLive && (
                    <div className="pg-slider-group">
                      <div className="pg-slider-header">
                        <span className="pg-slider-label">
                          Live Sync Window
                        </span>
                        <span className="pg-slider-value">
                          {liveSyncDuration}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={0.5}
                        value={liveSyncDuration}
                        onChange={(e) =>
                          setLiveSyncDuration(Number(e.target.value))
                        }
                        className="pg-range"
                      />
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1.4,
                        }}
                      >
                        Seconds behind live edge before badge shows "Go Live".
                        Speed auto-resets to 1× when you catch up.
                      </p>
                    </div>
                  )}

                  <div className="pg-slider-group">
                    <div className="pg-slider-header">
                      <span className="pg-slider-label">Manual Seek Step</span>
                      <span className="pg-slider-value">{seekStep}s</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      value={seekStep}
                      onChange={(e) => setSeekStep(Number(e.target.value))}
                      className="pg-range"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Share/Actions Section */}
          <section className="pg-section pg-actions-section">
            <div
              className={`pg-section-header ${expandedSections.integration ? "is-expanded" : ""}`}
              onClick={() => toggleSection("integration")}
            >
              <h2 className="pg-section-title">Playground Integration</h2>
              <IconChevron />
            </div>
            <div
              className={`pg-section-content ${expandedSections.integration ? "is-expanded" : ""}`}
            >
              <div className="pg-section-inner">
                <div className="pg-action-buttons">
                  <button
                    type="button"
                    onClick={copyReactCode}
                    className="pg-outline-btn"
                  >
                    <IconCode />
                    <span>
                      {copiedCode ? "Copied Props!" : "Copy React Code"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="pg-outline-btn"
                  >
                    <IconShare />
                    <span>
                      {copiedShare ? "Copied Link!" : "Copy Custom URL"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </nav>

        {/* Sidebar Footer with Reset */}
        <div className="pg-sidebar-footer">
          <button type="button" onClick={handleReset} className="pg-reset-btn">
            Reset All Customizations
          </button>
          <div className="pg-version-chip">v2.0.0 (Active)</div>
        </div>

        {/* Collapsible Sidebar Button - Desktop only */}
        {!isMobileScreen && (
          <button
            type="button"
            className="pg-sidebar-collapse-btn"
            onClick={() => setIsSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            <IconChevronLeft />
          </button>
        )}
      </aside>
    );
  },
);

Sidebar.displayName = "Sidebar";
