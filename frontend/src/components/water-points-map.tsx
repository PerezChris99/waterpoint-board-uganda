"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS_TONE } from "@/lib/labels";
import type { WaterPointStatus } from "@prisma/client";

const TONE_COLORS: Record<string, string> = {
  good: "#2f9e5b",
  warn: "#d99a2b",
  bad: "#c1483d",
  info: "#2f7ec2",
};

export interface MapWaterPoint {
  id: string;
  name: string;
  code: string;
  village: string;
  status: WaterPointStatus;
  latitude: number;
  longitude: number;
}

export function WaterPointsMap({ waterPoints }: { waterPoints: MapWaterPoint[] }) {
  const center: [number, number] =
    waterPoints.length > 0
      ? [
          waterPoints.reduce((sum, wp) => sum + wp.latitude, 0) / waterPoints.length,
          waterPoints.reduce((sum, wp) => sum + wp.longitude, 0) / waterPoints.length,
        ]
      : [0.912, 32.318];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-xl border border-black/10 dark:border-white/10 sm:h-[520px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {waterPoints.map((wp) => (
        <CircleMarker
          key={wp.id}
          center={[wp.latitude, wp.longitude]}
          radius={8}
          pathOptions={{
            color: TONE_COLORS[STATUS_TONE[wp.status]],
            fillColor: TONE_COLORS[STATUS_TONE[wp.status]],
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <p className="font-semibold">{wp.name}</p>
            <p className="text-xs text-black/60">
              {wp.code} · {wp.village}
            </p>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
