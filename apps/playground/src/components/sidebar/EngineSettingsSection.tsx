import { IconChevron } from "../../icons";
import React from "react";

interface EngineSettingsSectionProps {
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

export const EngineSettingsSection: React.FC<EngineSettingsSectionProps> =
  React.memo((props) => {
    const {
      muted,
      isLive,
      autoPlay,
      setMuted,
      seekStep,
      onToggle,
      lowLatency,
      isExpanded,
      setAutoPlay,
      customRates,
      setSeekStep,
      setLowLatency,
      setCustomRates,
      liveSyncDuration,
      disableDevOptions,
      setLiveSyncDuration,
      setDisableDevOptions,
    } = props;

    return (
      <section className="pg-section">
        <div
          className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
          onClick={onToggle}
        >
          <h2 className="pg-section-title">HLS Engine Settings</h2>
          <IconChevron />
        </div>
        <div
          className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}
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

              <div className="pg-toggle-wrapper-v">
                <label className="pg-toggle pg-toggle-tight">
                  <input
                    type="checkbox"
                    checked={customRates}
                    onChange={(e) => setCustomRates(e.target.checked)}
                  />
                  <span className="pg-toggle-label">Custom Speeds Preset</span>
                </label>
                <p className="pg-toggle-desc">
                  Adds 1.75× and 2.5× speed options inside the player settings
                  (click gear icon &gt; Speed).
                </p>
              </div>

              <div className="pg-toggle-wrapper-v">
                <label className="pg-toggle pg-toggle-tight">
                  <input
                    type="checkbox"
                    checked={disableDevOptions}
                    onChange={(e) => setDisableDevOptions(e.target.checked)}
                  />
                  <span className="pg-toggle-label pg-toggle-label-danger">
                    Secure Dev Shield
                  </span>
                </label>
                <p className="pg-toggle-desc">
                  Blocks right-click, F12/inspect hotkeys, and active DevTools
                  traps. Automatically pauses stream on open and resumes playing
                  instantly once closed.
                </p>
              </div>

              {isLive && (
                <div className="pg-slider-group">
                  <div className="pg-slider-header">
                    <span className="pg-slider-label">Live Sync Window</span>
                    <span className="pg-slider-value">{liveSyncDuration}s</span>
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
                  <p className="pg-range-desc">
                    Seconds behind live edge before badge shows "Go Live". Speed
                    auto-resets to 1× when you catch up.
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
    );
  });

EngineSettingsSection.displayName = "EngineSettingsSection";
