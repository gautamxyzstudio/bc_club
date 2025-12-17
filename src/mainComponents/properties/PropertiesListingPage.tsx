"use client";
import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import PropertyCard from "@/src/components/common/propertiesCard/PropertiesCard";
import FiltersPopup from "@/src/components/common/propertiesCard/FiltersPopup";
import { Chip } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FilterListIcon from "@mui/icons-material/FilterList";
import PropertiesMap from "./PropertiesMap";
import { propertyData } from "../dummyData";

export default function PropertiesListingPage() {
  const [openFilters, setOpenFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [isChip, setIsChip] = useState(false);
  const [activePrice, setActivePrice] = useState<string>('');
  const [activeBathRoom, setActiveBathRoom] = useState<string>('');
  const [activeBedRoom, setActiveBedRoom] = useState<string>('');
  const [activeProperty, setActiveProperty] = useState<string>('');
  const pillBase =
    "px-6 py-3 bg-white rounded-full shadow-[0_0_20px_0_rgba(0,0,0,0.12)] appearance-none pr-10 font-medium cursor-pointer border transition w-full";

  const pillActive = "border-primary text-primary ring-1 ring-blue-200";

  const pillInactive = "border-[#30548733] text-gray-800";

  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 pt-5 w-full h-full">
      <div className="h-full mt-24">
        {/* Top Filters Row */}
        <div className="flex items-center gap-4 flex-wrap mb-6 justify-between">
          {/* 🔍 CHIP SEARCH BAR (DESIGN SAME) */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-[0_0_20px_0_rgba(0,0,0,0.12)] border border-gray-200 w-full max-w-md">
            {isChip ? (
              <Chip
                label={search}
                onDelete={() => {
                  setSearch("");
                  setIsChip(false);
                }}
                className="bg-gray-100 text-sm"
              />
            ) : (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="flex-1 text-sm outline-none bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    setIsChip(true);
                  }
                }}
              />
            )}

            <button
              className="ml-auto bg-[#E6A500] p-2.5 rounded-lg flex items-center justify-center"
              onClick={() => {
                if (search.trim()) setIsChip(true);
              }}
            >
              <FiSearch size={18} className="text-white" />
            </button>
          </div>

          <button className="px-4 py-4 bg-gray rounded-xl shadow items-center gap-2 hidden">
            <BookmarkIcon sx={{ color: "#33333333" }} />
            Save Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center gap-4 md:flex-nowrap flex-wrap mb-6">
          <button
            onClick={() => setOpenFilters(true)}
            className="px-6 py-3 bg-background rounded-full shadow-[0_0_20px_0_rgba(0,0,0,0.12)] flex items-center justify-center gap-3 border-[#30548733] cursor-pointer xl:w-3/5 w-full"
          >
            {/* <FiFilter size={18} className="text-blue-600" /> */}
            <FilterListIcon sx={{ color: "#305487" }} />
            <span className="font-medium">Filters</span>
          </button>

          <div
            className={`${pillBase} ${
              activePrice !== 'any' ? pillActive : pillInactive
            } relative w-full xl:flex hidden text-nowrap gap-x-0.5`}
          >
            <span>Price:</span>
            <select
              onChange={(e) => setActivePrice(e.target.value)}
              className="w-full outline-0"
              value={activePrice}
            >
              <option value="any">Any</option>
              <option value="low">Below 50L</option>
              <option value="high">Above 50L</option>
            </select>
          </div>

          <div
            className={`${pillBase} ${
              activeBedRoom !== '1' ? pillActive : pillInactive
            } relative w-full xl:flex hidden text-nowrap`}
          >
            <span>BedRoom:</span>
            <select
              onChange={(e) => setActiveBedRoom(e.target.value)}
              className="w-full outline-0"
              value={activeBedRoom}
            >
              <option value="1">Any</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div
            className={`${pillBase} ${
              activeBathRoom !== '1' ? pillActive : pillInactive
            } relative w-full xl:flex hidden text-nowrap`}
          >
            <span>BathRoom:</span>
            <select
              onChange={(e) => setActiveBathRoom(e.target.value)}
              className="w-full outline-0"
              value={activeBathRoom}
            >
              <option value="1">Any</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div
            className={`${pillBase} ${
              activeProperty !== 'any' ? pillActive : pillInactive
            } relative w-full xl:flex hidden text-nowrap`}
          >
            <span>Property Type:</span>
            <select
              onChange={(e) => setActiveProperty(e.target.value)}
              value={activeProperty}
              className="w-full outline-0"
            >
              <option value="any">Any</option>
              <option value="house">House</option>
              <option value="flat">Flat</option>
            </select>
          </div>

          <button
            onClick={() => {
              setActivePrice('any');
              setActiveBedRoom('1');
              setActiveBathRoom('1');
              setActiveProperty('any');
            }}
            className="px-6 py-3 bg-white rounded-full shadow-[0_0_20px_0_rgba(0,0,0,0.12)] items-center gap-2 border-[#30548733] cursor-pointer w-3/4 xl:flex hidden"
          >
            <FiX size={16} className="text-gray-600" />
            <span className="font-medium text-gray-600">Reset Filters</span>
          </button>
        </div>

        {/* Map + List */}
        <div className="flex justify-between items-start mb-10 w-full ">
          <div className="xl:flex h-[65svh] w-full xl:w-[40%] hidden">
            <PropertiesMap />
          </div>

          <div className="flex flex-wrap gap-y-7 justify-between overflow-y-scroll xl:h-[65svh] no-scrollbar xl:w-[64%] w-full xl:p-3">
            {propertyData.map((property, index) => (
              <PropertyCard key={index} {...property} isLogin />
            ))}
          </div>
        </div>
      </div>

      <FiltersPopup open={openFilters} onClose={() => setOpenFilters(false)} />
    </section>
  );
}
