"use client";

import { useEffect } from "react";

export function ThemeRoot() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("bridgespace-theme");
      if (t === "light" || t === "dark") {
        document.documentElement.dataset.theme = t;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
