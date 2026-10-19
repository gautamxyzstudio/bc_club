"use client";

import { useEffect, useMemo, useState } from "react";
import {
    GeoJSON,
    Marker,
    Tooltip,
    useMap,
} from "react-leaflet";
import type { FeatureCollection, Geometry } from "geojson";
import L from "leaflet";

interface SchoolCatchment {
    id: number;
    school: string;
    district_name?: string | null;
    level?: string | null;
    program?: string | null;
    grades?: string | null;
    latitude: number;
    longitude: number;
    geometry: Geometry;
}

interface CatchmentResponse {
    data: SchoolCatchment[];
    meta?: unknown;
}

interface Props {
    apiUrl: string;
    minZoom?: number;
}

export default function SchoolCatchmentLayer({
    apiUrl,
    minZoom = 10,
}: Props) {
    const map = useMap();

    const [catchments, setCatchments] = useState<SchoolCatchment[]>([]);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const activeId = selectedId ?? hoveredId;

    const activeCatchment = useMemo(
        () => catchments.find((item) => item.id === activeId) ?? null,
        [catchments, activeId]
    );

    // Load catchments in the current map viewport.
    useEffect(() => {
        let controller: AbortController | null = null;
        let cancelled = false;

        const loadCatchments = async () => {
            controller?.abort();

            if (map.getZoom() < minZoom) {
                setCatchments([]);
                setHoveredId(null);
                setSelectedId(null);
                return;
            }

            const requestController = new AbortController();
            controller = requestController;

            const bounds = map.getBounds();

            const params = new URLSearchParams({
                north: String(bounds.getNorth()),
                south: String(bounds.getSouth()),
                east: String(bounds.getEast()),
                west: String(bounds.getWest()),
                zoom: String(map.getZoom()),
                limit: "500",
                offset: "0",
            });

            try {
                const baseUrl = apiUrl.replace(/\/+$/, "");

                const response = await fetch(
                    `${baseUrl}/api/school-catchments?${params.toString()}`,
                    { signal: requestController.signal }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch school catchments: ${response.status}`
                    );
                }

                const result: CatchmentResponse = await response.json();

                if (cancelled || requestController.signal.aborted) return;

                const rows = (result.data ?? []).filter(
                    (item) =>
                        item.geometry &&
                        Number.isFinite(Number(item.latitude)) &&
                        Number.isFinite(Number(item.longitude))
                );

                setCatchments(rows);

                // Clear selection if its catchment is no longer in the loaded results.
                setHoveredId((current) =>
                    current !== null && rows.some((item) => item.id === current)
                        ? current
                        : null
                );

                setSelectedId((current) =>
                    current !== null && rows.some((item) => item.id === current)
                        ? current
                        : null
                );
            } catch (error) {
                if (
                    !cancelled &&
                    (error as Error).name !== "AbortError"
                ) {
                    console.error("Failed to load school catchments:", error);
                }
            }
        };

        void loadCatchments();

        map.on("moveend", loadCatchments);

        return () => {
            cancelled = true;
            controller?.abort();
            map.off("moveend", loadCatchments);
        };
    }, [map, apiUrl, minZoom]);

    const highlightedFeature: FeatureCollection | null = activeCatchment
        ? {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    id: activeCatchment.id,
                    properties: {
                        school: activeCatchment.school,
                        district_name: activeCatchment.district_name,
                        level: activeCatchment.level,
                        program: activeCatchment.program,
                        grades: activeCatchment.grades,
                    },
                    geometry: activeCatchment.geometry,
                },
            ],
        }
        : null;

    const icon = useMemo(
        () =>
            L.divIcon({
                className: "bc-osm-marker",
                html: `
              <div class="relative flex h-6.5 w-6.5 items-center justify-center rounded-full bg-green text-white shadow-lg ring-2 ring-white">
                <svg stroke="currentColor" fill="currentColor" viewBox="0 0 512 512" height="15" width="15" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 32 20 160l236 128 192-104v104h44V160L256 32zM108 247.3V336c0 48.6 66.3 88 148 88s148-39.4 148-88v-88.7L256 328 108 247.3z"></path>
                </svg>
              </div>
            `,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
            }),
        [],
    );

    return (
        <>
            {/* School markers */}
            {catchments.map((school) => (
                <Marker
                    key={school.id}
                    icon={icon}
                    position={[Number(school.latitude), Number(school.longitude)]}
                    eventHandlers={{
                        mouseover: () => setHoveredId(school.id),

                        mouseout: () => {
                            setHoveredId((current) =>
                                current === school.id ? null : current
                            );
                        },

                        click: () => {
                            setSelectedId((current) =>
                                current === school.id ? null : school.id
                            );
                        },
                    }}
                >

                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        <div className="school-tooltip">
                            <div className="school-tooltip__header">
                                <div className="school-tooltip__icon">🏫</div>

                                <div>
                                    <strong className="school-tooltip__name">
                                        {school.school}
                                    </strong>
                                    <span className="school-tooltip__district">
                                        {school.district_name ?? "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="school-tooltip__divider" />

                            <div className="school-tooltip__row">
                                <span>School level</span>
                                <strong>{school.level ?? "N/A"}</strong>
                            </div>

                            <div className="school-tooltip__row">
                                <span>Program</span>
                                <strong>{school.program ?? "N/A"}</strong>
                            </div>

                            {school.grades && <div className="school-tooltip__row">
                                <span>Grades</span>
                                <strong>{school.grades ?? "N/A"}</strong>
                            </div>}

                            <div className="school-tooltip__hint">
                                Click the marker to keep its catchment area highlighted.
                            </div>
                        </div>
                    </Tooltip>

                </Marker>
            ))}

            {/* Only the hovered or selected catchment is displayed */}
            {highlightedFeature && (
                <GeoJSON
                    key={`catchment-${activeCatchment?.id}`}
                    data={highlightedFeature}
                    style={() => ({
                        color: "#7C3AED",
                        weight: 3,
                        opacity: 1,
                        fillColor: "#A78BFA",
                        fillOpacity: 0.25,
                    })}
                />
            )}
        </>
    );
}
