import { SidebarRevealButton } from "./components/SidebarRevealButton";
import { HudRevealButton } from "./components/HudRevealButton";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { TelemetryHud } from "./components/TelemetryHud";
import { MobileHeader } from "./components/MobileHeader";
import { usePlayground } from "./hooks/usePlayground";
import { SOURCES, ACCENT_COLORS } from "./constants";
import { Sidebar } from "./components/Sidebar";
import React from "react";
import "./App.css";

export function App({ onOpenDocs }: { onOpenDocs?: () => void }) {
  const {
    src,
    muted,
    setSrc,
    frameW,
    frameH,
    poster,
    videoId,
    autoPlay,
    setMuted,
    seekStep,
    viewport,
    customSrc,
    landscape,
    iframeRef,
    setPoster,
    viewportId,
    lowLatency,
    copiedCode,
    setVideoId,
    accentColor,
    setAutoPlay,
    customRates,
    setSeekStep,
    playerState,
    copiedShare,
    handleReset,
    setCustomSrc,
    setLandscape,
    useTokenAuth,
    setViewportId,
    isSidebarOpen,
    setLowLatency,
    customization,
    copyReactCode,
    copyShareLink,
    isHudExpanded,
    setAccentColor,
    setCustomRates,
    isMobileScreen,
    customColorText,
    playerIframeUrl,
    setActivePlayer,
    setUseTokenAuth,
    centerIconScale,
    debugTouchZones,
    setIsSidebarOpen,
    liveSyncDuration,
    setCustomization,
    setIsHudExpanded,
    disableDevOptions,
    setCustomColorText,
    setCenterIconScale,
    setDebugTouchZones,
    setLiveSyncDuration,
    setDisableDevOptions,
  } = usePlayground();

  return (
    <div
      className="pg-shell"
      style={{ "--pg-accent-theme": accentColor } as React.CSSProperties}
    >
      {/* ── Mobile/Tablet Glassmorphic Header ── */}
      {isMobileScreen && (
        <MobileHeader
          onOpenDocs={onOpenDocs}
          isSidebarOpen={isSidebarOpen}
          isHudExpanded={isHudExpanded}
          copyShareLink={copyShareLink}
          setIsSidebarOpen={setIsSidebarOpen}
          setIsHudExpanded={setIsHudExpanded}
        />
      )}

      {/* ── Row: Sidebar + Preview Canvas (below header on mobile) ── */}
      <div className="pg-content-row">
        {/* ── Sidebar Backdrop for Mobile Drawer Overlay ── */}
        {isMobileScreen && isSidebarOpen && (
          <div
            className="pg-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── Collapsible Left Sidebar ── */}
        <Sidebar
          src={src}
          muted={muted}
          setSrc={setSrc}
          poster={poster}
          sources={SOURCES}
          videoId={videoId}
          autoPlay={autoPlay}
          setMuted={setMuted}
          seekStep={seekStep}
          viewport={viewport}
          customSrc={customSrc}
          landscape={landscape}
          setPoster={setPoster}
          lowLatency={lowLatency}
          copiedCode={copiedCode}
          viewportId={viewportId}
          setVideoId={setVideoId}
          onOpenDocs={onOpenDocs}
          accentColor={accentColor}
          setAutoPlay={setAutoPlay}
          customRates={customRates}
          setSeekStep={setSeekStep}
          handleReset={handleReset}
          copiedShare={copiedShare}
          setCustomSrc={setCustomSrc}
          setLandscape={setLandscape}
          useTokenAuth={useTokenAuth}
          accentColors={ACCENT_COLORS}
          isSidebarOpen={isSidebarOpen}
          setLowLatency={setLowLatency}
          customization={customization}
          copyReactCode={copyReactCode}
          copyShareLink={copyShareLink}
          setViewportId={setViewportId}
          setAccentColor={setAccentColor}
          setCustomRates={setCustomRates}
          isMobileScreen={isMobileScreen}
          debugTouchZones={debugTouchZones}
          customColorText={customColorText}
          setUseTokenAuth={setUseTokenAuth}
          centerIconScale={centerIconScale}
          setIsSidebarOpen={setIsSidebarOpen}
          liveSyncDuration={liveSyncDuration}
          setCustomization={setCustomization}
          isLive={playerState?.isLive ?? false}
          disableDevOptions={disableDevOptions}
          setDebugTouchZones={setDebugTouchZones}
          setCustomColorText={setCustomColorText}
          setCenterIconScale={setCenterIconScale}
          setLiveSyncDuration={setLiveSyncDuration}
          setDisableDevOptions={setDisableDevOptions}
        />

        {/* Floating Reveal Sidebar Button when collapsed on desktop */}
        {!isMobileScreen && !isSidebarOpen && (
          <SidebarRevealButton onClick={() => setIsSidebarOpen(true)} />
        )}

        {/* Floating Reveal HUD Button when collapsed on desktop */}
        {!isMobileScreen && !isHudExpanded && (
          <HudRevealButton onClick={() => setIsHudExpanded(true)} />
        )}

        {/* ── Preview Canvas Area ── */}
        <main className="pg-preview-canvas">
          <div
            className={`pg-preview-layout ${!isHudExpanded ? "is-hud-collapsed" : ""} ${viewport.device ? "is-device-viewport" : "is-desktop-layout"} ${viewport.device && landscape ? "is-device-landscape" : ""}`}
          >
            <DeviceSimulator
              src={src}
              muted={muted}
              frameW={frameW}
              frameH={frameH}
              poster={poster}
              viewport={viewport}
              autoPlay={autoPlay}
              seekStep={seekStep}
              landscape={landscape}
              iframeRef={iframeRef}
              lowLatency={lowLatency}
              accentColor={accentColor}
              customRates={customRates}
              setLandscape={setLandscape}
              useTokenAuth={useTokenAuth}
              customization={customization}
              isMobileScreen={isMobileScreen}
              playerIframeUrl={playerIframeUrl}
              setActivePlayer={setActivePlayer}
              centerIconScale={centerIconScale}
              liveSyncDuration={liveSyncDuration}
              disableDevOptions={disableDevOptions}
              videoId={useTokenAuth ? videoId : undefined}
            />

            {/* ── Telemetry HUD Console ── */}
            <TelemetryHud
              playerState={playerState}
              isExpanded={isHudExpanded}
              isMobileScreen={isMobileScreen}
              onToggleExpand={() => setIsHudExpanded(!isHudExpanded)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
