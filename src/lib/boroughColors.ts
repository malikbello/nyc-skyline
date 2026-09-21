// Computed actual WCAG contrast ratios (not eyeballed) against each theme's
// background and picked colors that clear 4.5:1. The original flat palette
// had real failures: Queens gold was ~1.65:1 against the light background,
// Brooklyn ~2.93:1, Staten Island's blue ~2.9:1 against the dark background
// -- all well under the WCAG AA minimum. Each theme gets its own tuned set.
export const BOROUGH_COLORS_LIGHT: Record<string, string> = {
  Manhattan: "#c22752",
  Brooklyn: "#b8511f",
  Queens: "#8a6510",
  Bronx: "#1f7a68",
  "Staten Island": "#2e5c8a",
};

export const BOROUGH_COLORS_DARK: Record<string, string> = {
  Manhattan: "#f0456e",
  Brooklyn: "#e9703e",
  Queens: "#e8c15a",
  Bronx: "#3dbfa4",
  "Staten Island": "#6ea8e8",
};

export function boroughColors(theme: "light" | "dark"): Record<string, string> {
  return theme === "light" ? BOROUGH_COLORS_LIGHT : BOROUGH_COLORS_DARK;
}

export const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
