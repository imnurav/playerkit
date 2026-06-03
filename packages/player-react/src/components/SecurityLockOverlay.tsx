import type { SecurityLockOverlayProps } from "../types";
import { memo } from "react";

export const SecurityLockOverlay = memo(function SecurityLockOverlay(
  props: SecurityLockOverlayProps,
) {
  const { isActive } = props;
  if (!isActive) return null;

  return (
    <div className="vp-security-overlay">
      <div className="vp-security-overlay__icon-wrapper">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="vp-security-overlay__title">SECURITY LOCK ACTIVE</h2>
      <p className="vp-security-overlay__message">
        Developer Tools are currently open. Playback has been suspended to
        secure stream contents. Please close DevTools to resume.
      </p>
    </div>
  );
});

SecurityLockOverlay.displayName = "SecurityLockOverlay";
