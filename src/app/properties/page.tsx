// app/properties/page.tsx
"use client";

import React, { useState } from "react";
import { FiFilter, FiHeart, FiRefreshCw, FiSearch } from "react-icons/fi";
import { Images } from "@/src/app/exports";
import Image from "next/image";
import PropertyCard from "@/src/components/common/propertiesCard/PropertiesCard";
import FiltersPopup from "@/src/components/common/propertiesCard/FiltersPopup";

export default function PropertiesPage() {
  const [openFilters, setOpenFilters] = useState(false);
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
    // add more items...
  ];

  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 w-full">
      <div className=" min-h-screen mt-24">
        {/* Top Filters Row */}
        <div className="flex items-center gap-4 flex-wrap mb-6 justify-between">
          <div className="px-4 py-2 bg-white rounded-xl shadow flex items-center gap-2">
            <span className="text-sm font-medium">British Columbia</span>
            <button className="text-gray-500">✕</button>
            <button className="ml-auto px-4 py-2 bg-white rounded-xl shadow flex items-center gap-2">
              <FiSearch size={18} />
            </button>
          </div>

          <button className="px-4 py-5  bg-[#F0F0F0] rounded-xl shadow flex items-center gap-2">
            <FiHeart size={18} />
            Save Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
          {/* Filters Button */}
            <button
        onClick={() => setOpenFilters(true)}
        className="px-6 py-3 bg-white rounded-full shadow flex items-center gap-3 border-[#30548733]"
      >
        <FiFilter size={18} className="text-blue-600" />
        <span className="font-medium">Filters</span>
      </button>

          {/* Price */}
          <div className="relative">
            <select className="px-6 py-3 bg-white rounded-full shadow border-[#30548733] appearance-none pr-10 font-medium">
              <option>Price: Any</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </div>

          {/* Bed/Bathroom */}
          <div className="relative">
            <select className="px-6 py-3 bg-white rounded-full shadow border-[#30548733] appearance-none pr-10 font-medium">
              <option>Bed/Bathroom: Any</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </div>

          {/* Property Type */}
          <div className="relative">
            <select className="px-6 py-3 bg-white rounded-full shadow border-[#30548733] appearance-none pr-10 font-medium">
              <option>Property Type: Any</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </div>

          {/* Reset Filters */}
          <button className="px-6 py-3 bg-white rounded-full shadow flex items-center gap-2 border-[#30548733]">
            <FiRefreshCw size={16} className="text-gray-600" />
            <span className="font-medium text-gray-600">Reset Filters</span>
          </button>
        </div>

        {/* Map + List */}
        <div className="flex justify-between items-start mb-24">
          {/* Map */}
          <div
            className="flex bg-gray-200 rounded-xl h-[600px] 
  w-full sm:w-[300px] md:w-[350px] xl:w-[35%] xl:block hidden"
          >
            <Image
              src="/map-sample.png"
              className="w-full h-full object-cover   "
              alt="Map"
              width={100}
              height={100}
            />
          </div>

          {/* Property Cards — Using your component */}
          <div className="flex flex-wrap gap-y-7 justify-between overflow-y-scroll h-[580px] no-scrollbar p-3 ">
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
