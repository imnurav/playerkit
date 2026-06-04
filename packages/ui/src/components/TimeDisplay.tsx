import type { TimeDisplayProps } from "../types";
import { formatPlayerTime } from "../format";

export function TimeDisplay(props: TimeDisplayProps) {
  const { currentTime, duration, isLive = false, className = "" } = props;

  if (isLive) {
    // Live streams: no time display. Floating LIVE/Go Live button shows state.
    return null;
  }

  return (
    <span className={`pk-time ${className}`.trim()}>
      {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
    </span>
  );
}
