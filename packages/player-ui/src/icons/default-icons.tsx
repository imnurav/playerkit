export type PlayerIconProps = {
  className?: string;
};

export function IconPlay(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

export function IconPause(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function IconRewind(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M12.5 8l-6 4 6 4V8z" />
      <path d="M19.5 8l-6 4 6 4V8z" />
    </svg>
  );
}

export function IconForward(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M4.5 8v8l6-4-6-4z" />
      <path d="M11.5 8v8l6-4-6-4z" />
    </svg>
  );
}

export function IconVolume(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function IconVolumeOff(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63z" />
      <path d="M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
      <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z" />
    </svg>
  );
}

export function IconMaximize(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zM17 17h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

export function IconMinimize(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M5 16h3v3h2v-5H5v2zM8 8H5v2h5V5H8v3zM14 19h2v-3h3v-2h-5v5zM16 8V5h-2v5h5V8h-3z" />
    </svg>
  );
}

export function IconSettings(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

/** Contain — video fits inside with bars */
export function IconFitContain(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="6"
        y="8"
        width="12"
        height="8"
        rx="1"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

/** Cover — video fills, may crop */
export function IconFitCover(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Fill / Stretch — video stretches to fill */
export function IconFitFill(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 7L4 4M17 7l3-3M7 17l-3 3M17 17l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="1"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}
