import type L from "leaflet";
import { FiMap, FiMinus, FiNavigation, FiPlus } from "react-icons/fi";
import { WiFlood } from "react-icons/wi";
import { TbRulerMeasure } from "react-icons/tb";
import { MdSchool } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

type SchoolType = "Elementary" | "Secondary" | "All";

export default function OpenStreetMapControls({
  map,
  isSatellite,
  measureMode,
  floodProvinceMode,
  loadingFloodProvince,
  schoolMode,
  schoolType,
  loadingSchools,
  handleFloodProvince,
  toggleMapStyle,
  handleGeolocation,
  handleSchool,
  handleSchoolTypeChange,
  handleMeasure,
  mapZoomVal,
}: {
  map: L.Map | null;
  isSatellite: boolean;
  measureMode: boolean;
  floodProvinceMode: boolean;
  loadingFloodProvince?: boolean;
  schoolMode: boolean;
  schoolType: SchoolType;
  loadingSchools?: boolean;
  handleFloodProvince: () => void;
  toggleMapStyle: () => void;
  handleGeolocation: () => void;
  handleSchool: () => void;
  handleSchoolTypeChange: (type: SchoolType) => void;
  handleMeasure: () => void;
  mapZoomVal?: number | null;
}) {
  const disabledSchoolBtn = loadingSchools;

  const schoolBoxRef = useRef<HTMLDivElement | null>(null);
  const [schoolTypeBoxOpen, setSchoolTypeBoxOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        schoolBoxRef.current &&
        !schoolBoxRef.current.contains(event.target as Node)
      ) {
        setSchoolTypeBoxOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2 z-999">
      <div className="flex flex-col bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
        <button
          className="p-2.5 border-b hover:bg-gray-50"
          onClick={() => map?.setZoom((map.getZoom() || 5) + 1)}
        >
          <FiPlus className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="p-2.5 hover:bg-gray-50"
          onClick={() => map?.setZoom((map.getZoom() || 5) - 1)}
        >
          <FiMinus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <button
        onClick={toggleMapStyle}
        className={`p-2.5 rounded-md shadow-lg border transition-colors ${
          isSatellite
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
        title="Map Style"
      >
        <FiMap className="w-5 h-5" />
      </button>

      <button
        onClick={handleMeasure}
        className={`p-2.5 rounded-md shadow-lg border transition-colors ${
          measureMode
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:bg-gray-100"
        }`}
        title="Measure Distance"
      >
        <TbRulerMeasure className="w-5 h-5" />
      </button>

      <button
        onClick={handleGeolocation}
        className="p-2.5 bg-white rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        title="Current Location"
      >
        <FiNavigation className="w-5 h-5 text-gray-600" />
      </button>

      <div ref={schoolBoxRef} className="relative">
        <button
          onClick={() => {
           

            if (schoolMode) {
              handleSchool();
              handleSchoolTypeChange("All");
              setSchoolTypeBoxOpen(false);
              return;
            }

            handleSchool();
            setSchoolTypeBoxOpen(true);
          }}
          disabled={disabledSchoolBtn}
          className={`p-2.5 rounded-md shadow-lg border transition-colors ${
            schoolMode
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:bg-gray-100"
          } ${disabledSchoolBtn ? "opacity-60 cursor-not-allowed" : ""}`}
          title={
            "View Schools"
          }
        >
          <MdSchool className="w-5 h-5" />
        </button>

        {schoolTypeBoxOpen && (
          <div className="absolute right-12 top-0 w-40 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              School Type
            </p>
            <button
              onClick={() => {
                handleSchoolTypeChange("All");
                setSchoolTypeBoxOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                schoolType === "All"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              All Schools
            </button>
            <button
              onClick={() => {
                handleSchoolTypeChange("Elementary");
                setSchoolTypeBoxOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                schoolType === "Elementary"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              Elementary
            </button>

            <button
              onClick={() => {
                handleSchoolTypeChange("Secondary");
                setSchoolTypeBoxOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                schoolType === "Secondary"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              Secondary
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleFloodProvince}
        disabled={loadingFloodProvince}
        className={`p-1 rounded-md shadow-lg border transition-colors ${
          floodProvinceMode
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        } ${loadingFloodProvince ? "opacity-60 cursor-not-allowed" : ""}`}
        title="Flood Province Area"
      >
        <WiFlood fontSize={32} />
      </button>
    </div>
  );
}
