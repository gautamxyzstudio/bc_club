"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/src/mainComponents/openStreetMap/openStreetMap.css";
import {
  MapContainer,
  Marker,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import OpenStreetMapMapLibreLayer from "@/src/mainComponents/openStreetMap/OpenStreetMapMapLibreLayer";
import CityStatsPopup from "@/src/mainComponents/home/CityStatsPopup";
import { REGION_COORDINATES, RegionCoordinate } from "..";

interface ActiveRegion {
  name: string;
  lat: number;
  lng: number;
}

const createRegionIcon = (region: string, isSelected: boolean) => {
  return L.divIcon({
    className: "bc-osm-marker",
    html: `
      <div style="display:inline-flex;transform:translate(-50%,-50%);pointer-events:auto;">
        <div class="region-map-marker group flex items-center gap-1.5 px-3 py-1 rounded-full ${
          isSelected
            ? "bg-[#22558b] text-white border-[#22558b] ring-2 ring-primary/40 shadow-xl scale-105"
            : "bg-white text-gray-800 border-[#E6EAEE] shadow-md hover:shadow-lg hover:border-primary"
        } border cursor-pointer transition-all duration-200 select-none whitespace-nowrap">
          <span class="marker-dot w-2 h-2 rounded-full ${
            isSelected ? "bg-white" : "bg-[#EEA500]"
          } shrink-0 transition-colors"></span>
          <span class="marker-text text-xs font-semibold tracking-tight transition-colors">${region}</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

interface MapControllerProps {
  activeRegion: ActiveRegion | null;
  updatePopupPos: (lat: number, lng: number, mapInstance?: L.Map | null) => void;
  onClosePopup: () => void;
  setMapInstance: (map: L.Map) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  activeRegion,
  updatePopupPos,
  onClosePopup,
  setMapInstance,
}) => {
  const map = useMap();
  const activeRegionRef = useRef<ActiveRegion | null>(activeRegion);

  useEffect(() => {
    activeRegionRef.current = activeRegion;
  }, [activeRegion]);

  useEffect(() => {
    setMapInstance(map);

    // Initial fit bounds to display all 41 regions
    const bounds = L.latLngBounds(
      REGION_COORDINATES.map((c) => [c.latitude, c.longitude])
    );
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 11,
      animate: false,
    });
  }, [map, setMapInstance]);

  useMapEvents({
    move() {
      if (activeRegionRef.current) {
        updatePopupPos(
          activeRegionRef.current.lat,
          activeRegionRef.current.lng,
          map
        );
      }
    },
    click(e) {
      const target = e.originalEvent.target as HTMLElement | null;
      if (
        !target?.closest(".region-map-marker") &&
        !target?.closest(".city-stats-popup-container")
      ) {
        onClosePopup();
      }
    },
  });

  return null;
};

const StatsDetail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [activeRegion, setActiveRegion] = useState<ActiveRegion | null>(null);
  const activeRegionRef = useRef<ActiveRegion | null>(activeRegion);

  useEffect(() => {
    activeRegionRef.current = activeRegion;
  }, [activeRegion]);

  const [popupPosition, setPopupPosition] = useState<{
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
  }>({});

  const updatePopupPos = useCallback(
    (lat: number, lng: number, mapInstance?: L.Map | null) => {
      const m = mapInstance || mapRef.current;
      if (!m || !containerRef.current) return;

      const point = m.latLngToContainerPoint([lat, lng]);
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const popupWidth = Math.min(445, containerWidth - 24);
      const popupHeight = 490; // estimated popup height

      // Horizontal placement: prefer right, fallback to left or center
      let left: number;
      if (point.x + popupWidth + 24 <= containerWidth) {
        left = point.x + 16;
      } else if (point.x - popupWidth - 24 >= 0) {
        left = point.x - popupWidth - 16;
      } else {
        left = Math.max(12, (containerWidth - popupWidth) / 2);
      }

      // Vertical placement: align slightly above marker, clamped safely inside container
      let top = point.y - 120;
      top = Math.max(12, Math.min(containerHeight - popupHeight - 12, top));

      setPopupPosition({
        top: `${top}px`,
        left: `${left}px`,
      });
    },
    []
  );

  const handleMarkerClick = useCallback(
    (region: string, lat: number, lng: number) => {
      setActiveRegion((prev) => {
        if (prev?.name === region) {
          return null; // Close if clicked again
        }
        return { name: region, lat, lng };
      });
      updatePopupPos(lat, lng);
    },
    [updatePopupPos]
  );

  const handleClosePopup = useCallback(() => {
    setActiveRegion(null);
  }, []);

  // ResizeObserver to ensure map canvas fits container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        if (activeRegionRef.current) {
          updatePopupPos(
            activeRegionRef.current.lat,
            activeRegionRef.current.lng,
            mapRef.current
          );
        }
      }
    });
    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, [updatePopupPos]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-155 lg:h-150.5 overflow-hidden bg-gray-100"
    >
      {/* OpenStreetMap MapLibre Leaflet Map */}
      <MapContainer
        center={[49.25, -122.8]}
        zoom={10}
        minZoom={7}
        maxZoom={16}
        zoomControl={false}
        scrollWheelZoom
        className="w-full h-full z-0"
      >
        <OpenStreetMapMapLibreLayer />
        <ZoomControl position="bottomright" />

        <MapController
          activeRegion={activeRegion}
          updatePopupPos={updatePopupPos}
          onClosePopup={handleClosePopup}
          setMapInstance={(map) => {
            mapRef.current = map;
          }}
        />

        {REGION_COORDINATES.map((item: RegionCoordinate) => {
          const isSelected = activeRegion?.name === item.region;
          return (
            <Marker
              key={item.region}
              position={[item.latitude, item.longitude]}
              icon={createRegionIcon(item.region, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  handleMarkerClick(item.region, item.latitude, item.longitude);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* City Stats Popup */}
      <div className="city-stats-popup-container">
        <CityStatsPopup
          city={activeRegion?.name || ""}
          isVisible={!!activeRegion}
          position={popupPosition}
          customClasses="flex"
          onClose={handleClosePopup}
        />
      </div>
    </div>
  );
};

export default StatsDetail;
