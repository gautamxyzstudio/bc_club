"use client";

import React, { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import {
  MdApartment,
  MdEmojiEvents,
  MdMap,
  MdSchool,
  MdStar,
} from "react-icons/md";

export type SchoolType = "Elementary" | "Secondary" | "All";

export type SchoolItem = {
  id: string;
  school_name: string;
  school_type: SchoolType;
  city?: string;
  rating?: number | string;
  rank?: number;
  address?: string;
  latitude: number;
  longitude: number;
};

/**
 * Renders a specialized school marker with a detailed information popup,
 * showing Fraser Institute rating, rank, and address.
 */
export default function OpenStreetMapSchoolMarker({
  school,
}: {
  school: SchoolItem;
}) {
  const rating = school.rating ? Number(school.rating) : null;

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "bc-osm-marker",
        html: `
          <div class="relative flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-white">
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 512 512" height="15" width="15" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 32 20 160l236 128 192-104v104h44V160L256 32zM108 247.3V336c0 48.6 66.3 88 148 88s148-39.4 148-88v-88.7L256 328 108 247.3z"></path>
            </svg>
            ${
              rating
                ? `<span class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-[#15376b] shadow">${rating}</span>`
                : ""
            }
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      }),
    [rating],
  );

  return (
    <Marker position={[school.latitude, school.longitude]} icon={icon}>
      <Popup
        className="school-popup"
        // maxWidth={360}
        minWidth={262}
      >
        <div className="w-[calc(100vw-40px)] md:max-w-[350px] max-w-[260px] overflow-hidden rounded-2xl bg-white p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 sm:h-12 sm:w-12">
              <MdSchool className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="wrap-break-word text-sm font-bold leading-snug text-[#15376b] sm:text-base">
                {school.school_name || "-"}
              </h3>

              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-primary sm:px-3 sm:text-xs">
                <MdApartment className="h-3.5 w-3.5" />
                {school.school_type || "-"}
              </div>
            </div>
          </div>

          <div className="my-3 border-t border-dashed border-gray-200 sm:my-4" />

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-50">
                <MdStar className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="font-medium text-gray-600">Rating</span>
              <span className="ml-auto font-bold text-primary">
                {school.rating || "-"} / 10
              </span>
            </div>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50">
                <MdEmojiEvents className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-600">Rank</span>
              <span className="ml-auto font-bold text-purple-600">
                {school.rank || "-"}
              </span>
            </div>

            <div className="flex items-start gap-3 border-b border-gray-100 pb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <MdMap className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-medium text-gray-600">Address</span>
              <span className="ml-auto max-w-[55%] wrap-break-word text-right font-semibold leading-snug text-gray-800">
                {school.address || "-"}
              </span>
            </div>

            <div className="text-right text-[10px] font-medium text-gray-400">
              Data Source: Fraser Institute
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
