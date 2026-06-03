import { useState, useEffect } from "react";

/**
 * Custom hook to check if the client device is a mobile screen or touch hybrid.
 */
export function useCheckMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 760;
      setIsMobile(isSmallScreen || (hasTouch && window.innerWidth <= 1366));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
