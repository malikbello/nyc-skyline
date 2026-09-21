"use client";

import { useEffect, useRef, useState } from "react";
import { Map, useControl, NavigationControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { MVTLayer } from "@deck.gl/geo-layers";
import type { Feature, Geometry } from "geojson";
import { Play, Pause, RotateCcw } from "lucide-react";
import { colorForDecade, gradientCss, MIN_DECADE, MAX_DECADE } from "@/lib/decadeColor";
import { useTheme, themeClasses } from "@/lib/theme";
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

type HoverState = { x: number; y: number; object: Feature<Geometry, BuildingProps> } | null;

const PLAY_STEP_MS = 220; // fast enough to feel like a "growth" animation, not a slog

function DeckGLOverlay(props: { layers: MVTLayer<BuildingProps>[] }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function SkylineMap() {
  const { theme } = useTheme();
  const t = themeClasses[theme];
  const [maxDecade, setMaxDecade] = useState(MAX_DECADE);
  const [hoverInfo, setHoverInfo] = useState<HoverState>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setMaxDecade((d) => {
        if (d >= MAX_DECADE) {
          setIsPlaying(false);
          return d;
        }
        return d + 10;
      });
    }, PLAY_STEP_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (maxDecade >= MAX_DECADE) setMaxDecade(MIN_DECADE);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setMaxDecade(MIN_DECADE);
  };

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
        return [r, g, b, 225];
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
      transitions: {
        getElevation: PLAY_STEP_MS * 0.9,
        getFillColor: PLAY_STEP_MS * 0.9,
      },
      material: {
        ambient: 0.35,
        diffuse: 0.7,
        shininess: 40,
        specularColor: [80, 84, 90],
      },
    }),
  ];

  return (
    <div className={`relative h-screen w-full ${t.pageBg}`}>
      <Map
        initialViewState={{ longitude: -73.98, latitude: 40.75, zoom: 11, pitch: 50, bearing: -12 }}
        mapStyle={t.basemap}
      >
        <NavigationControl position="top-right" visualizePitch />
        <DeckGLOverlay layers={layers} />
      </Map>

      {hoverInfo?.object && (
        <div
          className={`pointer-events-none absolute z-20 rounded-xl border px-4 py-3 text-xs shadow-2xl backdrop-blur-md ${
            theme === "light"
              ? "border-black/10 bg-white/90 text-black"
              : "border-white/10 bg-[#0b0e16]/90 text-white"
          }`}
          style={{ left: (hoverInfo.x ?? 0) + 14, top: (hoverInfo.y ?? 0) + 14 }}
        >
          <div className="mb-1 text-sm font-semibold tracking-tight">
            {hoverInfo.object.properties.construction_year ?? "Year unknown"}
          </div>
          <div className={theme === "light" ? "text-black/60" : "text-white/70"}>
            {Math.round(hoverInfo.object.properties.height_m ?? 0)}m tall
          </div>
          {hoverInfo.object.properties.bldgclass && (
            <div className={theme === "light" ? "text-black/40" : "text-white/50"}>
              {hoverInfo.object.properties.bldgclass}
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-6">
        <div
          className={`pointer-events-auto rounded-full border px-5 py-2 text-sm font-medium tracking-tight backdrop-blur-md ${
            theme === "light"
              ? "border-black/10 bg-white/60 text-black/90"
              : "border-white/10 bg-black/40 text-white/90"
          }`}
        >
          NYC Skyline Growth, 1800 &ndash; 2020
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 z-20 w-[min(92vw,720px)] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl ${
          theme === "light" ? "border-black/10 bg-white/85 text-black" : "border-white/10 bg-[#0b0e16]/85 text-white"
        }`}
      >
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className={`text-[11px] font-medium uppercase tracking-wider ${t.textFaint}`}>
              Showing buildings through
            </div>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">{maxDecade}s</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                theme === "light"
                  ? "border-black/10 bg-black/5 text-black/60 hover:bg-black/10 hover:text-black"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              aria-label="Reset"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => (isPlaying ? setIsPlaying(false) : handlePlay())}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                theme === "light" ? "bg-black text-white hover:bg-black/85" : "bg-white text-black hover:bg-white/90"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>
        </div>

        <input
          type="range"
          min={MIN_DECADE}
          max={MAX_DECADE}
          step={10}
          value={maxDecade}
          onChange={(e) => {
            setIsPlaying(false);
            setMaxDecade(Number(e.target.value));
          }}
          className="skyline-slider w-full"
        />

        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full" style={{ background: gradientCss() }} />
        </div>
        <div className={`mt-1 flex justify-between text-[10px] ${t.textFaint}`}>
          <span>{MIN_DECADE}s</span>
          <span>{MAX_DECADE}s</span>
        </div>
      </div>
    </div>
  );
}
