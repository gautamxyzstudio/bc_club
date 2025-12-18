"use client";
import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { Images } from "@/src/app/exports";
 import PropertyCard from "@/src/components/common/propertiesCard/PropertiesCard";
import FiltersPopup from "@/src/components/common/propertiesCard/FiltersPopup";
import { Chip } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FilterListIcon from "@mui/icons-material/FilterList";
import PropertiesMap from "./PropertiesMap";

export default function PropertiesListingPage() {
  const [openFilters, setOpenFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [isChip, setIsChip] = useState(false);
  const [activePrice, setActivePrice] = useState(false);
  const [activeBedBath, setActiveBedBath] = useState(false);
  const [activeProperty, setActiveProperty] = useState(false);

  const propertyData = [
    {
      image: Images.singleFamilyThree,
      title: "Apartment/Condo",
      price: 350000,
      daysAgo: 10,
      address: "1056 Nicola Street Vancouver BC West End VWV",
      sqft: 1200,
      beds: 2,
      baths: 2,
      priceDrop: 10,
      assessedDiff: 1,
      realtor: "Jane Smith / Smith Realty Group",
      mls: "R3059142",
    },
    {
      image: Images.singleFamilyThree,
      title: "Luxury Condo",
      price: 489000,
      daysAgo: 5,
      address: "Davie Street Vancouver BC",
      sqft: 980,
      beds: 2,
      baths: 1,
      priceDrop: 5,
      assessedDiff: -2,
      realtor: "John Doe / Westview Realty",
      mls: "R2078332",
    },
    {
      image: Images.singleFamilyThree,
      title: "Luxury Condo",
      price: 489000,
      daysAgo: 5,
      address: "Davie Street Vancouver BC",
      sqft: 980,
      beds: 2,
      baths: 1,
      priceDrop: 5,
      assessedDiff: -2,
      realtor: "John Doe / Westview Realty",
      mls: "R2078332",
    },
    {
      image: Images.singleFamilyThree,
      title: "Luxury Condo",
      price: 489000,
      daysAgo: 5,
      address: "Davie Street Vancouver BC",
      sqft: 980,
      beds: 2,
      baths: 1,
      priceDrop: 5,
      assessedDiff: -2,
      realtor: "John Doe / Westview Realty",
      mls: "R2078332",
    },
    {
      image: Images.singleFamilyThree,
      title: "Luxury Condo",
      price: 489000,
      daysAgo: 5,
      address: "Davie Street Vancouver BC",
      sqft: 980,
      beds: 2,
      baths: 1,
      priceDrop: 5,
      assessedDiff: -2,
      realtor: "John Doe / Westview Realty",
      mls: "R2078332",
    },
    {
      image: Images.singleFamilyThree,
      title: "Luxury Condo",
      price: 489000,
      daysAgo: 5,
      address: "Davie Street Vancouver BC",
      sqft: 980,
      beds: 2,
      baths: 1,
      priceDrop: 5,
      assessedDiff: -2,
      realtor: "John Doe / Westview Realty",
      mls: "R2078332",
    },
  ];
  const pillBase =
    "px-6 py-3 bg-white rounded-full shadow appearance-none pr-10 font-medium cursor-pointer border transition w-full";

  const pillActive = "border-blue-500 text-blue-600 ring-1 ring-blue-200";

  const pillInactive = "border-[#30548733] text-gray-800";

  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 pt-5 w-full h-full">
      <div className="h-full mt-24">
        {/* Top Filters Row */}
        <div className="flex items-center gap-4 flex-wrap mb-6 justify-between">
          {/* 🔍 CHIP SEARCH BAR (DESIGN SAME) */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
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

          <button className="px-4 py-4 bg-[#F0F0F0] rounded-xl shadow flex items-center gap-2">
            <BookmarkIcon sx={{ color: "#33333333" }} />
            Save Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center gap-4 md:flex-nowrap flex-wrap mb-6">
          <button
            onClick={() => setOpenFilters(true)}
            className="px-6 py-3 bg-white rounded-full shadow flex items-center justify-center gap-3 border-[#30548733] cursor-pointer w-3/5"
          >
            {/* <FiFilter size={18} className="text-blue-600" /> */}
            <FilterListIcon sx={{ color: "#305487" }} />
            <span className="font-medium">Filters</span>
          </button>

          <div className="relative w-full">
            <select
              onChange={(e) => setActivePrice(e.target.value !== "any")}
              className={`${pillBase} ${
                activePrice ? pillActive : pillInactive
              }`}
            >
              <option value="any">Price: Any</option>
              <option value="low">Below 50L</option>
              <option value="high">Above 50L</option>
            </select>

            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
                activePrice ? "text-blue-600" : "text-gray-500"
              }`}
            >
              ▼
            </span>
          </div>
          <div className="relative w-full">
            <select
              onChange={(e) => setActiveBedBath(e.target.value !== "any")}
              className={`${pillBase} ${
                activeBedBath ? pillActive : pillInactive
              }`}
            >
              <option value="any">Bed/Bathroom: Any</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>

            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
                activeBedBath ? "text-blue-600" : "text-gray-500"
              }`}
            >
              ▼
            </span>
          </div>

          <div className="relative w-full">
            <select
              onChange={(e) => setActiveProperty(e.target.value !== "any")}
              className={`${pillBase} ${
                activeProperty ? pillActive : pillInactive
              }`}
            >
              <option value="any">Property Type: Any</option>
              <option value="house">House</option>
              <option value="flat">Flat</option>
            </select>

            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
                activeProperty ? "text-blue-600" : "text-gray-500"
              }`}
            >
              ▼
            </span>
          </div>

          <button
            onClick={() => {
              setActivePrice(false);
              setActiveBedBath(false);
              setActiveProperty(false);
            }}
            className="px-6 py-3 bg-white rounded-full shadow flex items-center gap-2 border-[#30548733] cursor-pointer w-3/5"
          >
            <FiX size={16} className="text-gray-600" />
            <span className="font-medium text-gray-600">Reset Filters</span>
          </button>
        </div>

        {/* Map + List */}
        <div className="flex justify-between items-start mb-10 w-full">
          <div className="xl:flex h-150 w-full xl:w-[40%] hidden">
            {/* <Image
              src={Images.map}
              alt="Map"
              width={1400}
              height={100}
              className="w-fit h-full object-cover"
            /> */}
            <PropertiesMap />
          </div>

          <div className="flex flex-wrap gap-y-7 justify-between overflow-y-scroll h-150 no-scrollbar p-3 xl:w-[64%] w-full">
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
