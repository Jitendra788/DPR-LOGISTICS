"use client";

import { useEffect, useRef } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = { lat: number; lng: number; at?: string; source?: string };

type Props = {
  lastLat: number | null;
  lastLng: number | null;
  route?: MapPoint[];
  fromLabel?: string;
  toLabel?: string;
  height?: number | string;
  className?: string;
};

export function LiveTrackMap({ lastLat, lastLng, route = [], fromLabel, toLabel, height = 420, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || lastLat == null || lastLng == null) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, { scrollWheelZoom: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const truckIcon = L.divIcon({
        className: "lt-leaflet-truck",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;border:3px solid #0b1f33;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const points: LatLngExpression[] = route.map((p) => [p.lat, p.lng] as LatLngExpression);
      if (points.length >= 2) {
        L.polyline(points, { color: "#f59e0b", weight: 4, opacity: 0.85 }).addTo(map);
      }

      L.marker([lastLat, lastLng], { icon: truckIcon }).addTo(map);

      if (route.length > 0) {
        const first = route[0];
        L.circleMarker([first.lat, first.lng], { radius: 6, color: "#22c55e", fillColor: "#22c55e", fillOpacity: 1 })
          .addTo(map)
          .bindPopup(fromLabel || "Start");
      }

      const bounds = L.latLngBounds(points.length ? points : [[lastLat, lastLng]]);
      bounds.extend([lastLat, lastLng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });

      if (toLabel) {
        map.once("zoomend", () => {
          /* destination label shown in meta, not geocoded */
        });
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lastLat, lastLng, route, fromLabel, toLabel]);

  if (lastLat == null || lastLng == null) {
    return (
      <div className={`lt-map-empty ${className}`} style={{ minHeight: typeof height === "number" ? height : undefined }}>
        Map tab dikhega jab location share hogi.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`lt-leaflet-map ${className}`}
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%", borderRadius: 12, marginTop: "0.85rem" }}
      aria-label="Live vehicle map"
    />
  );
}
