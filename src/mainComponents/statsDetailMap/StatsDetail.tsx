"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";

/* ================= TYPES ================= */
interface House {
  id: number;
  title: string;
  rent: string;
  coordinates: [number, number];
}

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

type Trend = "up" | "down";

interface StatRow {
  label: string;
  value: string;
  change: string;
  trend: Trend;
}

/* ================= SELECT ================= */
const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between border border-[#E6EAEE] rounded-full px-4 py-2 text-sm bg-white min-w-40"
      >
        <span>{value}</span>
        <FiChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
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
const rentedHouses: House[] = [
  {
    id: 1,
    title: "Lombardie",
    rent: "$2,500 / month",
    coordinates: [-123.1207, 49.2827],
  },
  {
    id: 2,
    title: "Lombardie",
    rent: "$2,100 / month",
    coordinates: [-123.0999, 49.2705],
  },
  {
    id: 3,
    title: "Lombardie",
    rent: "$2,100 / month",
    coordinates: [-123.02999, 49.2735],
  },
  {
    id: 4,
    title: "Lombardie",
    rent: "$2,100 / month",
    coordinates: [-123.10999, 49.2765],
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthlyStats: Record<string, StatRow[]> = {
  "November 2025": [
    {
      label: "Median Sold Price",
      value: "$1,850,000",
      change: "14.0%",
      trend: "down",
    },
    {
      label: "Median Price per SqFt",
      value: "$602",
      change: "14.0%",
      trend: "down",
    },
    { label: "Sale", value: "7", change: "14.0%", trend: "down" },
    { label: "Inventory", value: "117", change: "14.0%", trend: "down" },
    { label: "New Listings", value: "29", change: "14.0%", trend: "up" },
    { label: "Active Listings", value: "28", change: "14.0%", trend: "down" },
    { label: "Avg DOM", value: "4.70%", change: "14.0%", trend: "up" },
    { label: "Price Change", value: "0.00%", change: "14.0%", trend: "down" },
  ],
};

const MIN_YEAR = 2025;
const MAX_YEAR = 2031;

/* ================= COMPONENT ================= */
const StatsDetail: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [region, setRegion] = useState("Detached");
  const [monthIndex, setMonthIndex] = useState(10);
  const [year, setYear] = useState(2025);

  const currentMonthLabel = `${months[monthIndex]} ${year}`;
  const stats =
    monthlyStats[currentMonthLabel] || monthlyStats["November 2025"];

  /* ===== Scroll Lock ===== */
  useEffect(() => {
    document.body.style.overflow = selectedHouse ? "hidden" : "";
  }, [selectedHouse]);

  /* ===== MAP (FIXED) ===== */
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox token missing");
      return;
    }

    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-123.1207, 49.2827],
      zoom: 9,
      style: "mapbox://styles/mapbox/streets-v12",  
    });

    map.on("load", () => {
      map.resize();

      rentedHouses.forEach((house) => {
        const marker = new mapboxgl.Marker({ color: "#f59e0b" })
          .setLngLat(house.coordinates)
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setSelectedHouse(house);
          dialogRef.current?.showModal();
        });
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ===== Month ===== */
  const prevMonth = () => {
    setMonthIndex((p) => {
      if (p === 0 && year > MIN_YEAR) {
        setYear((y) => y - 1);
        return 11;
      }
      return Math.max(0, p - 1);
    });
  };

  const nextMonth = () => {
    setMonthIndex((p) => {
      if (p === 11 && year < MAX_YEAR) {
        setYear((y) => y + 1);
        return 0;
      }
      return Math.min(11, p + 1);
    });
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setSelectedHouse(null);
  };

  return (
    <>
      {/* MAP */}
      <div  
        ref={mapContainerRef}
        className="w-full rounded-3xl "
        style={{ height: "550px" }}
      />

      {/* DIALOG */}
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && closeDialog()}
        className="w-142.5 max-w-[95%] rounded-2xl p-5 m-auto backdrop:bg-black/70 "
      >
        {selectedHouse && (
          <div className="bg-white rounded-2xl">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Lombardie</h2>
              <CustomSelect
                options={["North Vancouver", "Vancouver", "Burnaby"]}
                value={region}
                onChange={setRegion}
              />
            </div>

            {/* MONTH */}
            <div className="bg-[#2f568d] text-white mt-3 py-3 rounded-xl flex justify-between items-center px-4">
              <FiChevronLeft onClick={prevMonth} className="cursor-pointer" />
              <div className="text-center">
                <div className="font-semibold">{currentMonthLabel}</div>
                <div className="text-xs opacity-80">
                  Trends reflect changes from {months[monthIndex]} {year - 1}
                </div>
              </div>
              <FiChevronRight onClick={nextMonth} className="cursor-pointer" />
            </div>

            {/* STATS TABLE */}
            <div className="mt-3 border-[#F0F0F0] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {stats.map((s, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-[#F0F0F0]"}
                    >
                      <td className="px-4 py-2">{s.label}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {s.value}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span
                          className={`font-medium ${
                            s.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {s.trend === "up" ? "▲" : "▼"} {s.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="mt-3 bg-[#F0F0F0] rounded-xl py-2 text-center text-sm text-yellow-600 font-medium cursor-pointer">
               Show detailed Charts
            </div>
          </div>
        )}
      </dialog>
    </>
  );
};

export default StatsDetail;
