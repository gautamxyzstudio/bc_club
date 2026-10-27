/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef } from "react";
import { useMapEvents } from "react-leaflet";

interface OpenStreetMapEventsProps {
  selectedProperty: any;
  selectedClusterProperties: any[];
  triggerSearch: () => void;
  clearPopups: () => void;
}

/**
 * Handles map interaction events (drag, zoom, click, mousemove) and
 * delegates search triggers and measurement actions appropriately.
 */
export default function OpenStreetMapEvents({
  selectedProperty,
  selectedClusterProperties,
  triggerSearch,
  clearPopups,
}: OpenStreetMapEventsProps) {
  const timeoutRef = useRef<any>(null);

  useMapEvents({
    moveend() {
      if (selectedClusterProperties.length > 0 || selectedProperty) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(triggerSearch, 400);
    },
    zoomend() {
      if (selectedClusterProperties.length > 0 || selectedProperty) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(triggerSearch, 400);
    },
    dragstart() {
      clearPopups();
    },
  });

  return null;
}
