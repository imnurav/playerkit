import { SidebarRevealButton } from "./components/SidebarRevealButton";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { TelemetryHud } from "./components/TelemetryHud";
import { MobileHeader } from "./components/MobileHeader";
import { usePlayground } from "./hooks/usePlayground";
import { SOURCES, ACCENT_COLORS } from "./constants";
import { Sidebar } from "./components/Sidebar";
import React from "react";
import "./App.css";

export function App() {
  const {
    src,
    muted,
    setSrc,
    frameW,
    frameH,
    autoPlay,
    setMuted,
    seekStep,
    viewport,
    customSrc,
    landscape,
    iframeRef,
    viewportId,
    lowLatency,
    copiedCode,
    accentColor,
    setAutoPlay,
    customRates,
    setSeekStep,
    playerState,
    copiedShare,
    handleReset,
    setCustomSrc,
    setLandscape,
    setViewportId,
    isSidebarOpen,
    setLowLatency,
    customization,
    copyReactCode,
    copyShareLink,
    setAccentColor,
    setCustomRates,
    isMobileScreen,
    customColorText,
    playerIframeUrl,
    setActivePlayer,
    setIsSidebarOpen,
    liveSyncDuration,
    setCustomization,
    setCustomColorText,
    setLiveSyncDuration,
    videoId,
    setVideoId,
    useTokenAuth,
    setUseTokenAuth,
    isHudExpanded,
    setIsHudExpanded,
  } = usePlayground();

  return (
    <div className="pg-shell" style={{ "--pg-accent-theme": accentColor } as React.CSSProperties}>

      {/* ── Mobile/Tablet Glassmorphic Header ── */}
      {isMobileScreen && (
        <MobileHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          copyShareLink={copyShareLink}
        />
      )}

      {/* ── Sidebar Backdrop for Mobile Drawer Overlay ── */}
      {isMobileScreen && isSidebarOpen && (
        <div className="pg-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Collapsible Left Sidebar ── */}
      <Sidebar
        src={src}
        isLive={playerState?.isLive ?? false}
        muted={muted}
        setSrc={setSrc}
        sources={SOURCES}
        autoPlay={autoPlay}
        setMuted={setMuted}
        seekStep={seekStep}
        customSrc={customSrc}
        lowLatency={lowLatency}
        copiedCode={copiedCode}
        accentColor={accentColor}
        setAutoPlay={setAutoPlay}
        customRates={customRates}
        setSeekStep={setSeekStep}
        handleReset={handleReset}
        copiedShare={copiedShare}
        setCustomSrc={setCustomSrc}
        accentColors={ACCENT_COLORS}
        isSidebarOpen={isSidebarOpen}
        setLowLatency={setLowLatency}
        customization={customization}
        copyReactCode={copyReactCode}
        copyShareLink={copyShareLink}
        setAccentColor={setAccentColor}
        setCustomRates={setCustomRates}
        isMobileScreen={isMobileScreen}
        customColorText={customColorText}
        setIsSidebarOpen={setIsSidebarOpen}
        liveSyncDuration={liveSyncDuration}
        setCustomization={setCustomization}
        setCustomColorText={setCustomColorText}
        setLiveSyncDuration={setLiveSyncDuration}
        viewportId={viewportId}
        setViewportId={setViewportId}
        landscape={landscape}
        setLandscape={setLandscape}
        viewport={viewport}
        videoId={videoId}
        setVideoId={setVideoId}
        useTokenAuth={useTokenAuth}
        setUseTokenAuth={setUseTokenAuth}
      />

      {/* Floating Reveal Sidebar Button when collapsed on desktop */}
      {!isMobileScreen && !isSidebarOpen && (
        <SidebarRevealButton
          accentColor={accentColor}
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* ── Preview Canvas Area ── */}
      <main className="pg-preview-canvas">
        <div className={`pg-preview-layout ${!isHudExpanded ? "is-hud-collapsed" : ""} ${viewport.device ? "is-device-viewport" : ""} ${viewport.device && landscape ? "is-device-landscape" : ""}`}>
          <DeviceSimulator
            src={src}
            muted={muted}
            frameW={frameW}
            frameH={frameH}
            viewport={viewport}
            autoPlay={autoPlay}
            seekStep={seekStep}
            landscape={landscape}
            iframeRef={iframeRef}
            lowLatency={lowLatency}
            accentColor={accentColor}
            customRates={customRates}
            customization={customization}
            isMobileScreen={isMobileScreen}
            playerIframeUrl={playerIframeUrl}
            setActivePlayer={setActivePlayer}
            setLandscape={setLandscape}
            liveSyncDuration={liveSyncDuration}
            videoId={useTokenAuth ? videoId : undefined}
            useTokenAuth={useTokenAuth}
          />

          {/* ── God-Level Real-time Developer HUD Console ── */}
          <TelemetryHud
            playerState={playerState}
            isExpanded={isHudExpanded}
            onToggleExpand={() => setIsHudExpanded(!isHudExpanded)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;