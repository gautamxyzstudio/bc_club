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
  const { setOpenLogin, setOpenSignup, isLoggedIn } = useAuthContext();

  console.log(soldListings, "Sold Listings")

  useEffect(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!map || !soldListings.length) return;

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
      const signupBtnId = `sold-signup-${item.documentId}`;
      const signinBtnId = `sold-signin-${item.documentId}`;
      const closeBtnId = `sold-close-${item.documentId}`;

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
    class="bc-mappop"
    role="dialog"
    aria-label="Sold property"
    style="
      width: 290px;
      max-width: calc(100vw - 90px);
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif;
      box-shadow: 0 18px 44px rgba(15, 23, 42, 0.28);
    "
  >
    <!-- Photo Header -->
    <div
      class="bc-photo"
      style="
        height: 108px;
        background: #CBD5E1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      "
    >
      ${
        image
          ? `
        <img
          src="${image}"
          alt="${item.address || "Sold property"}"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(2px);
            transform: scale(1.05);
          "
        />
      `
          : `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
        </svg>
      `
      }
      <span
        class="bc-tag-sold"
        style="
          position: absolute;
          top: 10px;
          left: 10px;
          background: #9F1239;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          z-index: 10;
        "
      >
        SOLD ${soldYear ? soldYear : ""}
      </span>
      <button
        id="${closeBtnId}"
        type="button"
        class="bc-close"
        aria-label="Close"
        style="
          position: absolute;
          top: 4px;
          right: 4px;
          width: 30px;
          height: 30px;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.92);
          border: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          z-index: 10;
        "
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div
      class="bc-mappop-body"
      style="
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      "
    >
      <div
        class="bc-mappop-price"
        style="
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          font-size: 14px;
          color: #4B5563;
        "
      >
        <span>Sold for</span>
        <strong
          class="bc-blur"
          style="
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            filter: blur(6px);
            user-select: none;
          "
          aria-label="Hidden until you sign in"
        >
          $${price ? price.toLocaleString() : "1,048,000"}
        </strong>
      </div>

      <div
        class="bc-lockline"
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.35;
          color: #111827;
        "
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F4F86" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none;">
          <rect x="5" y="11" width="14" height="10" rx="2"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
        </svg>
        <span>Sold prices are free with an account</span>
      </div>

      <ul
        class="bc-pills"
        style="
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          list-style: none;
          margin: 0;
          padding: 0;
        "
      >
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">Foreclosures</li>
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">Floodplain</li>
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">Lot lines</li>
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">Map tools</li>
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">School rankings</li>
        <li style="background: #EEF3F9; color: #1F4F86; font-size: 12px; font-weight: 700; padding: 5px 8px; border-radius: 999px;">Catchments</li>
      </ul>

      <button
        id="${signupBtnId}"
        type="button"
        class="bc-btn"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 48px;
          border: 0;
          border-radius: 12px;
          background: #1F4F86;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        "
        onmouseover="this.style.background='#163A63'"
        onmouseout="this.style.background='#1F4F86'"
      >
        Join free to see price
      </button>

      <p
        class="bc-fine"
        style="
          margin: 0;
          text-align: center;
          font-size: 13px;
          color: #4B5563;
        "
      >
        Member? <button
          id="${signinBtnId}"
          type="button"
          style="
            font-weight: 700;
            color: #111827;
            text-decoration: underline;
            text-decoration-color: #F5B800;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            cursor: pointer;
            background: transparent;
            border: 0;
            padding: 0;
            font-family: inherit;
            font-size: inherit;
          "
        >Sign in</button>
      </p>
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
        closeButton: isLoggedIn,
        autoPan: true,
        offset: [0, 10],
        maxWidth: 320,
        className: !isLoggedIn ? "sold-map-popup map-popup" : "map-popup",
      });

      marker.on("popupopen", () => {
        if (!isLoggedIn) {
          const signupBtn = document.getElementById(signupBtnId);
          signupBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenSignup(true);
          });

          const signinBtn = document.getElementById(signinBtnId);
          signinBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenLogin(true);
          });

          const closeBtn = document.getElementById(closeBtnId);
          closeBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            marker.closePopup();
          });
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, soldListings, zoomVal, isLoggedIn, setOpenLogin, setOpenSignup]);

  return null;
}
