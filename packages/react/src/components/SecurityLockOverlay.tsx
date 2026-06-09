import type { SecurityLockOverlayProps } from "../types";
import { IconLock } from "@playerkit/ui";
import { memo } from "react";

export const SecurityLockOverlay = memo(function SecurityLockOverlay(
  props: SecurityLockOverlayProps,
) {
  const { isActive } = props;
  if (!isActive) return null;

  return (
    <div className="pk-security-overlay">
      <div className="pk-security-overlay__icon-wrapper">
        <IconLock className="pk-security-overlay__icon" />
      </div>
      <h2 className="pk-security-overlay__title">SECURITY LOCK ACTIVE</h2>
      <p className="pk-security-overlay__message">
        Developer Tools are currently open. Playback has been suspended to
        secure stream contents. Please close DevTools to resume.
      </p>
    </div>
  );
});

SecurityLockOverlay.displayName = "SecurityLockOverlay";
