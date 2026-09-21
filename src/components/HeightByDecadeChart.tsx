"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import appStats from "@/data/appStats.json";
import { boroughColors, BOROUGHS } from "@/lib/boroughColors";
import { useTheme, themeClasses } from "@/lib/theme";
import { SkylineSilhouette } from "./SkylineSilhouette";
import { Reveal, ChapterMark } from "./Reveal";

const WIDTH = 960;
const HEIGHT = 420;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 34 };

// The original class notebook's headline chart, recreated against the full
// 1.08M-building dataset (not the 50K PLUTO sample) -- average building
// height by decade, by borough.
export default function HeightByDecadeChart() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const colors = boroughColors(theme);

  const { series, xScale, yScale, labelPositions } = useMemo(() => {
    const decades = Array.from(new Set(appStats.growth_by_decade.map((d) => d.decade))).sort(
      (a, b) => a - b
    );

    const series = BOROUGHS.map((borough) => {
      const points = decades
        .map((decade) => {
          const match = appStats.growth_by_decade.find(
            (d) => d.decade === decade && d.borough === borough
          );
          return match ? { decade, avgHeight: match.avg_height_m } : null;
        })
        .filter((p): p is { decade: number; avgHeight: number } => p !== null);
      return { borough, points };
    });

    const maxHeight = Math.max(...series.flatMap((s) => s.points.map((p) => p.avgHeight)));

    const xScale = scaleLinear()
      .domain([Math.min(...decades), Math.max(...decades)])
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const yScale = scaleLinear()
      .domain([0, maxHeight * 1.1])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    // End-of-line labels: Brooklyn/Bronx/Queens/Staten Island all sit within
    // a few meters of each other, so placing each label at its exact y
    // collides them. Greedily push overlapping labels apart, top to bottom.
    const MIN_LABEL_GAP = 16;
    const labelPositions = series
      .map((s) => {
        const last = s.points[s.points.length - 1];
        return last ? { borough: s.borough, x: xScale(last.decade), y: yScale(last.avgHeight) } : null;
      })
      .filter((p): p is { borough: string; x: number; y: number } => p !== null)
      .sort((a, b) => a.y - b.y);

    for (let i = 1; i < labelPositions.length; i++) {
      const prev = labelPositions[i - 1];
      const cur = labelPositions[i];
      if (cur.y - prev.y < MIN_LABEL_GAP) {
        cur.y = prev.y + MIN_LABEL_GAP;
      }
    }

    return { series, xScale, yScale, labelPositions };
  }, []);

  const lineGen = line<{ decade: number; avgHeight: number }>()
    .x((d) => xScale(d.decade))
    .y((d) => yScale(d.avgHeight))
    .curve(curveMonotoneX);

  return (
    <section className={`relative overflow-hidden ${t.pageBg} px-6 py-20 ${t.text}`}>
      <SkylineSilhouette className={`pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full ${t.silhouette}`} seed={22} />
      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <ChapterMark n="05 — The insight" />
          <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
            The real skyline story
          </h2>
          <p className="mb-10 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Manhattan didn&apos;t just build more &mdash; it built up. Average building height by
            decade, by borough.
          </p>
        </Reveal>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full overflow-visible">
          {[10, 20, 30, 40].map((h) => (
            <g key={h}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yScale(h)}
                y2={yScale(h)}
                stroke={t.gridLine}
                strokeOpacity={theme === "light" ? 0.08 : 0.06}
              />
              <text x={4} y={yScale(h) + 4} className={`text-[10px] ${theme === "light" ? "fill-black/45" : "fill-white/55"}`}>
                {h}m
              </text>
            </g>
          ))}

          {series.map((s, i) => (
            <motion.path
              key={s.borough}
              d={lineGen(s.points) ?? ""}
              fill="none"
              stroke={colors[s.borough]}
              strokeWidth={s.borough === "Manhattan" ? 3.5 : 2}
              opacity={s.borough === "Manhattan" ? 1 : 0.7}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.6, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}

          {labelPositions.map((p) => (
            <text
              key={p.borough}
              x={p.x - 4}
              y={p.y - 8}
              textAnchor="end"
              className="text-[12px] font-medium"
              fill={colors[p.borough]}
            >
              {p.borough}
            </text>
          ))}

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
