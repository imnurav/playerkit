import { memo } from "react";

export type BufferingSpinnerProps = {
  isBuffering: boolean;
  hasError: boolean;
};

export const BufferingSpinner = memo(function BufferingSpinner({
  isBuffering,
  hasError,
}: BufferingSpinnerProps) {
  if (!isBuffering || hasError) return null;

  return (
    <div className="vp-buffering" aria-label="Buffering">
      <span className="vp-buffering__spinner" />
    </div>
  );
});
