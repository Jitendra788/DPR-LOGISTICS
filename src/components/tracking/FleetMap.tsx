"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type TripPin = {
  tripId: number;
  tripNo: string;
  vehNo: string;
  lastLat: number | null;
  lastLng: number | null;
  route: { lat: number; lng: number }[];
};

type Props = {
  trips: TripPin[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  height?: number | string;
  className?: string;
};

export function FleetMap({ trips, selectedId, onSelect, height, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);

  const mappable = trips.filter((t) => t.lastLat != null && t.lastLng != null);
  const tripKey = trips.map((t) => `${t.tripId}:${t.lastLat}:${t.lastLng}:${t.route.length}`).join("|");

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OSM",
          maxZoom: 18,
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
      }

      const layer = layerRef.current!;
      layer.clearLayers();

      const pins = trips.filter((t) => t.lastLat != null && t.lastLng != null);

      if (!pins.length) {
        mapRef.current!.setView([20.5937, 78.9629], 5);
        return;
      }

      const bounds = L.latLngBounds([]);

      for (const t of pins) {
        const lat = t.lastLat!;
        const lng = t.lastLng!;
        bounds.extend([lat, lng]);

        const isSel = t.tripId === selectedId;
        const marker = L.circleMarker([lat, lng], {
          radius: isSel ? 10 : 7,
          color: isSel ? "#0d9488" : "#f59e0b",
          fillColor: isSel ? "#14b8a6" : "#fbbf24",
          fillOpacity: 0.95,
          weight: 2,
        });
        marker.bindPopup(`<strong>${t.vehNo || t.tripNo}</strong>`);
        marker.on("click", () => onSelect(t.tripId));
        marker.addTo(layer);

        if (t.route.length >= 2) {
          L.polyline(
            t.route.map((p) => [p.lat, p.lng] as [number, number]),
            { color: isSel ? "#0d9488" : "#94a3b8", weight: 3, opacity: 0.7 },
          ).addTo(layer);
        }
      }

      mapRef.current!.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    });

    return () => {
      cancelled = true;
    };
  }, [tripKey, selectedId, onSelect, trips]);

  const mapStyle = height != null ? { height } : undefined;
  const mapClass = `td-map-canvas ${className}`.trim();

  if (!mappable.length) {
    return (
      <div className={`td-map-empty ${className}`.trim()} style={mapStyle}>
        No GPS locations yet — start trips and share driver GPS.
      </div>
    );
  }

  return <div ref={containerRef} className={mapClass} style={mapStyle} aria-label="Fleet map" />;
}
