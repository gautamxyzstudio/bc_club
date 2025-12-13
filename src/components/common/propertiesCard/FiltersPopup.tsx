"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import Image from "next/image";
import { Icons } from "@/src/app/exports";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

// 🔥 Yellow theme slider (matches your UI perfectly)
const PriceSlider = styled(Slider)({
  color: "#E8A200",
  height: 6,

  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#E8A200",
    border: "2px solid white",
    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
  },

  "& .MuiSlider-track": {
    height: 6,
  },

  "& .MuiSlider-rail": {
    height: 6,
    borderRadius: 10,
    backgroundColor: "#e5e5e5",
  },
});

interface FiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FiltersPopup({ open, onClose }: FiltersDialogProps) {
  const minDistance = 10;

  const [value1, setValue1] = React.useState<number[]>([20, 37]);

  const handleChange1 = (
    event: Event,
    newValue: number[],
    activeThumb: number
  ) => {
    if (!Array.isArray(newValue)) return;

    if (activeThumb === 0) {
      setValue1([Math.min(newValue[0], value1[1] - minDistance), value1[1]]);
    } else {
      setValue1([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
    }
  };

  const valuetext = (value: number) => `${value}`;

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-popupSlide">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        {/* Status */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer">
            <Image src={Icons.forsale} width={40} height={40} alt="For Sale" />
            <span className="text-sm font-medium">For Sale</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer">
            <Image src={Icons.sold} width={40} height={40} alt="Sold" />
            <span className="text-sm font-medium">Sold</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer">
            <Image src={Icons.expire} width={40} height={40} alt="Expired" />
            <span className="text-sm font-medium">Expired</span>
          </div>
        </div>

        {/* Location */}
        <div className="mb-5">
          <label className="font-medium">Location</label>
          <div className="relative mt-2">
            <select className="w-full px-4 py-3 border rounded-xl appearance-none">
              <option>Any area</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </div>
        </div>

        {/* Property Info */}
        <div className="mb-5">
          <h3 className="font-medium mb-2">Property Info</h3>
          <div className="flex justify-between gap-3">
            <div className="flex items-center gap-2 border rounded-xl px-4 py-2">
              Bedrooms
              <button> - </button>
              <span>any</span>
              <button> + </button>
            </div>
            <div className="flex items-center gap-2 border rounded-xl px-4 py-2">
              Bathroom
              <button> - </button>
              <span>any</span>
              <button> + </button>
            </div>
          </div>
        </div>

        {/* Price Slider */}
        <div className="mb-8">
          <label className="font-medium">Price Range</label>
          <PriceSlider
            value={value1}
            onChange={handleChange1}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            disableSwap
          />

          <div className="flex justify-between text-gray-600 mt-2">
            <span>${value1[0]} Min</span>
            <span>${value1[1]} Max</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100">
            Cancel
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
