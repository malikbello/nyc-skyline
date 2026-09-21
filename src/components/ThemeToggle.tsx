"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, themeClasses } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = themeClasses[theme];

  return (
    <button
      onClick={toggleTheme}
      className={`fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border ${t.border} ${t.cardBg} backdrop-blur-md transition ${t.cardBgHover} ${t.text}`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
