export type PlayerIconProps = {
  className?: string;
};

export function IconPlay(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function IconPause(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

export function IconRewind(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M11 7v10l-7-5zM20 7v10l-7-5z" />
    </svg>
  );
}

export function IconForward(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M4 7v10l7-5zM13 7v10l7-5z" />
    </svg>
  );
}

export function IconVolume(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M4 9v6h4l5 4V5L8 9zM16 8.4v7.2c1.2-.8 2-2.1 2-3.6s-.8-2.8-2-3.6z" />
    </svg>
  );
}

export function IconVolumeOff(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M4 9v6h4l5 4V5L8 9zM18.6 12l2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z" />
    </svg>
  );
}

export function IconMaximize(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M5 5h6v2H8.4L11 9.6 9.6 11 7 8.4V11H5zM13 5h6v6h-2V8.4L14.4 11 13 9.6 15.6 7H13zM5 13h2v2.6L9.6 13l1.4 1.4L8.4 17H11v2H5zM17 15.6V13h2v6h-6v-2h2.6L13 14.4l1.4-1.4z" />
    </svg>
  );
}

export function IconMinimize(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M9 5h2v6H5V9h2.6L5 6.4 6.4 5 9 7.6zM13 5h2v2.6L17.6 5 19 6.4 16.4 9H19v2h-6zM5 13h6v6H9v-2.6L6.4 19 5 17.6 7.6 15H5zM15 16.4V19h-2v-6h6v2h-2.6l2.6 2.6-1.4 1.4z" />
    </svg>
  );
}

export function IconSettings(props: PlayerIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 2.5A8 8 0 0 0 7 6L4.6 5l-2 3.5 2 1.5a8 8 0 0 0 0 3l-2 1.5 2 3.5L7 18a8 8 0 0 0 2.6 1.5L10 22h4l.4-2.5A8 8 0 0 0 17 18l2.4 1 2-3.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
    </svg>
  );
}
