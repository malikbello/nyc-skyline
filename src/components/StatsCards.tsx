"use client";

import { Building2, Landmark, Ruler, CalendarClock } from "lucide-react";
import appStats from "@/data/appStats.json";
import { SkylineSilhouette } from "./SkylineSilhouette";
import { useTheme, themeClasses } from "@/lib/theme";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

const cards = [
  {
    icon: Building2,
    label: "Buildings mapped",
    value: formatNumber(appStats.total_buildings),
    detail: `${formatNumber(appStats.total_with_year)} with a known construction year`,
  },
  {
    icon: Landmark,
    label: "Tallest building",
    value: `${appStats.tallest.height_m}m`,
    detail: `${appStats.tallest.borough}, built ${appStats.tallest.year ?? "unknown"}`,
  },
  {
    icon: CalendarClock,
    label: "Oldest surviving building",
    value: `${appStats.oldest.year}`,
    detail: `${appStats.oldest.borough}`,
  },
  {
    icon: Ruler,
    label: "Average building height",
    value: `${appStats.avg_height_m}m`,
    detail: `Median ${appStats.median_height_m}m across all five boroughs`,
  },
];

export default function StatsCards() {
  const { theme } = useTheme();
  const t = themeClasses[theme];

  return (
    <section className={`relative overflow-hidden ${t.pageBg} px-6 py-20 ${t.text}`}>
      <SkylineSilhouette
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full ${t.silhouette}`}
        seed={3}
      />
      <div className="relative mx-auto max-w-5xl">
        <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
          The city, in numbers
        </h2>
        <p className="mb-10 max-w-xl text-2xl font-semibold tracking-tight">
          Every building has a story. Here&apos;s the whole city&apos;s.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, value, detail }) => (
            <div
              key={label}
              className={`rounded-2xl border ${t.border} ${t.cardBg} p-6 backdrop-blur-sm transition ${t.borderHover} ${t.cardBgHover}`}
            >
              <Icon size={20} className={`mb-4 ${t.textFaint}`} />
              <div className="mb-1 text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
              <div className={`text-sm font-medium ${t.textMuted}`}>{label}</div>
              <div className={`mt-1 text-xs ${t.textFaint}`}>{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
