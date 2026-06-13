import { useState, useEffect } from "react";

/**
 * Returns true when the viewport is in portrait orientation.
 * Uses matchMedia with resize fallback for broad browser support.
 */
export function useOrientation(): boolean {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const update = () => setIsPortrait(window.innerHeight > window.innerWidth);

    const mql = window.matchMedia("(orientation: portrait)");
    mql.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mql.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return isPortrait;
}
