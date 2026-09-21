#!/usr/bin/env bash
# Tiles the exported GeoJSON into a single PMTiles archive the app serves.
#
# Requires tippecanoe (no official Windows build -- run this in WSL, Colab, or
# a Linux Docker container): `apt-get install -y tippecanoe` on Debian/Ubuntu.
#
# --drop-densest-as-needed / --coalesce-densest-as-needed give tippecanoe's
# built-in equivalent of blockandpaper.com's low-zoom grid-cell aggregation --
# without them, ~1M building polygons at low zoom would be unreadable and slow.
# --extend-zooms-if-still-dropping keeps full detail at high zoom where it matters.
set -euo pipefail

DATA_DIR="${DATA_DIR:-$(dirname "$0")/../../data}"
IN_PATH="${TILE_IN_PATH:-$DATA_DIR/nyc_buildings_app.geojson}"
OUT_PATH="${TILE_OUT_PATH:-$DATA_DIR/nyc_buildings.pmtiles}"

tippecanoe -o "$OUT_PATH" \
  --force \
  --name="NYC Buildings" \
  --layer=buildings \
  --minimum-zoom=9 --maximum-zoom=16 \
  --coalesce-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --drop-densest-as-needed \
  "$IN_PATH"

echo "Saved $OUT_PATH: $(du -h "$OUT_PATH" | cut -f1)"
