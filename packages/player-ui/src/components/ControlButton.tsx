import type { ControlButtonProps } from "../types";
import { forwardRef } from "react";

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  function ControlButton(props, ref) {
    const { className = "", children, ...buttonProps } = props;
    return (
      <button
        ref={ref}
        type="button"
        className={`vp-icon-button ${className}`.trim()}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

ControlButton.displayName = "ControlButton";
