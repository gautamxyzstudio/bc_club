/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "leaflet/dist/leaflet.css";
import "../openStreetMap.css";
import "./openStreetMapV5.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  useMap,
} from "react-leaflet";
import {
  useGetMapZoomAssignmentList,
  useGetMapZoomWithClusters,
  useGetMapZoomSchools,
  useGetMapZoomSoldList,
  useGetMe,
  useGetMapZoomProperties,
} from "@/src/hooks/listing/useListingQueries";
import {
  useGetForecloserMapZoomProperties,
  useGetForecloserMapZoomWithClusters,
} from "@/src/hooks/listing/useRealEstateListingQueries";
import { useListingStore } from "@/src/store/useListingStore";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";
import { useSearchParams } from "next/navigation";
import {
  boundsKey,
  getBoundsPayload,
  type LatLngPoint,
} from "../osmMapUtils";
import { MapBounds } from "../mapTypes";
import { buildActiveFilterPills, buildMapZoomParams } from "../mapFilterUtils";
import {
  getGeoKey,
  hasValidCoordinates,
  normalizeAddress,
  transformActiveListing,
} from "../mapPropertyUtils";
import MapLoading from "../MapLoading";
import MapLoadingBadge from "../MapLoadingBadge";
import GetInTouch from "../../getInTouch/GetInTouch";
import { Endpoints } from "@/src/api/endpoints";
import OpenStreetMapSchoolMarker, {
  SchoolItem,
  SchoolType,
} from "../OpenStreetMapSchoolMarker";
import {
  OpenStreetMapDefaultCenter,
} from "../osmMapConfig";
import OpenStreetMapSidebar from "../OpenStreetMapSidebar";
import OpenStreetMapEvents from "../OpenStreetMapEvents";
import OpenStreetMapAssignmentGeoLayer from "../OpenStreetMapAssignmentGeoLayer";
import OpenStreetMapGeoJsonLayer from "../OpenStreetMapGeoJsonLayer";
import {
  OpenStreetMapClusterPopup,
  OpenStreetMapPropertyPopup,
} from "../OpenStreetMapInfoWindows";
import SchoolCatchmentLayer from "../SchoolCatchmentLayer";
import OpenStreetMapMapLibreLayer from "../OpenStreetMapMapLibreLayer";
import OpenStreetMapSoldMakerLayer from "../OpenStreetMapSoldMakerLayer";

