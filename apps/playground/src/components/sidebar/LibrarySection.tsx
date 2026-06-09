import type { SourceGroupProps, LibrarySectionProps } from "../../types";
import { IconChevron } from "../../icons/index";
import React, { useState } from "react";

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

export const LibrarySection: React.FC<LibrarySectionProps> = React.memo(
  (props) => {
    const {
      src,
      setSrc,
      videoId,
      onToggle,
      customSrc,
      ytSources,
      setVideoId,
      vodSources,
      isExpanded,
      mp4Sources,
      liveSources,
      trapSources,
      setCustomSrc,
      isMobileScreen,
      setUseTokenAuth,
      setIsSidebarOpen,
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
          <IconChevron className="pg-section-chevron" />
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
                title="MP4 Progressive"
                badge="MP4"
                badgeClass="is-mp4"
                sources={mp4Sources}
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
                  Custom URL
                </button>
                <button
                  type="button"
                  className={`pg-loader-tab ${activeLoaderTab === "id" ? "is-active" : ""}`}
                  onClick={() => setActiveLoaderTab("id")}
                >
                  Secure Video ID
                </button>
              </div>

              <div className="pg-loader-tab-content">
                <div
                  className="pg-loader-tab-pane"
                  style={{
                    display: activeLoaderTab === "url" ? "flex" : "none",
                  }}
                >
                  <input
                    type="text"
                    value={customSrc}
                    className="pg-input"
                    placeholder="Paste custom .m3u8 / .mp4 / YouTube URL..."
                    onChange={(e) => setCustomSrc(e.target.value)}
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
                  className="pg-loader-tab-pane"
                  style={{
                    display: activeLoaderTab === "id" ? "flex" : "none",
                  }}
                >
                  <input
                    type="text"
                    value={videoId}
                    className="pg-input"
                    placeholder="Video ID (e.g. 527697)"
                    onChange={(e) => setVideoId(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (videoId.trim()) {
                        setUseTokenAuth(true);
                        setSrc("");
                        if (isMobileScreen) setIsSidebarOpen(false);
                      }
                    }}
                    className="pg-primary-btn pg-primary-accent-btn"
                  >
                    Load via Auth API
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

LibrarySection.displayName = "LibrarySection";
