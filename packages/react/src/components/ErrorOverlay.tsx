import type { PlayerErrorCategory } from "@playerkit/core";
import type { ErrorOverlayProps } from "../types";
import { memo } from "react";
import {
  IconFilm,
  IconLock,
  IconRetry,
  IconWifiOff,
  IconCloudOff,
  IconAlertCircle,
  IconAlertTriangle,
} from "@playerkit/ui";

function getErrorTitle(category?: PlayerErrorCategory): string {
  switch (category) {
    case "network":
      return "Connection Lost";
    case "source":
      return "Stream Unavailable";
    case "auth":
      return "Access Denied";
    case "media":
      return "Playback Error";
    case "server":
      return "Server Error";
    default:
      return "Unable to Play";
  }
}

function ErrorCategoryIcon(props: { category?: PlayerErrorCategory }) {
  const { category } = props;
  const className = "pk-error-overlay__category-icon";

  switch (category) {
    case "network":
      return <IconWifiOff className={className} />;
    case "source":
      return <IconFilm className={className} />;
    case "auth":
      return <IconLock className={className} />;
    case "media":
      return <IconAlertTriangle className={className} />;
    case "server":
      return <IconCloudOff className={className} />;
    default:
      return <IconAlertCircle className={className} />;
  }
}

export const ErrorOverlay = memo(function ErrorOverlay(
  props: ErrorOverlayProps,
) {
  const { error, onRetry } = props;
  if (!error?.fatal) return null;

  return (
    <div className="pk-error-overlay" role="alert">
      <div className="pk-error-overlay__icon">
        <ErrorCategoryIcon category={error.category} />
      </div>
      <div className="pk-error-overlay__title">
        {getErrorTitle(error.category)}
      </div>
      <div className="pk-error-overlay__message">{error.message}</div>
      {error.category !== "media" && onRetry && (
        <button
          type="button"
          className="pk-error-overlay__retry"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
        >
          <IconRetry className="pk-error-overlay__retry-icon" />
          Try Again
        </button>
      )}
    </div>
  );
});

ErrorOverlay.displayName = "ErrorOverlay";
