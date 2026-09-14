"use client";
import React, { useEffect, useState } from "react";
import { FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Image from "next/image";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { Images } from "@/src/app/exports";
import LineGradient from "../lineGradient/LineGradient";
import CustomButton from "../../button/CustomButton";
import { Dialog, TextField } from "@mui/material";

// ================= Constants =================
const ALL_CITIES = [
  // Core Metro Vancouver
  "Vancouver",
  "Burnaby",
  "Richmond",
  "Surrey",
  "Coquitlam",
  "Port Coquitlam",
  "Port Moody",
  "New Westminster",
  "North Vancouver",
  "West Vancouver",

  // Fraser Valley
  "Abbotsford",
  "Chilliwack",
  "Mission",
  "Agassiz",
  "Hope",
  "Langley",
  "Maple Ridge",
  "Pitt Meadows",
  "Delta",
  "White Rock",
  "Tsawwassen",
  "Ladner",
  "Yarrow",
  "Rosedale",
  "Greendale",

  // Vancouver Island (important missing earlier)
  "Victoria",
  "Langford",
  "Saanich",
  "Nanaimo",
  "Courtenay",
  "Comox",
  "Campbell River",
  "Parksville",
  "Duncan",
  "Sidney",

  // Interior BC
  "Kelowna",
  "Kamloops",
  "Prince George",
  "Vernon",
  "Penticton",
  "Salmon Arm",
  "Nelson",
  "Castlegar",
  "Trail",

  // Sea-to-Sky
  "Squamish",
  "Whistler",
  "Pemberton",
  "Britannia Beach",
  "Lions Bay",

  // Sunshine Coast
  "Sechelt",
  "Gibsons",
  "Madeira Park",
  "Roberts Creek",
  "Egmont",

  // Islands
  "Salt Spring Island",
  "Pender Island",
  "Mayne Island",
  "Galiano Island",
  "Saturna Island",
  "Gabriola Island",
  "Bowen Island",
  "Gambier Island",
  "Keats Island",

  // Small / Rural / Edge cases
  "Anmore",
  "Belcarra",
  "D'Arcy",
  "Birken",
  "Brackendale",
  "Furry Creek",
  "Halfmoon Bay",
  "Garden Bay",
  "Harrison Hot Springs",
  "Harrison Mills",
  "Cultus Lake",
  "Lindell Beach",
  "Sunshine Valley",
  "Boston Bar",
  "Lytton",
  "Yale",
  "Vanderhoof",

  // DDF-specific / MLS weird values (optional keep)
  "Sardis",
  "Sardis - Chwk River Valley",
  "Sardis - Greendale",
  "University Endowment Lands",
  "Columbia Valley",
];

const POPULAR_CITIES = [
  "Vancouver",
  "Surrey",
  "Burnaby",
  "Coquitlam",
  "Richmond",
  "Langley",
  "Abbotsford",
  "Delta",
];
import { useListingStore } from "@/src/store/useListingStore";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";

// ================= Slider Theme =================
const PriceSlider = styled(Slider)({
  color: "#E8A200",
  height: 6,
  padding: "14px 0",
  "& .MuiSlider-thumb": {
    height: 18,
    width: 18,
    backgroundColor: "#E8A200",
    border: "3px solid #fff",
    boxShadow: "0 2px 6px rgba(0,0,0,.25)",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-track": {
    height: 12,
  },

  "& .MuiSlider-rail": {
    height: 12,
    opacity: 1,
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: "0 10px",
    width: "fit-content",
    height: 32,
    borderRadius: 20,
    backgroundColor: "#E8A200",
    transform: "translate(0%, 10%) rotate(180deg) scale(0)",
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(0%, 10%) rotate(180deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(180deg)",
    },
  },
});

// ================= Types =================
interface FiltersDialogProps {
  open: boolean;
  onClose: () => void;
  id: string;
}

// ================= Component =================
export default function FiltersPopup({
  open,
  onClose,
  id,
}: FiltersDialogProps) {
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const { getInstanceFilters, updateInstanceFilter, clearInstanceFilters } =
    useListingStore();

  const filters = getInstanceFilters(id);

  const [price, setPrice] = useState<[number | null, number | null]>([
    filters.minPrice ?? 0,
    filters.maxPrice ?? 100000000,
  ]);

  const [sqft, setSqft] = useState<[number | null, number | null]>([
    filters.minSqft ?? 0,
    filters.maxSqft ?? 15000,
  ]);

  const [pricePerSft, setPricePerSft] = useState<
    [number | null, number | null]
  >([filters.minPricePerSft ?? 0, filters.maxPricePerSft ?? 25000]);

  const [lotSqft, setLotSqft] = useState<[number | null, number | null]>([
    filters.minLotSizeArea ?? 0,
    filters.maxLotSizeArea ?? 100000,
  ]);

  const [tax, setTax] = useState<[number | null, number | null]>([
    filters.minTax ?? 0,
    filters.maxTax ?? 50000,
  ]);

  const [associationFee, setAssociationFee] = useState<
    [number | null, number | null]
  >([filters.minAssociationFee ?? 0, filters.maxAssociationFee ?? 3000]);
  const [bedrooms, setBedrooms] = useState<number | null>(
    filters.activeBedRoom && filters.activeBedRoom !== "any"
      ? Number(filters.activeBedRoom.replace("+", ""))
      : null,
  );
  const [bathrooms, setBathrooms] = useState<number | null>(
    filters.activeBathRoom && filters.activeBathRoom !== "any"
      ? Number(filters.activeBathRoom.replace("+", ""))
      : null,
  );
  const [status, setStatus] = useState<string>(filters.status ?? "");
  const [whenListed, setWhenListed] = useState<string>(
    filters.whenListed ?? "any",
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    filters.location ? filters.location.split(",").filter(Boolean) : [],
  );
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    filters.activeProperty && filters.activeProperty !== "any"
      ? filters.activeProperty.split(",").filter(Boolean)
      : [],
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    filters.features ? filters.features.split(",").filter(Boolean) : [],
  );

  const [selectedStructureTypes, setSelectedStructureTypes] = useState<
    string[]
  >(
    filters.structureType
      ? filters.structureType.split(",").filter(Boolean)
      : [],
  );

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [whenListedDropdownOpen, setWhenListedDropdownOpen] = useState(false);
  const [expandedCityGroup, setExpandedCityGroup] = useState<
    "all" | "popular" | null
  >("popular");

  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minSqftInput, setMinSqftInput] = useState("");
  const [maxSqftInput, setMaxSqftInput] = useState("");

  const [minLotSqftInput, setMinLotSqftInput] = useState("");
  const [maxLotSqftInput, setMaxLotSqftInput] = useState("");

  const [minPricePerSftInput, setMinPricePerSftInput] = useState("");
  const [maxPricePerSftInput, setMaxPricePerSftInput] = useState("");

  const [minTaxInput, setMinTaxInput] = useState("");
  const [maxTaxInput, setMaxTaxInput] = useState("");

  const [minAssociationFeeInput, setMinAssociationFeeInput] = useState("");
  const [maxAssociationFeeInput, setMaxAssociationFeeInput] = useState("");

  const handleToggleLocation = (city: string) => {
    if (selectedLocations.includes(city)) {
      setSelectedLocations(selectedLocations.filter((c) => c !== city));
    } else {
      setSelectedLocations([...selectedLocations, city]);
    }
  };

  const handleToggleProperty = (prop: string, isSingleFamilyGroup: boolean) => {
    const singleFamilyOptions = [
      "Single-Family",
      "Townhouse",
      "Detached House",
      "Detached Home",
      "Duplex",
      "Apartment/Condo",
      "Apartment",
      "Single Family Residence",
      "Half Duplex",
      "Row House (Non-Strata)",
    ];

    if (isSingleFamilyGroup) {
      // If it's a Single Family group option, clear any "Other" types
      const currentSF = selectedProperties.filter((p) =>
        singleFamilyOptions.includes(p),
      );
      if (currentSF.includes(prop)) {
        setSelectedProperties(currentSF.filter((p) => p !== prop));
      } else {
        setSelectedProperties([...currentSF, prop]);
      }
    } else {
      // If it's an "Other" type, it's single-select and clears everything elsew
      setSelectedProperties([prop]);
      setSelectedStructureTypes([]);
    }
  };

  const handleToggleStructureType = (type: string) => {
    const singleFamilyOptions = [
      "Single-Family",
      "Townhouse",
      "Detached House",
      "Detached Home",
      "Duplex",
      "Apartment/Condo",
      "Apartment",
      "Single Family Residence",
      "Half Duplex",
      "Row House (Non-Strata)",
    ];

    const currentSF = selectedProperties.filter((p) =>
      singleFamilyOptions.includes(p),
    );

    if (currentSF.length !== selectedProperties.length) {
      setSelectedProperties(currentSF);
    }

    // Only one selection at a time
    setSelectedStructureTypes((prev) => (prev[0] === type ? [] : [type]));
  };

  const handleToggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  useEffect(() => {
    if (open) {
      const currentFilters = getInstanceFilters(id);

      const minPrice = currentFilters.minPrice ?? 0;
      const maxPrice = currentFilters.maxPrice ?? 100000000;

      const minSqft = currentFilters.minSqft ?? 0;
      const maxSqft = currentFilters.maxSqft ?? 15000;

      const minLot = currentFilters.minLotSizeArea ?? 0;
      const maxLot = currentFilters.maxLotSizeArea ?? 100000;

      const minTax = currentFilters.minTax ?? 0;
      const maxTax = currentFilters.maxTax ?? 50000;

      const minPps = currentFilters.minPricePerSft ?? 0;
      const maxPps = currentFilters.maxPricePerSft ?? 25000;

      const minFee = currentFilters.minAssociationFee ?? 0;
      const maxFee = currentFilters.maxAssociationFee ?? 3000;

      setPrice([minPrice, maxPrice]);
      setSqft([minSqft, maxSqft]);
      setLotSqft([minLot, maxLot]);
      setTax([minTax, maxTax]);
      setPricePerSft([minPps, maxPps]);
      setAssociationFee([minFee, maxFee]);

      // input reset / sync
      setMinPriceInput(minPrice > 0 ? String(minPrice) : "");
      setMaxPriceInput(maxPrice < 100000000 ? String(maxPrice) : "");

      setMinSqftInput(minSqft > 0 ? String(minSqft) : "");
      setMaxSqftInput(maxSqft < 15000 ? String(maxSqft) : "");

      setMinLotSqftInput(minLot > 0 ? String(minLot) : "");
      setMaxLotSqftInput(maxLot < 100000 ? String(maxLot) : "");

      setMinTaxInput(minTax > 0 ? String(minTax) : "");
      setMaxTaxInput(maxTax < 50000 ? String(maxTax) : "");

      setMinPricePerSftInput(minPps > 0 ? String(minPps) : "");
      setMaxPricePerSftInput(maxPps < 25000 ? String(maxPps) : "");

      setMinAssociationFeeInput(minFee > 0 ? String(minFee) : "");
      setMaxAssociationFeeInput(maxFee < 3000 ? String(maxFee) : "");

      setBedrooms(
        currentFilters.activeBedRoom && currentFilters.activeBedRoom !== "any"
          ? Number(currentFilters.activeBedRoom.replace("+", ""))
          : null,
      );

      setBathrooms(
        currentFilters.activeBathRoom && currentFilters.activeBathRoom !== "any"
          ? Number(currentFilters.activeBathRoom.replace("+", ""))
          : null,
      );

      setStatus(currentFilters.status ?? "forSale");
      setWhenListed(currentFilters.whenListed ?? "any");

      setSelectedLocations(
        currentFilters.location
          ? currentFilters.location.split(",").filter(Boolean)
          : [],
      );

      setSelectedProperties(
        currentFilters.activeProperty && currentFilters.activeProperty !== "any"
          ? currentFilters.activeProperty.split(",").filter(Boolean)
          : [],
      );

      setSelectedFeatures(
        currentFilters.features
          ? currentFilters.features.split(",").filter(Boolean)
          : [],
      );

      setSelectedStructureTypes(
        currentFilters.structureType
          ? currentFilters.structureType.split(",").filter(Boolean)
          : [],
      );
    }
  }, [open, id]);

  const resetRangeInputs = () => {
    setMinPriceInput("");
    setMaxPriceInput("");

    setMinSqftInput("");
    setMaxSqftInput("");

    setMinLotSqftInput("");
    setMaxLotSqftInput("");

    setMinPricePerSftInput("");
    setMaxPricePerSftInput("");

    setMinTaxInput("");
    setMaxTaxInput("");

    setMinAssociationFeeInput("");
    setMaxAssociationFeeInput("");
  };

  const handleClearAll = () => {
    clearInstanceFilters(id);
    resetRangeInputs();
    setPrice([0, 100000000]);
    setSqft([0, 15000]);
    setLotSqft([0, 100000]);
    setTax([0, 50000]);
    setPricePerSft([0, 25000]);
    setAssociationFee([0, 3000]);
    setBedrooms(null);
    setBathrooms(null);
    setStatus("");
    setWhenListed("any");
    setSelectedLocations([]);
    setSelectedProperties([]);
    setSelectedFeatures([]);
    setSelectedStructureTypes([]);
    onClose();
  };

  const handleApplyFilter = () => {
    updateInstanceFilter(id, "minPrice", price[0]);
    updateInstanceFilter(id, "maxPrice", price[1]);
    updateInstanceFilter(id, "minSqft", sqft[0]);
    updateInstanceFilter(id, "maxSqft", sqft[1]);
    updateInstanceFilter(id, "minLotSizeArea", lotSqft[0]);
    updateInstanceFilter(id, "maxLotSizeArea", lotSqft[1]);
    updateInstanceFilter(id, "minTax", tax[0]);
    updateInstanceFilter(id, "maxTax", tax[1]);
    updateInstanceFilter(id, "minPricePerSft", pricePerSft[0]);
    updateInstanceFilter(id, "maxPricePerSft", pricePerSft[1]);
    updateInstanceFilter(id, "minAssociationFee", associationFee[0]);
    updateInstanceFilter(id, "maxAssociationFee", associationFee[1]);
    updateInstanceFilter(
      id,
      "activeBedRoom",
      bedrooms ? (bedrooms >= 4 ? "4+" : bedrooms.toString()) : "any",
    );
    updateInstanceFilter(
      id,
      "activeBathRoom",
      bathrooms ? (bathrooms >= 4 ? "4+" : bathrooms.toString()) : "any",
    );
    updateInstanceFilter(id, "status", status);
    updateInstanceFilter(id, "whenListed", whenListed);
    updateInstanceFilter(id, "location", selectedLocations.join(","));
    updateInstanceFilter(
      id,
      "activeProperty",
      selectedProperties.length > 0 ? selectedProperties.join(",") : "any",
    );
    updateInstanceFilter(id, "features", selectedFeatures.join(","));
    updateInstanceFilter(id, "structureType", selectedStructureTypes.join(","));
    onClose();
  };

  const handleRangeInputChange = (
    value: string,
    index: 0 | 1,
    setter: React.Dispatch<
      React.SetStateAction<[number | null, number | null]>
    >,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
    defaultMin: number,
    defaultMax: number,
  ) => {
    inputSetter(value);

    if (value === "") {
      setter((prev) => (index === 0 ? [null, prev[1]] : [prev[0], null]));
      return;
    }

    const num = Number(value);

    setter((prev) => {
      const min = prev[0] ?? defaultMin;
      const max = prev[1] ?? defaultMax;

      return index === 0
        ? [Math.min(num, max), max]
        : [min, Math.max(num, min)];
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: 650,
            borderRadius: 5,
            margin: "24px",
          },
        },
      }}
    >
      {/* Popup Content */}
      <div
        className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto md:px-6 md:pt-6 p-4 pb-0 w-full scrollbar-hide"
        onClick={(e) => {
          e.stopPropagation();
          if (locationDropdownOpen) {
            setLocationDropdownOpen(!locationDropdownOpen);
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between cursor-pointer mb-6">
          <h2 className="text-xl font-medium">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" autoFocus>
            <FiX size={22} />
          </button>
        </div>

        {/* Property Type Status */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { k: "forSale", l: "For Sale", i: Images.forSale },
            { k: "sold", l: "Sold", i: Images.sold },
            { k: "expired", l: "Expired", i: Images.expired },
            { k: "forecloser", l: "Forecloser", i: Images.foreCloser },
          ].map((s) => (
            <button
              key={s.k}
              onClick={() => {
                if ((s.k === "sold" || s.k === "expired" || s.k === "forecloser") && !isLoggedIn) {
                  setOpenLogin(true);
                  return;
                }
                setStatus(s.k);
              }}
              className={`border rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition ${
                status === s.k
                  ? "bg-[#7c7c7c33] border-[#0F0F0F33]"
                  : "border-[#0F0F0F33]"
              }`}
            >
              <Image
                title="image title"
                src={s.i}
                width={36}
                height={36}
                alt={s.l}
              />
              <span className="text-sm font-medium">{s.l}</span>
            </button>
          ))}
        </div>
        <LineGradient />

        {/* Location */}
        <div className="mb-6 space-y-2 flex flex-col gap-y-1 pt-5">
          <label className="font-medium">Location</label>
          <div className="relative w-full">
            <div
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="w-full border border-[#33333333] rounded-xl px-3 py-3 cursor-pointer text-sm flex justify-between items-center bg-white"
            >
              <span
                className={
                  selectedLocations.length > 0 ? "text-black" : "text-gray-500"
                }
              >
                {selectedLocations.length > 0
                  ? selectedLocations.join(", ")
                  : "All Locations"}
              </span>
              <span className="text-gray-400">
                {locationDropdownOpen ? (
                  <FiChevronUp size={18} />
                ) : (
                  <FiChevronDown size={18} />
                )}
              </span>
            </div>

            {locationDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-[#33333333] shadow-lg rounded-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
                {/* Popular Group */}
                <div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCityGroup(
                        expandedCityGroup === "popular" ? null : "popular",
                      );
                    }}
                    className="px-4 py-2 bg-gray-50/80 font-medium text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>Popular Cities</span>
                    <span className="text-gray-500">
                      {expandedCityGroup === "popular" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </span>
                  </div>
                  {expandedCityGroup === "popular" && (
                    <div className="py-1 flex flex-col">
                      {POPULAR_CITIES.map((city) => (
                        <div
                          key={`pop-${city}`}
                          className={`px-6 py-1.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                            selectedLocations.includes(city)
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                          onClick={() => handleToggleLocation(city)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(city)}
                            onChange={() => {}}
                            className="cursor-pointer rounded border-gray-300 text-primary focus:ring-primary checkbox checkbox-sm checkbox-"
                          />
                          <span>{city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* All Cities Group */}
                <div className="mb-1">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCityGroup(
                        expandedCityGroup === "all" ? null : "all",
                      );
                    }}
                    className="px-4 py-2 bg-gray-50/80 font-medium text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>All BC Cities</span>
                    <span className="text-gray-500">
                      {expandedCityGroup === "all" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </span>
                  </div>
                  {expandedCityGroup === "all" && (
                    <div className="py-1 flex flex-col">
                      {ALL_CITIES.map((city) => (
                        <div
                          key={`all-${city}`}
                          className={`px-6 py-1.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                            selectedLocations.includes(city)
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                          onClick={() => handleToggleLocation(city)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(city)}
                            onChange={() => {}}
                            className="cursor-pointer rounded border-gray-300 text-primary focus:ring-primary checkbox-sm checkbox"
                          />
                          <span>{city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <LineGradient />

        {/* When Listed */}
        {isLoggedIn && (
          <>
            <div className="mb-6 space-y-2 flex flex-col gap-y-1 pt-5">
              <label className="font-medium">When Listed</label>
              <div className="relative w-full">
                <div
                  onClick={() =>
                    setWhenListedDropdownOpen(!whenListedDropdownOpen)
                  }
                  className="w-full border border-[#33333333] rounded-xl px-3 py-3 cursor-pointer text-sm flex justify-between items-center bg-white"
                >
                  <span
                    className={
                      whenListed !== "any"
                        ? "text-black capitalize"
                        : "text-gray-500"
                    }
                  >
                    {whenListed === "any" ? "Any time" : whenListed}
                  </span>
                  <span className="text-gray-400">
                    {whenListedDropdownOpen ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                  </span>
                </div>

                {whenListedDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-[#33333333] shadow-lg rounded-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
                    {[
                      { label: "Any time", value: "any" },
                      { label: "Today", value: "today" },
                      { label: "Yesterday", value: "yesterday" },
                      {
                        label: "Today and yesterday",
                        value: "today and yesterday",
                      },
                      { label: "Last 7 days", value: "last 7 days" },
                      { label: "Last 14 days", value: "last 14 days" },
                      { label: "This month", value: "this month" },
                      { label: "Last month", value: "last month" },
                      { label: "This year", value: "this year" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`px-6 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center transition ${
                          whenListed === option.value
                            ? "bg-gray-100 font-medium text-primary"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          setWhenListed(option.value);
                          setWhenListedDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <LineGradient />
          </>
        )}

        {/* Property Type */}
        <div className="mb-6 space-y-3 pt-5">
          <label className="font-medium">Property Type</label>
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col gap-3 py-2">
              {/* Single Family Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                {[
                  { label: "Townhouse", value: "Townhouse" },
                  { label: "Detached Home", value: "Detached Home" },
                  { label: "Duplex", value: "Duplex" },
                  { label: "Apartment", value: "Apartment" },
                ].map((prop) => (
                  <div
                    key={prop.value}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleToggleStructureType(prop.value)}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        selectedStructureTypes.includes(prop.value)
                          ? "bg-primary border-primary"
                          : "border-gray-300 group-hover:border-primary"
                      }`}
                    >
                      {selectedStructureTypes.includes(prop.value) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {prop.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Other Types Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                {[
                  { label: "Multi-Family", value: "Multi-Family" },
                  { label: "Office", value: "Office" },
                  { label: "Business", value: "Business" },
                  { label: "Agriculture", value: "Agriculture" },
                  { label: "Vacant Land", value: "Vacant Land" },
                ].map((prop) => (
                  <div
                    key={prop.value}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleToggleProperty(prop.value, false)}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        selectedProperties.includes(prop.value)
                          ? "bg-primary border-primary"
                          : "border-gray-300 group-hover:border-primary"
                      }`}
                    >
                      {selectedProperties.includes(prop.value) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {prop.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <LineGradient />

        {/* Price Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Price Range</h3>
          <div className="relative">
            <PriceSlider
              value={[price[0] ?? 1000, price[1] ?? 100000000]}
              min={1000}
              max={100000000}
              step={10000}
              onChange={(_, v) => {
                const next = v as [number, number];

                setPrice(next);
                setMinPriceInput(String(next[0]));
                setMaxPriceInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
            />
          </div>

          <div className="flex flex-row flex-wrap items-center mt-5 justify-between gap-x-0.5 sm:gap-4">
            {/* Min */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Min Price
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={minPriceInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      0,
                      setPrice,
                      setMinPriceInput,
                      1000,
                      100000000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Divider */}
            <LineGradient
              customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
              vr
            />

            {/* Max */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Max Price
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-40.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      1,
                      setPrice,
                      setMaxPriceInput,
                      1000,
                      100000000,
                    )
                  }
                  placeholder="Max"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
        <LineGradient />

        {/* Maintenance Fee Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Maintenance Fee</h3>
          <div className="relative">
            <PriceSlider
              value={[associationFee[0] ?? 0, associationFee[1] ?? 3000]}
              min={0}
              max={3000}
              step={10}
              onChange={(_, v) => {
                const next = v as [number, number];
                setAssociationFee(next);
                setMinAssociationFeeInput(String(next[0]));
                setMaxAssociationFeeInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
              // marks={[
              //   { value: 0, label: "$0" },
              //   { value: 1000, label: "$1K" },
              //   { value: 2000, label: "$2K" },
              //   { value: 3000, label: "$3K" },
              // ]}
            />
            {/* Input Boxes */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mt-3">
              {/* Min */}
              <div className="flex items-center gap-1 sm:gap-4 h-full">
                <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                  Min Fee
                </p>
                <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-40.5 px-2 sm:px-4 py-2 h-full">
                  <span className="text-secondary">$</span>
                  <input
                    type="number"
                    value={minAssociationFeeInput}
                    onChange={(e) =>
                      handleRangeInputChange(
                        e.target.value,
                        0,
                        setAssociationFee,
                        setMinAssociationFeeInput,
                        0,
                        3000,
                      )
                    }
                    placeholder="Min"
                    className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Divider */}
              <LineGradient
                customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
                vr
              />

              {/* Max */}
              <div className="flex items-center gap-1 sm:gap-4 h-full">
                <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                  Max Fee
                </p>
                <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-40.5 px-2 sm:px-4 py-2 h-full">
                  <span className="text-secondary">$</span>
                  <input
                    type="number"
                    value={maxAssociationFeeInput}
                    onChange={(e) =>
                      handleRangeInputChange(
                        e.target.value,
                        1,
                        setAssociationFee,
                        setMaxAssociationFeeInput,
                        0,
                        3000,
                      )
                    }
                    placeholder="Max"
                    className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <LineGradient />

        {/* Living Area Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Living Area</h3>
          <div className="relative">
            <PriceSlider
              value={[sqft[0] ?? 100, sqft[1] ?? 15000]}
              min={100}
              max={15000}
              step={100}
              onChange={(_, v) => {
                const next = v as [number, number];
                setSqft(next);
                setMinSqftInput(String(next[0]));
                setMaxSqftInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
            />
          </div>

          <div className="flex items-center mt-5 justify-between gap-2 sm:gap-4">
            {/* Min */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Min Living Area
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <input
                  type="number"
                  value={minSqftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      0,
                      setSqft,
                      setMinSqftInput,
                      100,
                      15000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-secondary">sft</span>
              </div>
            </div>

            {/* Divider */}
            <LineGradient
              customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
              vr
            />

            {/* Max */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Max Living Area
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <input
                  type="number"
                  value={maxSqftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      1,
                      setSqft,
                      setMaxSqftInput,
                      100,
                      15000,
                    )
                  }
                  placeholder="Max"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-secondary">sft</span>
              </div>
            </div>
          </div>
        </div>
        <LineGradient />
        {/* Lot Size Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Lot Size</h3>
          <div className="relative">
            <PriceSlider
              value={[lotSqft[0] ?? 100, lotSqft[1] ?? 100000]}
              min={100}
              max={100000}
              step={100}
              onChange={(_, v) => {
                const next = v as [number, number];
                setLotSqft(next);
                setMinLotSqftInput(String(next[0]));
                setMaxLotSqftInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
            />
          </div>

          <div className="flex items-center mt-5 justify-between gap-2 sm:gap-4">
            {/* Min */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Min Lot Size
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <input
                  type="number"
                  value={minLotSqftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      0,
                      setLotSqft,
                      setMinLotSqftInput,
                      100,
                      100000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-secondary">sft</span>
              </div>
            </div>

            {/* Divider */}
            <LineGradient
              customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
              vr
            />

            {/* Max */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Max Lot Size
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <input
                  type="number"
                  value={maxLotSqftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      1,
                      setLotSqft,
                      setMaxLotSqftInput,
                      100,
                      100000,
                    )
                  }
                  placeholder="Max"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-secondary">sft</span>
              </div>
            </div>
          </div>
        </div>
        <LineGradient />
        {/* Price Per Sft Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Price Per Sft</h3>
          <div className="relative">
            <PriceSlider
              value={[pricePerSft[0] ?? 100, pricePerSft[1] ?? 25000]}
              min={100}
              max={25000}
              step={100}
              onChange={(_, v) => {
                const next = v as [number, number];
                setPricePerSft(next);
                setMinPricePerSftInput(String(next[0]));
                setMaxPricePerSftInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
            />
          </div>

          <div className="flex items-center mt-5 justify-between gap-2 sm:gap-4">
            {/* Min */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Min Price
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={minPricePerSftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      0,
                      setPricePerSft,
                      setMinPricePerSftInput,
                      100,
                      25000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Divider */}
            <LineGradient
              customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
              vr
            />

            {/* Max */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Max Price
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={maxPricePerSftInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      1,
                      setPricePerSft,
                      setMaxPricePerSftInput,
                      100,
                      25000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
        <LineGradient />

        {/* Tax Range */}
        <div className="md:mb-6 mb-3 pt-5">
          <h3 className="font-medium md:mb-3">Tax Range</h3>
          <div className="relative">
            <PriceSlider
              value={[tax[0] ?? 0, tax[1] ?? 50000]}
              min={0}
              max={50000}
              step={100}
              onChange={(_, v) => {
                const next = v as [number, number];
                setTax(next);
                setMinTaxInput(String(next[0]));
                setMaxTaxInput(String(next[1]));
              }}
              disableSwap
              valueLabelDisplay="auto"
            />
          </div>

          <div className="flex items-center mt-5 justify-between gap-2 sm:gap-4">
            {/* Min */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Min Tax
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={minTaxInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      0,
                      setTax,
                      setMinTaxInput,
                      100,
                      50000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Divider */}
            <LineGradient
              customClasses="mx-1 h-10 sm:h-15 hidden sm:block"
              vr
            />

            {/* Max */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
              <p className="text-[10px] sm:text-xs text-[#333]/30 mb-1 whitespace-nowrap">
                Max Tax
              </p>
              <div className="flex text-xs sm:text-sm font-medium items-center gap-1 border border-[#33333333] rounded-xl w-24 sm:w-30.5 px-2 sm:px-4 py-2 h-full">
                <span className="text-secondary">$</span>
                <input
                  type="number"
                  value={maxTaxInput}
                  onChange={(e) =>
                    handleRangeInputChange(
                      e.target.value,
                      1,
                      setTax,
                      setMaxTaxInput,
                      100,
                      50000,
                    )
                  }
                  placeholder="Min"
                  className="w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
        <LineGradient />

        {/* Property Info */}
        <div className="mb-6 border-[#33333333] pt-5">
          <h3 className="font-medium mb-4">Property Info</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["Bedrooms", "Bathroom"].map((label, idx) => {
              const value = idx === 0 ? bedrooms : bathrooms;

              return (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>

                  <div className="flex items-center gap-3 border border-[rgba(15,15,15,0.12)] rounded-xl px-3 py-2">
                    <button
                      className="w-7 h-7 rounded-lg bg-[#30548729]"
                      onClick={() => {
                        const setter = idx === 0 ? setBedrooms : setBathrooms;
                        const current = value ?? 0;
                        if (current === 1) setter(null);
                        else if (current > 1) setter(current - 1);
                      }}
                    >
                      −
                    </button>

                    <span className="text-sm min-w-6 text-center">
                      {value ?? "any"}
                    </span>

                    <button
                      className="w-7 h-7 rounded-lg bg-[#30548729]"
                      onClick={() => {
                        const setter = idx === 0 ? setBedrooms : setBathrooms;
                        const current = value ?? 0;
                        setter(current + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <LineGradient />

        {/* Features */}
        <div className="mb-6  border-[#33333333] pt-5">
          <h3 className="font-bold mb-5">Features</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              // { label: "Parking", value: "parking" },
              { label: "View", value: "view" },
              { label: "Fireplace", value: "firePlace" },
              { label: "Suite", value: "suite" },
              // { label: "Security", value: "security" },
              { label: "Waterfront", value: "waterfront" },
              { label: "Pool", value: "pool" },
              { label: "Workshop", value: "workshop" },
            ].map((f) => (
              <div
                key={f.value}
                onClick={() => handleToggleFeature(f.value)}
                className={`text-center py-3 rounded-xl border cursor-pointer text-sm transition-all ${
                  selectedFeatures.includes(f.value)
                    ? "bg-primary border-primary text-white"
                    : "border-[#0F0F0F1F] text-gray-400 hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
              </div>
            ))}
          </div>
        </div>
        <LineGradient />

        {/* Extra Features */}
        {/* <div className="border-[#33333333] pt-2">
            <h3 className="font-medium mb-4">Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { label: " Court-ordered sale", icon: Icons.courtorder },
                { label: "Open House is set for", icon: Icons.openhouse },
                { label: "Previously sold", icon: Icons.soldicon },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-3.5 border border-[rgba(15,15,15,0.12)] rounded-xl text-gray-400 text-xs"
                >
                  <Image
title="image title" src={item.icon} alt="" width={16} height={16} />
                  <span className="whitespace-normal leading-snug">
                    {item.label}
                  </span>
                </div>
              ))}
            </div> */}

        {/* Bottom single item */}
        {/* <div className="mt-4 mb-5 ">
              <div className="flex items-center justify-center gap-2 px-3 py-3 border border-[rgba(15,15,15,0.12)] rounded-xl text-gray-400 text-xs">
                <Image
title="image title" src={Icons.star} alt="" width={16} height={16} />
                <span>Must Be on Favorites list</span>
              </div>
            </div>
          </div> 
        {/* <LineGradient /> 

        {/* Bottom Buttons */}
        <div className="md:py-6 py-4 mt-2 border-[#0F0F0F1F] flex gap-4 sticky bottom-0 bg-background w-full">
          <CustomButton
            buttonType="secondary"
            label="Apply Filter"
            customClasses="w-1/2"
            onClick={handleApplyFilter}
          />
          <CustomButton
            buttonType="disabled"
            label="Clear All"
            customClasses="w-1/2"
            onClick={handleClearAll}
          />
        </div>
      </div>
    </Dialog>
  );
}
