import type { PlayerErrorCategory, PlayerError } from "@varun/player-core";
import { memo } from "react";

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

function ErrorCategoryIcon({ category }: { category?: PlayerErrorCategory }) {
  const props = {
    width: 48,
    height: 48,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (category) {
    case "network":
      // Wi-Fi off icon
      return (
        <svg {...props}>
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );
    case "source":
      // Film / video not found icon
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      );
    case "auth":
      // Lock icon
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "media":
      // Alert triangle icon
      return (
        <svg {...props}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "server":
      // Server / cloud off icon
      return (
        <svg {...props}>
          <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      // Generic alert circle
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

// Retry arrow icon
function IconRetry() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export type ErrorOverlayProps = {
  error: PlayerError | null;
  onRetry?: () => void;
};

export const ErrorOverlay = memo(function ErrorOverlay({
  error,
  onRetry,
}: ErrorOverlayProps) {
  if (!error?.fatal) return null;

  return (
    <div className="vp-error-overlay" role="alert">
      <div className="vp-error-overlay__icon">
        <ErrorCategoryIcon category={error.category} />
      </div>
      <div className="vp-error-overlay__title">
        {getErrorTitle(error.category)}
      </div>
      <div className="vp-error-overlay__message">{error.message}</div>
      {error.category !== "media" && onRetry && (
        <button
          type="button"
          className="vp-error-overlay__retry"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
        >
          <IconRetry />
          Try Again
        </button>
      )}
    </div>
  );
});
