"use client";

import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme, themeClasses } from "@/lib/theme";

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const t = themeClasses[theme];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        theme === "light" ? "border-black/10 bg-white/70" : "border-white/10 bg-[#05070c]/70"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <a
          href="https://malikbello.is-a.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <Image
            src="/headshot.jpg"
            alt="Malik Pelumi Bello"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="leading-tight">
            <div className={`text-sm font-semibold ${t.text}`}>Malik Pelumi Bello</div>
            <div className={`text-xs ${t.textFaint}`}>AI/ML Engineer</div>
          </div>
        </a>

        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${t.border} ${t.cardBg} ${t.cardBgHover} ${t.text}`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>
    </header>
  );
}
