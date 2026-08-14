"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "dpr_theme";

export function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const next = readTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return { theme, toggleTheme };
}
