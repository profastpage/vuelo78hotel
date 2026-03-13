"use client";

import { useEffect } from "react";
import { initAnimations } from "@/lib/animations";

type AnimationsProviderProps = {
  children: React.ReactNode;
};

/**
 * Client boundary that initialises the IntersectionObserver
 * entrance animation system after the first render.
 */
export function AnimationsProvider({ children }: AnimationsProviderProps) {
  useEffect(() => {
    const cleanup = initAnimations();
    return cleanup;
  }, []);

  return <>{children}</>;
}
