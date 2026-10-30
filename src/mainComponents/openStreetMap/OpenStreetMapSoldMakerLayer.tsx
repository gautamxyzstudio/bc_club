"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useAuthContext } from "../auth/AuthContext";
import { formatPriceAbbreviated } from "./mapUtils";

type SoldListing = {
  documentId: string;
  listing_id?: string;
  mls_number?: string;
  property_sub_type?: string;
  property_type?: string;
  property_status?: string;
  latitude: number | string;
  longitude: number | string;
  price: number | string;
  bedrooms?: number;
  bathrooms?: number;
  address?: string;
  Living_area?: number;
  area?: number;
  media_url?: string;
  soldDate?: string;
};

export default function OpenStreetMapSoldMakerLayer({
  map,
  soldListings = [],
  zoomVal,
}: {
  map: L.Map | null;
  soldListings: SoldListing[];
  zoomVal: number | null;
}) {
  const markersRef = useRef<L.Marker[]>([]);
  const { setOpenLogin, isLoggedIn } = useAuthContext();

  useEffect(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!map || !soldListings.length || !zoomVal || zoomVal <= 15) return;

    soldListings.forEach((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      if (!lat || !lng || Number.isNaN(lat) || Number.isNaN(lng)) return;

      const soldYear = item.soldDate
        ? new Date(item.soldDate).getFullYear()
        : "";

      const price = Number(item.price);
      const image =
        item.media_url || "https://placehold.co/400x300?text=Property";
      const sqft = item.Living_area || item.area || 0;
      const loginBtnId = `sold-login-${item.documentId}`;

      const icon = L.divIcon({
        className: "",
        html: `
          <div class="sold-marker flex items-center justify-center rounded-sm text-[#9F1239] bg-background hover:border border-[#9F1239] text-xs font-semibold text-nowrap shadow-md cursor-pointer w-fit px-1 py-0.5">
            ${!isLoggedIn ? 'Sold ' + soldYear : `${formatPriceAbbreviated(Number(price))}`}
          </div>
        `,
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
      });

      const popupHtml = !isLoggedIn
        ? `
  <div
    style="
      width:220px;
      background:white;
      border-radius:8px;
      font-family:'Plus Jakarta Display', sans-serif;
      cursor:pointer;
      padding:4px;
      position:relative;
      overflow:hidden;
    "
  >
    <div
      style="
        position:absolute;
        top:10px;
        left:10px;
        z-index:4;
        background:#9F1239;
        color:white;
        font-size:12px;
        font-weight:800;
        padding:5px 12px;
        border-radius:999px;
        text-transform:uppercase;
      "
    >
      SOLD ${soldYear}
    </div>

    <div
      style="
        width:100%;
        height:150px;
        overflow:hidden;
        border-radius:5px;
        background-color:#f1f5f9;
        position:relative;
      "
    >
      <img
        src="${image}"
        alt="Sold Property"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          filter:blur(4px);
          transform:scale(1.06);
        "
      />

      <div
        style="
          position:absolute;
          inset:0;
          background:rgba(0,0,0,0.35);
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          color:white;
          padding:14px;
        "
      >
        <div
          style="
            width:46px;
            height:46px;
            border-radius:999px;
            background:rgba(255,255,255,0.95);
            color:#305487;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
            font-weight:800;
            margin-bottom:10px;
          "
        >
          🔒
        </div>

        <div
          style="
            font-size:16px;
            font-weight:800;
            line-height:1.35;
          "
        >
          Login or register to view property details
        </div>
      </div>
    </div>

    <div
      style="
        padding:14px 10px 10px;
        text-align:center;
      "
    >
      <p
        style="
          margin:0 0 12px;
          font-size:14px;
          color:#333;
          line-height:1.45;
          font-weight:600;
        "
      >
        Sold property details are available to registered members.
      </p>

      <button
        id="${loginBtnId}"
        style="
          width:100%;
          background:#305487;
          color:white;
          border:none;
          border-radius:8px;
          padding:12px 14px;
          font-size:15px;
          font-weight:800;
          cursor:pointer;
        "
      >
        Login / Register
      </button>
    </div>
  </div>
`
        : `
        <div
          style="
            width:220px;
            background:white;
            border-radius:6px;
            font-family:Plus Jakarta Display, sans-serif;
            cursor:pointer;
            padding:0px;
            position:relative;
          " onclick="window.open('/sold-property-info/${item.documentId}', '_blank')"
        >
          <div
            style="
              position:absolute;
              top:5px;
              left:5px;
              z-index:2;
              background:#dc2626;
              color:white;
              font-size:11px;
              font-weight:550;
              padding:4px 8px;
              border-radius:999px;
            "
          >
            SOLD ${soldYear}
          </div>

          <div
            style="
              width:100%;
              height:130px;
              overflow:hidden;
              border-radius:3px;
              background-color:#f1f5f9;
            "
          >
            <img
              src="${image}"
              alt="${item.address || "Sold Property"}"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
              "
            />
          </div>

          <div
            style="
              padding:12px 2px 4px 2px;
              display:flex;
              flex-direction:column;
              gap:4px;
            "
          >
            <h3
              style="
                margin:0;
                color:#305487;
                font-size:18px;
                font-weight:700;
              "
            >
              $${price.toLocaleString()}
            </h3>

            <p
              style="
                margin:0;
                font-size:14px;
                font-weight:700;
                color:#333;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
              "
            >
              ${item.bedrooms || 0} Bed • ${item.bathrooms || 0} Bath • ${sqft} Sqft
            </p>

            <p
              style="
                margin:0;
                font-size:12px;
                color:#6e6e6e;
                line-height:1.4;
                font-weight:500;
              "
            >
              ${item.address || ""}
            </p>
          </div>
          
        </div>
      `;

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true,
        offset: [0, 10],
        maxWidth: 280,
        className: 'map-popup'
      });

      marker.on("popupopen", () => {
        if (!isLoggedIn) {
          const btn = document.getElementById(loginBtnId);

          btn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenLogin(true);
          });
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, soldListings, zoomVal, isLoggedIn, setOpenLogin]);

  return null;
}
