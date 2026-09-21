"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import appStats from "@/data/appStats.json";
import { boroughColors, BOROUGHS } from "@/lib/boroughColors";
import { Reveal, ChapterMark } from "./Reveal";
import { useTheme, themeClasses } from "@/lib/theme";

const WIDTH = 960;
const HEIGHT = 420;
const MARGIN = { top: 20, right: 100, bottom: 40, left: 20 };

export default function RegionalGrowthChart() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const colors = boroughColors(theme);

  const { series, xScale, yScale } = useMemo(() => {
    const decades = Array.from(new Set(appStats.growth_by_decade.map((d) => d.decade))).sort(
      (a, b) => a - b
    );

    const series = BOROUGHS.map((borough) => {
      let cumulative = 0;
      const points = decades.map((decade) => {
        const match = appStats.growth_by_decade.find(
          (d) => d.decade === decade && d.borough === borough
        );
        cumulative += match?.count ?? 0;
        return { decade, cumulative };
      });
      return { borough, points };
    });

    const maxCumulative = Math.max(...series.map((s) => s.points[s.points.length - 1].cumulative));

    const xScale = scaleLinear()
      .domain([Math.min(...decades), Math.max(...decades)])
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const yScale = scaleLinear()
      .domain([0, maxCumulative * 1.05])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    return { series, xScale, yScale };
  }, []);

  const lineGen = line<{ decade: number; cumulative: number }>()
    .x((d) => xScale(d.decade))
    .y((d) => yScale(d.cumulative))
    .curve(curveMonotoneX);

  return (
    <section className={`${t.pageBg} px-6 py-20 ${t.text}`}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <ChapterMark n="04 — By region" />
          <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
            Not every borough grew the same way
          </h2>
          <p className="mb-10 max-w-2xl text-2xl font-semibold tracking-tight">
            Queens and Brooklyn built outward, decade after decade. Manhattan mostly stopped
            adding buildings a century ago &mdash; and started building up instead.
          </p>
        </Reveal>

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

          {series.map((s, i) => (
            <motion.path
              key={s.borough}
              d={lineGen(s.points) ?? ""}
              fill="none"
              stroke={colors[s.borough]}
              strokeWidth={2.5}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.6, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}

          {series.map((s) => {
            const last = s.points[s.points.length - 1];
            return (
              <g key={s.borough}>
                <circle cx={xScale(last.decade)} cy={yScale(last.cumulative)} r={3.5} fill={colors[s.borough]} />
                <text
                  x={xScale(last.decade) + 8}
                  y={yScale(last.cumulative) + 4}
                  className="text-[12px] font-medium"
                  fill={colors[s.borough]}
                >
                  {s.borough}
                </text>
              </g>
            );
          })}

          {[1850, 1900, 1950, 2000].map((decade) => (
            <text
              key={decade}
              x={xScale(decade)}
              y={HEIGHT - MARGIN.bottom + 20}
              textAnchor="middle"
              className={`text-[11px] ${theme === "light" ? "fill-black/55" : "fill-white/50"}`}
            >
              {decade}s
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
