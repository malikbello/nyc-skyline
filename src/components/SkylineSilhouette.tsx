"use client";

import appStats from "@/data/appStats.json";

// A decorative skyline silhouette used as a background motif behind stat
// cards / charts -- bar heights are the real citywide average building
// height by decade (not random), so the decoration itself is a small piece
// of the same story the section it sits behind is telling. Width still
// varies via a small seeded jitter, purely for visual texture, since real
// per-decade width data isn't meaningful here.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function SkylineSilhouette({ className = "", seed = 7 }: { className?: string; seed?: number }) {
  const rand = seededRandom(seed);
  const decadeHeights = appStats.avg_height_by_decade_citywide;
  const maxHeight = Math.max(...decadeHeights.map((d) => d.avg_height_m));

  // Repeat the real decade sequence to fill a wide background band, jittering
  // width (and slightly the height, so repeats don't look identical) per copy.
  const repeats = 3;
  const buildings = Array.from({ length: repeats }).flatMap((_, r) =>
    decadeHeights.map((d, i) => {
      const width = 14 + rand() * 16;
      const jitter = 0.85 + rand() * 0.3;
      const height = 24 + (d.avg_height_m / maxHeight) * 220 * jitter;
      return { width, height, index: r * decadeHeights.length + i };
    })
  );

  let x = 0;
  const positioned = buildings.map((b) => {
    const placed = { ...b, x };
    x += b.width + 6;
    return placed;
  });
  const totalWidth = x + 20;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} 260`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      {positioned.map((b) => (
        <rect
          key={b.index}
          x={b.x}
          y={260 - b.height}
          width={b.width}
          height={b.height}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
