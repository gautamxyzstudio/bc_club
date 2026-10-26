/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GeoJSON } from "react-leaflet";
import type { PathOptions } from "leaflet";

type PropertyType = {
  latitude: number;
  longitude: number;
};

function pointInBounds(lat: number, lng: number, coordinates: any[]): boolean {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const scan = (coords: any[]) => {
    coords.forEach((item) => {
      if (typeof item[0] === "number" && typeof item[1] === "number") {
        const lngVal = item[0];
        const latVal = item[1];

        minLat = Math.min(minLat, latVal);
        maxLat = Math.max(maxLat, latVal);
        minLng = Math.min(minLng, lngVal);
        maxLng = Math.max(maxLng, lngVal);
      } else {
        scan(item);
      }
    });
  };

  scan(coordinates);

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function hasPropertyInsideFeature(feature: any, properties: PropertyType[]) {
  const coordinates = feature?.geometry?.coordinates;

  if (!coordinates) return false;

  return properties.some((property) => {
    const lat = Number(property.latitude);
    const lng = Number(property.longitude);

    if (!lat || !lng) return false;

    return pointInBounds(lat, lng, coordinates);
  });
}

export default function OpenStreetMapGeoJsonLayer({
  data,
  properties = [],
}: {
  data: any;
  properties?: PropertyType[];
}) {
  if (!data) return null;

  return (
    <GeoJSON
      key={`${properties.length}-${JSON.stringify(data)?.length}`}
      data={data}
      style={(feature): PathOptions => {
        const active = hasPropertyInsideFeature(feature, properties);

        return {
          fillColor: active ? "#1E4E8C" : "#AFB7C3",
          fillOpacity: active ? 0.18 : 0.08,
          color: active ? "#1E4E8C" : "#AFB7C3",
          weight: active ? 1 : 2,
          interactive: false,
        };
      }}
    />
  );
}
