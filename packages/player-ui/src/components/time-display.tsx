import { formatPlayerTime } from "../format";

export type TimeDisplayProps = {
  currentTime: number;
  duration: number;
  className?: string;
};

export function TimeDisplay({
  currentTime,
  duration,
  className = "",
}: TimeDisplayProps) {
  return (
    <span className={`vhp-time ${className}`.trim()}>
      {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
    </span>
  );
}
