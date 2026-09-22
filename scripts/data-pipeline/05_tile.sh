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
#
# --maximum-tile-bytes raised from tippecanoe's 500KB default to 5MB: the
# first run's build log showed tiles as low as zoom 11 being forced to keep
# only ~10-14% of features to fit under the default cap -- a QA pass on the
# app confirmed the result: even the default map view looked like a sparse
# scatter of dots rather than a filled skyline. A generous per-tile byte
# budget means --drop-densest-as-needed only has to kick in at the very
# lowest zooms (9-10, where the whole city genuinely can't fit either way),
# not from zoom 11 up. Expect a noticeably larger .pmtiles file as a result --
# that's the correct tradeoff here, not a regression.
set -euo pipefail

DATA_DIR="${DATA_DIR:-$(dirname "$0")/../../data}"
IN_PATH="${TILE_IN_PATH:-$DATA_DIR/nyc_buildings_app.geojson}"
OUT_PATH="${TILE_OUT_PATH:-$DATA_DIR/nyc_buildings.pmtiles}"

tippecanoe -o "$OUT_PATH" \
  --force \
  --name="NYC Buildings" \
  --layer=buildings \
  --minimum-zoom=9 --maximum-zoom=16 \
  --maximum-tile-bytes=5000000 \
  --coalesce-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --drop-densest-as-needed \
  "$IN_PATH"

echo "Saved $OUT_PATH: $(du -h "$OUT_PATH" | cut -f1)"
