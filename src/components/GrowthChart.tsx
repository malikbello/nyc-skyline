"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX, area } from "d3-shape";
import appStats from "@/data/appStats.json";
import { SkylineSilhouette } from "./SkylineSilhouette";
import { useTheme, themeClasses } from "@/lib/theme";

const WIDTH = 960;
const HEIGHT = 380;
const MARGIN = { top: 30, right: 20, bottom: 40, left: 20 };

export default function GrowthChart() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const data = appStats.cumulative_by_decade;

  const { linePath, areaPath, points, xScale, yScale } = useMemo(() => {
    const decades = data.map((d) => d.decade);
    const counts = data.map((d) => d.cumulative_count);

    const xScale = scaleLinear()
      .domain([Math.min(...decades), Math.max(...decades)])
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const yScale = scaleLinear()
      .domain([0, Math.max(...counts) * 1.05])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const lineGen = line<{ decade: number; cumulative_count: number }>()
      .x((d) => xScale(d.decade))
      .y((d) => yScale(d.cumulative_count))
      .curve(curveMonotoneX);

    const areaGen = area<{ decade: number; cumulative_count: number }>()
      .x((d) => xScale(d.decade))
      .y0(HEIGHT - MARGIN.bottom)
      .y1((d) => yScale(d.cumulative_count))
      .curve(curveMonotoneX);

    return {
      linePath: lineGen(data) ?? "",
      areaPath: areaGen(data) ?? "",
      points: data.map((d) => ({ ...d, cx: xScale(d.decade), cy: yScale(d.cumulative_count) })),
      xScale,
      yScale,
    };
  }, [data]);

  const decadeTicks = points.filter((_, i) => i % 3 === 0);

  return (
    <section className={`relative overflow-hidden ${t.pageBg} px-6 py-20 ${t.text}`}>
      <SkylineSilhouette
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full ${t.silhouette}`}
        seed={11}
      />
      <div className="relative mx-auto max-w-5xl">
        <h2 className={`mb-2 text-sm font-medium uppercase tracking-widest ${t.textFaint}`}>
          The skyline is getting taller
        </h2>
        <p className="mb-10 max-w-2xl text-2xl font-semibold tracking-tight">
          From a handful of colonial-era structures to over a million buildings &mdash; New
          York&apos;s growth, decade by decade.
        </p>

        <motion.svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0456e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2a2356" stopOpacity={0.02} />
            </linearGradient>
          </defs>

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

          <motion.path
            d={areaPath}
            fill="url(#growthFill)"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1 } } }}
          />

          <motion.path
            d={linePath}
            fill="none"
            stroke="#f0456e"
            strokeWidth={2.5}
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 1.8, ease: "easeInOut" } },
            }}
          />

          {decadeTicks.map((p) => (
            <text
              key={p.decade}
              x={p.cx}
              y={HEIGHT - MARGIN.bottom + 20}
              textAnchor="middle"
              className={`text-[11px] ${theme === "light" ? "fill-black/40" : "fill-white/40"}`}
            >
              {p.decade}s
            </text>
          ))}

          {points.length > 0 && (
            <g>
              <circle cx={points[points.length - 1].cx} cy={points[points.length - 1].cy} r={4} fill="#f0456e" />
              <text
                x={points[points.length - 1].cx}
                y={points[points.length - 1].cy - 14}
                textAnchor="end"
                className={`text-sm font-semibold ${theme === "light" ? "fill-black" : "fill-white"}`}
              >
                {points[points.length - 1].cumulative_count.toLocaleString("en-US")} buildings
              </text>
            </g>
          )}
        </motion.svg>
      </div>
    </section>
  );
}
