import { NextRequest, NextResponse } from "next/server";
import { getTile } from "@/lib/pmtilesServer";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const tile = await getTile(Number(z), Number(x), Number(y.replace(".pbf", "")));

  if (!tile) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(tile, {
    headers: {
      "Content-Type": "application/x-protobuf",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
