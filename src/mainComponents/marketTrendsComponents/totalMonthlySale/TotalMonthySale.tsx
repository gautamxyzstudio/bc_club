import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

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
const TotalMonthySale = () => {
    const [property, setProperty] = useState("All Residential");
    const [neighborhood, setNeighborhood] = useState("All Neighborhoods");
    const [year, setYear] = useState("Select Year");
  return (
    <div>
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
    </div>
  );
};

export default TotalMonthySale;
