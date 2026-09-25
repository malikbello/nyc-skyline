"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});

// The saved theme lives in localStorage, outside React. Reading it through
// useSyncExternalStore (server snapshot "dark") avoids both a hydration
// mismatch and the extra render of setting state from an effect on mount.
// memoryTheme keeps the toggle working when storage is blocked.
const STORAGE_KEY = "skyline-theme";
const listeners = new Set<() => void>();
let memoryTheme: Theme = "dark";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage blocked -- fall through to the in-memory value
  }
  return memoryTheme;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  const toggleTheme = () => {
    const next: Theme = readTheme() === "light" ? "dark" : "light";
    memoryTheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked -- memoryTheme still carries the change
    }
    listeners.forEach((l) => l());
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
    textMuted: "text-black/65",
    textFaint: "text-black/55",
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
    textFaint: "text-white/50",
    cardBg: "bg-white/[0.03]",
    cardBgHover: "hover:bg-white/[0.06]",
    border: "border-white/10",
    borderHover: "hover:border-white/20",
    silhouette: "text-white/[0.05]",
    gridLine: "white",
    basemap: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
  },
} as const;
