"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import {
  Bar,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ===== DUMMY DATA ===== */
const data = [
  { month: "Jan 23", sold: 680, price: 920, ma: 900 },
  { month: "Feb 23", sold: 800, price: 960, ma: 930 },
  { month: "Mar 23", sold: 740, price: 980, ma: 950 },
  { month: "Apr 23", sold: 770, price: 950, ma: 920 },
  { month: "May 23", sold: 780, price: 930, ma: 900 },
  { month: "Jun 23", sold: 720, price: 940, ma: 910 },
  { month: "Jul 23", sold: 760, price: 960, ma: 930 },
  { month: "Aug 23", sold: 790, price: 950, ma: 920 },
  { month: "Sep 23", sold: 780, price: 940, ma: 910 },
  { month: "Oct 23", sold: 770, price: 930, ma: 900 },
  { month: "Nov 23", sold: 790, price: 950, ma: 920 },
  { month: "Dec 23", sold: 810, price: 970, ma: 940 },
  { month: "Jan 24", sold: 850, price: 990, ma: 960 },
  { month: "Feb 24", sold: 760, price: 960, ma: 930 },
  { month: "Mar 24", sold: 770, price: 980, ma: 950 },
  { month: "Apr 24", sold: 800, price: 1000, ma: 970 },
  { month: "May 24", sold: 790, price: 980, ma: 950 },
  { month: "Jun 24", sold: 830, price: 960, ma: 930 },
  { month: "Jul 24", sold: 820, price: 970, ma: 940 },
  { month: "Aug 24", sold: 810, price: 990, ma: 960 },
  { month: "Sep 24", sold: 760, price: 970, ma: 940 },
  { month: "Oct 24", sold: 740, price: 950, ma: 920 },
  { month: "Nov 24", sold: 720, price: 930, ma: 900 },
  { month: "Dec 24", sold: 700, price: 920, ma: 890 },
];

interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/* ================= OPTIONS ================= */
const YEAR_OPTIONS = [
  "Select Year",
  "1 Year",
  "2 Years",
  "3 Years",
  "4 Years",
  "5 Years",
  "6 Years",
  "7 Years",
  "8 Years",
];

const DATA_OPTIONS = [
  "Sold Prices by Months",
  "Sold Prices by Month (Compare)",
  "Sold Prices per SqFt",
  "Sold Prices by Type YTD",
  "Sold Prices per SqFt every NOV",
];

const REGION_OPTIONS = [
  "Vancouver Downtown",
  "Sunshine Coast",
  "Squamish",
  "Whistler & Area",
];

const PROPERTY_OPTIONS = [
  "All Residential",
  "Detached",
  "Apartment",
  "Townhouse",
  "Manufactured on Pad",
  "Vacant Lot",
];

const NEIGHBORHOOD_OPTIONS = [
  "All Neighborhoods",
  "Brunette",
  "Connaught Heights",
  "Downtown NW",
  "Freserview NW",
  "GlenBrooke North",
  "Moody Park",
  "North Arm",
  "Quay",
  "Queens Park",
  "Queensborough",
  "Sapper",
  "The Heights NW",
  "Uptown NW",
  "West End NW",
];

/* ================= CUSTOM SELECT ================= */
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex justify-between items-center border border-[#E6EAEE] rounded-[31px] px-4 py-2 text-sm bg-white"
      >
        <span>{value}</span>
        <FiChevronDown
          size={18}
          className={`text-[#EEA500] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-64 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                value === opt ? "font-medium text-black" : "text-gray-600"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const MonthlySale = () => {
  const [filters, setFilters] = useState({
    region: "Vancouver Downtown",
    data: "Sold Prices by Months",
    propertyType: "All Residential",
    neighborhood: "All Neighborhoods",
    year: "Select Year",
  });

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getFilteredData = () => {
    let filtered = [...data];

    // Filter by year
    if (filters.year !== "Select Year") {
      const years = parseInt(filters.year);
      filtered = filtered.slice(-12 * years);
    }

    return filtered;
  };

  return (
    <section>
      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow p-5 mt-10 flex flex-wrap gap-4">
        <div className="w-full md:w-[calc(33.333%-1rem)]">
          <CustomSelect
            label="Region"
            options={REGION_OPTIONS}
            value={filters.region}
            onChange={(v) => updateFilter("region", v)}
          />
        </div>

        <div className="w-full md:w-[calc(33.333%-1rem)]">
          <CustomSelect
            label="Data"
            options={DATA_OPTIONS}
            value={filters.data}
            onChange={(v) => updateFilter("data", v)}
          />
        </div>

        <div className="w-full md:w-[calc(33.333%-1rem)]">
          <CustomSelect
            label="Property Type"
            options={PROPERTY_OPTIONS}
            value={filters.propertyType}
            onChange={(v) => updateFilter("propertyType", v)}
          />
        </div>

        <div className="w-full md:w-[calc(50%-1rem)]">
          <CustomSelect
            label="Neighborhood"
            options={NEIGHBORHOOD_OPTIONS}
            value={filters.neighborhood}
            onChange={(v) => updateFilter("neighborhood", v)}
          />
        </div>

        <div className="w-full md:w-[calc(50%-1rem)]">
          <CustomSelect
            label="Years"
            options={YEAR_OPTIONS}
            value={filters.year}
            onChange={(v) => updateFilter("year", v)}
          />
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl shadow p-6 mt-10">
        <div className="flex justify-between mb-10">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            City Of Vancouver Median Sold Price in all Neighborhoods*
          </h3>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
              <span className="w-3 h-3 bg-blue-800 rounded"></span> All
              Residential
            </span>
            <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
              <span className="w-3 h-3 bg-green-500 rounded"></span> 12-MA
            </span>
            <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
              <span className="w-3 h-3 bg-yellow-400 rounded"></span> Sold Count
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={getFilteredData()}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}K`} />
            <Tooltip />

            <Bar
              dataKey="sold"
              name="Sold Count"
              barSize={26}
              fill="#244A7C"
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="sold"
                position="top"
                style={{
                  fontSize: 11,
                  fill: "#333",
                  fontWeight: 500,
                }}
              />
            </Bar>
            <Legend />

            <Bar
              dataKey="sold"
              name="Sold Count"
              barSize={26}
              fill="#244A7C"
              radius={[6, 6, 0, 0]}
            />

            <Line
              type="monotone"
              dataKey="price"
              name={filters.propertyType}
              stroke="#F5A623"
              strokeWidth={2}
              dot={{ r: 3 }}
            />

            <Line
              type="monotone"
              dataKey="ma"
              name="12-MA"
              stroke="#2E7D32"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default MonthlySale;
