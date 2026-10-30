/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiX, } from "react-icons/fi";
import FiltersPopup from "@/src/components/common/propertiesCard/FiltersPopup";
import { formatPriceAbbreviated } from "../mapUtils";

interface FilterBarProps {
  status: string;
  setStatus: (val: string) => void;
  // search: string;
  // setSearch: (val: string) => void;
  viewMode: "area" | "street";
  setViewMode: (val: "area" | "street") => void;
  activeFilterPills: Array<{
    label: string;
    onRemove: () => void;
  }>;
  resetAllFilters: () => void;
  filters: any;
  updateFilter: (key: string, value: any) => void;
}

export default function OpenStreetMapV5FilterBar({
  status,
  setStatus,
  // search,
  // setSearch,
  viewMode,
  setViewMode,
  activeFilterPills,
  resetAllFilters,
  filters,
  updateFilter,
}: FilterBarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const priceRef = useRef<HTMLDivElement>(null);
  const bedsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !priceRef.current?.contains(target) &&
        !bedsRef.current?.contains(target) &&
        !statusRef.current?.contains(target) &&
        !typeRef.current?.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const activeBedRoom = filters.activeBedRoom || "any";
  const minPrice = filters.minPrice || 0;
  const maxPrice = filters.maxPrice || 100000000;

  const hasPriceFilter = minPrice > 0 || maxPrice < 100000000;
  const hasBedFilter = activeBedRoom !== "any";
  const hasStatusFilter = status !== "forSale";

  return (
    <>
      {/* Comprehensive Filter Modal */}
      <FiltersPopup
        id="map"
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {/* Modern Filter Chips Scroll Container */}
      <div className="v5-chips-bar">
        {/* Segmented Area / Street View Toggle */}
        <div className="v5-segmented" title="Toggle zoom level">
          <button
            type="button"
            className={viewMode === "area" ? "on" : ""}
            onClick={() => setViewMode("area")}
          >
            Area
          </button>
          <button
            type="button"
            className={viewMode === "street" ? "on" : ""}
            onClick={() => setViewMode("street")}
          >
            Street
          </button>
        </div>

        {/* All Filters Button */}
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className={`v5-chip ${activeFilterPills.length > 0 ? "active" : ""}`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeFilterPills.length > 0 && (
            <span className="v5-chip-count">{activeFilterPills.length}</span>
          )}
        </button>

        {/* Price Dropdown Chip */}
        <div className="relative" ref={priceRef}>
          <button
            type="button"
            onClick={() => toggleDropdown("price")}
            className={`v5-chip ${hasPriceFilter ? "active" : ""}`}
          >
            <span>
              {hasPriceFilter
                ? `${formatPriceAbbreviated(minPrice)} - ${formatPriceAbbreviated(maxPrice)}`
                : "Price"}
            </span>
            <FiChevronDown
              size={13}
              className={`transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown === "price" && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] border border-slate-100 p-4 z-1050 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Price Range
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Min</label>
                  <select
                    value={minPrice}
                    onChange={(e) => updateFilter("minPrice", Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                  >
                    <option value={0}>Any Min</option>
                    <option value={300000}>$300,000</option>
                    <option value={500000}>$500,000</option>
                    <option value={750000}>$750,000</option>
                    <option value={1000000}>$1,000,000</option>
                    <option value={1500000}>$1,500,000</option>
                    <option value={2000000}>$2,000,000</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Max</label>
                  <select
                    value={maxPrice}
                    onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                  >
                    <option value={100000000}>Any Max</option>
                    <option value={750000}>$750,000</option>
                    <option value={1000000}>$1,000,000</option>
                    <option value={1500000}>$1,500,000</option>
                    <option value={2000000}>$2,000,000</option>
                    <option value={3000000}>$3,000,000</option>
                    <option value={5000000}>$5,000,000</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    updateFilter("minPrice", 0);
                    updateFilter("maxPrice", 100000000);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="px-3 py-1.5 bg-[#1E4E8C] text-white text-xs font-bold rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Beds Dropdown Chip */}
        <div className="relative" ref={bedsRef}>
          <button
            type="button"
            onClick={() => toggleDropdown("beds")}
            className={`v5-chip ${hasBedFilter ? "active" : ""}`}
          >
            <span>{hasBedFilter ? `${activeBedRoom}+ Beds` : "Beds"}</span>
            <FiChevronDown
              size={13}
              className={`transition-transform ${openDropdown === "beds" ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown === "beds" && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] border border-slate-100 p-4 z-1050 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Bedrooms
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["any", "1", "2", "3", "4", "5"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      updateFilter("activeBedRoom", b);
                      setOpenDropdown(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      activeBedRoom === b
                        ? "bg-[#1E4E8C] text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {b === "any" ? "Any" : `${b}+`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status / Sold Dropdown Chip */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => toggleDropdown("status")}
            className={`v5-chip ${hasStatusFilter ? "active" : ""}`}
          >
            <span>
              {status === "closed"
                ? "Sold: 12 mo"
                : status === "forecloser"
                  ? "Foreclosure"
                  : status === "expired"
                    ? "Expired"
                    : "For Sale"}
            </span>
            <FiChevronDown
              size={13}
              className={`transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown === "status" && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] border border-slate-100 p-2 z-1050 animate-in fade-in duration-150">
              {[
                { id: "forSale", label: "For Sale", color: "#1E4E8C" },
                { id: "closed", label: "Sold: 12 mo", color: "#9F1239" },
                { id: "forecloser", label: "Foreclosure", color: "#EA580C" },
                { id: "expired", label: "Expired", color: "#64748B" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStatus(item.id);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    status === item.id
                      ? "bg-slate-100 text-[#0F172A]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </div>
                  {status === item.id && (
                    <span className="text-[#1E4E8C] font-extrabold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Removable Active Filter Pills */}
        {activeFilterPills.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            {activeFilterPills.map((pill, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold whitespace-nowrap"
              >
                {pill.label}
                <button
                  type="button"
                  onClick={pill.onRemove}
                  className="hover:text-red-600 transition-colors"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline px-2 cursor-pointer whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
