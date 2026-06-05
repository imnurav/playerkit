/** Shared props accepted by every icon component. */
export type IconProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// ─── Navigation & Controls ────────────────────────────────────────────────────

export const IconMenu = ({
  width = 20,
  height = 20,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const IconClose = ({
  width = 20,
  height = 20,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconChevronLeft = ({
  width = 16,
  height = 16,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconChevronRight = ({
  width = 16,
  height = 16,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/** Down-pointing chevron. Pass `className` for section-toggle animations. */
export const IconChevron = ({
  width = 12,
  height = 12,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconSearch = ({
  width = 14,
  height = 14,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Actions ──────────────────────────────────────────────────────────────────

export const IconRotate = ({
  width = 15,
  height = 15,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const IconShare = ({
  width = 14,
  height = 14,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IconCode = ({
  width = 14,
  height = 14,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const IconCheck = ({
  width = 12,
  height = 12,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconCopy = ({
  width = 12,
  height = 12,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconPlay = ({
  width = 48,
  height = 48,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const IconBarChart = ({
  width = 15,
  height = 15,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const IconBook = ({
  width = 14,
  height = 14,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const IconAlertCircle = ({
  width = 40,
  height = 40,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ─── Device / Viewport ────────────────────────────────────────────────────────

export const IconDesktop = ({
  width = 16,
  height = 16,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const IconTablet = ({
  width = 16,
  height = 16,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPhone = ({
  width = 16,
  height = 16,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSmall = ({
  width = 14,
  height = 14,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Mock device status bar ───────────────────────────────────────────────────

export const IconCellular = ({
  width = 16,
  height = 10,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 17 11"
    fill="currentColor"
  >
    <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
    <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
    <rect x="8" y="4" width="2.5" height="7" rx="0.5" />
    <rect x="12" y="2" width="2.5" height="9" rx="0.5" />
    <rect x="16" y="0" width="2.5" height="11" rx="0.5" />
  </svg>
);

export const IconWifi = ({
  width = 14,
  height = 10,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 16 12"
    fill="currentColor"
  >
    <path d="M8 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-4.2-4.2a1 1 0 0 1 0-1.4 8 8 0 0 1 11.3 0 1 1 0 0 1-1.4 1.4 6 6 0 0 0-8.5 0zm-2.8-2.8a1 1 0 0 1 0-1.4 12 12 0 0 1 17 0 1 1 0 0 1-1.4 1.4 10 10 0 0 0-14.2 0z" />
  </svg>
);

export const IconBattery = ({
  width = 20,
  height = 10,
  className,
}: IconProps = {}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 22 11"
    fill="currentColor"
  >
    <rect
      x="0.5"
      y="0.5"
      width="18"
      height="10"
      rx="2.5"
      fill="none"
      stroke="currentColor"
    />
    <rect x="2.5" y="2.5" width="11" height="6" rx="1.5" fill="currentColor" />
    <path d="M19.5 3.5h1v4h-1z" fill="currentColor" />
  </svg>
);
