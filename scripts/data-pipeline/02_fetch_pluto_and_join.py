"""
Downloads the FULL PLUTO tax-lot dataset (Socrata id 64uk-42ks, ~858K rows --
not the earlier 50K-row sample used in the original notebook) and joins it onto
the building footprints from 01_fetch_building_footprints.py via BBL.

PLUTO measures tax lots; the footprints file measures individual buildings.
A tax lot can contain multiple buildings, which is exactly why this is a
footprints-LEFT-JOIN-pluto (one BBL -> many building rows), not the other way
around -- footprints stay the geometry backbone, PLUTO only adds lot-level
attributes (land use, building class) where a match exists.

Requires: geopandas, pyarrow (pip install geopandas pyarrow)

Output: OUT_PATH (default: ../../data/nyc_buildings_joined.parquet)
"""

import os
import urllib.request

import geopandas as gpd
import pandas as pd

DATA_DIR = os.environ.get(
    "DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "data")
)
FOOTPRINTS_PATH = os.environ.get(
    "FOOTPRINTS_PATH", os.path.join(DATA_DIR, "nyc_building_footprints_raw.geojson")
)
PLUTO_OUT_PATH = os.environ.get("PLUTO_OUT_PATH", os.path.join(DATA_DIR, "pluto_full.csv"))
JOINED_OUT_PATH = os.environ.get(
    "JOINED_OUT_PATH", os.path.join(DATA_DIR, "nyc_buildings_joined.parquet")
)

PLUTO_URL = "https://data.cityofnewyork.us/resource/64uk-42ks.csv?$limit=900000"

KEEP_COLUMNS = [
    "doitt_id", "bin", "mappluto_bbl", "height_roof", "construction_year",
    "last_status_type", "geom_source", "landuse", "bldgclass", "yearbuilt",
    "numfloors", "borough", "geometry",
]


def main() -> None:
    print("Downloading full PLUTO ...")
    urllib.request.urlretrieve(PLUTO_URL, PLUTO_OUT_PATH)
    pluto = pd.read_csv(PLUTO_OUT_PATH, low_memory=False)
    print("PLUTO full:", pluto.shape)

    # BBL exactly as NYC constructs it: borough code (1 digit) + block (5 digit) + lot (4 digit)
    pluto["bbl"] = (
        pluto["borocode"].astype(str)
        + pluto["block"].astype(int).astype(str).str.zfill(5)
        + pluto["lot"].astype(int).astype(str).str.zfill(4)
    )

    print("Loading footprints ...")
    footprints = gpd.read_file(FOOTPRINTS_PATH)
    print("Footprints:", footprints.shape)
    footprints["mappluto_bbl"] = footprints["mappluto_bbl"].astype(str)

    joined = footprints.merge(
        pluto[["bbl", "landuse", "bldgclass", "yearbuilt", "numfloors", "borough"]],
        left_on="mappluto_bbl", right_on="bbl", how="left",
    )

    match_rate = joined["bbl"].notna().mean()
    print(f"Join match rate: {match_rate:.4f}")
    if match_rate < 0.9:
        print("WARNING: match rate is unexpectedly low -- NYC's own footprints metadata "
              "notes mappluto_bbl values can occasionally be wrong; inspect before proceeding.")

    joined = joined[KEEP_COLUMNS]
    joined.to_parquet(JOINED_OUT_PATH)
    size_mb = os.path.getsize(JOINED_OUT_PATH) / 1e6
    print(f"Saved {JOINED_OUT_PATH}: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
