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

export async function getTile(z: number, x: number, y: number): Promise<ArrayBuffer | null> {
  const pmtiles = getPMTiles();
  const result = await pmtiles.getZxy(z, x, y);
  return result?.data ?? null;
}
