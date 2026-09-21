import { interpolateHcl } from "d3-interpolate";
import { scaleLinear } from "d3-scale";

export const MIN_DECADE = 1800;
export const MAX_DECADE = 2020;

// A warm-to-cool "heat of construction" gradient: deep indigo (old) through
// teal, gold, and ember to hot pink (newest) -- built for a dark basemap,
// avoiding the muddy look flat discrete color stops give on dark backgrounds.
const GRADIENT_STOPS = ["#2a2356", "#2e5c8a", "#2f9985", "#e8c15a", "#e9703e", "#f0456e"];

const stopPositions = GRADIENT_STOPS.map((_, i) => i / (GRADIENT_STOPS.length - 1));

function interpolateGradient(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stopPositions.length - 2 && clamped > stopPositions[i + 1]) i++;
  const localT = (clamped - stopPositions[i]) / (stopPositions[i + 1] - stopPositions[i]);
  return interpolateHcl(GRADIENT_STOPS[i], GRADIENT_STOPS[i + 1])(localT);
}

const decadeToT = scaleLinear().domain([MIN_DECADE, MAX_DECADE]).clamp(true);

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function colorForDecade(decade: number | null | undefined): [number, number, number] {
  if (decade === null || decade === undefined || Number.isNaN(decade)) return [90, 90, 100];
  const hex = interpolateGradient(decadeToT(decade));
  return hexToRgb(hex);
}

export function gradientCss(): string {
  const stops = GRADIENT_STOPS.map((c, i) => `${c} ${(i / (GRADIENT_STOPS.length - 1)) * 100}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
