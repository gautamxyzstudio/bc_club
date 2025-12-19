"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SimpleMapProps {
  center?: [number, number];
  zoom?: number;
}

const PropertiesMap: React.FC<SimpleMapProps> = ({
  center = [-123.1207, 49.2827],
  zoom = 9,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center,
      zoom,
      style: "mapbox://styles/bcrealestate/cmj8gyj7g000k01sagq9ad6bv",
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-3xl" />;
};

export default PropertiesMap;
