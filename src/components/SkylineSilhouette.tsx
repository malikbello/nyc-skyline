"use client";

// A deterministic, decorative skyline silhouette used as a background motif
// behind stat cards / charts. Seeded so it's stable across renders (no
// hydration mismatch from Math.random()).
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function SkylineSilhouette({ className = "", seed = 7 }: { className?: string; seed?: number }) {
  const rand = seededRandom(seed);
  const buildingCount = 40;
  const buildings = Array.from({ length: buildingCount }).map((_, i) => {
    const width = 14 + rand() * 22;
    const height = 30 + rand() * 220;
    return { width, height, x: i * 26 };
  });
  const totalWidth = buildingCount * 26 + 40;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} 260`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      {buildings.map((b, i) => (
        <rect
          key={i}
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
