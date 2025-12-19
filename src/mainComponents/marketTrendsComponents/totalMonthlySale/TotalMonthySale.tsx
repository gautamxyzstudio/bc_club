"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

/* ================= SELECT ================= */
interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

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
        className="w-full flex justify-between items-center border border-[#E6EAEE] rounded-full px-4 py-2 text-sm bg-white"
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
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-auto">
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

/* ================= DATA ================= */
const TABLE_DATA = [
  { range: "$0 – $799,999", sold: 4, inventory: 5, ratio: "80.0%", new: 3 },
  {
    range: "$800,000 – $899,999",
    sold: 4,
    inventory: 5,
    ratio: "100%",
    new: 3,
  },
  {
    range: "$900,000 – $999,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$1,000,000 – $1,249,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$1,250,000 – $1,499,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$1,500,000 – $1,749,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$1,750,000 – $1,999,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$2,000,000 – $2,249,999",
    sold: 4,
    inventory: 5,
    ratio: "80.0%",
    new: 3,
  },
  {
    range: "$2,250,000 – $2,499,999",
    sold: 5,
    inventory: 6,
    ratio: "85.0%",
    new: 4,
  },
  {
    range: "$2,500,000 – $2,749,999",
    sold: 7,
    inventory: 8,
    ratio: "90.0%",
    new: 5,
  },
  {
    range: "$2,750,000 – $2,999,999",
    sold: 6,
    inventory: 7,
    ratio: "88.0%",
    new: 4,
  },
];

/* ================= MAIN ================= */
const TotalMonthlySale = () => {
  const [property, setProperty] = useState("All Residential");
  const [neighborhood, setNeighborhood] = useState("All Neighborhoods");
  const [year, setYear] = useState("Select Year");

  return (
    <section className="space-y-6 mt-10">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
        <CustomSelect
          label="Property Type"
          options={["All Residential", "Detached", "Apartment"]}
          value={property}
          onChange={setProperty}
        />
        <CustomSelect
          label="Neighborhood"
          options={["All Neighborhoods", "Downtown", "Uptown"]}
          value={neighborhood}
          onChange={setNeighborhood}
        />
        <CustomSelect
          label="Years Back"
          options={["Select Year", "1 Year", "2 Years", "3 Years"]}
          value={year}
          onChange={setYear}
        />
      </div>

      {/* Table Card */}
      <div className="flex-row w-full flex  gap-5">
        <div className="bg-white rounded-2xl shadow overflow-hidden w-1/2">
          <table className="w-full text-sm ">
            <thead className="bg-[#F9FAFB]  ">
              <tr className="text-left text-gray-500  ">
                <th className="px-4 py-3">Price Range $ ▲</th>
                <th className="px-4 py-3">Solds</th>
                <th className="px-4 py-3">Inventory</th>
                <th className="px-4 py-3">Ratio</th>
                <th className="px-4 py-3">New</th>
              </tr>
            </thead>

            <tbody>
              {TABLE_DATA.map((row, i) => (
                <tr
                  key={i}
                  className={`  ${i % 2 === 1 ? "bg-[#F3F3F3]" : "bg-white"}`}
                >
                  <td className="px-4 py-3 font-medium">{row.range}</td>
                  <td className="px-4 py-3">{row.sold}</td>
                  <td className="px-4 py-3">{row.inventory}</td>
                  <td className="px-4 py-3">{row.ratio}</td>
                  <td className="px-4 py-3">{row.new}</td>
                </tr>
              ))}

              <tr className="border-t font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">4</td>
                <td className="px-4 py-3">5</td>
                <td className="px-4 py-3">80.0%</td>
                <td className="px-4 py-3">3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden w-1/2">
          <table className="w-full text-sm ">
            <thead className="bg-[#F9FAFB]  ">
              <tr className="text-left text-gray-500  ">
                <th className="px-4 py-3">Price Range $ ▲</th>
                <th className="px-4 py-3">Solds</th>
                <th className="px-4 py-3">Inventory</th>
                <th className="px-4 py-3">Ratio</th>
                <th className="px-4 py-3">New</th>
              </tr>
            </thead>

            <tbody>
              {TABLE_DATA.map((row, i) => (
                <tr
                  key={i}
                  className={`  ${i % 2 === 1 ? "bg-[#F3F3F3]" : "bg-white"}`}
                >
                  <td className="px-4 py-3 font-medium">{row.range}</td>
                  <td className="px-4 py-3">{row.sold}</td>
                  <td className="px-4 py-3">{row.inventory}</td>
                  <td className="px-4 py-3">{row.ratio}</td>
                  <td className="px-4 py-3">{row.new}</td>
                </tr>
              ))}

              <tr className="border-t font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">4</td>
                <td className="px-4 py-3">5</td>
                <td className="px-4 py-3">80.0%</td>
                <td className="px-4 py-3">3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TotalMonthlySale;
