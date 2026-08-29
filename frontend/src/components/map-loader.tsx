"use client";

import dynamic from "next/dynamic";
import type { MapWaterPoint } from "@/components/water-points-map";

const WaterPointsMap = dynamic(
  () => import("@/components/water-points-map").then((mod) => mod.WaterPointsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-black/10 bg-[var(--wb-surface-100)] text-sm text-black/50 dark:border-white/10 dark:bg-[var(--wb-surface-800)] dark:text-white/50 sm:h-[520px]">
        Loading map…
      </div>
    ),
  },
);

export function MapLoader({ waterPoints }: { waterPoints: MapWaterPoint[] }) {
  return <WaterPointsMap waterPoints={waterPoints} />;
}
