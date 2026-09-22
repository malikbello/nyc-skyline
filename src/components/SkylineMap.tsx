"use client";

import { useEffect, useRef, useState } from "react";
import { Map, useControl, NavigationControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { MVTLayer } from "@deck.gl/geo-layers";
import { DataFilterExtension, type DataFilterExtensionProps } from "@deck.gl/extensions";
import { LightingEffect, AmbientLight, DirectionalLight, type Effect } from "@deck.gl/core";
import type { Feature, Geometry } from "geojson";
import { Play, Pause, RotateCcw } from "lucide-react";
import { colorForDecade, gradientCss, MIN_DECADE, MAX_DECADE } from "@/lib/decadeColor";
import { useTheme, themeClasses } from "@/lib/theme";
import "maplibre-gl/dist/maplibre-gl.css";

// Plain ambient + directional light for real diffuse shading, without the
// shadow-map render pass -- shadow-casting was the main cause of the lag at
// ~1M buildings, so it's dropped in favor of staying smooth.
const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.3 });
const sunLight = new DirectionalLight({
  color: [255, 250, 240],
  intensity: 1.3,
  direction: [-2.5, -3.5, -1.5],
});
const lightingEffect = new LightingEffect({ ambientLight, sunLight });

// Post-process vignette/tone-mapping (@luma.gl/effects) was tried here and
// pulled back out -- a QA pass found WebGL uniform-block reflection failures
// for gouraudMaterialUniforms/dataFilterUniforms/lightingUniforms (mismatched
// std140 layout for lights[0].color) starting around when this was added,
// alongside buildings rendering as a flat uniform color regardless of decade.
// Root cause of the flat-color issue turned out to be the decade gradient's
// own low-contrast early stops (see decadeColor.ts), not this -- but with the
// uniform failures unconfirmed as harmless and no way to visually verify the
// post-process passes were doing anything correct, removing the least-tested
// addition first is the safer move.
const mapEffects: Effect[] = [lightingEffect];

const dataFilter = new DataFilterExtension({ filterSize: 1 });

// Everything with no known year is treated as always-present rather than
// hidden -- we don't know when it was built, so it shouldn't be made to
// vanish from an arbitrary point in the timeline.
const UNDATED_SENTINEL = MIN_DECADE - 10;

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

const PLAY_STEP_MS = 340; // moderately fast timelapse pace: ~23 decades in ~8s

type BuildingFeature = Feature<Geometry, BuildingProps>;
type BuildingLayer = MVTLayer<BuildingProps, DataFilterExtensionProps<BuildingFeature>>;

function DeckGLOverlay(props: { layers: BuildingLayer[]; effects: Effect[] }) {
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
  const rafRef = useRef<number | null>(null);
  const playStartRef = useRef<number>(0);
  const startDecadeRef = useRef<number>(MIN_DECADE);

  // Wall-clock-driven, not a fixed-count setInterval: computes the target
  // decade from actual elapsed time each frame. A setInterval-per-step
  // approach compounds delay if any single tick's work (recomputing
  // getElevation across ~1M features) takes longer than the interval --
  // confirmed happening in practice (measured ~17-19s actual vs. the ~8s
  // this is tuned for). This way, if a frame falls behind, the next check
  // jumps straight to the correct decade for the current time instead of
  // queuing up compounding delay, so total duration stays close to intended
  // even if individual steps occasionally look uneven under load.
  useEffect(() => {
    if (!isPlaying) return;
    playStartRef.current = performance.now();
    startDecadeRef.current = maxDecade >= MAX_DECADE ? MIN_DECADE : maxDecade;

    const tick = () => {
      const elapsed = performance.now() - playStartRef.current;
      const stepsElapsed = Math.floor(elapsed / PLAY_STEP_MS);
      const target = Math.min(MAX_DECADE, startDecadeRef.current + stepsElapsed * 10);
      setMaxDecade((prev) => (prev === target ? prev : target));
      if (target >= MAX_DECADE) {
        setIsPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    new MVTLayer<BuildingProps, DataFilterExtensionProps<BuildingFeature>>({
      id: "nyc-buildings",
      data: "/api/tiles/{z}/{x}/{y}",
      minZoom: 9,
      maxZoom: 16,
      extruded: true,
      // getFillColor is static (cached by deck.gl, never re-run during
      // animation). getElevation genuinely does depend on maxDecade -- this
      // is the maintainer-validated pattern for animated deck.gl elevation:
      // keep `data` untouched (no backfill cost), only change the accessor
      // and let `transitions` interpolate it on the GPU. This only re-runs
      // once per decade tick (~23 times for a full playthrough), not per
      // animation frame, so it stays cheap.
      getElevation: (f) => {
        const decade = f.properties.decade;
        if (decade != null && decade > maxDecade) return 0;
        return f.properties.height_m ?? 3;
      },
      getFillColor: (f) => {
        const [r, g, b] = colorForDecade(f.properties.decade, theme);
        return [r, g, b, 225];
      },
      // No lineWidthMinPixels floor -- a forced minimum screen-pixel outline
      // width stays visible even when a building's fill is sub-pixel at a
      // zoomed-out view, which is what turned the whole map into a field of
      // dots instead of solid color at low zoom. Letting the outline scale
      // down with the fill (both in real-world units) keeps them consistent
      // at every zoom level.
      getLineColor: [15, 15, 20, 130],
      getLineWidth: 0.5,
      lineWidthUnits: "meters",
      pickable: true,
      onHover: (info) =>
        setHoverInfo(
          info.object
            ? { x: info.x, y: info.y, object: info.object as Feature<Geometry, BuildingProps> }
            : null
        ),
      updateTriggers: {
        getElevation: [maxDecade],
        getFillColor: [theme],
      },
      transitions: {
        // Was 3.5x the step duration, which meant several decades' worth of
        // transitions were always mid-flight simultaneously -- contributed
        // to both the sluggish overall feel and made per-step timing harder
        // to reason about. Kept just above the step so growth still reads as
        // a continuous ease rather than a hard pop, without stacking deeply.
        getElevation: { duration: PLAY_STEP_MS * 1.3, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
      },
      // GPU-side hard cutoff for far-future buildings -- cheaper fragment
      // work at early decades since most of the dataset is filtered before
      // it's even shaded. The actual "growth" look now comes from the
      // elevation transition above, not from a filter fade.
      extensions: [dataFilter],
      getFilterValue: (f) => f.properties.decade ?? UNDATED_SENTINEL,
      filterRange: [UNDATED_SENTINEL, maxDecade],
      material: {
        ambient: 0.4,
        diffuse: 0.85,
        shininess: 12,
        specularColor: [40, 40, 45],
      },
    }),
  ];

  return (
    <div className={`relative h-screen w-full ${t.pageBg}`}>
      <Map
        initialViewState={{ longitude: -73.98, latitude: 40.75, zoom: 11.5, pitch: 58, bearing: -14 }}
        mapStyle={t.basemap}
      >
        <NavigationControl position="top-right" visualizePitch />
        <DeckGLOverlay layers={layers} effects={mapEffects} />
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
            <div className={theme === "light" ? "text-black/55" : "text-white/55"}>
              Building class: {hoverInfo.object.properties.bldgclass}
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
          <div className="h-2 flex-1 rounded-full" style={{ background: gradientCss(theme) }} />
        </div>
        <div className={`mt-1 flex justify-between text-[10px] ${t.textFaint}`}>
          <span>{MIN_DECADE}s</span>
          <span>{MAX_DECADE}s</span>
        </div>
      </div>
    </div>
  );
}
