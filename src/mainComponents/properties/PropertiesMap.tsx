import React, { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const PropertiesMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = `${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current || "",
      center: [-123.1207, 49.2827],
      zoom: 9, 
      style:'mapbox://styles/bcrealestate/cmj8gyj7g000k01sagq9ad6bv'
    });
  });

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      ref={mapContainerRef}
      className="map-container w-full rounded-3xl"
    />
  );
};

export default PropertiesMap;
