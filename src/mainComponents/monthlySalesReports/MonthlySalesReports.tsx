"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

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
          className={`text-[#EEA500] transition-transform ${open ? "rotate-180" : ""}`}
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

/* ================= TABLE DATA ================= */
const ROWS = Array.from({ length: 8 }).map(() => ({
  area: "All Areas",
  sold: 157,
  soldChange: "17.8%",
  avgPrice: "$1.24M",
  medianPrice: "$1.24M",
  medianPSF: 157,
  volume: 157,
  discount: "10%",
  dom: "17.8%",
  inventory: 157,
  months: 157,
  listings: 157,
}));

const StatCell = ({ value, positive = true }: { value: string; positive?: boolean }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm font-medium">{value}</span>
    <span className={`flex items-center text-xs ${positive ? "text-green-600" : "text-red-500"}`}>
      {positive ? <FiArrowUpRight /> : <FiArrowDownRight />} 10%
    </span>
  </div>
);

/* ================= MAIN ================= */
const MonthlySalesReports = () => {
  const [region, setRegion] = useState("North Vancouver");
  const [property, setProperty] = useState("All Residential");
  const [month, setMonth] = useState("Select Month");

  return (
    <section className="space-y-6 mt-10">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
        <CustomSelect
          label="Region"
          options={["North Vancouver", "Vancouver", "Burnaby"]}
          value={region}
          onChange={setRegion}
        />
        <CustomSelect
          label="Property Type"
          options={["All Residential", "Detached", "Apartment"]}
          value={property}
          onChange={setProperty}
        />
        <CustomSelect
          label="Month"
          options={["Select Month", "Jan 2025", "Feb 2025", "Mar 2025"]}
          value={month}
          onChange={setMonth}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto scrollbar-hide">
        <table className="min-w-290 w-full text-xs">
          <thead className="bg-[#F9FAFB] text-gray-500 whitespace-nowrap">
            <tr>
              <th className="px-4 py-3 text-left">Area Name</th>
              <th className="px-4 py-3"># Sold</th>
              <th className="px-4 py-3">% Sold Above<br/>Ask Price</th>
              <th className="px-4 py-3">Median Sold<br/>Price</th>
              <th className="px-4 py-3">Median Sold<br/>Price per SqFT</th>
              <th className="px-4 py-3">Dollar<br/>Volume</th>
              <th className="px-4 py-3">Median Discount<br/>From Orig</th>
              <th className="px-4 py-3">Median DOM</th>
              <th className="px-4 py-3">Inventory</th>
              <th className="px-4 py-3"># Months of<br/>Inventory</th>
              <th className="px-4 py-3"># New Listings</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className={i % 2 ? "bg-[#F3F3F3]" : "bg-white"}>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.area}</div>
                  <div className="text-xs text-gray-400">% change from Oct 2025</div>
                </td>
                <td className="px-4 py-3 text-center"><StatCell value={row.sold.toString()} positive={false} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.avgPrice} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.medianPrice} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.medianPSF.toString()} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.volume.toString()} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.discount} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.dom} positive={false} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.inventory.toString()} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.months.toString()} /></td>
                <td className="px-4 py-3 text-center"><StatCell value={row.listings.toString()} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MonthlySalesReports;