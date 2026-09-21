# Data pipeline

Run these in order to go from nothing to a tiled, web-ready NYC buildings dataset.
Steps 1-2 fetch from NYC Open Data (`data.cityofnewyork.us`), which blocks requests
from some cloud/CI IP ranges (confirmed: 403 even on the bare domain root from one
such environment) -- if step 1 or 2 fails with a 403, run them in Google Colab
instead (same code, just paste into a Colab cell) and download the output locally.

1. `01_fetch_building_footprints.py` -- downloads NYC's official Building Footprints
   dataset (~1.08M polygons, real measured height + per-building construction year).
2. `02_fetch_pluto_and_join.py` -- downloads the *full* PLUTO tax-lot dataset
   (~858K rows, not a sample) and joins it onto the footprints via BBL
   (`mappluto_bbl`), producing `nyc_buildings_joined.parquet`.
3. `03_clean.py` -- fixes the one known data error (a column-shift bug that puts a
   BIN value into `height_roof`), converts height from feet to meters, floors
   zero-height footprints to a 1-story minimum for extrusion, nulls out impossible
   construction years, and buckets by decade.
4. `04_export_for_tiles.py` -- drops columns the web app doesn't need, simplifies
   geometry, and exports newline-safe GeoJSON for tippecanoe.
5. `05_tile.sh` -- runs `tippecanoe` to produce `nyc_buildings.pmtiles`, the file
   the app actually serves. Requires `tippecanoe` (`apt install tippecanoe` on
   Linux/WSL; no official Windows build, hence step 5 being a shell script for
   WSL/Colab/Docker rather than a Python script).

Each script reads from and writes to `../../data/` (relative to this folder) by
default; override with the environment variables noted in each script's header if
running somewhere the paths differ (e.g. Colab's `/content/`).
