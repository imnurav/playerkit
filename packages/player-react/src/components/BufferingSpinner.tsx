import type { BufferingSpinnerProps } from "../types";
import { memo } from "react";

export const BufferingSpinner = memo(function BufferingSpinner(
  props: BufferingSpinnerProps,
) {
  const { isBuffering, hasError } = props;
  if (!isBuffering || hasError) return null;

  return (
    <div className="vp-buffering" aria-label="Buffering">
      <span className="vp-buffering__spinner" />
    </div>
  );
});

BufferingSpinner.displayName = "BufferingSpinner";
