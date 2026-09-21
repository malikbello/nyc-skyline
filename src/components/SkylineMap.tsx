"use client";

import { useState } from "react";
import { Map, useControl, NavigationControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { MVTLayer } from "@deck.gl/geo-layers";
import type { Feature, Geometry } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

type BuildingProps = {
  doitt_id?: string;
  bin?: string;
  height_m?: number;
  construction_year?: number | null;
  decade?: number | null;
  last_status_type?: string;
  landuse?: string;
  bldgclass?: string;
  borough?: string;
};

const DECADE_STOPS: [number, [number, number, number]][] = [
  [1800, [40, 40, 90]],
  [1900, [60, 90, 150]],
  [1920, [80, 130, 160]],
  [1940, [110, 160, 130]],
  [1960, [170, 170, 80]],
  [1980, [220, 140, 70]],
  [2000, [235, 100, 90]],
  [2020, [250, 60, 110]],
];

function colorForDecade(decade: number | null | undefined): [number, number, number] {
  if (decade === null || decade === undefined || Number.isNaN(decade)) return [110, 110, 110];
  let match = DECADE_STOPS[0][1];
  for (const [d, color] of DECADE_STOPS) {
    if (decade >= d) match = color;
  }
  return match;
}

function DeckGLOverlay(props: { layers: MVTLayer<BuildingProps>[] }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type HoverState = { x: number; y: number; object: Feature<Geometry, BuildingProps> } | null;

export default function SkylineMap() {
  const [maxDecade, setMaxDecade] = useState(2020);
  const [hoverInfo, setHoverInfo] = useState<HoverState>(null);

  const layers = [
    new MVTLayer<BuildingProps>({
      id: "nyc-buildings",
      data: "/api/tiles/{z}/{x}/{y}",
      minZoom: 9,
      maxZoom: 16,
      extruded: true,
      getElevation: (f) => {
        const decade = f.properties.decade;
        if (decade != null && decade > maxDecade) return 0;
        return f.properties.height_m ?? 3;
      },
      getFillColor: (f) => {
        const decade = f.properties.decade;
        if (decade != null && decade > maxDecade) return [0, 0, 0, 0];
        const [r, g, b] = colorForDecade(decade);
        return [r, g, b, 220];
      },
      pickable: true,
      onHover: (info) =>
        setHoverInfo(
          info.object
            ? { x: info.x, y: info.y, object: info.object as Feature<Geometry, BuildingProps> }
            : null
        ),
      updateTriggers: {
        getElevation: [maxDecade],
        getFillColor: [maxDecade],
      },
      material: {
        ambient: 0.3,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [60, 64, 70],
      },
    }),
  ];

  return (
    <div className="relative h-screen w-screen">
      <Map
        initialViewState={{ longitude: -73.98, latitude: 40.75, zoom: 11, pitch: 45, bearing: -10 }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels/style.json"
      >
        <NavigationControl position="top-left" visualizePitch />
        <DeckGLOverlay layers={layers} />
      </Map>

      {hoverInfo?.object && (
        <div
          className="pointer-events-none absolute z-10 rounded bg-black/80 px-3 py-2 text-xs text-white"
          style={{ left: (hoverInfo.x ?? 0) + 12, top: (hoverInfo.y ?? 0) + 12 }}
        >
          <div>Built: {hoverInfo.object.properties.construction_year ?? "unknown"}</div>
          <div>Height: {Math.round(hoverInfo.object.properties.height_m ?? 0)}m</div>
          <div>{hoverInfo.object.properties.bldgclass ?? ""}</div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 z-10 w-[min(90vw,600px)] -translate-x-1/2 rounded-lg bg-black/70 p-4 text-white backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">NYC Skyline Growth</span>
          <span>{maxDecade}s</span>
        </div>
        <input
          type="range"
          min={1800}
          max={2020}
          step={10}
          value={maxDecade}
          onChange={(e) => setMaxDecade(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
