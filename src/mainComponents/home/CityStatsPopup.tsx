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

  // Derive stat rows directly from the API response
  const statsRows: DisplayStatRow[] = useMemo(() => {
    if (!currentMonth) return [];

    const metrics = currentMonth.metrics;

    return [
      {
        label: "Median Sold Price",
        value: metrics?.medianSoldPrice?.formatted || "$0",
        change: formatPercent(metrics?.medianSoldPrice?.percent),
        trend: metrics?.medianSoldPrice?.direction || "neutral",
      },
      {
        label: "Median Price per SqFt",
        value: metrics?.medianPricePerSqFt?.formatted || "$0",
        change: formatPercent(metrics?.medianPricePerSqFt?.percent),
        trend: metrics?.medianPricePerSqFt?.direction || "neutral",
      },
      {
        label: "Sales",
        value: metrics?.sales?.formatted || "0",
        change: formatPercent(metrics?.sales?.percent),
        trend: metrics?.sales?.direction || "neutral",
      },
      {
        label: "Inventory",
        value: metrics?.inventory?.formatted || "0",
        change: formatPercent(metrics?.inventory?.percent),
        trend: metrics?.inventory?.direction || "neutral",
      },
      {
        label: "New Listings",
        value: metrics?.newListings?.formatted || "0",
        change: formatPercent(metrics?.newListings?.percent),
        trend: metrics?.newListings?.direction || "neutral",
      },
      {
        label: "Median Days on Market",
        value: metrics?.medianDaysOnMarket?.formatted || "0",
        change: formatPercent(metrics?.medianDaysOnMarket?.percent),
        trend: metrics?.medianDaysOnMarket?.direction || "neutral",
      },
    ];
  }, [currentMonth]);

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
  const subtitle =
    currentMonth?.subtitle ||
    (currentMonth?.comparisonMonthName
      ? `Trends reflect changes from ${currentMonth.comparisonMonthName}`
      : "");

  return (
    <div
      className={`absolute z-99999 w-111.25 max-w-[calc(100vw-32px)] bg-background rounded-xl shadow-2xl p-4 animate-popupSlide border border-[#E6EAEE] flex flex-col gap-y-4 ${
        customClasses || "hidden lg:flex"
      }`}
      style={{
        ...position,
        pointerEvents: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {city}
          </h2>
          {isFetching && (
            <Loader2 size={16} className="animate-spin text-primary" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border border-[#E6EAEE] rounded-full px-4 py-2 text-sm font-medium text-black70 hover:bg-gray transition cursor-pointer"
            >
              {selectedType}
              <ChevronDown
                size={18}
                className={
                  isDropdownOpen ? "rotate-180 transition" : "transition"
                }
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-background border border-[#E6EAEE] rounded-2xl shadow-xl overflow-hidden z-50">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm hover:bg-gray transition font-medium cursor-pointer ${
                      selectedType === type
                        ? "text-primary font-bold bg-gray/50"
                        : "text-black70"
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
              className="p-1.5 rounded-full hover:bg-gray text-gray-400 hover:text-foreground transition cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {isLoading && !currentMonth ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-black70">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span>Loading market data...</span>
        </div>
      ) : totalMonthsCount === 0 ? (
        <div className="py-8 text-center text-sm text-black70">
          No market data available for {city} ({selectedType})
        </div>
      ) : (
        <>
          {/* Month Navigator */}
          <div className="bg-primary text-background rounded-lg px-4 py-2 flex flex-col items-center relative overflow-hidden">
            <div className="flex justify-between w-full items-center z-10">
              <button
                onClick={handlePrevMonth}
                disabled={dataIndex >= totalMonthsCount - 1}
                className="p-1 hover:bg-white/10 rounded-full transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <span className="text-lg font-bold">
                  {monthTitle || "—"}
                </span>
                {subtitle && (
                  <p className="text-[11px] text-white/70 z-10 font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={handleNextMonth}
                disabled={dataIndex <= 0}
                className="p-1 hover:bg-white/10 rounded-full transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Stats Table */}
          <div className="rounded-[10px] border border-[#3333331F] overflow-hidden">
            <table className="w-full text-xs text-foreground">
              <tbody>
                {statsRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={`${idx % 2 === 0 ? "bg-[#F0F0F0]" : "bg-background"}`}
                  >
                    <td className="py-3 px-4 leading-tight font-medium">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {row.value}
                    </td>
                    <td className="py-3 px-4 text-right w-20">
                      {row.change && row.trend === "up" ? (
                        <div className="flex items-center justify-end gap-1.5 font-bold text-green">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M8 0.5C3.858 0.5 0.5 3.858 0.5 8C0.5 12.142 3.858 15.5 8 15.5C12.142 15.5 15.5 12.142 15.5 8C15.5 3.858 12.142 0.5 8 0.5ZM9.28575 7.57625V12.25H6.71425V7.57625H4L8 3.75L12 7.57625H9.28575Z"
                              fill="#14B514"
                            />
                          </svg>
                          {row.change}
                        </div>
                      ) : row.change && row.trend === "down" ? (
                        <div className="flex items-center justify-end gap-1.5 font-bold text-red">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M8 15.5C3.858 15.5 0.5 12.142 0.5 8C0.5 3.858 3.858 0.5 8 0.5C12.142 0.5 15.5 3.858 15.5 8C15.5 12.142 12.142 15.5 8 15.5ZM9.28575 8.42375V3.75H6.71425V8.42375H4L8 12.25L12 8.42375H9.28575Z"
                              fill="#FF0000"
                            />
                          </svg>
                          {row.change}
                        </div>
                      ) : row.change ? (
                        <div className="flex items-center justify-end font-semibold text-black70">
                          {row.change}
                        </div>
                      ) : (
                        <span className="text-lightWhite">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <button
        onClick={handleNavigateToTrends}
        className="w-full py-2.5 bg-gray hover:bg-[#E4E7EC] text-secondary flex items-center justify-center gap-2 rounded-xl transition group cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 6L15.707 11.293C15.5195 11.4805 15.2652 11.5858 15 11.5858C14.7348 11.5858 14.4805 11.4805 14.293 11.293L12.707 9.707C12.5195 9.51953 12.2652 9.41421 12 9.41421C11.7348 9.41421 11.4805 9.51953 11.293 9.707L7 14"
            stroke="#eea500"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 3V17.8C3 18.92 3 19.48 3.218 19.908C3.40974 20.2843 3.71569 20.5903 4.092 20.782C4.52 21 5.08 21 6.2 21H21"
            stroke="#eea500"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Show detailed Charts
      </button>
    </div>
  );
};

export default CityStatsPopup;
