import { formatPlayerTime } from "../format";

export type TimeDisplayProps = {
  currentTime: number;
  duration: number;
  isLive?: boolean;
  className?: string;
};

export function TimeDisplay({
  currentTime,
  duration,
  isLive = false,
  className = "",
}: TimeDisplayProps) {
  if (isLive) {
    // Live streams: no time display. Floating LIVE/Go Live button shows state.
    return null;
  }

  return (
    <span className={`vp-time ${className}`.trim()}>
      {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
    </span>
  );
}
