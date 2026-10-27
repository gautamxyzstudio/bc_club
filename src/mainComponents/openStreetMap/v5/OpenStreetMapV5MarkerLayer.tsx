/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { escapeHtml } from "../osmMapUtils";
import { formatPriceAbbreviated } from "../mapUtils";

const v5ClusterIcon = ({
  count,
  isSold,
  isExpired,
}: {
  count: number;
  isSold?: boolean;
  isExpired?: boolean;
}) => {
  const size = count < 10 ? 34 : count < 100 ? 42 : 50;

  const clusterClass = isSold
    ? "v5-cluster-sold"
    : isExpired
      ? "v5-cluster-expired"
      : "";

  const bgColor = isSold
    ? "#9F1239"
    : isExpired
      ? "#c8c8c8"
      : "#1E4E8C";

  const ringColor = isSold
    ? "rgba(159, 18, 57, 0.18)"
    : isExpired
      ? "rgba(200, 200, 200, 0.25)"
      : "rgba(30, 78, 140, 0.18)";

  const shadowColor = isSold
    ? "rgba(159, 18, 57, 0.4)"
    : isExpired
      ? "rgba(160, 160, 160, 0.35)"
      : "rgba(30, 78, 140, 0.4)";

  const textColor = isExpired ? "#0F172A" : "#ffffff";

  return L.divIcon({
    className: "v5-marker-wrapper",
    html: `
      <div class="v5-cluster-badge ${clusterClass}" style="width:${size}px;height:${size}px;font-size:${count > 99 ? "12px" : "13px"};background:${bgColor};color:${textColor};box-shadow:0 4px 14px ${shadowColor};">
        <div class="v5-cluster-ring" style="background:${ringColor};"></div>
        <span>${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const v5PriceMarkerIcon = ({
  price,
  isDrop,
  isSold,
  isExpired,
  isLoggedIn,
  isSelected,
  isHovered,
}: {
  price: number;
  isDrop: boolean;
  isSold: boolean;
  isExpired?: boolean;
  isLoggedIn: boolean;
  isSelected: boolean;
  isHovered: boolean;
}) => {
  const isSelectedOrHovered = isSelected || isHovered;

  if (isSold) {
    const text = isLoggedIn ? `Sold ${formatPriceAbbreviated(price)}` : "Sold";
    const lockSvg = isLoggedIn
      ? ""
      : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" style="margin-right:3px;flex-shrink:0"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;

    return L.divIcon({
      className: "v5-marker-wrapper",
      html: `
        <div class="v5-pin v5-pin-sold ${isSelectedOrHovered ? "selected" : ""}">
          <div class="v5-pin-pill">
            ${lockSvg}
            <span>${escapeHtml(text)}</span>
          </div>
          <div class="v5-pin-arrow"></div>
          <div class="v5-pin-dot"></div>
        </div>
      `,
      iconSize: [60, 32],
      iconAnchor: [30, 30],
    });
  }

  if (isExpired) {
    const text = formatPriceAbbreviated(price);
    return L.divIcon({
      className: "v5-marker-wrapper",
      html: `
        <div class="v5-pin v5-pin-expired ${isSelectedOrHovered ? "selected" : ""}">
          <div class="v5-pin-pill">
            <span>${escapeHtml(text)}</span>
          </div>
          <div class="v5-pin-arrow"></div>
          <div class="v5-pin-dot"></div>
        </div>
      `,
      iconSize: [60, 32],
      iconAnchor: [30, 30],
    });
  }

  const prefix = isDrop ? "↓ " : "";
  const priceText = `${prefix}${formatPriceAbbreviated(price)}`;
  const pinClass = isDrop ? "v5-pin-drop" : "v5-pin-active";

  return L.divIcon({
    className: "v5-marker-wrapper",
    html: `
      <div class="v5-pin ${pinClass} ${isSelectedOrHovered ? "selected" : ""}">
        <div class="v5-pin-pill">
          <span>${escapeHtml(priceText)}</span>
        </div>
        <div class="v5-pin-arrow"></div>
        <div class="v5-pin-dot"></div>
      </div>
    `,
    iconSize: [70, 34],
    iconAnchor: [35, 32],
  });
};

export default function OpenStreetMapV5MarkerLayer({
  clusters,
  map,
  status,
  isLoggedIn,
  hoveredPropertyId,
  selectedPropertyId,
  setHoveredPropertyId,
  setSelectedProperty,
  setSelectedClusterProperties,
  setClusterPosition,
  layerState,
}: {
  clusters: any;
  map: L.Map | null;
  status: string;
  isLoggedIn: boolean;
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  setHoveredPropertyId: (value: string | null) => void;
  setSelectedProperty: (value: any) => void;
  setSelectedClusterProperties: (value: any[]) => void;
  setClusterPosition: (value: { lat: number; lng: number } | null) => void;
  layerState: {
    listings: boolean;
    drops: boolean;
    sold: boolean;
  };
}) {


  if (!clusters?.data) return null;

  return clusters.data.map((item: any, index: number) => {
    const lat = Number(item?.latitude || item?.lat);
    const lng = Number(item?.longitude || item?.lng);
    const isCluster = item?.isCluster;

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      return null;
    }

    if (isCluster) {
      const propertyCount = Number(item?.pointCount || 1);
      const clusterId = item.clusterId || index;

      const isSold =
        status === "closed" ||
        status === "sold" ||
        status === "forecloserSold" ||
        status === "forcecloserSold" ||
        item.status === "Closed" ||
        item.status === "Sold";

      const isExpired =
        status === "expired" ||
        item.status === "Expired" ||
        item.status === "expired";

      return (
        <Marker
          key={`cluster-${clusterId}`}
          position={[lat, lng]}
          icon={v5ClusterIcon({ count: propertyCount, isSold, isExpired })}
          eventHandlers={{
            click: () => {
              if (!map) return;
              const currentZoom = map.getZoom() || 0;
              setSelectedProperty(null);

              if (
                item.properties &&
                item.properties.length > 0 &&
                propertyCount <= 10 &&
                currentZoom >= 18
              ) {
                setSelectedClusterProperties(item.properties);
                setClusterPosition({ lat, lng });
              } else {
                map.setView([lat, lng], currentZoom + 2);
              }
            },
          }}
        />
      );
    }

    // Individual Property Marker
    const isSold =
      status === "closed" ||
      status === "sold" ||
      status === "forecloserSold" ||
      status === "forcecloserSold" ||
      item.status === "Closed" ||
      item.status === "Sold";

    const isExpired =
      status === "expired" ||
      item.status === "Expired" ||
      item.status === "expired";

    const isDrop =
      (item.old_price && Number(item.old_price) > Number(item.price)) ||
      (item.PreviousListPrice && item.PreviousListPrice > item.ListPrice) ||
      item.priceDrop !== undefined;

    // Filter check based on active layer toggles
    if (isSold && !layerState.sold) return null;
    if (isDrop && !layerState.drops && !layerState.listings) return null;
    if (!isSold && !isDrop && !layerState.listings) return null;

    const propId = item.documentId || item.id || item.listing_id || String(index);
    const isHovered = hoveredPropertyId === propId;
    const isSelected = selectedPropertyId === propId;

    return (
      <Marker
        key={`property-${propId}`}
        position={[lat, lng]}
        icon={v5PriceMarkerIcon({
          price: Number(item.price || 0),
          isDrop,
          isSold,
          isExpired,
          isLoggedIn,
          isSelected,
          isHovered,
        })}
        eventHandlers={{
          click: () => {
            setSelectedClusterProperties([]);
            setSelectedProperty(item);
          },
          mouseover: () => setHoveredPropertyId(propId),
          mouseout: () => setHoveredPropertyId(null),
        }}
      />
    );
  });
}
