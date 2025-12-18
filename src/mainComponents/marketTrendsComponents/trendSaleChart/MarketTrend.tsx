"use client";
import React, { useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { FiChevronDown } from "react-icons/fi";

/* ================= DATA ================= */
const data = [
  { month: "Jan 23", sold: 20, price: 980, ma: 950 },
  { month: "Feb 23", sold: 820, price: 1020, ma: 980 },
  { month: "Mar 23", sold: 740, price: 1010, ma: 970 },
  { month: "Apr 23", sold: 70, price: 1030, ma: 990 },
  { month: "May 23", sold: 760, price: 1000, ma: 960 },
  { month: "Jun 23", sold: 790, price: 1015, ma: 975 },
  { month: "Jul 23", sold: 80, price: 1040, ma: 1000 },
  { month: "Aug 23", sold: 70, price: 1020, ma: 990 },
  { month: "Sep 23", sold: 750, price: 1005, ma: 985 },
  { month: "Oct 23", sold: 790, price: 1018, ma: 990 },
  { month: "Nov 23", sold: 820, price: 1030, ma: 1000 },
  { month: "Dec 23", sold: 720, price: 995, ma: 980 },
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

/* ================= DROPDOWN ================= */
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <p className="text-sm text-gray-500 mb-1">{label}</p>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border border-[#E6EAEE] rounded-[31px] px-4 py-2 text-sm bg-white"
      >
        <span>{value}</span>

        <FiChevronDown
          size={18}
          className={`text-[#EEA500] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-64 overflow-auto">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                value === opt ? "font-medium text-black" : "text-gray-600"
              }`}
            >
              {opt}
              {value === opt && (
                <span className="text-yellow-500 font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MarketTrend = () => {
  const [property, setProperty] = useState("All Residential");
  const [neighborhood, setNeighborhood] = useState("All Neighborhoods");
  const [year, setYear] = useState("Select Year");
  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl shadow p-5  gap-4 flex flex-nowrap md:flex-row flex-col mt-10">
        <CustomSelect
          label="Property Type"
          options={PROPERTY_OPTIONS}
          value={property}
          onChange={setProperty}
        />

        <CustomSelect
          label="Neighborhood"
          options={NEIGHBORHOOD_OPTIONS}
          value={neighborhood}
          onChange={setNeighborhood}
        />

        <CustomSelect
          label="Years Back"
          options={YEAR_OPTIONS}
          value={year}
          onChange={setYear}
        />
      </div>

      <div className=" rounded-2xl bg-[#F5F6F8] p-4 pb-16">
        <div className="h-124.75   rounded-xl ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm w-85.5">
              City of Vancouver / Median Sold Price in all Neighborhoods
            </h2>

            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
                <span className="w-3 h-3 bg-blue-800 rounded"></span> All
                Residential
              </span>
              <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
                <span className="w-3 h-3 bg-green-500 rounded"></span> 12-MA
              </span>
              <span className="flex items-center gap-1 border border-borderColor p-1 rounded-lg ">
                <span className="w-3 h-3 bg-yellow-400 rounded"></span> Sold
                Count
              </span>
            </div>
          </div>
          <ResponsiveContainer className="mb-10" width="100%" height="100%">
            <ComposedChart data={data}>
              <XAxis dataKey="month" />
              <YAxis yAxisId="price" tickFormatter={(v) => `${v / 1000}M`} />
              <YAxis
                yAxisId="sold"
                orientation="right"
                tickFormatter={(v) => `${v}K`}
              />

              <Tooltip />

              <Bar
                yAxisId="sold"
                dataKey="sold"
                barSize={30}
                fill="#1f3a5f"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="sold" position="top" />
              </Bar>

              <Line
                yAxisId="price"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={1}
                dot={false}
              />

              <Line
                className="mb-290"
                yAxisId="price"
                dataKey="ma"
                stroke="#22c55e"
                strokeWidth={1}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketTrend;
