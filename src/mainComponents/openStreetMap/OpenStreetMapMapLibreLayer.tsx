
"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";

setWorkerUrl(
  new URL(
    "maplibre-gl/dist/maplibre-gl-worker.mjs",
    import.meta.url
  ).toString()
);

const MAP_STYLE =
  "https://tiles.openfreemap.org/styles/positron";

export default function OpenStreetMapMapLibreLayer() {
  const map = useMap();

  useEffect(() => {
    const mapLibreLayer = maplibreGL({
      style: MAP_STYLE,
    });

    mapLibreLayer.addTo(map);

    return () => {
      map.removeLayer(mapLibreLayer);
    };
  }, [map]);

  return null;
}
