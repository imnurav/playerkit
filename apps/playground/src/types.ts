import type { PlayerControls, PlayerSnapshot } from "@playerkit/core";
import type { PlayerCustomization } from "@playerkit/ui";
import type React from "react";

export type ViewportId = "desktop" | "tablet" | "phone" | "small";

/** Explicit category for each source — no heuristic guessing */
export type SourceCategory =
  | "youtube"
  | "hls-live"
  | "hls-vod"
  | "mp4"
  | "error";

export interface Source {
  label: string;
  src: string;
  /** Explicit type tag — determines which group this source appears under */
  category: SourceCategory;
  /** Optional description shown as tooltip */
  description?: string;
}

export interface Viewport {
  id: ViewportId;
  label: string;
  w: number | null;
  h: number | null;
  device: boolean;
}

export interface AccentColor {
  label: string;
  value: string;
}

export interface PlaygroundConfig {
  src: string;
  accentColor: string;
  lowLatency: boolean;
  autoPlay: boolean;
  muted: boolean;
  customRates: boolean;
  disableDevOptions: boolean;
  seekStep: number;
  liveSyncDuration: number;
  customization: PlayerCustomization;
}

// ─── Sidebar Section Interfaces ──────────────────────────────────────────────

export interface ViewportSectionProps {
  landscape: boolean;
  viewport: Viewport;
  isExpanded: boolean;
  onToggle: () => void;
  viewportId: ViewportId;
  setLandscape: (l: boolean) => void;
  setViewportId: (id: ViewportId) => void;
  viewportIcons: Record<ViewportId, React.ReactNode>;
}

export interface ThemeSectionProps {
  accentColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  customColorText: string;
  accentColors: AccentColor[];
  setAccentColor: (color: string) => void;
  setCustomColorText: (text: string) => void;
}

export interface IntegrationSectionProps {
  copiedCode: boolean;
  isExpanded: boolean;
  copiedShare: boolean;
  onToggle: () => void;
  copyReactCode: () => void;
  copyShareLink: () => void;
}

export interface EngineSettingsSectionProps {
  muted: boolean;
  isLive: boolean;
  seekStep: number;
  autoPlay: boolean;
  lowLatency: boolean;
  isExpanded: boolean;
  customRates: boolean;
  onToggle: () => void;
  liveSyncDuration: number;
  disableDevOptions: boolean;
  setMuted: (muted: boolean) => void;
  setSeekStep: (step: number) => void;
  setAutoPlay: (auto: boolean) => void;
  setLowLatency: (low: boolean) => void;
  setCustomRates: (rates: boolean) => void;
  setLiveSyncDuration: (duration: number) => void;
  setDisableDevOptions: (disabled: boolean) => void;
}

export interface UiCustomizationSectionProps {
  poster: string;
  isLive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  centerIconScale: number;
  debugTouchZones: boolean;
  setPoster: (url: string) => void;
  customization: PlayerCustomization;
  setCenterIconScale: (scale: number) => void;
  setDebugTouchZones: (debug: boolean) => void;
  updateCustomization: <K extends keyof PlayerCustomization>(
    key: K,
    value: PlayerCustomization[K],
  ) => void;
}

export interface SourceGroupProps {
  title: string;
  badge: string;
  badgeClass: string;
  sources: Source[];
  activeSrc: string;
  onSelect: (src: string) => void;
}

export interface LibrarySectionProps {
  src: string;
  videoId: string;
  customSrc: string;
  ytSources: Source[];
  isExpanded: boolean;
  vodSources: Source[];
  onToggle: () => void;
  mp4Sources: Source[];
  liveSources: Source[];
  trapSources: Source[];
  isMobileScreen: boolean;
  setSrc: (src: string) => void;
  setVideoId: (id: string) => void;
  setCustomSrc: (src: string) => void;
  setUseTokenAuth: (use: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  authToken: string;
  setAuthToken: (token: string) => void;
}

export interface SidebarFooterProps {
  handleReset: () => void;
  onOpenDocs?: () => void;
}

// ─── Main Component Interfaces ───────────────────────────────────────────────

export interface SidebarProps {
  src: string;
  muted: boolean;
  poster: string;
  videoId: string;
  seekStep: number;
  isLive?: boolean;
  customSrc: string;
  autoPlay: boolean;
  sources: Source[];
  landscape: boolean;
  viewport: Viewport;
  accentColor: string;
  lowLatency: boolean;
  copiedCode: boolean;
  customRates: boolean;
  copiedShare: boolean;
  useTokenAuth: boolean;
  authToken: string;
  isSidebarOpen: boolean;
  viewportId: ViewportId;
  customColorText: string;
  handleReset: () => void;
  isMobileScreen: boolean;
  centerIconScale: number;
  onOpenDocs?: () => void;
  debugTouchZones: boolean;
  liveSyncDuration: number;
  copyReactCode: () => void;
  copyShareLink: () => void;
  disableDevOptions: boolean;
  accentColors: AccentColor[];
  setSrc: (src: string) => void;
  setPoster: (url: string) => void;
  setVideoId: (id: string) => void;
  setMuted: (muted: boolean) => void;
  customization: PlayerCustomization;
  setCustomSrc: (src: string) => void;
  setSeekStep: (step: number) => void;
  setAutoPlay: (auto: boolean) => void;
  setLowLatency: (low: boolean) => void;
  setAccentColor: (color: string) => void;
  setAuthToken: (token: string) => void;
  setUseTokenAuth: (use: boolean) => void;
  setViewportId: (id: ViewportId) => void;
  setCustomRates: (rates: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setCustomColorText: (text: string) => void;
  setLandscape: (landscape: boolean) => void;
  setCenterIconScale: (scale: number) => void;
  setDebugTouchZones: (debug: boolean) => void;
  setLiveSyncDuration: (duration: number) => void;
  setDisableDevOptions: (disabled: boolean) => void;
  setCustomization: React.Dispatch<React.SetStateAction<PlayerCustomization>>;
}

export interface SidebarRevealButtonProps {
  onClick: () => void;
}

export interface HudRevealButtonProps {
  onClick: () => void;
}

export interface MobileHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHudExpanded: boolean;
  setIsHudExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  copyShareLink: () => void;
  onOpenDocs?: () => void;
}

export interface TelemetryHudProps {
  playerState: PlayerSnapshot | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isMobileScreen?: boolean;
}

export interface DeviceSimulatorProps {
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
  authToken?: string;
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
