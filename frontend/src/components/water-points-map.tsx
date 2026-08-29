"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import maplibregl, { type Map as MapLibreMap, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STATUS_TONE } from "@/lib/labels";
import type { WaterPointStatus } from "@prisma/client";

const TONE_COLORS: Record<string, string> = {
  good: "#2f9e5b",
  warn: "#d99a2b",
  bad: "#c1483d",
  info: "#2f7ec2",
};

// Free vector-tile style, no API key, no rate limits — see https://openfreemap.org
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
// Free public OSRM demo server — road-network-accurate routing, no API key.
// Light-use only; document as a scale limitation (see docs/SECURITY.md).
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export interface MapWaterPoint {
  id: string;
  name: string;
  code: string;
  village: string;
  status: WaterPointStatus;
  latitude: number;
  longitude: number;
}

interface NearestPoint extends MapWaterPoint {
  distanceKm: number;
}

interface LineStringFeature {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "LineString"; coordinates: [number, number][] };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function WaterPointsMap({ waterPoints }: { waterPoints: MapWaterPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const drawRoute = useCallback(async (from: { lat: number; lng: number }, to: MapWaterPoint) => {
    const map = mapRef.current;
    if (!map) return;
    setRoutingId(to.id);
    setRouteError(null);
    try {
      const url = `${OSRM_URL}/${from.lng},${from.lat};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Routing service unavailable right now");
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) throw new Error("No road route found to this water point");

      const geojson: LineStringFeature = {
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      };
      const source = map.getSource("route") as GeoJSONSource | undefined;
      if (source) {
        source.setData(geojson as never);
      } else {
        map.addSource("route", { type: "geojson", data: geojson as never });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#2f7ec2", "line-width": 5, "line-opacity": 0.85 },
        });
      }
      const bounds = new maplibregl.LngLatBounds();
      for (const coord of route.geometry.coordinates as [number, number][]) {
        bounds.extend(coord);
      }
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : "Could not calculate a route");
    } finally {
      setRoutingId(null);
    }
  }, []);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      waterPoints.length > 0
        ? [
            waterPoints.reduce((sum, wp) => sum + wp.longitude, 0) / waterPoints.length,
            waterPoints.reduce((sum, wp) => sum + wp.latitude, 0) / waterPoints.length,
          ]
        : [32.318, 0.912];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center,
      zoom: 12,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // GPS-grade accuracy: force a fresh device fix every time, never a cached/network-derived one.
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", (position: GeolocationPosition) => {
      setLocationError(null);
      setLocationAccuracy(position.coords.accuracy);
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
    geolocate.on("error", (err: GeolocationPositionError) => {
      setLocationError(
        err.code === err.PERMISSION_DENIED
          ? "Location access was denied. Allow location access in your browser to see water points near you."
          : "Couldn't determine your location. Try again.",
      );
    });

    map.on("load", () => {
      // Prompt for location as soon as the map is ready, instead of waiting for a button click.
      geolocate.trigger();

      map.addSource("water-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: waterPoints.map((wp) => ({
            type: "Feature",
            properties: {
              id: wp.id,
              name: wp.name,
              code: wp.code,
              village: wp.village,
              tone: STATUS_TONE[wp.status],
            },
            geometry: { type: "Point", coordinates: [wp.longitude, wp.latitude] },
          })),
        } as never,
      });

      map.addLayer({
        id: "water-points-circle",
        type: "circle",
        source: "water-points",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "match",
            ["get", "tone"],
            "good",
            TONE_COLORS.good,
            "warn",
            TONE_COLORS.warn,
            "bad",
            TONE_COLORS.bad,
            TONE_COLORS.info,
          ] as never,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("mouseenter", "water-points-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "water-points-circle", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "water-points-circle", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as { id: string; name: string; code: string; village: string };
        const coords = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates;

        const popupNode = document.createElement("div");
        popupNode.innerHTML = `
          <p style="font-weight:600;margin:0 0 2px">${props.name}</p>
          <p style="font-size:12px;color:#666;margin:0 0 8px">${props.code} · ${props.village}</p>
          <button type="button" data-directions style="font-size:12px;font-weight:600;color:#2f7ec2;background:none;border:none;padding:0;cursor:pointer;">
            Get directions from my location
          </button>
        `;
        popupNode.querySelector("[data-directions]")?.addEventListener("click", () => {
          const loc = userLocationRef.current;
          if (!loc) {
            setLocationError("Share your location first using the location button on the map.");
            return;
          }
          drawRoute(loc, {
            id: props.id,
            name: props.name,
            code: props.code,
            village: props.village,
            status: "AVAILABLE",
            latitude: coords[1],
            longitude: coords[0],
          });
        });

        new maplibregl.Popup({ closeButton: true }).setLngLat(coords).setDOMContent(popupNode).addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearest: NearestPoint[] = useMemo(() => {
    if (!userLocation || waterPoints.length === 0) return [];
    return waterPoints
      .map((wp) => ({
        ...wp,
        distanceKm: haversineKm(userLocation.lat, userLocation.lng, wp.latitude, wp.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [userLocation, waterPoints]);

  return (
    <div>
      <p className="mb-2 text-xs text-black/50 dark:text-white/50">
        Your browser will ask to share your location so we can show water points near you. You can
        also tap the <span aria-hidden>◎</span> button on the map to try again anytime.
      </p>
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 sm:h-[520px]"
      />
      {locationError && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {locationError}
        </p>
      )}
      {userLocation && nearest.length > 0 && (
        <div className="mt-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Nearest water points to you</h3>
            {locationAccuracy != null && (
              <span className="shrink-0 text-xs text-black/40 dark:text-white/40">
                GPS accuracy ±{Math.round(locationAccuracy)}m
              </span>
            )}
          </div>
          {routeError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{routeError}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {nearest.map((wp) => (
              <li key={wp.id}>
                <button
                  type="button"
                  onClick={() => drawRoute(userLocation, wp)}
                  disabled={routingId === wp.id}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-black/10 px-3 py-2 text-left text-sm hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{wp.name}</span>
                    <span className="ml-1 text-black/50 dark:text-white/50">· {wp.village}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[var(--wb-water-500)]">
                    {routingId === wp.id ? "Routing…" : `${wp.distanceKm.toFixed(1)} km`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
