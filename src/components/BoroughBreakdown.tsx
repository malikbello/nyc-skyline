"use client";

import { motion } from "framer-motion";
import appStats from "@/data/appStats.json";
import { BOROUGH_COLORS } from "@/lib/boroughColors";
import { useTheme, themeClasses } from "@/lib/theme";

export default function BoroughBreakdown() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const maxCount = Math.max(...appStats.by_borough.map((b) => b.count));
  const sorted = [...appStats.by_borough].sort((a, b) => b.count - a.count);

  return (
    <section className={`${t.pageBg} px-6 py-20 ${t.text}`}>
      <div className="mx-auto max-w-5xl">
        <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
          Borough by borough
        </h2>
        <p className="mb-10 max-w-2xl text-2xl font-semibold tracking-tight">
          Queens has the most buildings by far &mdash; Manhattan has the fewest, and by far the
          tallest.
        </p>

        <div className="space-y-5">
          {sorted.map((b, i) => (
            <div key={b.borough}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-semibold">{b.borough}</span>
                <span className={t.textMuted}>
                  {b.count.toLocaleString("en-US")} buildings &middot; avg {b.avg_height_m}m
                </span>
              </div>
              <div className={`h-3 w-full overflow-hidden rounded-full ${theme === "light" ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: BOROUGH_COLORS[b.borough] }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(b.count / maxCount) * 100}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
