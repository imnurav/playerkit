import { useState, useEffect, useRef } from "react";
import type { PlayerCustomization } from "../types";

/**
 * Reusable hook to synchronize and manage player object fit mode ("contain", "cover", "fill")
 * dynamically with customization props.
 */
export function usePlayerObjectFit(customization?: PlayerCustomization) {
  const [objectFit, setObjectFit] = useState<"contain" | "cover" | "fill">(
    customization?.objectFit ?? "contain",
  );

  const prevPropObjectFitRef = useRef(customization?.objectFit);

  useEffect(() => {
    if (
      customization?.objectFit &&
      customization.objectFit !== prevPropObjectFitRef.current
    ) {
      setObjectFit(customization.objectFit);
      prevPropObjectFitRef.current = customization.objectFit;
    }
  }, [customization?.objectFit]);

  return { objectFit, setObjectFit };
}
