import { open, type FileHandle } from "node:fs/promises";
import path from "node:path";
import { PMTiles, type Source, type RangeResponse } from "pmtiles";

const PMTILES_PATH =
  process.env.NYC_PMTILES_PATH ?? path.join(process.cwd(), "data", "nyc_buildings.pmtiles");

class NodeFileSource implements Source {
  private handlePromise: Promise<FileHandle>;

  constructor(private filePath: string) {
    this.handlePromise = open(filePath, "r");
  }

  getKey(): string {
    return this.filePath;
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    const handle = await this.handlePromise;
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, offset);
    return { data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + length) };
  }
}

let pmtilesInstance: PMTiles | null = null;

function getPMTiles(): PMTiles {
  if (!pmtilesInstance) {
    pmtilesInstance = new PMTiles(new NodeFileSource(PMTILES_PATH));
  }
  return pmtilesInstance;
}

export async function getTile(z: number, x: number, y: number): Promise<ArrayBuffer | null> {
  const pmtiles = getPMTiles();
  const result = await pmtiles.getZxy(z, x, y);
  return result?.data ?? null;
}
