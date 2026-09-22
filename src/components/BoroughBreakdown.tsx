"use client";

import { motion } from "framer-motion";
import appStats from "@/data/appStats.json";
import { boroughColors } from "@/lib/boroughColors";
import { useTheme, themeClasses } from "@/lib/theme";
import { Reveal, ChapterMark } from "./Reveal";

export default function BoroughBreakdown() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const colors = boroughColors(theme);
  const maxCount = Math.max(...appStats.by_borough.map((b) => b.count));
  const sorted = [...appStats.by_borough].sort((a, b) => b.count - a.count);

  return (
    <section className={`${t.pageBg} px-6 py-20 ${t.text}`}>
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <Reveal>
          <ChapterMark n="06: By the numbers" />
          <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
            Borough by borough
          </h2>
          <p className="max-w-md text-2xl font-semibold tracking-tight">
            Queens has the most buildings by far : Manhattan has the fewest, and by far the
            tallest.
          </p>
        </Reveal>

        <div className="space-y-5">
          {sorted.map((b, i) => (
            <Reveal key={b.borough} delay={i * 0.06}>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{b.borough}</span>
                  <span className={t.textMuted}>
                    {b.count.toLocaleString("en-US")} buildings &middot; avg {b.avg_height_m}m
                  </span>
                </div>
                <div className={`h-3 w-full overflow-hidden rounded-full ${theme === "light" ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors[b.borough] }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(b.count / maxCount) * 100}%` }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
