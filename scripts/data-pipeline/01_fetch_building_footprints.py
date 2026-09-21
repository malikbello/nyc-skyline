"""
Downloads NYC's official Building Footprints dataset (Socrata id 5zhs-2jue):
~1.08M building polygons with real measured roof height, per-building
construction year, demolition/construction status, and a BBL field
(`mappluto_bbl`) built specifically to join against PLUTO.

Run in an environment that can reach data.cityofnewyork.us -- it blocks some
cloud/CI IP ranges outright (403 on the bare domain root). If it 403s here,
paste this same code into a Google Colab cell instead.

Output: OUT_PATH (default: ../../data/nyc_building_footprints_raw.geojson, ~855MB)
"""

import os
import urllib.request

OUT_PATH = os.environ.get(
    "FOOTPRINTS_OUT_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "nyc_building_footprints_raw.geojson"),
)

FOOTPRINTS_URL = "https://data.cityofnewyork.us/api/geospatial/5zhs-2jue?method=export&format=GeoJSON"


def main() -> None:
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    print(f"Downloading NYC Building Footprints to {OUT_PATH} ...")
    urllib.request.urlretrieve(FOOTPRINTS_URL, OUT_PATH)
    size_mb = os.path.getsize(OUT_PATH) / 1e6
    print(f"Done: {size_mb:.1f} MB")

    with open(OUT_PATH) as f:
        head = f.read(2000)
    expected_fields = ["mappluto_bbl", "height_roof", "construction_year", "last_status_type", "bin"]
    missing = [field for field in expected_fields if field not in head]
    if missing:
        print(f"WARNING: expected fields not seen in first 2000 chars: {missing}")
        print("The dataset schema may have changed -- inspect before trusting downstream steps.")
    else:
        print("Sanity check passed: all expected join/attribute fields present.")


if __name__ == "__main__":
    main()
