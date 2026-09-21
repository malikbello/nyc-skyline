"""
Prepares the cleaned dataset for tippecanoe: keeps only the columns the web app
actually reads (dropping the rest to keep tile size down), simplifies geometry
slightly (photogrammetric rooftop outlines carry more vertices than a web map
needs -- tippecanoe's own per-zoom simplification handles the rest), and
exports GeoJSON.

Output: OUT_PATH (default: ../../data/nyc_buildings_app.geojson)
"""

import os

import geopandas as gpd

DATA_DIR = os.environ.get(
    "DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "data")
)
IN_PATH = os.environ.get("EXPORT_IN_PATH", os.path.join(DATA_DIR, "nyc_buildings_clean.parquet"))
OUT_PATH = os.environ.get("EXPORT_OUT_PATH", os.path.join(DATA_DIR, "nyc_buildings_app.geojson"))

APP_COLUMNS = [
    "doitt_id", "bin", "render_height_m", "construction_year", "decade",
    "last_status_type", "landuse", "bldgclass", "borough", "geometry",
]
SIMPLIFY_TOLERANCE_FT = 3.0  # in NY State Plane feet (EPSG:2263)


def main() -> None:
    gdf = gpd.read_parquet(IN_PATH)
    app_gdf = gdf[APP_COLUMNS].copy().rename(columns={"render_height_m": "height_m"})

    app_gdf_proj = app_gdf.to_crs(epsg=2263)
    app_gdf_proj["geometry"] = app_gdf_proj["geometry"].simplify(SIMPLIFY_TOLERANCE_FT)
    app_gdf = app_gdf_proj.to_crs(epsg=4326)

    app_gdf.to_file(OUT_PATH, driver="GeoJSON")
    size_mb = os.path.getsize(OUT_PATH) / 1e6
    print(f"Saved {OUT_PATH}: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
