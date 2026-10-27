/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { FiX, FiHeart, FiLock } from "react-icons/fi";
import { formatPriceAbbreviated } from "../mapUtils";

interface PropertyCardProps {
  property: any;
  onClose: () => void;
  isLoggedIn: boolean;
  onSignInClick?: () => void;
  status: string;
}

export default function OpenStreetMapV5PropertyCard({
  property,
  onClose,
  isLoggedIn,
  onSignInClick,
  status,
}: PropertyCardProps) {
  if (!property) return null;

  const isSold =
    status === "closed" ||
    status === "sold" ||
    status === "forecloserSold" ||
    status === "forcecloserSold" ||
    property.status === "Closed" ||
    property.status === "Sold";

  const isPriceDrop =
    (property.old_price && Number(property.old_price) > Number(property.price)) ||
    (property.PreviousListPrice && property.PreviousListPrice > property.ListPrice) ||
    property.priceDrop !== undefined;

  const priceDropAmount = property.old_price
    ? Number(property.old_price) - Number(property.price)
    : 0;

  const formattedPrice = Number(property.price || 0).toLocaleString();
  const imageUrl =
    property.media_url ||
    property.image ||
    property.media?.[0]?.MediaURL ||
    property.media?.[0] ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

  const beds = property.bedrooms || property.beds || 0;
  const baths = property.bathrooms || property.baths || 0;
  const sqft = property.Living_area || property.area || property.sqft || 0;
  const lotSqft = property.lot_size_area || property.lotSize || 0;

  const specText = [
    beds ? `${beds} bd` : null,
    baths ? `${baths} ba` : null,
    sqft ? `${Number(sqft).toLocaleString()} sqft` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const propertyId = property.documentId || property.id || property.listing_id;

  const handleOpenDetails = () => {
    const isForeclosure =
      status === "forecloser" ||
      status === "forcecloser" ||
      status === "forecloserSold" ||
      status === "forcecloserSold";

    const path = isForeclosure
      ? `/forecloser-property-info/${propertyId}`
      : isSold
        ? `/sold-property-info/${propertyId}`
        : `/property-info/${propertyId}`;

    window.open(path, "_blank");
  };

  return (
    <div className="v5-card open">
      <button
        type="button"
        onClick={onClose}
        className="v5-card-close"
        aria-label="Close"
      >
        <FiX size={16} />
      </button>

      <div className="v5-crow">
        {/* Photo thumbnail */}
        <div className="v5-ph">
          <Image
            src={imageUrl}
            alt={property.address || "Property"}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Header and specs */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="v5-price-row">
            {isSold && !isLoggedIn ? (
              <span className="inline-flex items-center gap-1.5 text-base font-bold text-slate-700">
                <FiLock size={14} className="text-[#9F1239]" />
                Sold price
              </span>
            ) : (
              <span>${formattedPrice}</span>
            )}

            {/* Tags */}
            {isSold ? (
              <span className="v5-tag sold">Sold</span>
            ) : isPriceDrop ? (
              <span className="v5-tag drop">
                ↓ {priceDropAmount > 0 ? formatPriceAbbreviated(priceDropAmount) : "Reduced"}
              </span>
            ) : (
              <span className="v5-tag new">Active</span>
            )}
          </div>

          <div className="text-[13px] text-slate-600 font-semibold mt-0.5">
            {isSold && !isLoggedIn ? (
              <span className="text-[#9F1239] cursor-pointer" onClick={onSignInClick}>
                Sign in free to see sold price
              </span>
            ) : (
              specText || property.property_sub_type || "Single Family Home"
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {property.address || "British Columbia, Canada"}
          </div>
        </div>
      </div>

      {/* Facts section */}
      <div className="v5-facts">
        {lotSqft > 0 && (
          <div className="v5-fact">
            <span className="v5-fact-dot" style={{ background: "#AFB7C3" }} />
            <span>Lot size</span>
            <span className="v5-fact-val">
              approx. {Number(lotSqft).toLocaleString()} sqft
              <small>based on public data</small>
            </span>
          </div>
        )}

        {property.annual_tax ? (
          <div className="v5-fact">
            <span className="v5-fact-dot" style={{ background: "#94A3B8" }} />
            <span>Annual Property Tax</span>
            <span className="v5-fact-val">
              ${Number(property.annual_tax).toLocaleString()}
              <small>BC assessment record</small>
            </span>
          </div>
        ) : null}

        <div className="v5-fact">
          <span className="v5-fact-dot" style={{ background: "#3B82F6" }} />
          <span>Floodplain</span>
          <span className="v5-fact-val">
            General assessment area
            <small>based on public data</small>
          </span>
        </div>

        <div className="v5-fact">
          <span className="v5-fact-dot" style={{ background: "#7C3AED" }} />
          <span>Catchment status</span>
          <span className="v5-fact-val">
            Local school zone
            <small>confirm with school board</small>
          </span>
        </div>
      </div>

      {/* Legal disclaimer */}
      <p className="v5-disc">
        Lot size, assessed value, floodplain and catchment information is based on available
        public data and is for general information only. It is not a survey, appraisal or
        guarantee. Confirm catchments with the local school board.
      </p>

      {/* Action buttons */}
      <div className="v5-cbtns">
        {isSold && !isLoggedIn ? (
          <button
            type="button"
            onClick={onSignInClick}
            className="v5-btn"
          >
            Sign in free to see sold price
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleOpenDetails}
              className="v5-btn"
            >
              View details
            </button>
            <button
              type="button"
              onClick={handleOpenDetails}
              className="v5-btn sec flex-none w-12"
              title="Save property"
              aria-label="Save property"
            >
              <FiHeart size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
