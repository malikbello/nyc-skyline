"""
Cleans the joined dataset from 02_fetch_pluto_and_join.py:

- height_roof ships in FEET (NYC's own units), not meters -- converts to meters
  for consistency with the rest of the pipeline.
- Drops one known data error: exactly one row has height_roof == its own bin
  number (a column-shift bug), producing an impossible ~650km height. Detected
  generically via a >550m sanity ceiling (well above any real NYC building)
  rather than hardcoded to that one row, so a future re-pull with a different
  broken row is still caught.
- 0.07% of footprints have height_roof == 0 (very low real structures, e.g.
  garages) -- floored to 3m (roughly one story) for extrusion so they're still
  visible rather than flat/invisible.
- Nulls construction_year values that are 0 or pre-1800 (35 rows in the original
  pull -- data errors, not real claims of 17th-century-or-earlier structures).
- Adds a `decade` column for the growth-by-decade visualization.

Output: OUT_PATH (default: ../../data/nyc_buildings_clean.parquet)
"""

import os

import geopandas as gpd
import pandas as pd

DATA_DIR = os.environ.get(
    "DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "data")
)
IN_PATH = os.environ.get("CLEAN_IN_PATH", os.path.join(DATA_DIR, "nyc_buildings_joined.parquet"))
OUT_PATH = os.environ.get("CLEAN_OUT_PATH", os.path.join(DATA_DIR, "nyc_buildings_clean.parquet"))

FEET_TO_METERS = 0.3048
IMPOSSIBLE_HEIGHT_M = 550  # above any real NYC building; catches data errors generically
MIN_RENDER_HEIGHT_M = 3.0  # ~1 story, floor for footprints with height_roof == 0
MIN_PLAUSIBLE_YEAR = 1800


def main() -> None:
    gdf = gpd.read_parquet(IN_PATH)
    print("start shape:", gdf.shape)

    h_ft = pd.to_numeric(gdf["height_roof"], errors="coerce")
    n_impossible = (h_ft > IMPOSSIBLE_HEIGHT_M / FEET_TO_METERS).sum()
    if n_impossible:
        print(f"Nulling {n_impossible} row(s) with impossible height_roof (>{IMPOSSIBLE_HEIGHT_M}m)")
    h_ft = h_ft.mask(h_ft > IMPOSSIBLE_HEIGHT_M / FEET_TO_METERS)
    gdf["height_m"] = h_ft * FEET_TO_METERS

    n_zero = (gdf["height_m"] == 0).sum()
    print(f"Flooring {n_zero} zero-height row(s) to {MIN_RENDER_HEIGHT_M}m for extrusion")
    gdf["render_height_m"] = gdf["height_m"].where(gdf["height_m"] > 0, MIN_RENDER_HEIGHT_M)

    year = pd.to_numeric(gdf["construction_year"], errors="coerce")
    n_bad_year = ((year < MIN_PLAUSIBLE_YEAR) | (year == 0)).sum()
    print(f"Nulling {n_bad_year} row(s) with construction_year < {MIN_PLAUSIBLE_YEAR} or == 0")
    year = year.mask((year < MIN_PLAUSIBLE_YEAR) | (year == 0))
    gdf["construction_year"] = year
    gdf["decade"] = (year // 10 * 10).astype("Int64")

    if gdf.crs is None:
        gdf = gdf.set_crs("EPSG:4326")

    gdf.to_parquet(OUT_PATH)
    size_mb = os.path.getsize(OUT_PATH) / 1e6
    print(f"Saved {OUT_PATH}: {size_mb:.1f} MB")
    print(gdf[["height_m", "render_height_m", "construction_year", "decade"]].describe())


if __name__ == "__main__":
    main()
