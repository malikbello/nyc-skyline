import { config } from "maplibre-gl";

// maplibre-gl's ESM build locates its worker script via `import.meta.url`,
// which resolves to the maplibre-gl.mjs source file's own path. Once
// Turbopack bundles that module into a Next.js chunk, `import.meta.url`
// resolves to the chunk's synthetic URL instead, so maplibre requests a
// worker script that doesn't exist there and every map goes blank. Copies
// of the worker and its sibling shared module (matching the installed
// maplibre-gl version, currently 6.10.0 -- re-run
// `cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs public/maplibre-gl-worker.js`
// and `cp node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre-gl-shared.mjs`
// after upgrading) are served from /public instead, and this override,
// documented by maplibre-gl itself, points at the worker copy.
if (typeof window !== "undefined") {
  config.WORKER_URL = "/maplibre-gl-worker.js";
}
