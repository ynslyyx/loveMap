"use client";

import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { Minus, Plus, RotateCcw, Map as MapIcon, Minimize2, ZoomIn } from "lucide-react";
import {
  chinaFeatures,
  dashLineFeature,
  makePath,
  makeProjection,
  makeProjectionForFeature,
  provinceIdOf,
} from "@/lib/geo";
import {
  getLitCityIds,
  getLitProvinceIds,
  memoryStoreUpdatedEvent,
  type LocalMemoryStore,
} from "@/data/progress";
import { sortMemoriesByTime, moodConfig } from "@/data/memories";
import { getCitiesByProvince } from "@/data/cities";
import { provinces } from "@/data/provinces";
import TimelineOverlay, { TimelineToggle } from "@/components/TimelineOverlay";
import { fetchMemoriesDeduplicated } from "@/components/province/Shared";

interface ChinaMapProps {
  width?: number;
  height?: number;
  className?: string;
}

const colors = {
  cream: "#FAFBF7",
  dim: "#D8DDD8",
  ink: "#5A6670",
  sakura: "#F5DCE0",
  bloom: "#E8B8C2",
  sky: "#A8C8DC",
};

const provinceById = new Map(provinces.map((province) => [province.id, province]));
const easyTapProvinceIds = new Set(["hongkong", "macau"]);
const maxZoom = 8;
const minZoom = 1;
const stableCoordinate = (value: number) => Number(value.toFixed(3));

// The South China Sea ten-dash line, drawn as a small standalone inset box so it
// is always visible and never overlapped by floating cards on the main map.
export function SouthChinaSeaInset() {
  const [collapsed, setCollapsed] = useState(true);
  const inset = useMemo(() => {
    if (!dashLineFeature) return null;

    const insetWidth = 72;
    const insetHeight = 100;
    const projection = makeProjectionForFeature(dashLineFeature, insetWidth, insetHeight, 10);
    const path = makePath(projection);

    return { width: insetWidth, height: insetHeight, d: path(dashLineFeature as never) ?? "" };
  }, []);

  if (!inset || !inset.d) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{ touchAction: "none" }}
      className={`absolute right-4 top-24 z-30 flex flex-col items-center gap-2 w-fit rounded-[8px] border border-[#D8DDD8]/80 bg-[#FAFBF7]/82 shadow-[0_10px_28px_rgba(90,102,112,0.08)] backdrop-blur cursor-grab active:cursor-grabbing ${collapsed ? 'p-2' : 'p-1'}`}
    >
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="grid h-6 w-6 place-items-center text-[#5A6670]/60 transition hover:text-[#5A6670]" aria-label="展开南海诸岛">
          <MapIcon className="h-4 w-4" />
        </button>
      ) : (
        <div className="relative">
          <button onClick={() => setCollapsed(true)} className="absolute right-0 top-0 p-1 text-[#5A6670]/40 transition hover:text-[#5A6670]" aria-label="隐藏南海诸岛">
            <Minimize2 className="h-3 w-3" />
          </button>
          <svg
            width={inset.width}
            height={inset.height}
            viewBox={`0 0 ${inset.width} ${inset.height}`}
            role="img"
            aria-label="南海诸岛"
            className="mt-2"
          >
            <path
              d={inset.d}
              fill={colors.ink}
              fillOpacity="0.55"
              stroke={colors.ink}
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
            <text
              x={inset.width / 2}
              y={inset.height - 18}
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={colors.ink}
              fillOpacity="0.6"
            >
              南海诸岛十段线
            </text>
            <text
              x={inset.width / 2}
              y={inset.height - 5}
              textAnchor="middle"
              fontSize="5"
              fontWeight="500"
              fill={colors.ink}
              fillOpacity="0.4"
            >
              GS(2023)2767号
            </text>
          </svg>
        </div>
      )}
    </motion.div>
  );
}

