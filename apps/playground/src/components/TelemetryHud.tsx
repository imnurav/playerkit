import React from "react";
import type { PlayerSnapshot } from "@nurav/player-core";

interface TelemetryHudProps {
  playerState: PlayerSnapshot | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function formatTime(secs: number) {
  if (isNaN(secs) || secs === Infinity || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = React.memo(({ playerState, isExpanded = true, onToggleExpand }) => {
  // Derived live metrics
  const dvrWindowSecs =
    playerState?.isLive && playerState.dvr
      ? Math.round(playerState.seekableEnd - playerState.seekableStart)
      : 0;

  const willAutoResetSpeed =
    playerState?.isLive &&
    !playerState.isAtLiveEdge &&
    (playerState.playbackRate ?? 1) > 1;

  return (
    <div className={`pg-hud-console ${!isExpanded ? "is-collapsed" : ""}`}>
      <div className="pg-hud-header">
        <div className="pg-hud-led" />
        <h3 className="pg-hud-title">Real-Time Player Telemetry HUD</h3>
        {playerState ? (
          <span className="pg-hud-status-active">MONITORING ACTIVE</span>
        ) : (
          <span className="pg-hud-status-idle">AWAITING CONNECTION</span>
        )}

        {onToggleExpand && (
          <button
            type="button"
            className="pg-hud-toggle-btn"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Collapse HUD" : "Expand HUD"}
            title={isExpanded ? "Collapse HUD" : "Expand HUD"}
          >
            <svg
              className={`pg-hud-toggle-icon ${isExpanded ? "is-expanded" : ""}`}
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="pg-hud-grid">
            {/* Playback state card */}
            <div className="pg-hud-card">
              <span className="pg-hud-card-label">PLAYBACK ENGINE</span>
              <div className="pg-hud-card-value">
                {playerState ? (
                  <span className={`pg-hud-badge ${playerState.isBuffering ? "is-buffering" : playerState.isPlaying ? "is-playing" : "is-paused"}`}>
                    {playerState.isBuffering ? "BUFFERING" : playerState.isPlaying ? "PLAYING" : "PAUSED"}
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
                      <span className="pg-hud-mono">{formatTime(playerState.currentTime)}</span>
                      <span className="pg-hud-slash">/</span>
                      <span className="pg-hud-mono">{formatTime(playerState.duration)}</span>
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
                  <span className={`pg-hud-badge ${playerState.isLive ? "is-live" : "is-vod"}`}>
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
                      {playerState.selectedQuality === "auto" ? " (Auto)" : " (Manual)"}
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
                    {Math.max(0, playerState.bufferedPercent).toFixed(1)}% ({formatTime(playerState.bufferedEnd - playerState.currentTime)} ahead)
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
                    <span className={`pg-hud-mono ${playerState.isAtLiveEdge ? "is-at-edge" : "is-behind"}`}>
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
                      <span className="pg-hud-mono-green">{dvrWindowSecs}s available</span>
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
                    <span className="pg-hud-mono-blue">{playerState.playbackRate.toFixed(2)}x Speed</span>
                    {willAutoResetSpeed && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>
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
                    <span className="pg-hud-mono">{(playerState.volume * 100).toFixed(0)}% Output</span>
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
                ⚠ [{playerState.error.category?.toUpperCase() ?? "UNKNOWN"}]{playerState.error.fatal ? " FATAL" : ""}: {playerState.error.message ?? "Playback interrupted"}
                {playerState.error.details ? ` (${playerState.error.details})` : ""}
              </span>
            ) : (
              <span className="pg-hud-healthy-msg">✓ All systems nominal. Engine healthy, no errors detected.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
});

TelemetryHud.displayName = "TelemetryHud";
