"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readTheme } from "@/hooks/useTheme";

/** Apply saved theme as early as possible on the client (admin UI). */
export function ThemeInit() {
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);
  return null;
}
