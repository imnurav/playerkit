import type { PlayerCustomization, PlayerObjectFit } from "@playerkit/ui";
import { IconChevron } from "../../icons";
import React, { useState, useEffect } from "react";

interface UiCustomizationSectionProps {
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

export const UiCustomizationSection: React.FC<UiCustomizationSectionProps> =
  React.memo((props) => {
    const {
      poster,
      isLive,
      onToggle,
      setPoster,
      isExpanded,
      customization,
      debugTouchZones,
      centerIconScale,
      setDebugTouchZones,
      setCenterIconScale,
      updateCustomization,
    } = props;

    const [posterInput, setPosterInput] = useState(poster);
    const [isApplied, setIsApplied] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
      setPosterInput(poster);
      setErrorMsg(null);
    }, [poster]);

    const handleApply = () => {
      const val = posterInput.trim();

      if (!val) {
        setErrorMsg("Poster URL cannot be empty");
        return;
      }

      let isValidUrl = false;
      try {
        if (val.startsWith("/") || val.startsWith("data:image/")) {
          isValidUrl = true;
        } else {
          new URL(val);
          isValidUrl = true;
        }
      } catch (_) {
        isValidUrl = false;
      }

      if (!isValidUrl) {
        setErrorMsg("Please enter a valid URL (e.g. https://...)");
        return;
      }

      const isImage =
        /\.(jpeg|jpg|gif|png|webp|svg|bmp)(?:\?.*)?$/i.test(val) ||
        val.startsWith("data:image/");
      if (!isImage) {
        setErrorMsg("URL must point to an image (.png, .jpg, .webp, etc.)");
        return;
      }

      setErrorMsg(null);
      setPoster(val);
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 2000);
    };

    return (
      <section className="pg-section">
        <div
          className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
          onClick={onToggle}
        >
          <h2 className="pg-section-title">UI Customizations</h2>
          <IconChevron />
        </div>
        <div
          className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}
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
                      updateCustomization("showTimeDisplay", e.target.checked)
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
                <span className="pg-toggle-label">Settings Menu (Gear)</span>
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
                    updateCustomization("showCenterOverlay", e.target.checked)
                  }
                />
                <span className="pg-toggle-label">Center Gestures HUD</span>
              </label>

              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={!!customization.showObjectFitButton}
                  onChange={(e) =>
                    updateCustomization("showObjectFitButton", e.target.checked)
                  }
                />
                <span className="pg-toggle-label">Object Fit button</span>
              </label>

              <label className="pg-toggle">
                <input
                  type="checkbox"
                  checked={debugTouchZones}
                  onChange={(e) => setDebugTouchZones(e.target.checked)}
                />
                <span className="pg-toggle-label pg-toggle-label-debug">
                  Debug Touch Zones
                </span>
              </label>

              <div className="pg-custom-source pg-margin-y-sm">
                <span className="pg-select-label pg-label-sub">
                  Custom Poster URL (Outside)
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexDirection: "column",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={posterInput}
                    onChange={(e) => {
                      setPosterInput(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="pg-input"
                    style={
                      errorMsg
                        ? {
                            borderColor: "#ef4444",
                            boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.25)",
                          }
                        : undefined
                    }
                  />
                  {errorMsg && (
                    <span
                      style={{
                        color: "#f87171",
                        fontSize: "11px",
                        fontWeight: 500,
                        marginTop: "-2px",
                      }}
                    >
                      ⚠ {errorMsg}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleApply}
                    className="pg-primary-btn"
                    style={
                      isApplied
                        ? {
                            background:
                              "linear-gradient(135deg, #10b981, #059669)",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                          }
                        : errorMsg
                          ? {
                              background:
                                "linear-gradient(135deg, #ef4444, #dc2626)",
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                            }
                          : undefined
                    }
                  >
                    {isApplied
                      ? "Poster Applied ✓"
                      : errorMsg
                        ? "Validation Failed"
                        : "Apply Poster Image"}
                  </button>
                </div>
              </div>

              <div className="pg-select-group">
                <span className="pg-select-label">Volume Layout</span>
                <select
                  value={customization.volumeControl ?? "vertical"}
                  onChange={(e) =>
                    updateCustomization(
                      "volumeControl",
                      e.target.value as "horizontal" | "vertical" | "hidden",
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
                  <span className="pg-slider-label">Center Gestures Scale</span>
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
                  onChange={(e) => setCenterIconScale(Number(e.target.value))}
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
                      e.target.value as PlayerObjectFit,
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
    );
  });

UiCustomizationSection.displayName = "UiCustomizationSection";
