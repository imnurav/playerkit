export type PlayerControlVariant = "primary" | "secondary" | "ghost";

export type PlayerControlSize = "sm" | "md" | "lg";

export type PlayerControlClassOptions = {
  variant?: PlayerControlVariant;
  size?: PlayerControlSize;
  isActive?: boolean;
  className?: string;
};

const variantClassName: Record<PlayerControlVariant, string> = {
  primary: "vhp-control vhp-control-primary",
  secondary: "vhp-control vhp-control-secondary",
  ghost: "vhp-control vhp-control-ghost",
};

const sizeClassName: Record<PlayerControlSize, string> = {
  sm: "vhp-control-sm",
  md: "vhp-control-md",
  lg: "vhp-control-lg",
};

export function getPlayerControlClassName(
  options: PlayerControlClassOptions = {},
) {
  const variant = options.variant || "secondary";
  const size = options.size || "md";

  return [
    variantClassName[variant],
    sizeClassName[size],
    options.isActive ? "is-active" : "",
    options.className || "",
  ]
    .filter(Boolean)
    .join(" ");
}
