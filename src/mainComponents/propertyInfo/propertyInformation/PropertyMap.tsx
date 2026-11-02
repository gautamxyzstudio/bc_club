"use client";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef } from "react";

interface PropertyMapProps {
  location: [number, number];
  address?: string;
  city?: string;
  state?: string;
}

const PropertyMap = ({
  location = [-123.13, 49.28],
  address = "Property Address",
  city = "Vancouver",
  state = "BC",
}: PropertyMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
    if (!mapContainerRef.current || mapRef.current) return;

    const [lng, lat] = location;
    if (isNaN(lng) || isNaN(lat)) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [lng, lat],
      zoom: 16,
      style: "mapbox://styles/bcrealestate/cmj8gyj7g000k01sagq9ad6bv",
    });

    map.on("load", () => {
      // // Create custom popup HTML
      // const popupContent = `
      //   <div class="google-maps-popup">
      //     <div class="popup-info">
      //       <h3 class="popup-title">${address}</h3>
      //       <p class="popup-address">${address}, ${city}, ${state}, Canada</p>
      //       <p class="popup-reviews">No reviews</p>
      //     </div>
      //     <div class="popup-actions">
      //       <button class="action-btn open-maps" title="Open in Maps">
      //         <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      //       </button>
      //       <button class="action-btn directions" title="Directions">
      //         <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22.43 10.59l-9.01-9.01c-.75-.75-1.96-.75-2.71 0l-9.01 9.01c-.75.75-.75 1.96 0 2.71l9.01 9.01c.75.75 1.96.75 2.71 0l9.01-9.01c.75-.75.75-1.96 0-2.71zM11 18V9.41L7.71 12.7c-.39.39-1.02.39-1.41 0a.996.996 0 0 1 0-1.41L11.3 6.3c.39-.39 1.02-.39 1.41 0l5 5a.996.996 0 1 1-1.41 1.41L13 9.41V18c0 .55-.45 1-1 1s-1-.45-1-1z"/></svg>
      //       </button>
      //     </div>
      //   </div>
      // `;

      // const popup = new mapboxgl.Popup({
      //   offset: 35,
      //   closeButton: false,
      //   anchor: "bottom",
      // }).setHTML(popupContent);

      new mapboxgl.Marker({ color: "#305487" })
        .setLngLat([lng, lat])
        // .setPopup(popup)
        .addTo(map);
      // .togglePopup();
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [location, address, city, state]);

  const [lng, lat] = location;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-98.75 rounded-xl overflow-clip map-container relative"
    >
      <div className="absolute top-3 left-3 w-full max-w-87.5 bg-white z-10 p-4 rounded-xl shadow-lg border border-gray-100 flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">
            {address.split(",")[0]}
          </h3>
          <p className="text-sm text-gray-400">
            {address.split("BC").slice(-1)[0]}, Canada
          </p>
          <p className="text-xs text-gray-400">No reviews</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-gray-50 transition-colors"
            title="Open in Google Maps"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>

          {/* Directions */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-md"
            title="Get Directions"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M22.43 10.59l-9.01-9.01c-.75-.75-1.96-.75-2.71 0l-9.01 9.01c-.75.75-.75 1.96 0 2.71l9.01 9.01c.75.75 1.96.75 2.71 0l9.01-9.01c.75-.75.75-1.96 0-2.71zM11 18V9.41L7.71 12.7c-.39.39-1.02.39-1.41 0a.996.996 0 0 1 0-1.41L11.3 6.3c.39-.39 1.02-.39 1.41 0l5 5a.996.996 0 1 1-1.41 1.41L13 9.41V18c0 .55-.45 1-1 1s-1-.45-1-1z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
