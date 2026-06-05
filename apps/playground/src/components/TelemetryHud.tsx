import type { PlayerSnapshot } from "@playerkit/core";
import React from "react";
import { IconChevronRight, IconClose } from "../icons/index";

interface TelemetryHudProps {
  playerState: PlayerSnapshot | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isMobileScreen?: boolean;
}

function formatTime(secs: number) {
  if (isNaN(secs) || secs === Infinity || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = React.memo((props) => {
  const {
    playerState,
    isExpanded = true,
    onToggleExpand,
    isMobileScreen = false,
  } = props;

  const dvrWindowSecs =
    playerState?.isLive && playerState.dvr
      ? Math.round(playerState.seekableEnd - playerState.seekableStart)
      : 0;

  const willAutoResetSpeed =
    playerState?.isLive &&
    !playerState.isAtLiveEdge &&
    (playerState.playbackRate ?? 1) > 1;

  return (
    /* Outer wrapper: handles animated width/clip, overflow:visible for the tab button */
    <div
      className={`pg-hud-wrapper ${isExpanded ? "is-expanded" : "is-collapsed"}`}
    >
      {/* Left-edge collapse tab — desktop only, sits OUTSIDE the scrollable panel */}
      {!isMobileScreen && onToggleExpand && (
        <button
          type="button"
          className="pg-hud-collapse-btn"
          onClick={onToggleExpand}
          title="Collapse HUD"
        >
          <IconChevronRight width={14} height={14} />
        </button>
      )}

      {/* Inner console panel — overflow:hidden, full height, scrollable */}
      <div className="pg-hud-console">
        <div className="pg-hud-header">
          <div className="pg-hud-led" />
          <h3 className="pg-hud-title">Player Telemetry HUD</h3>
          {playerState ? (
            <span className="pg-hud-status-active">ACTIVE</span>
          ) : (
            <span className="pg-hud-status-idle">OFFLINE</span>
          )}

          {/* Mobile-only X button to close the overlay */}
          {isMobileScreen && onToggleExpand && (
            <button
              type="button"
              className="pg-hud-toggle-btn"
              onClick={onToggleExpand}
              aria-label="Close HUD"
              title="Close HUD"
            >
              <IconClose width={16} height={16} />
            </button>
          )}
        </div>

        <div className="pg-hud-grid">
          {/* Playback state card */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">PLAYBACK ENGINE</span>
            <div className="pg-hud-card-value">
              {playerState ? (
                <span
                  className={`pg-hud-badge ${playerState.isBuffering ? "is-buffering" : playerState.isPlaying ? "is-playing" : "is-paused"}`}
                >
                  {playerState.isBuffering
                    ? "BUFFERING"
                    : playerState.isPlaying
                      ? "PLAYING"
                      : "PAUSED"}
                </span>
              ) : (
                <span className="pg-hud-badge is-paused">OFFLINE</span>
              )}
            </div>
          </div>

          {/* Playback time card */}
          {!playerState?.isLive && (
            <div className="pg-hud-card">
              <span className="pg-hud-card-label">POSITION / DURATION</span>
              <span className="pg-hud-card-text">
                {playerState ? (
                  <>
                    <span className="pg-hud-mono">
                      {formatTime(playerState.currentTime)}
                    </span>
                    <span className="pg-hud-slash">/</span>
                    <span className="pg-hud-mono">
                      {formatTime(playerState.duration)}
                    </span>
                  </>
                ) : (
                  "00:00 / 00:00"
                )}
              </span>
            </div>
          )}

          {/* Stream Class Mode */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">BROADCAST CLASS</span>
            <div className="pg-hud-card-value">
              {playerState ? (
                <span
                  className={`pg-hud-badge ${playerState.isLive ? "is-live" : "is-vod"}`}
                >
                  {playerState.isLive ? "LIVE BROADCAST" : "VOD ARCHIVE"}
                </span>
              ) : (
                <span className="pg-hud-badge is-vod">UNDETECTED</span>
              )}
            </div>
          </div>

          {/* Quality active resolution */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">ACTIVE RESOLUTION</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                playerState.activeQuality ? (
                  <span className="pg-hud-mono-green">
                    {playerState.activeQuality}p
                    {playerState.selectedQuality === "auto"
                      ? " (Auto)"
                      : " (Manual)"}
                  </span>
                ) : (
                  <span className="pg-hud-mono">Auto Leveling...</span>
                )
              ) : (
                "---"
              )}
            </span>
          </div>

          {/* Buffer seconds preloaded */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">BUFFER PRELOAD</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                <span className="pg-hud-mono">
                  {Math.max(0, playerState.bufferedPercent).toFixed(1)}% (
                  {formatTime(
                    playerState.bufferedEnd - playerState.currentTime,
                  )}{" "}
                  ahead)
                </span>
              ) : (
                "---"
              )}
            </span>
          </div>

          {/* Live edge latency */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">EDGE LATENCY</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                playerState.isLive ? (
                  <span
                    className={`pg-hud-mono ${playerState.isAtLiveEdge ? "is-at-edge" : "is-behind"}`}
                  >
                    {playerState.liveLatency.toFixed(2)}s behind{" "}
                    {playerState.isAtLiveEdge ? "✓ Synced" : "⚡ Go Live"}
                  </span>
                ) : (
                  "VOD (N/A)"
                )
              ) : (
                "---"
              )}
            </span>
          </div>

          {/* DVR window size */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">DVR WINDOW</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                playerState.isLive ? (
                  playerState.dvr ? (
                    <span className="pg-hud-mono-green">
                      {dvrWindowSecs}s available
                    </span>
                  ) : (
                    <span className="pg-hud-mono">No DVR</span>
                  )
                ) : (
                  "VOD (N/A)"
                )
              ) : (
                "---"
              )}
            </span>
          </div>

          {/* Playback speed multiplier with auto-reset hint */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">PLAYBACK RATE</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                <>
                  <span className="pg-hud-mono-blue">
                    {playerState.playbackRate.toFixed(2)}x Speed
                  </span>
                  {willAutoResetSpeed && (
                    <span className="pg-hud-auto-reset-badge">
                      → auto-reset on sync
                    </span>
                  )}
                </>
              ) : (
                "1.00x"
              )}
            </span>
          </div>

          {/* Active Volume metrics */}
          <div className="pg-hud-card">
            <span className="pg-hud-card-label">SOUND ENGINE</span>
            <span className="pg-hud-card-text">
              {playerState ? (
                playerState.isMuted ? (
                  <span className="pg-hud-mono-red">MUTED</span>
                ) : (
                  <span className="pg-hud-mono">
                    {(playerState.volume * 100).toFixed(0)}% Output
                  </span>
                )
              ) : (
                "---"
              )}
            </span>
          </div>
        </div>

        {/* HUD Footer for active error reports */}
        <div className="pg-hud-footer">
          <span className="pg-hud-error-label">HEALTH CONSOLE:</span>
          {playerState && playerState.error ? (
            <span className="pg-hud-error-msg">
              ⚠ [{playerState.error.category?.toUpperCase() ?? "UNKNOWN"}]
              {playerState.error.fatal ? " FATAL" : ""}:{" "}
              {playerState.error.message ?? "Playback interrupted"}
              {playerState.error.details
                ? ` (${playerState.error.details})`
                : ""}
            </span>
          ) : (
            <span className="pg-hud-healthy-msg">
              ✓ Nominal. Engine healthy, no errors.
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

TelemetryHud.displayName = "TelemetryHud";
