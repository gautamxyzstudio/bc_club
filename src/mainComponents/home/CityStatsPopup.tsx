/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetCityMonthlyData } from "@/src/hooks/listing/useListingQueries";
import { CityMonthData } from "@/src/api/listing/listingApi";

export const propertyTypes = ["Detached", "Apartment", "Townhouse"];

interface CityStatsPopupProps {
  city: string;
  isVisible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  position?: {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
  };
  customClasses?: string;
  onClose?: () => void;
  onShowDetailedCharts?: (city: string, propertyType: string) => void;
}

interface DisplayStatRow {
  label: string;
  value: string;
  change?: string | null;
  trend?: "up" | "down" | "neutral";
}

const FRASER_VALLEY_CITIES = [
  "langley",
  "abbotsford",
  "surrey",
  "delta",
  "mission",
  "chilliwack",
  "hope",
  "white rock",
];

const getSourceBoard = (cityName: string): string => {
  if (!cityName) return "Real Estate Board of Greater Vancouver";
  if (FRASER_VALLEY_CITIES.includes(cityName.toLowerCase().trim())) {
    return "Fraser Valley Real Estate Board";
  }
  return "Greater Vancouver Realtors";
};

const CityStatsPopup: React.FC<CityStatsPopupProps> = ({
  city,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  position,
  customClasses,
  onClose,
  onShowDetailedCharts,
}) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("Detached");
  const [dataIndex, setDataIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch real-time monthly data from backend endpoint
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetCityMonthlyData(
    { city, propertyType: selectedType },
    { enabled: isVisible && !!city }
  );

  const apiDataList: CityMonthData[] = useMemo(() => {
    return apiResponse?.data || [];
  }, [apiResponse]);

  const totalMonthsCount = apiDataList.length;

  useEffect(() => {
    setDataIndex(0); // Reset index when city or type changes
  }, [city, selectedType]);

  useEffect(() => {
    // Close dropdown when city changes
    setIsDropdownOpen(false);
  }, [city]);

  const currentMonth: CityMonthData | undefined =
    apiDataList[dataIndex] || apiDataList[0];

  const formatPercent = (pct: number | null | undefined) => {
    if (pct === null || pct === undefined) return null;
    return `${Math.abs(pct)}%`;
  };

  const metrics = currentMonth?.metrics;

  const medianSoldPriceStat = useMemo(() => {
    if (!metrics?.medianSoldPrice) return null;
    return {
      label: "Median sold price",
      value: metrics.medianSoldPrice.formatted || "$0",
      change: formatPercent(metrics.medianSoldPrice.percent),
      trend: metrics.medianSoldPrice.direction || "neutral",
    };
  }, [metrics]);

  const remainingStats: DisplayStatRow[] = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: "Price per sq ft",
        value: metrics.medianPricePerSqFt?.formatted || "$0",
        change: formatPercent(metrics.medianPricePerSqFt?.percent),
        trend: metrics.medianPricePerSqFt?.direction || "neutral",
      },
      {
        label: "Homes sold",
        value: metrics.sales?.formatted || "0",
        change: formatPercent(metrics.sales?.percent),
        trend: metrics.sales?.direction || "neutral",
      },
      {
        label: "Homes for sale",
        value: metrics.inventory?.formatted || "0",
        change: formatPercent(metrics.inventory?.percent),
        trend: metrics.inventory?.direction || "neutral",
      },
      {
        label: "New listings",
        value: metrics.newListings?.formatted || "0",
        change: formatPercent(metrics.newListings?.percent),
        trend: metrics.newListings?.direction || "neutral",
      },
      {
        label: "Days to sell",
        value: metrics.medianDaysOnMarket?.formatted || "0",
        change: formatPercent(metrics.medianDaysOnMarket?.percent),
        trend: metrics.medianDaysOnMarket?.direction || "neutral",
      },
    ];
  }, [metrics]);

  if (!isVisible) return null;

  const handlePrevMonth = () => {
    if (dataIndex < totalMonthsCount - 1) {
      setDataIndex(dataIndex + 1);
    }
  };

  const handleNextMonth = () => {
    if (dataIndex > 0) {
      setDataIndex(dataIndex - 1);
    }
  };

  const handleNavigateToTrends = () => {
    if (onShowDetailedCharts) {
      onShowDetailedCharts(city, selectedType);
      return;
    }
    router.push(
      `/market-trends/monthly-sales-chart?city=${encodeURIComponent(
        city
      )}&propertyType=${encodeURIComponent(selectedType)}`
    );
  };

  const monthTitle = currentMonth?.monthName;
  const subtitle = currentMonth?.comparisonMonthName
    ? `vs. ${currentMonth.comparisonMonthName}`
    : "vs. last year";

  return (
    <article
      className={`absolute z-99999 w-72.5 max-w-[calc(100vw-32px)] bg-white rounded-[18px] overflow-hidden shadow-[0_18px_44px_rgba(20,40,74,0.3)] border border-[#E7E9EE] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#0F0F0F] transition-all duration-200 animate-popupSlide ${customClasses || "hidden lg:flex"
        }`}
      style={{
        ...position,
        pointerEvents: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-live="polite"
    >
      {/* Header section (ch) */}
      <div className="px-3.5 pt-3 pb-2 flex flex-col gap-1.5 justify-between items-start">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <p className="m-0 text-[10px] font-extrabold tracking-[0.6px] uppercase text-[#5B6472]">
              Market snapshot
            </p>
            {isFetching && (
              <Loader2 size={12} className="animate-spin text-[#102A43]" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 border border-[#E7E9EE] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#5B6472] hover:bg-[#F3F4F6] transition cursor-pointer"
              >
                {selectedType}
                <ChevronDown
                  size={13}
                  className={isDropdownOpen ? "rotate-180 transition" : "transition"}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white border border-[#E7E9EE] rounded-xl shadow-xl overflow-hidden z-50">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${selectedType === type
                        ? "text-[#102A43] bg-[#E6F4EE]/60 font-bold"
                        : "text-[#374151] hover:bg-[#F9FAFB]"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-[#F3F4F6] text-[#5B6472] hover:text-[#0F0F0F] transition cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Property Type Dropdown & Close */}
        <b
          id="city"
          className="text-[20px] font-bold tracking-[-0.4px] text-[#0F0F0F] block leading-tight mt-0.5"
        >
          {city}
        </b>
      </div>

      {isLoading && !currentMonth ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#5B6472]">
          <Loader2 size={24} className="animate-spin text-[#102A43]" />
          <span>Loading market snapshot...</span>
        </div>
      ) : totalMonthsCount === 0 ? (
        <div className="py-8 text-center text-xs text-[#5B6472] px-4">
          No market snapshot available for {city} ({selectedType})
        </div>
      ) : (
        <>
          {/* Month Banner (mo) */}
          <div className="mx-2.25 bg-[#102A43] text-white rounded-[10px] py-1.75 px-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={dataIndex >= totalMonthsCount - 1}
              className="p-1 hover:bg-white/10 rounded-full transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex-1 text-center px-1">
              <span className="font-extrabold text-[13px] leading-tight block">
                {monthTitle || "—"}
              </span>
              <small className="block font-medium text-[10px] text-[#C9D5E6] leading-none mt-0.5">
                {subtitle}
              </small>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={dataIndex <= 0}
              className="p-1 hover:bg-white/10 rounded-full transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Hero Stat: Median Sold Price (hs) */}
          <div className="px-3.5 pt-2.75 pb-0.75 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-[#5B6472] block font-medium">
                Median sold price
              </span>
              <b className="text-[24px] font-bold tracking-[-0.8px] text-[#0F0F0F] leading-tight block">
                {medianSoldPriceStat?.value || "$0"}
              </b>
            </div>
            {medianSoldPriceStat?.change && (
              <span
                id="hchg"
                className={`text-[11px] font-bold py-0.75 px-1.75 rounded-full whitespace-nowrap ${medianSoldPriceStat.trend === "up"
                  ? "bg-[#E6F4EE] text-[#0D7A68]"
                  : "bg-[#FDECEC] text-[#B42318]"
                  }`}
              >
                {medianSoldPriceStat.trend === "up" ? "▲ +" : "▼ −"}
                {medianSoldPriceStat.change}
              </span>
            )}
          </div>

          {/* Stats List (ul / li) */}
          <ul className="list-none mt-1.5 mb-0 px-3.5 text-xs">
            {remainingStats.map((row) => (
              <li
                key={row.label}
                className="flex justify-between items-center gap-2 py-1.5 border-t border-[#E7E9EE]"
              >
                <span className="flex-1 text-[#374151] font-medium">{row.label}</span>
                <b className="text-[#0F0F0F] font-bold">{row.value}</b>
                {row.change ? (
                  <span
                    className={`text-[11px] font-bold py-0.5 px-1.75 rounded-full whitespace-nowrap ${row.trend === "up"
                      ? "bg-[#E6F4EE] text-[#0D7A68]"
                      : row.trend === "down"
                        ? "bg-[#FDECEC] text-[#B42318]"
                        : "bg-[#F3F4F6] text-[#5B6472]"
                      }`}
                  >
                    {row.trend === "up" ? "▲ +" : row.trend === "down" ? "▼ −" : ""}
                    {row.change}
                  </span>
                ) : (
                  <span className="text-[#9CA3AF] text-[11px]">—</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* CTA Button (cta) */}
      <button
        type="button"
        id="cta"
        onClick={handleNavigateToTrends}
        className="block m-2.25 bg-[#EEA500] hover:bg-[#d89600] rounded-[10px] text-center font-extrabold p-2.5 text-[13px] text-[#0F0F0F] transition cursor-pointer"
      >
        See full {city} report
      </button>

      {/* Source (src) */}
      <p className="-mt-0.5 mb-2.5 text-center text-[10px] text-[#5B6472]">
        Source: {getSourceBoard(city)}
      </p>
    </article>
  );
};

export default CityStatsPopup;