// V5 Components
import OpenStreetMapV5FilterBar from "./OpenStreetMapV5FilterBar";
import OpenStreetMapV5Controls, { MapLayerState } from "./OpenStreetMapV5Controls";
import OpenStreetMapV5MarkerLayer from "./OpenStreetMapV5MarkerLayer";
import OpenStreetMapV5PropertyCard from "./OpenStreetMapV5PropertyCard";

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export default function OpenStreetMapSearchV5() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const minParcelZoom = isMobile ? 16 : 18;

  const searchParams = useSearchParams();
  const { data: me } = useGetMe();
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const { getInstanceFilters, updateInstanceFilter, clearInstanceFilters } =
    useListingStore();

  const filters = getInstanceFilters("map");
  const status =
    filters.status === "sold" ? "closed" : filters.status || "forSale";

  const effectiveFilters = useMemo(() => {
    if (filters.status === "sold") {
      return { ...filters, status: "closed" };
    }
    return filters;
  }, [filters]);

  useEffect(() => {
    if (filters.status === "sold") {
      if (!isLoggedIn) {
        setOpenLogin(true);
      }
      updateInstanceFilter("map", "status", "closed");
    }
  }, [filters.status, isLoggedIn, setOpenLogin, updateInstanceFilter]);

  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"area" | "street">("area");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleProperties, setVisibleProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [selectedClusterProperties, setSelectedClusterProperties] = useState<any[]>([]);
  const [clusterPosition, setClusterPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapZoomVal, setMapZoomVal] = useState<number | null>(null);
  const [parcelGeoJSON, setParcelGeoJSON] = useState<any>(null);
  const [geocodedCache, setGeocodedCache] = useState<Record<string, any>>({});
  const [schoolType] = useState<SchoolType>("All");
  const [userLocation, setUserLocation] = useState<LatLngPoint | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // V5 Layer State
  const [layerState, setLayerState] = useState<MapLayerState>({
    listings: true,
    drops: true,
    sold: true,
    lots: false,
    schools: false,
    flood: false,
  });

  const floodLayerRef = useRef<L.GeoJSON | null>(null);
  const [, setLoadingFloodProvince] = useState(false);
  const [selectedAssessmentProperty, setSelectedAssessmentProperty] = useState<any>(null);
  const [assessmentDrawerOpen, setAssessmentDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const lastFetchedBounds = useRef<string>("");
  const popupRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  };

  const setStatus = (val: string) => {
    const nextVal = val === "sold" ? "closed" : val;
    if ((nextVal === "closed" || nextVal === "expired") && !isLoggedIn) {
      setOpenLogin(true);
      return;
    }
    updateInstanceFilter("map", "status", nextVal);
  };

  // URL search params sync
  useEffect(() => {
    if (!searchParams) return;

    const statusParam = searchParams.get("status");
    if (statusParam === "closed" || statusParam === "sold") {
      if (!isLoggedIn) setOpenLogin(true);
      updateInstanceFilter("map", "status", "closed");
    }

    if (searchParams.get("schools") === "true") {
      setLayerState((prev) => ({ ...prev, schools: true }));
    }

    if (searchParams.get("flood") === "true") {
      setLayerState((prev) => ({ ...prev, flood: true }));
    }

    if (searchParams.get("propertyLines") === "true") {
      setLayerState((prev) => ({ ...prev, lots: true }));
      if ((map?.getZoom() || 0) < 17) {
        map?.setZoom(18);
        setMapZoomVal(18);
      }
    }
  }, [searchParams, map, isLoggedIn]);

  const resetAllFilters = () => {
    clearInstanceFilters("map");
    setSortBy("newest");
    showToast("Filters reset");
  };

  const activeFilterPills = useMemo(
    () =>
      buildActiveFilterPills({
        filters: effectiveFilters,
        sortBy,
        setSortBy,
        updateInstanceFilter,
      }),
    [effectiveFilters, sortBy, updateInstanceFilter],
  );

  const isForSale = status === "forSale";
  const isForecloser =
    status === "forecloser" ||
    status === "forcecloser" ||
    status === "forecloserSold" ||
    status === "forcecloserSold";
  const isForecloserSold =
    status === "forecloserSold" || status === "forcecloserSold";


  const mapZoomParams = useMemo(
    () => buildMapZoomParams({ filters: effectiveFilters, mapBounds, mapZoomVal }),
    [effectiveFilters, mapBounds, mapZoomVal],
  );

  // Active listings query
  const {
    data: queryDataActive,
    isLoading: isLoadingActive,
    isFetching: isFetchingActive,
  } = useGetMapZoomWithClusters(mapZoomParams, {
    enabled: !!mapBounds && !isForecloser,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData: any) => previousData,
  });

  // Foreclosure query
  const forecloserMapZoomParams = useMemo(() => {
    return {
      ...mapZoomParams,
      status: isForecloserSold ? "Closed" : "Active",
    };
  }, [mapZoomParams, isForecloserSold]);

  const {
    data: queryDataForecloserActive,
    isLoading: isLoadingForecloserActive,
    isFetching: isFetchingForecloserActive,
  } = useGetForecloserMapZoomWithClusters(forecloserMapZoomParams, {
    enabled: !!mapBounds && isForecloser,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData: any) => previousData,
  });

  const mapZoomParamsWithPage = useMemo(() => {
    return {
      ...mapZoomParams,
      page: currentPage,
      pageSize: 50,
      isLogin: isLoggedIn,
    };
  }, [mapZoomParams, currentPage, isLoggedIn]);

  useEffect(() => {
    setCurrentPage(1);
  }, [mapZoomParams, status, isLoggedIn]);

  const {
    data: queryDataProperties,
    isLoading: isLoadingProperties,
    isFetching: isFetchingProperties,
  } = useGetMapZoomProperties(mapZoomParamsWithPage, {
    enabled: !!mapBounds && !isForecloser,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData: any) => previousData,
  });

  const forecloserParams = useMemo(() => {
    return {
      ...forecloserMapZoomParams,
      page: currentPage,
      pageSize: 50,
    };
  }, [forecloserMapZoomParams, currentPage]);

  const {
    data: queryDataForecloserProperties,
    isLoading: isLoadingForecloserProperties,
    isFetching: isFetchingForecloserProperties,
  } = useGetForecloserMapZoomProperties(forecloserParams, {
    enabled: !!mapBounds && isForecloser,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData: any) => previousData,
  });

  // Sold listings query
  const {
    data: queryDataSold,
    isLoading: isLoadingSold,
    isFetching: isFetchingSold,
  } = useGetMapZoomSoldList(mapZoomParams, {
    select: (res: any) => res.data.filter((l: any) => Number(l.price) > 0),
    enabled: !isForecloser && isForSale && !!mapBounds && (mapZoomVal || 0) > 15,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData: any) => previousData,
  });

  // Assignment query
  const { data: queryDataAssignment } = useGetMapZoomAssignmentList(
    mapZoomParams,
    {
      select: (res: any) => res.data.filter((l: any) => Number(l.price) > 0),
      enabled: !isForecloser && isForSale && !!mapBounds && (mapZoomVal || 0) > 15,
      staleTime: 1000 * 60 * 5,
      placeholderData: (previousData: any) => previousData,
    },
  );

  // School query
  const schoolParams = useMemo(() => {
    return {
      ...mapZoomParams,
      type: schoolType === "All" ? undefined : schoolType,
    };
  }, [mapZoomParams, schoolType]);

  const { data: querySchools } = useGetMapZoomSchools(schoolParams, {
    enabled: layerState.schools && !!mapBounds,
    staleTime: 1000 * 60 * 10,
  });

  const schools = useMemo(() => {
    if (!layerState.schools || !querySchools?.data) return [];
    return querySchools.data.filter((s: SchoolItem) => s.latitude && s.longitude);
  }, [layerState.schools, querySchools?.data]);

  const queryActiveData = isForecloser
    ? queryDataForecloserActive
    : queryDataActive;
  const queryData = isForecloser
    ? queryDataForecloserProperties
    : queryDataProperties;

  const cleanData = useMemo(() => {
    if (!queryData?.data) return [];
    return queryData.data
      .map((listing: any) => transformActiveListing(listing, me))
      .filter(
        (l: any) =>
          Number(l.price) > 0 && (hasValidCoordinates(l) || l.address),
      );
  }, [queryData?.data, me]);

  const rawProperties = useMemo(() => cleanData || [], [cleanData]);

  // Geocoding fallback
  useEffect(() => {
    const needsGeocode = rawProperties.filter((property: any) => {
      const key = getGeoKey(property);
      return (
        !hasValidCoordinates(property) &&
        property.address &&
        !geocodedCache[key]
      );
    });

    if (needsGeocode.length === 0) return;

    let cancelled = false;
    const geocodeBatch = async () => {
      const updates: Record<string, any> = {};
      for (const property of needsGeocode) {
        if (cancelled) break;
        const key = getGeoKey(property);
        try {
          const query = encodeURIComponent(normalizeAddress(property));
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          );
          const data = await res.json();
          if (data && data[0]) {
            updates[key] = {
              latitude: Number(data[0].lat),
              longitude: Number(data[0].lon),
            };
          }
        } catch { }
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setGeocodedCache((prev) => ({ ...prev, ...updates }));
      }
    };

    geocodeBatch();
    return () => {
      cancelled = true;
    };
  }, [rawProperties]);

  const properties = useMemo(() => {
    return rawProperties
      .map((property: any) => {
        if (hasValidCoordinates(property)) return property;
        const key = getGeoKey(property);
        const cached = geocodedCache[key];
        if (cached) {
          return {
            ...property,
            latitude: cached.latitude,
            longitude: cached.longitude,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [rawProperties, geocodedCache]);

  // Update visible properties for the sidebar
  useEffect(() => {
    if (!properties) {
      setVisibleProperties([]);
      return;
    }
    setVisibleProperties(properties);
  }, [properties]);

  const isFetching = isForecloser
    ? isFetchingForecloserActive || isFetchingForecloserProperties
    : isFetchingActive || isFetchingProperties;
  const isLoadingData = isForecloser
    ? isLoadingForecloserActive || isLoadingForecloserProperties
    : isLoadingActive || isLoadingProperties;
  const isLoading = isForecloser
    ? isLoadingData || isFetching
    : isLoadingData || isFetching || isLoadingSold || isFetchingSold;

  // Parcels fetcher
  const fetchParcels = useCallback(async (bounds: MapBounds) => {
    try {
      const query = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        zoom: bounds.zoom.toString(),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/parcels/findGeoJSON?${query}`,
      );
      if (!res.ok) throw new Error("Failed to fetch parcels");
      setParcelGeoJSON(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Flood layer loader
  useEffect(() => {
    if (!map) return;

    if (!layerState.flood) {
      if (floodLayerRef.current) {
        map.removeLayer(floodLayerRef.current);
        floodLayerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    let requestController: AbortController | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    let lastBoundsKey = "";

    const loadFloodLayer = async () => {
      if (cancelled) return;
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      const query = new URLSearchParams({
        north: bounds.getNorth().toString(),
        south: bounds.getSouth().toString(),
        east: bounds.getEast().toString(),
        west: bounds.getWest().toString(),
        zoom: zoom.toString(),
      });

      const bKey = [
        bounds.getNorth().toFixed(3),
        bounds.getSouth().toFixed(3),
        bounds.getEast().toFixed(3),
        bounds.getWest().toFixed(3),
        zoom,
      ].join(":");

      if (bKey === lastBoundsKey) return;
      lastBoundsKey = bKey;

      requestController?.abort();
      requestController = new AbortController();

      try {
        setLoadingFloodProvince(true);
        const res = await fetch(
          `${Endpoints.getFloodProvinceGeoJSON}?${query.toString()}`,
          { signal: requestController.signal },
        );
        if (!res.ok) throw new Error("Flood fetch failed");
        const geojson = await res.json();
        if (cancelled) return;

        if (floodLayerRef.current) {
          map.removeLayer(floodLayerRef.current);
          floodLayerRef.current = null;
        }

        const layer = L.geoJSON(geojson, {
          pane: "overlayPane",
          style: {
            color: "#3B82F6",
            weight: 1.6,
            opacity: 0.9,
            dashArray: "5 3",
            fillColor: "#3B82F6",
            fillOpacity: 0.2,
          },
        });

        layer.addTo(map);
        floodLayerRef.current = layer;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      } finally {
        if (!cancelled) setLoadingFloodProvince(false);
      }
    };

    const scheduleLoad = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => void loadFloodLayer(), 250);
    };

    void loadFloodLayer();
    map.on("moveend", scheduleLoad);

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      requestController?.abort();
      map.off("moveend", scheduleLoad);
      if (floodLayerRef.current) {
        map.removeLayer(floodLayerRef.current);
        floodLayerRef.current = null;
      }
    };
  }, [map, layerState.flood]);

  const triggerSearch = useCallback(() => {
    if (!map) return;
    const zoom = map.getZoom() || 8;
    if (zoom < 8) return;

    const newBounds = getBoundsPayload(map);
    const key = boundsKey(newBounds);
    if (lastFetchedBounds.current === key) return;

    setMapBounds(newBounds);
    setMapZoomVal(Math.round(zoom));
    lastFetchedBounds.current = key;

    if (zoom >= 16 && layerState.lots) {
      fetchParcels(newBounds);
    }
  }, [map, fetchParcels, layerState.lots]);

  const onMapReady = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
    setMapLoaded(true);

    const initialBounds = getBoundsPayload(mapInstance);
    setMapBounds(initialBounds);
    setMapZoomVal(Math.round(initialBounds.zoom));
    lastFetchedBounds.current = boundsKey(initialBounds);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(center);
        mapInstance.setView([center.lat, center.lng], 13);
        setTimeout(() => {
          const nextBounds = getBoundsPayload(mapInstance);
          setMapBounds(nextBounds);
          setMapZoomVal(Math.round(nextBounds.zoom));
          lastFetchedBounds.current = boundsKey(nextBounds);
        }, 600);
      },
      () => {
        mapInstance.setView(OpenStreetMapDefaultCenter, 13);
      },
    );
  }, []);

  // Handle segmented View switch (Area vs Street)
  const handleViewModeChange = (mode: "area" | "street") => {
    setViewMode(mode);
    if (!map) return;
    if (mode === "area") {
      map.setZoom(12);
      showToast("Area overview · zoom in to see details");
    } else {
      map.setZoom(18);
      showToast("Street view · lot lines & homes visible");
    }
  };

  // Toggle layer helper
  const handleToggleLayer = (key: keyof MapLayerState, value: boolean) => {
    setLayerState((prev) => ({ ...prev, [key]: value }));
    const label =
      key === "lots"
        ? "Lot lines"
        : key === "flood"
          ? "Floodplain"
          : key === "schools"
            ? "Schools & catchments"
            : key === "drops"
              ? "Price drops"
              : key === "sold"
                ? "Sold listings"
                : "Active listings";
    showToast(`${label} ${value ? "on" : "off"}`);

    if (key === "lots" && value && map) {
      if ((map.getZoom() || 0) < 17) {
        map.setZoom(18);
      }
      fetchParcels(getBoundsPayload(map));
    }
  };

  const handleResetDisclaimers = () => {
    setLayerState((prev) => ({
      ...prev,
      lots: false,
      flood: false,
      schools: false,
    }));
    showToast("Disclaimers reset");
  };

  // Geolocation trigger
  const handleGeolocation = () => {
    if (!map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(center);
        map.setView([center.lat, center.lng], 16);
        showToast("Centered on your location");
      },
      () => {
        showToast("Location access denied");
      },
    );
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const isSidebarLoading =
    isLoadingData ||
    (isForecloser ? isLoadingForecloserProperties : isLoadingProperties);

  const stableClusterPosition = useMemo(
    () => (clusterPosition ? { ...clusterPosition } : null),
    [clusterPosition?.lat, clusterPosition?.lng],
  );

  if (!mapLoaded && typeof window === "undefined") return <MapLoading />;

  return (
    <>
      <div className="flex flex-col overflow-hidden lg:mt-19 mt-15 w-full lg:h-[calc(100vh-80px)] h-[calc(100vh-140px)]">
        {/* Main Body with Sidebar + Map */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative xl:max-w-screen-2xl mx-auto w-full h-full">
          {/* Same OpenStreetMapSidebar component */}
          <OpenStreetMapSidebar
            isLoading={isSidebarLoading}
            visibleProperties={visibleProperties}
            properties={queryData}
            isLoggedIn={isLoggedIn || isForecloserSold}
            status={status}
            setHoveredPropertyId={setHoveredPropertyId}
            assessmentDrawerOpen={assessmentDrawerOpen}
            selectedAssessmentProperty={selectedAssessmentProperty}
            setAssessmentDrawerOpen={setAssessmentDrawerOpen}
            currentPage={currentPage}
            totalPages={
              queryData?.meta
                ? Math.ceil(queryData.meta.total / queryData.meta.pageSize)
                : 1
            }
            onPageChange={handlePageChange}
          />

          {/* Map View Area */}
          <div className="flex flex-1 relative z-10 w-full h-full">
            {/* Top Loading Progress Line */}
            {isLoading && (
              <div className="absolute left-0 top-0 z-9999 h-1 w-full overflow-hidden bg-slate-200">
                <div className="h-full w-1/3 animate-[mapLoading_1.2s_ease-in-out_infinite] bg-[#1E4E8C]" />
              </div>
            )}

            {/* V5 Filter Chips Bar */}
            <OpenStreetMapV5FilterBar
              status={status}
              setStatus={setStatus}
              // search={search}
              // setSearch={setSearch}
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              activeFilterPills={activeFilterPills}
              resetAllFilters={resetAllFilters}
              filters={effectiveFilters}
              updateFilter={(k, v) => updateInstanceFilter("map", k, v)}
            />

            {/* Leaflet Map Container */}
            <MapContainer
              center={OpenStreetMapDefaultCenter}
              zoom={13}
              minZoom={8}
              maxZoom={22}
              zoomControl={false}
              scrollWheelZoom
              className="w-full h-full bc-osm-map"
            >
              <MapReady onReady={onMapReady} />

              {/* Base Layer */}
              <OpenStreetMapMapLibreLayer />

              {/* School Catchment Polygon Layer */}
              {layerState.schools && (
                <SchoolCatchmentLayer
                  apiUrl={process.env.NEXT_PUBLIC_BASE_URL || ""}
                />
              )}

              {/* Map Events Handler */}
              <OpenStreetMapEvents
                selectedProperty={selectedProperty}
                selectedClusterProperties={selectedClusterProperties}
                triggerSearch={triggerSearch}
                clearPopups={() => {
                  setSelectedProperty(null);
                  setSelectedClusterProperties([]);
                  setClusterPosition(null);
                }}
              />

              {/* Assignment & Assessment Layer */}
              <OpenStreetMapAssignmentGeoLayer
                map={map}
                data={queryDataAssignment || []}
                zoomVal={mapZoomVal}
                onSelectProperty={(property) => {
                  setSelectedAssessmentProperty(property);
                  setAssessmentDrawerOpen(true);
                }}
              />

              {/* Lot Lines GeoJSON Layer */}
              {layerState.lots &&
                parcelGeoJSON &&
                mapZoomVal &&
                mapZoomVal >= minParcelZoom && (
                  <OpenStreetMapGeoJsonLayer
                    data={parcelGeoJSON}
                    properties={properties}
                  />
                )}

              {/* Schools Pins */}
              {layerState.schools &&
                schools.map((school: SchoolItem) => (
                  <OpenStreetMapSchoolMarker key={school.id} school={school} />
                ))}

              {/* User Location Pulse Marker */}
              {userLocation && (
                <>
                  <CircleMarker
                    center={[userLocation.lat, userLocation.lng]}
                    radius={18}
                    pathOptions={{
                      color: "rgba(37,99,235,0.25)",
                      fillColor: "rgba(37,99,235,0.25)",
                      fillOpacity: 0.5,
                      weight: 1,
                    }}
                    className="v5-pulse-circle"
                  />
                  <CircleMarker
                    center={[userLocation.lat, userLocation.lng]}
                    radius={7}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: "#2563EB",
                      fillOpacity: 1,
                      weight: 2.5,
                    }}
                  />
                </>
              )}

              {/* V5 Marker Layer (Active, Price Drops, Sold, Clusters) */}
              <OpenStreetMapV5MarkerLayer
                clusters={queryActiveData}
                map={map}
                status={status}
                isLoggedIn={isLoggedIn}
                hoveredPropertyId={hoveredPropertyId}
                selectedPropertyId={selectedProperty?.documentId || selectedProperty?.id}
                setHoveredPropertyId={setHoveredPropertyId}
                setSelectedProperty={setSelectedProperty}
                setSelectedClusterProperties={setSelectedClusterProperties}
                setClusterPosition={setClusterPosition}
                layerState={layerState}
              />

              {/* Sold Listings Deep Layer */}
              {layerState.sold && (
                <OpenStreetMapSoldMakerLayer
                  map={map}
                  soldListings={queryDataSold || []}
                  zoomVal={mapZoomVal}
                />
              )}

              {/* Popups */}
              <OpenStreetMapPropertyPopup
                selectedProperty={selectedProperty}
                popupRef={popupRef}
                status={status}
                onClose={() => setSelectedProperty(null)}
              />

              <OpenStreetMapClusterPopup
                selectedClusterProperties={selectedClusterProperties}
                stableClusterPosition={stableClusterPosition}
                onClose={() => setSelectedClusterProperties([])}
              />
            </MapContainer>

            {/* Loading Badge */}
            {isLoading && <MapLoadingBadge />}

            {/* V5 Controllers (FABs, Layers Sheet, Disclaimers, Notes) */}
            <OpenStreetMapV5Controls
              layerState={layerState}
              onToggleLayer={handleToggleLayer}
              onResetDisclaimers={handleResetDisclaimers}
              handleGeolocation={handleGeolocation}
              toastMessage={toastMessage}
            />

            {/* Mobile Bottom Sliding Property Card */}
            {selectedProperty && (
              <OpenStreetMapV5PropertyCard
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
                isLoggedIn={isLoggedIn}
                onSignInClick={() => setOpenLogin(true)}
                status={status}
              />
            )}
          </div>
        </div>
      </div>
      <GetInTouch />
    </>
  );
}
