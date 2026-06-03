import type { TouchDiagnosticOverlayProps } from "../types";
import { memo } from "react";

export const TouchDiagnosticOverlay = memo(function TouchDiagnosticOverlay(
  props: TouchDiagnosticOverlayProps,
) {
  const { isActive, centerZoneX, centerZoneY } = props;
  if (!isActive) return null;

  const cxStart = centerZoneX?.start ?? 0.4;
  const cxEnd = centerZoneX?.end ?? 0.6;
  const cyStart = centerZoneY?.start ?? 0.35;
  const cyEnd = centerZoneY?.end ?? 0.65;

  return (
    <div className="vp-touch-diagnostic">
      {/* Left Seek Zone */}
      <div
        className="vp-touch-diagnostic__zone vp-touch-diagnostic__zone--left"
        style={{ width: `${cxStart * 100}%` }}
      >
        Left Seek Zone ({Math.round(cxStart * 100)}%)
      </div>

      {/* Right Seek Zone */}
      <div
        className="vp-touch-diagnostic__zone vp-touch-diagnostic__zone--right"
        style={{ left: `${cxEnd * 100}%` }}
      >
        Right Seek Zone ({Math.round((1 - cxEnd) * 100)}%)
      </div>

      {/* Center Play/Pause Zone */}
      <div
        className="vp-touch-diagnostic__zone vp-touch-diagnostic__zone--center"
        style={{
          left: `${cxStart * 100}%`,
          width: `${(cxEnd - cxStart) * 100}%`,
          top: `${cyStart * 100}%`,
          height: `${(cyEnd - cyStart) * 100}%`,
        }}
      >
        Center Play/Pause
      </div>
    </div>
  );
});

TouchDiagnosticOverlay.displayName = "TouchDiagnosticOverlay";
