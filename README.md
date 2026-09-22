# NYC Skyline Growth

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![deck.gl](https://img.shields.io/badge/deck.gl-9.4-8A2BE2)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-JS-396CB2)
![PMTiles](https://img.shields.io/badge/tiles-PMTiles-orange)
![License](https://img.shields.io/badge/license-Apache_2.0-green)

An interactive 3D map of every one of New York City's ~1.08 million buildings, colored and extruded by the decade each one was built, with a play button that animates the city's growth from 1800 to 2020 — plus the data story behind it, told in a series of charts computed from the same dataset.

**Live:** _add the deployed URL here once it's live_

## Why this exists

Started from a class notebook that only got as far as a single static chart. This project asks: what if you could actually *watch* the city grow, building by building, joined from the city's own government records rather than a sample?

## What it does

- **A real join, not a spatial guess.** NYC's own [Building Footprints](https://data.cityofnewyork.us/City-Government/Building-Footprints/5zhs-2jue) dataset (geometry + real measured height + real per-building construction year) is joined to the full [PLUTO](https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-PLUTO-/64uk-42ks) tax-lot dataset on BBL — a 99.85% match rate across 1.08M buildings, with footprints as the geometry backbone rather than a lossy lat/lon spatial join.
- **A real 3D timelapse.** Press play and buildings grow from the ground up, decade by decade, driven by GPU-side attribute transitions rather than per-frame recomputation — this runs smoothly at full dataset scale.
- **Borough navigation.** Click a borough to fly the camera there and filter the map to just that borough's buildings.
- **A full data-story layer above the map**: citywide growth over time, a per-decade distribution chart, a regional (borough-by-borough) growth comparison, and the project's actual headline finding — Manhattan didn't just build more, it built *up*, while the other boroughs built outward and stayed roughly the same height for 150+ years.
- **Light and dark themes**, including a from-scratch, WCAG-contrast-verified color system (not just inverted defaults) — several real contrast failures were found and fixed by computing actual ratios, not eyeballing them.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | |
| 3D rendering | [deck.gl](https://deck.gl) (`MVTLayer`, `DataFilterExtension`) | Handles ~1M-feature extrusion and GPU-side filtering/animation at scale — chosen over Kepler.gl (too much fixed dashboard chrome) and CesiumJS (built for globe/terrain problems this single-city app doesn't have) after an explicit comparison pass |
| Basemap | [MapLibre GL JS](https://maplibre.org) | Open-source, no API key |
| Tile format | [PMTiles](https://protomaps.com/docs/pmtiles) via `tippecanoe` | Single static file, HTTP range-request friendly, no tile server needed |
| Charts | Hand-built SVG (`d3-scale`/`d3-shape`) + `framer-motion` | Full control over the visual style rather than a generic chart-library look |

See [`scripts/data-pipeline/`](./scripts/data-pipeline) for the full, runnable, documented pipeline from raw NYC Open Data to the tiled dataset the app serves — every step is a real script, not a one-off notebook cell.

## Running locally

```bash
npm install
npm run dev
```

Requires `data/nyc_buildings.pmtiles` to exist locally — generate it via the pipeline in `scripts/data-pipeline/` (see that folder's own README for the full sequence; NYC Open Data blocks some cloud IP ranges, so steps 1–2 may need to run in Colab).

## Deployment note

The `.pmtiles` file is large (~200MB+) and deliberately **not** committed to git (see `.gitignore`) — it's meant to be hosted on object storage (e.g. Cloudflare R2) with the app's tile-serving API route (`src/app/api/tiles/`) pointed at it via the `NYC_PMTILES_PATH` environment variable, rather than bundled into the deployment itself.

## Data sources

- [NYC Building Footprints](https://data.cityofnewyork.us/City-Government/Building-Footprints/5zhs-2jue) — NYC Office of Technology and Innovation
- [PLUTO](https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-PLUTO-/64uk-42ks) — NYC Department of City Planning

## License

Apache-2.0 — see [LICENSE](./LICENSE).

---

Built by [Malik Pelumi Bello](https://malikbello.is-a.dev).
