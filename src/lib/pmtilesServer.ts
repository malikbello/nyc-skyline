import { PMTiles } from "pmtiles";

// PMTiles' constructor uses its own built-in FetchSource (HTTP range
// requests) automatically when given a URL string -- no local file, no
// custom Source implementation needed. Falls back to a local file path via
// NYC_PMTILES_PATH for anyone running the data pipeline without R2 set up
// yet, but production reads from the public R2 URL.
const PMTILES_URL =
  process.env.NYC_PMTILES_URL ??
  "https://pub-df6169769411408abaf5509658a923a1.r2.dev/nyc_buildings.pmtiles";

let pmtilesInstance: PMTiles | null = null;

function getPMTiles(): PMTiles {
  if (!pmtilesInstance) {
    pmtilesInstance = new PMTiles(PMTILES_URL);
  }
  return pmtilesInstance;
}

// A failed range request can come from a stale pooled connection (seen: a
// TLS "bad record mac" after the network changed, which left the cached
// instance failing every tile until restart, since PMTiles caches its header
// fetch) or a transient drop (seen: R2 closing the socket twice in a row).
// deck.gl never re-requests a failed tile, so a failure here is a visible gap
// in the city. So: up to three attempts, each after throwing the cached
// instance away, with a short pause between them.
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 150;

export async function getTile(z: number, x: number, y: number): Promise<ArrayBuffer | null> {
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await getPMTiles().getZxy(z, x, y);
      return result?.data ?? null;
    } catch (err) {
      pmtilesInstance = null;
      if (attempt >= ATTEMPTS) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
}
