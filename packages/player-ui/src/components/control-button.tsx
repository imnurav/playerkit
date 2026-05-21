import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
};

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  function ControlButton({ className = "", children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`vhp-icon-button ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);
