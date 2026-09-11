"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  Layers,
  FileText,
  ImageIcon,
  Code,
  Building,
  Bed,
  Bath,
  Maximize,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";

interface PropertyViewModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onOpenEdit?: () => void;
  onOpenRearrange?: () => void;
}

export default function PropertyViewModal({
  open,
  onClose,
  property,
  onOpenEdit,
  onOpenRearrange,
}: PropertyViewModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "specs" | "financials" | "features" | "media" | "raw"
  >("overview");
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!open || !property) return null;

  // Normalize image list
  const images: string[] = [];
  if (Array.isArray(property.media_url)) {
    images.push(...property.media_url);
  } else if (typeof property.media_url === "string") {
    images.push(property.media_url);
  } else if (Array.isArray(property.media)) {
    property.media.forEach((m: any) => {
      const url = m?.MediaURL || m?.url || m?.src;
      if (url) images.push(url);
    });
  }

  const primaryImage =
    images[0] || "/apartment.webp";

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(property, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "specs", label: "Specifications", icon: Layers },
    { id: "financials", label: "Financials", icon: DollarSign },
    { id: "features", label: "Features", icon: Building },
    { id: "media", label: `Media (${images.length})`, icon: ImageIcon },
    { id: "raw", label: "Raw JSON", icon: Code },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                property.standard_status === "Active" || property.status === "forSale"
                  ? "bg-emerald-100 text-emerald-800"
                  : property.standard_status === "Sold" || property.status === "sold"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {property.standard_status || property.status || "Active"}
            </span>
            <h2 className="text-lg font-bold text-gray-900 truncate max-w-md">
              {property.address || `Listing #${property.listing_id || property.documentId}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRearrange && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRearrange();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Rearrange Media
              </button>
            )}
            {onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary2 rounded-lg transition"
              >
                Edit Property
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-gray-100 bg-white overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Hero Banner with Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-br from-slate-50 to-blue-50/40 p-5 rounded-xl border border-blue-100/60">
                <div className="md:col-span-1 relative h-52 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <Image
                    src={primaryImage}
                    alt="Property cover"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {images.length} Photos
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                      {property.property_sub_type || "Residential"} • {property.structure_type || "Townhouse"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">
                      ${Number(property.price || 0).toLocaleString()}
                    </h1>
                    {property.old_price && Number(property.old_price) > 0 && (
                      <p className="text-xs text-gray-500 line-through">
                        Original: ${Number(property.old_price).toLocaleString()}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-gray-700 text-sm mt-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {property.address || "Address not provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-100/80">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-primary" /> Beds
                      </span>
                      <p className="text-lg font-bold text-gray-800">{property.bedrooms ?? "-"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-primary" /> Baths
                      </span>
                      <p className="text-lg font-bold text-gray-800">{property.bathrooms ?? "-"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5 text-primary" /> Living Area
                      </span>
                      <p className="text-lg font-bold text-gray-800">
                        {property.Living_area ? `${property.Living_area} sqft` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Remarks / Description */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Public Remarks
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.public_remarks ||
                    property.raw_data?.PublicRemarks ||
                    "No description provided for this listing."}
                </p>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Listing ID</span>
                  <p className="text-sm font-semibold text-gray-900">{property.listing_id || "-"}</p>
                </div>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Document ID</span>
                  <p className="text-xs font-mono font-semibold text-gray-700 truncate">{property.documentId || "-"}</p>
                </div>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Office Name</span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{property.office_name || "-"}</p>
                </div>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">City / Municipality</span>
                  <p className="text-sm font-semibold text-gray-900">{property.city || "-"}</p>
                </div>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Postal Code</span>
                  <p className="text-sm font-semibold text-gray-900">{property.postal_code || "-"}</p>
                </div>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Province / State</span>
                  <p className="text-sm font-semibold text-gray-900">{property.state || "British Columbia"}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Bedrooms", value: property.bedrooms ?? "-" },
                { label: "Bathrooms", value: property.bathrooms ?? "-" },
                { label: "Living Area", value: property.Living_area ? `${property.Living_area} ${property.living_area_units || "sqft"}` : "-" },
                { label: "Lot Size Area", value: property.lot_size_area ? `${property.lot_size_area} ${property.lot_size_units || "sqft"}` : "-" },
                { label: "Lot Dimensions", value: property.lot_size_dimensions || property.raw_data?.LotSizeDimensions || "-" },
                { label: "Year Built", value: property.raw_data?.YearBuilt || "-" },
                { label: "Property Sub Type", value: property.property_sub_type || "-" },
                { label: "Structure Type", value: property.structure_type || "-" },
                { label: "Common Interest", value: property.raw_data?.CommonInterest || "-" },
                { label: "Zoning", value: property.raw_data?.Zoning || property.raw_data?.ZoningDescription || "-" },
                { label: "Stories / Levels", value: property.raw_data?.Stories || "-" },
                { label: "Parking Total", value: property.raw_data?.ParkingTotal || "-" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === "financials" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Asking Price", value: property.price ? `$${Number(property.price).toLocaleString()}` : "-" },
                { label: "Old / Original Price", value: property.old_price && Number(property.old_price) > 0 ? `$${Number(property.old_price).toLocaleString()}` : "-" },
                { label: "Price Per Sq Ft", value: property.pricePerSft ? `$${Number(property.pricePerSft).toFixed(2)}` : "-" },
                { label: "Maintenance Fee", value: property.fee || property.raw_data?.AssociationFee ? `$${property.fee || property.raw_data?.AssociationFee}` : "-" },
                { label: "Fee Frequency", value: property.raw_data?.AssociationFeeFrequency || "Monthly" },
                { label: "Annual Property Tax", value: property.annual_tax ? `$${Number(property.annual_tax).toLocaleString()}` : "-" },
                { label: "Tax Year", value: property.raw_data?.TaxYear || "-" },
                { label: "Listed Date", value: property.OriginalEntryTimestamp ? new Date(property.OriginalEntryTimestamp).toLocaleDateString() : "-" },
                { label: "Last Modified", value: property.ModificationTimestamp ? new Date(property.ModificationTimestamp).toLocaleDateString() : "-" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: FEATURES & AMENITIES */}
          {activeTab === "features" && (
            <div className="space-y-4">
              {[
                { label: "Appliances", value: Array.isArray(property.raw_data?.Appliances) ? property.raw_data.Appliances.join(", ") : property.raw_data?.Appliances || "-" },
                { label: "Heating", value: Array.isArray(property.raw_data?.Heating) ? property.raw_data.Heating.join(", ") : property.raw_data?.Heating || "-" },
                { label: "Cooling", value: Array.isArray(property.raw_data?.Cooling) ? property.raw_data.Cooling.join(", ") : property.raw_data?.Cooling || "-" },
                { label: "View", value: Array.isArray(property.raw_data?.View) ? property.raw_data.View.join(", ") : property.raw_data?.View || "-" },
                { label: "Basement", value: Array.isArray(property.raw_data?.Basement) ? property.raw_data.Basement.join(", ") : property.raw_data?.Basement || "-" },
                { label: "Flooring", value: Array.isArray(property.raw_data?.Flooring) ? property.raw_data.Flooring.join(", ") : property.raw_data?.Flooring || "-" },
                { label: "Sewer", value: Array.isArray(property.raw_data?.Sewer) ? property.raw_data.Sewer.join(", ") : property.raw_data?.Sewer || "-" },
                { label: "Water Source", value: Array.isArray(property.raw_data?.WaterSource) ? property.raw_data.WaterSource.join(", ") : property.raw_data?.WaterSource || "-" },
              ].map((feat, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500 font-semibold uppercase">{feat.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{feat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: MEDIA GALLERY */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total Images: <span className="font-bold text-gray-900">{images.length}</span>
                </p>
                {onOpenRearrange && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRearrange();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary2 rounded-lg transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Open Image Rearranger
                  </button>
                )}
              </div>

              {images.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No images available for this property.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs"
                    >
                      <Image
                        src={url}
                        alt={`Property image ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        #{idx + 1} {idx === 0 && "• Cover"}
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 bg-white/90 text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition hover:bg-white"
                        title="Open full size"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RAW JSON */}
          {activeTab === "raw" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Inspect full backend payload and schema:</span>
                <button
                  onClick={handleCopyRaw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-auto max-h-96 leading-relaxed">
                {JSON.stringify(property, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
