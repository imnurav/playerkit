import { IconChevron } from "../../icons";
import type { Source } from "../../types";
import React, { useState } from "react";

interface SourceGroupProps {
  title: string;
  badge: string;
  badgeClass: string;
  sources: Source[];
  activeSrc: string;
  onSelect: (src: string) => void;
}

const SourceGroup: React.FC<SourceGroupProps> = ({
  title,
  badge,
  badgeClass,
  sources,
  activeSrc,
  onSelect,
}) => {
  if (sources.length === 0) return null;
  return (
    <div className="pg-source-group">
      <div className="pg-source-group-header">
        <span className="pg-source-group-title">{title}</span>
        <span className={`pg-source-group-badge ${badgeClass}`}>{badge}</span>
      </div>
      <div className="pg-source-list">
        {sources.map((s) => (
          <button
            key={s.src}
            type="button"
            className={`pg-source-btn ${s.src === activeSrc ? "is-active" : ""}`}
            onClick={() => onSelect(s.src)}
            title={s.description ?? s.label}
          >
            <span className="pg-source-dot" />
            <span className="pg-source-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface LibrarySectionProps {
  src: string;
  setSrc: (src: string) => void;
  customSrc: string;
  setCustomSrc: (src: string) => void;
  videoId: string;
  setVideoId: (id: string) => void;
  setUseTokenAuth: (use: boolean) => void;
  ytSources: Source[];
  liveSources: Source[];
  vodSources: Source[];
  trapSources: Source[];
  isMobileScreen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = React.memo(
  (props) => {
    const {
      src,
      setSrc,
      customSrc,
      setCustomSrc,
      videoId,
      setVideoId,
      setUseTokenAuth,
      ytSources,
      liveSources,
      vodSources,
      trapSources,
      isMobileScreen,
      setIsSidebarOpen,
      isExpanded,
      onToggle,
    } = props;

    const [activeLoaderTab, setActiveLoaderTab] = useState<"url" | "id">("url");

    const handleSelect = (newSrc: string) => {
      setSrc(newSrc);
      if (isMobileScreen) setIsSidebarOpen(false);
    };

    return (
      <section className="pg-section">
        <div
          className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
          onClick={onToggle}
        >
          <h2 className="pg-section-title">Video Stream Library</h2>
          <IconChevron />
        </div>
        <div
          className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}
        >
          <div className="pg-section-inner">
            <div className="pg-source-groups">
              <SourceGroup
                title="YouTube"
                badge="YT"
                badgeClass="is-youtube"
                sources={ytSources}
                activeSrc={src}
                onSelect={handleSelect}
              />
              <SourceGroup
                title="HLS Live"
                badge="LIVE"
                badgeClass="is-live"
                sources={liveSources}
                activeSrc={src}
                onSelect={handleSelect}
              />
              <SourceGroup
                title="HLS VOD"
                badge="VOD"
                badgeClass="is-vod"
                sources={vodSources}
                activeSrc={src}
                onSelect={handleSelect}
              />
              <SourceGroup
                title="Error Simulation"
                badge="ERR"
                badgeClass="is-error"
                sources={trapSources}
                activeSrc={src}
                onSelect={handleSelect}
              />
            </div>

            {/* Tabbed Custom Loader */}
            <div className="pg-custom-loader-container">
              <div className="pg-loader-tabs">
                <button
                  type="button"
                  className={`pg-loader-tab ${activeLoaderTab === "url" ? "is-active" : ""}`}
                  onClick={() => setActiveLoaderTab("url")}
                >
                  Custom HLS
                </button>
                <button
                  type="button"
                  className={`pg-loader-tab ${activeLoaderTab === "id" ? "is-active" : ""}`}
                  onClick={() => setActiveLoaderTab("id")}
                >
                  KGS Video ID
                </button>
              </div>

              <div className="pg-loader-tab-content">
                {activeLoaderTab === "url" ? (
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
                ) : (
                  <div className="pg-custom-source">
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
                      className="pg-primary-btn pg-primary-accent-btn"
                    >
                      Load via KGS API
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

LibrarySection.displayName = "LibrarySection";
