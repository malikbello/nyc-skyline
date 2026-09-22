import { interpolateHcl } from "d3-interpolate";
import { scaleLinear } from "d3-scale";

export const MIN_DECADE = 1800;
export const MAX_DECADE = 2020;

// A warm-to-cool "heat of construction" gradient: indigo (old) through blue,
// teal, gold, and ember to hot pink (newest). Theme-specific, not a single
// compromise palette -- computed WCAG contrast ratios showed the original
// single gradient's early (indigo/blue) stops were as low as 1.41:1 against
// the dark background (effectively invisible, and likely why most buildings
// -- overwhelmingly pre-1950, see the "what's still standing" chart's own
// 1920s peak -- read as a uniform near-black-blue smear once map lighting
// darkened them further). Every stop below is verified >=3.0:1 against its
// own theme's background.
const GRADIENT_STOPS_DARK = ["#7b6fd6", "#4f97d9", "#3fc4ad", "#f0cf6e", "#f4884a", "#ff5c82"];
const GRADIENT_STOPS_LIGHT = ["#4a3d8f", "#1f5f8f", "#1d7a6b", "#a97a12", "#b8501f", "#c22752"];

const stopPositions = GRADIENT_STOPS_DARK.map((_, i) => i / (GRADIENT_STOPS_DARK.length - 1));

function interpolateGradient(stops: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stopPositions.length - 2 && clamped > stopPositions[i + 1]) i++;
  const localT = (clamped - stopPositions[i]) / (stopPositions[i + 1] - stopPositions[i]);
  return interpolateHcl(stops[i], stops[i + 1])(localT);
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

export function colorForDecade(
  decade: number | null | undefined,
  theme: "light" | "dark" = "dark"
): [number, number, number] {
  const stops = theme === "light" ? GRADIENT_STOPS_LIGHT : GRADIENT_STOPS_DARK;
  if (decade === null || decade === undefined || Number.isNaN(decade)) {
    return theme === "light" ? [120, 120, 128] : [150, 150, 158];
  }
  const hex = interpolateGradient(stops, decadeToT(decade));
  return hexToRgb(hex);
}

export function gradientCss(theme: "light" | "dark" = "dark"): string {
  const stops = theme === "light" ? GRADIENT_STOPS_LIGHT : GRADIENT_STOPS_DARK;
  const cssStops = stops.map((c, i) => `${c} ${(i / (stops.length - 1)) * 100}%`);
  return `linear-gradient(90deg, ${cssStops.join(", ")})`;
}