export default function ChinaMap({ width = 1100, height = 860, className }: ChinaMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [localMemories, setLocalMemories] = useState<LocalMemoryStore>({});
  const [zoomCollapsed, setZoomCollapsed] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const router = useRouter();
  const pinchRef = useRef<{ dist: number }>({ dist: 0 });

  const resetMap = () => {
    setZoom(1);
    animate(x, 0, { type: "spring", stiffness: 100, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 100, damping: 20 });
  };

  useEffect(() => {
    let cancelled = false;
    const handleMemoryUpdate = (event: Event) => {
      const detail = (event as CustomEvent<LocalMemoryStore>).detail;
      if (detail) setLocalMemories(detail);
    };

    async function loadLocalMemories() {
      const memories = await fetchMemoriesDeduplicated().catch(() => ({}));
      if (!cancelled) setLocalMemories(memories);
    }

    window.addEventListener(memoryStoreUpdatedEvent, handleMemoryUpdate);
    loadLocalMemories();

    return () => {
      cancelled = true;
      window.removeEventListener(memoryStoreUpdatedEvent, handleMemoryUpdate);
    };
  }, []);

  const litProvinceIds = useMemo(
    () => getLitProvinceIds(getLitCityIds(localMemories)),
    [localMemories],
  );

  const projection = useMemo(() => makeProjection(width, height, 24), [width, height]);

  useEffect(() => {
    const handleToggle = (e: CustomEvent<boolean>) => {
      const active = e.detail;
      setShowTimeline(active);
      setZoom(active ? 1.35 : 1);
    };
    window.addEventListener("toggle-timeline", handleToggle as EventListener);
    return () => window.removeEventListener("toggle-timeline", handleToggle as EventListener);
  }, []);

  useEffect(() => {
    // Keep sidebar card in sync with local state (e.g. if map unmounts or timeline auto-closes)
    window.dispatchEvent(new CustomEvent("timeline-state-sync", { detail: showTimeline }));
  }, [showTimeline]);

  const timelinePointCount = useMemo(() => {
    const allMemories = Object.values(localMemories).flat();
    const seen = new Set<string>();
    let count = 0;
    const sorted = sortMemoriesByTime(allMemories);
    for (const m of sorted) {
      if (!seen.has(m.cityId)) {
        seen.add(m.cityId);
        count++;
      }
    }
    return count;
  }, [localMemories]);

  const paths = useMemo(() => {
    const path = makePath(projection);

    return chinaFeatures.map((feature) => {
      const id = provinceIdOf(feature);
      const [cx, cy] = path.centroid(feature as never);
      const isLit = litProvinceIds.has(id);
      let latestMoodInfo = undefined;

      if (isLit) {
        const provinceCities = getCitiesByProvince(id);
        const provinceMemories = provinceCities.flatMap(c => localMemories[c.id] || []);
        const sorted = sortMemoriesByTime(provinceMemories);
        const latestMood = sorted[0]?.mood;
        if (latestMood) latestMoodInfo = moodConfig[latestMood];
      }

      return {
        id,
        d: path(feature as never) ?? "",
        x: stableCoordinate(cx),
        y: stableCoordinate(cy),
        province: provinceById.get(id),
        lit: isLit,
        moodInfo: latestMoodInfo,
      };
    });
  }, [projection, litProvinceIds, localMemories]);

  const hoveredPath = paths.find((path) => path.id === hoveredId);
  const zoomProgress = ((zoom - minZoom) / (maxZoom - minZoom)) * 100;
  const setClampedZoom = (nextZoom: number) => {
    setZoom(Math.min(Math.max(nextZoom, minZoom), maxZoom));
  };

  const goProvince = (id: string) => {
    router.push(`/province/${id}`);
  };

  return (
    <motion.div
      className={`relative ${className ?? ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{ aspectRatio: `${width} / ${height}`, touchAction: "none" }}
      onTouchStart={(e) => {
        if (e.touches.length === 2) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          pinchRef.current.dist = dist;
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const delta = dist / pinchRef.current.dist;
          pinchRef.current.dist = dist;
          setZoom((current) => Math.min(Math.max(current * delta, minZoom), maxZoom));
        }
      }}
    >
      <motion.div
        drag
        dragMomentum={false}
        style={{ touchAction: "none" }}
        className={`absolute left-3 top-24 h-fit z-20 flex flex-col items-center rounded-[24px] border border-[#D8DDD8]/85 bg-[#FAFBF7]/82 shadow-[0_12px_28px_rgba(90,102,112,0.1)] backdrop-blur sm:left-4 cursor-grab active:cursor-grabbing ${zoomCollapsed ? 'p-2' : 'px-2 py-3 gap-2'}`}
      >
        {zoomCollapsed ? (
          <button onClick={() => setZoomCollapsed(false)} className="grid h-6 w-6 place-items-center text-[#5A6670]/60 transition hover:text-[#5A6670]" aria-label="展开缩放控制">
            <ZoomIn className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              className="grid h-8 w-8 place-items-center rounded-full text-[#5A6670] transition hover:bg-[#D6E8F0]/42 disabled:opacity-35"
              type="button"
              onClick={() => setZoom((z) => Math.min(z * 1.5, maxZoom))}
              disabled={zoom >= maxZoom}
              aria-label="放大中国地图"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="flex min-h-16 w-8 flex-col items-center justify-center gap-1.5">
              <input
                className="map-zoom-slider"
                type="range"
                min={minZoom}
                max={maxZoom}
                step="0.01"
                value={zoom}
                onChange={(event) => setClampedZoom(Number(event.target.value))}
                aria-label="拖动缩放中国地图"
                style={{ "--zoom-progress": `${zoomProgress}%` } as CSSProperties}
              />
            </div>
            <button
              className="grid h-8 w-8 place-items-center rounded-full text-[#5A6670] transition hover:bg-[#F5DCE0]/55 disabled:opacity-35"
              type="button"
              onClick={() => setZoom((z) => Math.max(z / 1.5, minZoom))}
              disabled={zoom <= minZoom}
              aria-label="缩小中国地图"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              className="mt-1 grid h-8 w-8 place-items-center rounded-full text-[#5A6670]/70 transition hover:bg-[#D8DDD8]/42 hover:text-[#5A6670]"
              type="button"
              onClick={resetMap}
              aria-label="重置中国地图"
              title="重置居中"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              className="mt-1 grid h-6 w-6 place-items-center rounded-full text-[#5A6670]/40 transition hover:text-[#5A6670]"
              type="button"
              onClick={() => setZoomCollapsed(true)}
              aria-label="隐藏缩放控制"
            >
              <Minimize2 className="h-3 w-3" />
            </button>
          </>
        )}
      </motion.div>

      <motion.div
        drag
        dragConstraints={{ 
          left: -width * Math.max(0, zoom - 1), 
          right: width * Math.max(0, zoom - 1), 
          top: -height * Math.max(0, zoom - 1), 
          bottom: height * Math.max(0, zoom - 1) 
        }}
        dragElastic={0.1}
        className="map-visual-scale relative h-full w-full overflow-visible cursor-grab active:cursor-grabbing"
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{ x, y, transformOrigin: "50% 50%" }}
      >
        <svg
          className="h-full w-full overflow-visible drop-shadow-[0_16px_26px_rgba(168,200,220,0.18)]"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="China map with visited provinces highlighted"
        >
          <defs>
            <filter id="visitedGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={colors.bloom} floodOpacity="0.42" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="softPixelTexture" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 0h2v2H0z" fill={colors.cream} opacity="0.26" />
              <path d="M5 5h1.5v1.5H5z" fill={colors.sky} opacity="0.08" />
            </pattern>
          </defs>

          <g shapeRendering="geometricPrecision">
            {paths.map((path) => (
              <path
                key={`${path.id}-glow`}
                d={path.d}
                fill="none"
                stroke={path.lit ? colors.bloom : "transparent"}
                strokeWidth={path.lit ? 10 : 0}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={path.lit ? 0.18 : 0}
                filter={path.lit ? "url(#visitedGlow)" : undefined}
                pointerEvents="none"
              />
            ))}

            {paths.map((path) => {
              const isHovered = hoveredId === path.id;
              const litColor = path.moodInfo?.color ?? colors.sakura;

              return (
                <path
                  key={path.id}
                  d={path.d}
                  fill={path.lit ? litColor : colors.dim}
                  fillOpacity={path.lit ? 0.68 : 0.34}
                  stroke={path.lit ? colors.bloom : colors.ink}
                  strokeOpacity={path.lit ? 0.95 : 0.24}
                  strokeWidth={path.lit ? 2.2 : 1.25}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-300"
                  filter={path.lit || isHovered ? "url(#visitedGlow)" : undefined}
                  onMouseEnter={() => setHoveredId(path.id)}
                  onMouseLeave={() =>
                    setHoveredId((current) => (current === path.id ? null : current))
                  }
                  onClick={() => goProvince(path.id)}
                />
              );
            })}

            {paths
              .filter((path) => easyTapProvinceIds.has(path.id))
              .map((path) => (
                <g key={`${path.id}-easy-tap`}>
                  <circle
                    cx={path.x}
                    cy={path.y}
                    r={path.id === "macau" ? 18 : 24}
                    fill={colors.sakura}
                    fillOpacity={hoveredId === path.id ? 0.22 : 0.08}
                    stroke={colors.bloom}
                    strokeOpacity={hoveredId === path.id ? 0.5 : 0.18}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredId(path.id)}
                    onMouseLeave={() =>
                      setHoveredId((current) => (current === path.id ? null : current))
                    }
                    onClick={() => goProvince(path.id)}
                  />
                  <circle
                    cx={path.x}
                    cy={path.y}
                    r="3.5"
                    fill={colors.bloom}
                    opacity="0.55"
                    pointerEvents="none"
                  />
                </g>
              ))}

            {paths.map((path) =>
              path.lit ? (
                <path
                  key={`${path.id}-inner`}
                  d={path.d}
                  fill="url(#softPixelTexture)"
                  stroke={colors.cream}
                  strokeOpacity="0.9"
                  strokeWidth="1"
                  pointerEvents="none"
                />
              ) : null,
            )}
          </g>
        </svg>

        <TimelineOverlay
          width={width}
          height={height}
          projection={projection}
          visible={showTimeline}
        />

        {hoveredPath?.province && (
          <motion.div
            className="pointer-events-none absolute rounded-[8px] border border-[#D8DDD8]/80 bg-[#FAFBF7]/90 px-3 py-2 text-sm text-[#5A6670] shadow-[0_10px_30px_rgba(90,102,112,0.12)] backdrop-blur"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              left: `${(hoveredPath.x / width) * 100}%`,
              top: `${(hoveredPath.y / height) * 100}%`,
              transform: "translate(14px, -50%)",
            }}
          >
            <span
              className="mr-2 inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: hoveredPath.moodInfo?.color ?? colors.bloom }}
            />
            {hoveredPath.province.name}
            {hoveredPath.moodInfo && (
              <span className="ml-1.5 font-medium">
                · {hoveredPath.moodInfo.label} <span className="text-[12px]">{hoveredPath.moodInfo.emoji}</span>
              </span>
            )}
            <span className="ml-2 text-[#5A6670]/60">{hoveredPath.province.nameEn}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
