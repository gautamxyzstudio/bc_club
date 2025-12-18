"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type House = {
  id: number;
  title: string;
  rent: string;
  coordinates: [number, number];  
};

const rentedHouses: House[] = [
  {
    id: 1,
    title: "Rented House",
    rent: "$2,500 / month",
    coordinates: [-123.1207, 49.2827],
  },
  {
    id: 2,
    title: "Rented Apartment",
    rent: "$2,100 / month",
    coordinates: [-123.0999, 49.2705],
  },
];

const PropertiesMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYmNyZWFsZXN0YXRlIiwiYSI6ImNtajg1MGUxbDBjOXgzZnExOW52Z2I2YjIifQ.qTP3WbvlpQVV_ETiF8UVsA";

    if (!mapContainerRef.current || mapRef.current) return;

    //  CREATE MAP
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-123.1207, 49.2827],
      zoom: 9,
      style: "mapbox://styles/bcrealestate/cmj8gyj7g000k01sagq9ad6bv",
    });

    mapRef.current = map;

    //  ADD RENTED HOUSE MARKERS
    rentedHouses.forEach((house) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${house.title}</strong><br/>
        <span>${house.rent}</span>
      `);

      new mapboxgl.Marker({ color: "#22c55e" }) // green = rented
        .setLngLat(house.coordinates)
        .setPopup(popup)
        .addTo(map);
    });

    // 🧹 CLEANUP ON UNMOUNT
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-3xl"
    />
  );
};

export default PropertiesMap;
