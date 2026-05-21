import { formatPlayerTime } from "../format";

export type TimeDisplayProps = {
  currentTime: number;
  duration: number;
  isLive?: boolean;
  seekableStart?: number;
  seekableEnd?: number;
  className?: string;
};

export function TimeDisplay({
  currentTime,
  duration,
  isLive = false,
  seekableStart = 0,
  seekableEnd = 0,
  className = "",
}: TimeDisplayProps) {
  if (isLive && seekableEnd > seekableStart) {
    // Show time from current position within the DVR window
    const elapsed = Math.max(0, currentTime - seekableStart);
    const windowDuration = seekableEnd - seekableStart;
    return (
      <span className={`vp-time ${className}`.trim()}>
        {formatPlayerTime(elapsed)} / {formatPlayerTime(windowDuration)}
      </span>
    );
  }

  return (
    <span className={`vp-time ${className}`.trim()}>
      {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
    </span>
  );
}
