import { IconChevron, IconRotate } from "../../icons/index";
import type { ViewportSectionProps } from "../../types";
import { VIEWPORTS } from "../../constants";
import React from "react";

export const ViewportSection: React.FC<ViewportSectionProps> = React.memo(
  (props) => {
    const {
      viewport,
      onToggle,
      landscape,
      viewportId,
      isExpanded,
      setLandscape,
      setViewportId,
      viewportIcons,
    } = props;

    return (
      <section className="pg-section">
        <div
          className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
          onClick={onToggle}
        >
          <h2 className="pg-section-title">Viewport / Simulator Mode</h2>
          <IconChevron className="pg-section-chevron" />
        </div>
        <div
          className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}
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
                    <span className="pg-sidebar-viewport-label">{v.label}</span>
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
                title={landscape ? "Switch to portrait" : "Switch to landscape"}
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
    );
  },
);

ViewportSection.displayName = "ViewportSection";
