import { UiCustomizationSection } from "./sidebar/UiCustomizationSection";
import { EngineSettingsSection } from "./sidebar/EngineSettingsSection";
import { IntegrationSection } from "./sidebar/IntegrationSection";
import { ViewportSection } from "./sidebar/ViewportSection";
import { LibrarySection } from "./sidebar/LibrarySection";
import type { SidebarProps, ViewportId } from "../types";
import type { PlayerCustomization } from "@playerkit/ui";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { ThemeSection } from "./sidebar/ThemeSection";
import React, { useState, useCallback } from "react";
import {
  IconPhone,
  IconSmall,
  IconTablet,
  IconDesktop,
  IconChevronLeft,
} from "../icons/index";

export const Sidebar: React.FC<SidebarProps> = React.memo((props) => {
  const {
    src,
    muted,
    setSrc,
    poster,
    videoId,
    sources,
    autoPlay,
    setMuted,
    seekStep,
    viewport,
    customSrc,
    setPoster,
    landscape,
    lowLatency,
    setVideoId,
    copiedCode,
    viewportId,
    onOpenDocs,
    accentColor,
    setAutoPlay,
    customRates,
    setSeekStep,
    handleReset,
    copiedShare,
    setCustomSrc,
    accentColors,
    setLandscape,
    isSidebarOpen,
    setLowLatency,
    customization,
    copyReactCode,
    copyShareLink,
    setViewportId,
    isLive = false,
    setAccentColor,
    setCustomRates,
    isMobileScreen,
    customColorText,
    debugTouchZones,
    setUseTokenAuth,
    centerIconScale,
    setIsSidebarOpen,
    liveSyncDuration,
    setCustomization,
    disableDevOptions,
    setCustomColorText,
    setDebugTouchZones,
    setCenterIconScale,
    setLiveSyncDuration,
    setDisableDevOptions,
    authToken,
    setAuthToken,
  } = props;

  const [expandedSections, setExpandedSections] = useState({
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

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    [],
  );

  const updateCustomization = useCallback(
    <K extends keyof PlayerCustomization>(
      key: K,
      value: PlayerCustomization[K],
    ) => {
      setCustomization((prev) => ({ ...prev, [key]: value }));
    },
    [setCustomization],
  );

  const ytSources = sources.filter((s) => s.category === "youtube");
  const liveSources = sources.filter((s) => s.category === "hls-live");
  const vodSources = sources.filter((s) => s.category === "hls-vod");
  const mp4Sources = sources.filter((s) => s.category === "mp4");
  const trapSources = sources.filter((s) => s.category === "error");

  return (
    <aside className={`pg-sidebar ${isSidebarOpen ? "is-open" : "is-closed"}`}>
      <div className="pg-logo">
        <span className="pg-logo-mark">▶</span>
        <span className="pg-logo-text">PlayerKit Playground</span>
      </div>

      <nav className="pg-nav">
        <ViewportSection
          viewport={viewport}
          landscape={landscape}
          viewportId={viewportId}
          setLandscape={setLandscape}
          setViewportId={setViewportId}
          viewportIcons={viewportIcons}
          isExpanded={expandedSections.simulator}
          onToggle={() => toggleSection("simulator")}
        />

        <LibrarySection
          src={src}
          setSrc={setSrc}
          videoId={videoId}
          customSrc={customSrc}
          ytSources={ytSources}
          setVideoId={setVideoId}
          vodSources={vodSources}
          liveSources={liveSources}
          trapSources={trapSources}
          mp4Sources={mp4Sources}
          setCustomSrc={setCustomSrc}
          isMobileScreen={isMobileScreen}
          setUseTokenAuth={setUseTokenAuth}
          setIsSidebarOpen={setIsSidebarOpen}
          authToken={authToken}
          setAuthToken={setAuthToken}
          isExpanded={expandedSections.library}
          onToggle={() => toggleSection("library")}
        />

        <ThemeSection
          accentColor={accentColor}
          accentColors={accentColors}
          setAccentColor={setAccentColor}
          customColorText={customColorText}
          isExpanded={expandedSections.theme}
          setCustomColorText={setCustomColorText}
          onToggle={() => toggleSection("theme")}
        />

        <UiCustomizationSection
          poster={poster}
          isLive={isLive}
          setPoster={setPoster}
          customization={customization}
          isExpanded={expandedSections.ui}
          debugTouchZones={debugTouchZones}
          centerIconScale={centerIconScale}
          onToggle={() => toggleSection("ui")}
          setDebugTouchZones={setDebugTouchZones}
          setCenterIconScale={setCenterIconScale}
          updateCustomization={updateCustomization}
        />

        <EngineSettingsSection
          muted={muted}
          isLive={isLive}
          autoPlay={autoPlay}
          setMuted={setMuted}
          seekStep={seekStep}
          lowLatency={lowLatency}
          setAutoPlay={setAutoPlay}
          customRates={customRates}
          setSeekStep={setSeekStep}
          setLowLatency={setLowLatency}
          setCustomRates={setCustomRates}
          liveSyncDuration={liveSyncDuration}
          isExpanded={expandedSections.engine}
          disableDevOptions={disableDevOptions}
          onToggle={() => toggleSection("engine")}
          setLiveSyncDuration={setLiveSyncDuration}
          setDisableDevOptions={setDisableDevOptions}
        />

        <IntegrationSection
          copiedCode={copiedCode}
          copiedShare={copiedShare}
          copyReactCode={copyReactCode}
          copyShareLink={copyShareLink}
          isExpanded={expandedSections.integration}
          onToggle={() => toggleSection("integration")}
        />
      </nav>

      <SidebarFooter handleReset={handleReset} onOpenDocs={onOpenDocs} />

      {!isMobileScreen && (
        <button
          type="button"
          title="Collapse Sidebar"
          className="pg-sidebar-collapse-btn"
          onClick={() => setIsSidebarOpen(false)}
        >
          <IconChevronLeft />
        </button>
      )}
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
