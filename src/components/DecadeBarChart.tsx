"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { scaleLinear, scaleBand } from "d3-scale";
import appStats from "@/data/appStats.json";
import { colorForDecade } from "@/lib/decadeColor";
import { useTheme, themeClasses } from "@/lib/theme";

const WIDTH = 960;
const HEIGHT = 420;
const MARGIN = { top: 20, right: 20, bottom: 50, left: 20 };

// Matches blockandpaper's own chart concept: "Buildings standing today, by the
// decade they were built" -- a per-decade (not cumulative) count, plus an
// undated bar for buildings with no known construction year.
export default function DecadeBarChart() {
  const { theme } = useTheme();
  const t = themeClasses[theme];

  const bars = useMemo(() => {
    const withUndated = [
      ...appStats.count_by_decade.map((d) => ({ label: `${d.decade}s`, decade: d.decade, count: d.count })),
      { label: "Undated", decade: null, count: appStats.undated_count },
    ];
    return withUndated;
  }, []);

  const { xScale, yScale } = useMemo(() => {
    const xScale = scaleBand()
      .domain(bars.map((b) => b.label))
      .range([MARGIN.left, WIDTH - MARGIN.right])
      .padding(0.25);
    const yScale = scaleLinear()
      .domain([0, Math.max(...bars.map((b) => b.count)) * 1.08])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);
    return { xScale, yScale };
  }, [bars]);

  const peak = bars.reduce((a, b) => (b.count > a.count ? b : a), bars[0]);

  return (
    <section className={`${t.pageBg} px-6 py-20 ${t.text}`}>
      <div className="mx-auto max-w-5xl">
        <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
          What&apos;s still standing
        </h2>
        <p className="mb-10 max-w-2xl text-2xl font-semibold tracking-tight">
          Buildings standing today, by the decade they were built. The {peak.label} alone account
          for {peak.count.toLocaleString("en-US")} of the city&apos;s current buildings.
        </p>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yScale(yScale.domain()[1] * f)}
              y2={yScale(yScale.domain()[1] * f)}
              stroke={t.gridLine}
              strokeOpacity={theme === "light" ? 0.08 : 0.06}
            />
          ))}

          {bars.map((b, i) => {
            const barX = xScale(b.label) ?? 0;
            const barWidth = xScale.bandwidth();
            const barY = yScale(b.count);
            const barHeight = HEIGHT - MARGIN.bottom - barY;
            const [r, g, bl] = b.decade !== null ? colorForDecade(b.decade) : [140, 140, 150];

            return (
              <g key={b.label}>
                <motion.rect
                  x={barX}
                  width={barWidth}
                  fill={`rgb(${r},${g},${bl})`}
                  initial={{ y: HEIGHT - MARGIN.bottom, height: 0 }}
                  whileInView={{ y: barY, height: barHeight }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.02, ease: "easeOut" }}
                  rx={2}
                />
                {i % 2 === 0 && (
                  <text
                    x={barX + barWidth / 2}
                    y={HEIGHT - MARGIN.bottom + 18}
                    textAnchor="middle"
                    className={`text-[10px] ${theme === "light" ? "fill-black/50" : "fill-white/50"}`}
                  >
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
