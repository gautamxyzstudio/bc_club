/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef } from "react";
import { useMapEvents } from "react-leaflet";
import type { LatLngPoint } from "./osmMapUtils";

interface OpenStreetMapEventsProps {
  selectedProperty: any;
  selectedClusterProperties: any[];
  triggerSearch: () => void;
  clearPopups: () => void;
  measureMode?: boolean;
  handleMeasureClick?: (point: LatLngPoint) => void;
  handleMeasureMove?: (point: LatLngPoint) => void;
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
  measureMode,
  handleMeasureClick,
  handleMeasureMove,
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
    click(e) {
      if (measureMode && handleMeasureClick) {
        handleMeasureClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
      clearPopups();
    },
    mousemove(e) {
      if (!measureMode || !handleMeasureMove) return;
      handleMeasureMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}
