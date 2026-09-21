"use client";

import { useTheme, themeClasses } from "@/lib/theme";

export default function Footer() {
  const { theme } = useTheme();
  const t = themeClasses[theme];

  return (
    <footer className={`border-t ${t.border} ${t.pageBg} px-6 py-10 text-center`}>
      <p className={`text-sm ${t.textMuted}`}>
        Built by{" "}
        <a
          href="https://malikbello.is-a.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-medium underline underline-offset-4 ${t.text}`}
        >
          Malik Pelumi Bello
        </a>
      </p>
      <p className={`mt-1 text-xs ${t.textFaint}`}>
        NYC Building Footprints &times; PLUTO, joined on BBL &middot;{" "}
        <a
          href="https://github.com/malikbello/nyc-skyline"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          source
        </a>
      </p>
    </footer>
  );
}
