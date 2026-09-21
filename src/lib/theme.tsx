"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("skyline-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      // localStorage unavailable -- keep default
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("skyline-theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Shared theme-aware class fragments, kept in one place so every section stays consistent.
export const themeClasses = {
  light: {
    pageBg: "bg-[#fafaf9]",
    pageBgAlt: "bg-[#f1efe9]",
    text: "text-[#111113]",
    textMuted: "text-black/50",
    textFaint: "text-black/35",
    cardBg: "bg-black/[0.02]",
    cardBgHover: "hover:bg-black/[0.04]",
    border: "border-black/10",
    borderHover: "hover:border-black/20",
    silhouette: "text-black/[0.05]",
    gridLine: "black",
    basemap: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
  },
  dark: {
    pageBg: "bg-[#05070c]",
    pageBgAlt: "bg-[#0a0d16]",
    text: "text-white",
    textMuted: "text-white/60",
    textFaint: "text-white/40",
    cardBg: "bg-white/[0.03]",
    cardBgHover: "hover:bg-white/[0.06]",
    border: "border-white/10",
    borderHover: "hover:border-white/20",
    silhouette: "text-white/[0.05]",
    gridLine: "white",
    basemap: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
  },
} as const;
