"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthContext } from "../../auth/AuthContext";
import ChartSignInOverlay from "@/src/components/common/charts/ChartSignInOverlay";
import {
  DATA_OPTIONS,
  OptionGroup,
  PROPERTY_OPTIONS,
  REGION_DATA,
  YEAR_OPTIONS,
} from "..";
import { useGetMonthlySalesChart } from "@/src/hooks/listing/useListingQueries";
import {
  MonthlySalesChartParams,
} from "@/src/api/listing/listingApi";

interface CustomSelectProps {
  label: string;
  options: string[] | OptionGroup[];
  value: string;
  onChange: (value: string) => void;
}

const REGION_OPTIONS = REGION_DATA.map((r) => r.region);

const isGrouped = (
  opts: string[] | OptionGroup[]
): opts is OptionGroup[] => {
  return (
    opts.length > 0 && typeof opts[0] === "object" && "category" in opts[0]
  );
};

/* ================= CUSTOM SELECT ================= */
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={selectRef} className="relative w-full">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex justify-between items-center border border-[#E6EAEE] rounded-[31px] px-4 py-2 text-sm bg-white cursor-pointer"
      >
        <span className="truncate">{value}</span>
        <FiChevronDown
          size={18}
          className={`text-[#EEA500] shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-lg border border-[#E6EAEE] max-h-80 overflow-auto divide-y divide-gray-100">
          {isGrouped(options) ? (
            options.map((group) => (
              <div key={group.category} className="py-1">
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/90 sticky top-0 z-10">
                  {group.category}
                </div>
                {group.items.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`px-4 py-2 pl-6 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                      value === opt
                        ? "font-semibold text-[#EEA500] bg-amber-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            ))
          ) : (
            options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                  value === opt
                    ? "font-semibold text-[#EEA500] bg-amber-50/50"
                    : "text-gray-700"
                }`}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AREA_COLORS = [
  "#244A7C",
  "#008080",
  "#F5A623",
  "#D9534F",
  "#5BC0DE",
  "#6F42C1",
  "#2E7D32",
];

/* ================= MAIN COMPONENT ================= */
const MonthlySaleChartContent = () => {
  const searchParams = useSearchParams();
  const urlCity = searchParams?.get("city");
  const urlType = searchParams?.get("propertyType");

  const [filters, setFilters] = useState({
    region: "Vancouver West",
    data: "Sold Prices by Month",
    propertyType: "All Residential",
    neighborhood: "All Neighborhoods",
    year: "Select Year",
    compareRegion: "Vancouver East",
    compareNeighborhood: "All Neighborhoods",
  });

  // Chart type flags
  const isCompareChart =
    filters.data === "Sold Prices by Month (Compare)" ||
    filters.data === "Sold Count by Month (Compare)";

  const isTypeChart =
    filters.data === "Sold Prices by Type YTD" ||
    filters.data.startsWith("Sold Prices by Type every") ||
    filters.data === "Sold Count by Type YTD" ||
    filters.data.startsWith("Sold Count by Type every");

  const isAreaChart =
    filters.data === "Sold Prices by Area YTD" ||
    filters.data.startsWith("Sold Prices by Area every") ||
    filters.data === "Sold Count by Area YTD" ||
    filters.data.startsWith("Sold Count by Area every");

  const isSqFtChart =
    filters.data === "Sold Prices per SqFt" ||
    filters.data.startsWith("Sold Prices per SqFt every");

  const isSoldCountByMonth = filters.data === "Sold Count by Month";
  const isCountChart = filters.data.toLowerCase().includes("sold count");

  // Visibility flags per Filter Data requirements:
  // - Type charts, SqFt charts, and Sold Count by Month compare/include all property types
  const hidePropertyType = isTypeChart || isSqFtChart || isSoldCountByMonth;

  // - Area charts compare all neighborhoods in selected region
  const hideNeighborhood = isAreaChart;

  // - YTD, every [month] charts show fixed 5-year/current periods
  const hideYears = isTypeChart || isAreaChart || filters.data.includes("every");

  // Sync filters if URL search params are provided (e.g. from CityStatsPopup)
  useEffect(() => {
    if (!urlCity && !urlType) return;

    setFilters((prev) => {
      let updatedRegion = prev.region;
      let updatedNeighborhood = prev.neighborhood;
      let updatedType = prev.propertyType;

      if (urlCity) {
        const matchedRegion = REGION_DATA.find(
          (r) => r.region.toLowerCase() === urlCity.toLowerCase()
        );
        if (matchedRegion) {
          updatedRegion = matchedRegion.region;
        } else {
          const parentRegion = REGION_DATA.find((r) =>
            r.neighborhoods.some(
              (n) => n.toLowerCase() === urlCity.toLowerCase()
            )
          );
          if (parentRegion) {
            updatedRegion = parentRegion.region;
            const matchedNeighborhood = parentRegion.neighborhoods.find(
              (n) => n.toLowerCase() === urlCity.toLowerCase()
            );
            if (matchedNeighborhood) {
              updatedNeighborhood = matchedNeighborhood;
            }
          }
        }
      }

      if (urlType) {
        const matchedType = PROPERTY_OPTIONS.find(
          (t) => t.toLowerCase() === urlType.toLowerCase()
        );
        if (matchedType) {
          updatedType = matchedType;
        }
      }

      return {
        ...prev,
        region: updatedRegion,
        neighborhood: updatedNeighborhood,
        propertyType: updatedType,
      };
    });
  }, [urlCity, urlType]);

  // Primary neighborhoods depend dynamically upon the selected region
  const neighborhoodOptions = useMemo(() => {
    const selectedRegion = REGION_DATA.find((r) => r.region === filters.region);
    return ["All Neighborhoods", ...(selectedRegion?.neighborhoods || [])];
  }, [filters.region]);

  // Compare neighborhoods depend dynamically upon the selected compareRegion
  const compareNeighborhoodOptions = useMemo(() => {
    const selectedRegion = REGION_DATA.find((r) => r.region === filters.compareRegion);
    return ["All Neighborhoods", ...(selectedRegion?.neighborhoods || [])];
  }, [filters.compareRegion]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    if (key === "region") {
      setFilters((prev) => ({
        ...prev,
        region: value,
        neighborhood: "All Neighborhoods",
      }));
    } else if (key === "compareRegion") {
      setFilters((prev) => ({
        ...prev,
        compareRegion: value,
        compareNeighborhood: "All Neighborhoods",
      }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Construct query params for the live API endpoint
  const queryParams: MonthlySalesChartParams = useMemo(() => {
    const params: MonthlySalesChartParams = {
      region: filters.region,
      data: filters.data,
    };

    const everyMonthMatch = filters.data.match(/every\s+([A-Za-z]{3})/i);
    if (everyMonthMatch) {
      const monthNames = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
      ];
      const mIdx = monthNames.indexOf(everyMonthMatch[1].toUpperCase());
      if (mIdx !== -1) {
        params.month = mIdx + 1;
      }
    }

    if (!hideNeighborhood && filters.neighborhood && filters.neighborhood !== "All Neighborhoods") {
      params.neighbourhood = filters.neighborhood;
    }

    if (!hidePropertyType && filters.propertyType && filters.propertyType !== "All Residential") {
      params.property_sub_type = filters.propertyType.toLowerCase();
    }

    if (!hideYears && filters.year && filters.year !== "Select Year") {
      const parsedYear = parseInt(filters.year);
      if (!isNaN(parsedYear)) {
        params.year = parsedYear;
      }
    }

    if (isCompareChart) {
      if (filters.compareRegion) {
        params.compare_region = filters.compareRegion;
      }
      if (filters.compareNeighborhood && filters.compareNeighborhood !== "All Neighborhoods") {
        params.compare_neighbourhood = filters.compareNeighborhood;
      }
    }

    return params;
  }, [filters, hideNeighborhood, hidePropertyType, hideYears, isCompareChart]);

  // Fetch real-time monthly sales chart data
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetMonthlySalesChart(queryParams);

  // Transform and format API response for Recharts
  const chartData = useMemo(() => {
    if (!apiResponse) {
      return [];
    }

    let rawItems: any[] = [];
    if (Array.isArray(apiResponse.chartData) && apiResponse.chartData.length > 0) {
      rawItems = apiResponse.chartData;
    } else if (Array.isArray(apiResponse.data)) {
      rawItems = apiResponse.data;
    } else if (apiResponse.data && typeof apiResponse.data === "object") {
      const dataObj = apiResponse.data;
      const firstVal = Object.values(dataObj)[0];
      if (firstVal && typeof firstVal === "object") {
        const firstKeys = Object.keys(firstVal);
        if (
          firstKeys.length > 0 &&
          ["detached", "apartment", "townhouse"].includes(firstKeys[0].toLowerCase())
        ) {
          rawItems = Object.entries(dataObj).map(([monthKey, val]: [string, any]) => ({
            month: monthKey,
            Detached: Number(String(val.detached || "").replace(/[^0-9.]/g, "")) || 0,
            Apartment: Number(String(val.apartment || "").replace(/[^0-9.]/g, "")) || 0,
            Townhouse: Number(String(val.townhouse || "").replace(/[^0-9.]/g, "")) || 0,
          }));
        } else {
          const keys = Object.keys(dataObj);
          const isCategory = keys.some((k) =>
            ["detached", "apartment", "townhouse"].includes(k.toLowerCase())
          );
          if (isCategory) {
            const timeKeys = Array.from(
              new Set(keys.flatMap((k) => Object.keys(dataObj[k] || {})))
            ).sort();
            rawItems = timeKeys.map((tKey) => {
              const item: any = { year: tKey, month: tKey };
              keys.forEach((cat) => {
                const title = cat.charAt(0).toUpperCase() + cat.slice(1);
                item[title] =
                  Number(String(dataObj[cat]?.[tKey] || "").replace(/[^0-9.]/g, "")) || 0;
              });
              return item;
            });
          } else {
            rawItems = Object.entries(dataObj).map(([neigh, timeMap]: [string, any]) => {
              const item: any = { neighborhood: neigh };
              Object.entries(timeMap || {}).forEach(([tKey, val]) => {
                item[tKey] =
                  Number(String(val || "").replace(/[^0-9.]/g, "")) || 0;
              });
              return item;
            });
          }
        }
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return [];
    }

    return rawItems.map((item: any) => {
      const rawMonth = item.month;
      let displayMonth = rawMonth;

      if (rawMonth && dayjs(rawMonth, ["YYYY-MM", "YYYY-M"]).isValid()) {
        displayMonth = dayjs(rawMonth, ["YYYY-MM", "YYYY-M"]).format("MMM YY");
      }

      return {
        ...item,
        rawMonth,
        month: displayMonth,
        // soldCount: item.soldCount != null ? Number(item.soldCount) : undefined,
        // averageSoldPrice:
        //   item.averageSoldPrice != null ? Number(item.averageSoldPrice) : undefined,
        // "12MonthAvgPrice":
        //   item["12MonthAvgPrice"] != null ? Number(item["12MonthAvgPrice"]) : undefined,
        // "12MonthAvgCount":
        //   item["12MonthAvgCount"] != null ? Number(item["12MonthAvgCount"]) : undefined,
      };
    });
  }, [apiResponse]);

  // Dynamic bar keys for area charts (e.g. 2022, 2023, 2024, 2025, 2026 YTD or Aug 2022, ...)
  const areaBarKeys = useMemo(() => {
    if (!isAreaChart || chartData.length === 0) return [];
    const sample = chartData[0];
    return Object.keys(sample).filter(
      (k) => k !== "neighborhood" && k !== "rawMonth" && k !== "month"
    );
  }, [isAreaChart, chartData]);

  const { isLoggedIn, setOpenLogin } = useAuthContext();

  // Axis formatters
  const formatAxisValue = (v: number) => {
    if (isCountChart) {
      if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
      return String(v);
    }
    if (isSqFtChart) {
      return `$${v}`;
    }
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${Math.round(v / 1000)}K`;
    return `$${v}`;
  };

  // Dynamic Chart Header Title
  const chartTitle = useMemo(() => {
    if (isCompareChart) {
      const primaryLoc =
        filters.neighborhood === "All Neighborhoods"
          ? filters.region
          : `${filters.region} (${filters.neighborhood})`;
      const compareLoc =
        filters.compareNeighborhood === "All Neighborhoods"
          ? filters.compareRegion
          : `${filters.compareRegion} (${filters.compareNeighborhood})`;
      return `${primaryLoc} vs ${compareLoc} ${filters.data}*`;
    }

    if (isAreaChart) {
      return `${filters.region} ${filters.data} in ${
        filters.propertyType === "All Residential"
          ? "All Property Types"
          : filters.propertyType
      }*`;
    }

    const neighPart =
      filters.neighborhood === "All Neighborhoods"
        ? "all Neighborhoods"
        : filters.neighborhood;

    if (filters.data === "Sold Prices by Month") {
      return `${filters.region} Median Sold Price in ${neighPart}*`;
    }

    return `${filters.region} ${filters.data} in ${neighPart}*`;
  }, [filters, isCompareChart, isAreaChart]);

  return (
    <section>
      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow p-5 mt-10 flex flex-wrap gap-4">
        {/* Region */}
        <div className="w-full md:w-[calc(33.333%-1rem)]">
          <CustomSelect
            label="Region"
            options={REGION_OPTIONS}
            value={filters.region}
            onChange={(v) => updateFilter("region", v)}
          />
        </div>

        {/* Data Option */}
        <div className="w-full md:w-[calc(33.333%-1rem)]">
          <CustomSelect
            label="Data"
            options={DATA_OPTIONS}
            value={filters.data}
            onChange={(v) => updateFilter("data", v)}
          />
        </div>

        {/* Property Type (Hidden when Type charts, SqFt, or Count by Month) */}
        {!hidePropertyType && (
          <div className="w-full md:w-[calc(33.333%-1rem)]">
            <CustomSelect
              label="Property Type"
              options={PROPERTY_OPTIONS}
              value={filters.propertyType}
              onChange={(v) => updateFilter("propertyType", v)}
            />
          </div>
        )}

        {/* Neighborhood (Hidden when Area charts) */}
        {!hideNeighborhood && (
          <div className="w-full md:w-[calc(33.333%-1rem)]">
            <CustomSelect
              label="Neighborhood"
              options={neighborhoodOptions}
              value={filters.neighborhood}
              onChange={(v) => updateFilter("neighborhood", v)}
            />
          </div>
        )}

        {/* Years (Hidden when YTD or every AUG) */}
        {!hideYears && (
          <div className="w-full md:w-[calc(33.333%-1rem)]">
            <CustomSelect
              label="Years"
              options={YEAR_OPTIONS}
              value={filters.year}
              onChange={(v) => updateFilter("year", v)}
            />
          </div>
        )}

        {/* Compare Region & Compare Neighborhood (Visible only for Compare charts) */}
        {isCompareChart && (
          <>
            <div className="w-full md:w-[calc(50%-1rem)]">
              <CustomSelect
                label="Compare Region"
                options={REGION_OPTIONS}
                value={filters.compareRegion}
                onChange={(v) => updateFilter("compareRegion", v)}
              />
            </div>
            <div className="w-full md:w-[calc(50%-1rem)]">
              <CustomSelect
                label="Compare Neighborhood"
                options={compareNeighborhoodOptions}
                value={filters.compareNeighborhood}
                onChange={(v) => updateFilter("compareNeighborhood", v)}
              />
            </div>
          </>
        )}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl shadow p-6 mt-10 min-h-130">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-2">
          <h3 className="text-sm font-medium text-gray-700">
            {chartTitle}
          </h3>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Loader2 size={13} className="animate-spin" />
              <span>Updating chart...</span>
            </div>
          )}
        </div>

        {/* SCROLL WRAPPER */}
        <div className="overflow-x-auto scrollbar-hide h-full">
          <div className="min-w-175 md:min-w-full h-full relative">
            {!isLoggedIn ? (
              <ChartSignInOverlay onSignIn={() => setOpenLogin(true)} />
            ) : isLoading && chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[380px] gap-3 text-gray-500">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-sm font-medium">
                  Loading sales data...
                </span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[380px] gap-2 text-gray-400">
                <p className="text-base font-semibold text-gray-600">
                  No sales data available
                </p>
                <p className="text-xs">
                  Try selecting a different region, neighborhood, property
                  type, or year range.
                </p>
              </div>
            ) : (
              <div className="w-full">
                {/* 1. Sold Prices by Month (Standard ComposedChart) */}
                {filters.data === "Sold Prices by Month" && (
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="price"
                        tick={{ fontSize: 11 }}
                        tickFormatter={formatAxisValue}
                      />
                      <YAxis
                        yAxisId="sold"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                        domain={[
                          0,
                          (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.3)),
                        ]}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === "Sold Count") return [value, name];
                          return [`$${Number(value || 0).toLocaleString()}`, name];
                        }}
                        labelFormatter={(label, payload) => {
                          const rawMonth = payload?.[0]?.payload?.rawMonth;
                          if (rawMonth && dayjs(rawMonth).isValid()) {
                            return dayjs(rawMonth).format("MMMM YYYY");
                          }
                          return label;
                        }}
                      />
                      <Bar
                        yAxisId="sold"
                        dataKey="soldCount"
                        name="Sold Count"
                        barSize={26}
                        fill="#244A7C"
                        radius={[6, 6, 0, 0]}
                      >
                        <LabelList
                          dataKey="soldCount"
                          position="top"
                          style={{ fontSize: 11, fill: "#333", fontWeight: 500 }}
                        />
                      </Bar>
                      <Legend verticalAlign="bottom" height={36} />
                      <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="medianPrice"
                        name={
                          filters.propertyType === "All Residential"
                            ? "Median Sold Price"
                            : `${filters.propertyType} Median Sold Price`
                        }
                        stroke="#F5A623"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="12MonthAvgPrice"
                        name="12 Month Avg Price"
                        stroke="#2E7D32"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {/* 2. Sold Count by Month (Property Type Bars + 12-MA Line) */}
                {filters.data === "Sold Count by Month" && (
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                        domain={[
                          0,
                          (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.25)),
                        ]}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          Number(value || 0).toLocaleString(),
                          name,
                        ]}
                        labelFormatter={(label, payload) => {
                          const rawMonth = payload?.[0]?.payload?.rawMonth;
                          if (rawMonth && dayjs(rawMonth).isValid()) {
                            return dayjs(rawMonth).format("MMMM YYYY");
                          }
                          return label;
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Bar dataKey="detached" name="Detached" fill="#244A7C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="apartment" name="Apartment" fill="#F5A623" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="townhouse" name="Townhouse" fill="#008080" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="12MonthAvgCount"
                        name="12 Month Avg Sold Count"
                        stroke="#2E7D32"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {/* 3. Compare Line Charts (Prices or Sold Count) */}
                {isCompareChart && (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={formatAxisValue}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const num = Number(value || 0);
                          if (isCountChart) return [num.toLocaleString(), name];
                          return [`$${num.toLocaleString()}`, name];
                        }}
                        labelFormatter={(label, payload) => {
                          const rawMonth = payload?.[0]?.payload?.rawMonth;
                          if (rawMonth && dayjs(rawMonth).isValid()) {
                            return dayjs(rawMonth).format("MMMM YYYY");
                          }
                          return label;
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Line
                        type="monotone"
                        dataKey={isCountChart ? "primarySoldCount" : "primaryPrice"}
                        name={chartData[0]?.primaryLabel || filters.region}
                        stroke="#244A7C"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={isCountChart ? "compareSoldCount" : "comparePrice"}
                        name={chartData[0]?.compareLabel || filters.compareRegion}
                        stroke="#F5A623"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* 4. Sold Prices per SqFt (Line Chart UI with 12-MA and all types) */}
                {filters.data === "Sold Prices per SqFt" && (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `$${Number(value || 0).toLocaleString()} / sq ft`,
                          name,
                        ]}
                        labelFormatter={(label, payload) => {
                          const rawMonth = payload?.[0]?.payload?.rawMonth;
                          if (rawMonth && dayjs(rawMonth).isValid()) {
                            return dayjs(rawMonth).format("MMMM YYYY");
                          }
                          return label;
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Line
                        type="monotone"
                        dataKey="detached"
                        name="Detached"
                        stroke="#244A7C"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="apartment"
                        name="Apartment"
                        stroke="#F5A623"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="townhouse"
                        name="Townhouse"
                        stroke="#008080"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="12MonthAvgPrice"
                        name="12 Month Avg"
                        stroke="#2E7D32"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* 5. Bar Charts for Type YTD & every [month] (Property Types: Detached, Apartment, Townhouse) */}
                {(isTypeChart || filters.data.startsWith("Sold Prices per SqFt every")) && (
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis
                        dataKey={chartData[0]?.year != null ? "year" : "month"}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={formatAxisValue}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const num = Number(value || 0);
                          if (isCountChart) return [num.toLocaleString(), name];
                          if (isSqFtChart) return [`$${num.toLocaleString()} / sq ft`, name];
                          return [`$${num.toLocaleString()}`, name];
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Bar dataKey="Detached" name="Detached" fill="#244A7C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Apartment" name="Apartment" fill="#F5A623" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Townhouse" name="Townhouse" fill="#008080" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* 6. Bar Charts for Area YTD & Area every [month] */}
                {isAreaChart && (
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: Math.max(600, chartData.length * 60) }}>
                      <ResponsiveContainer width="100%" height={420}>
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 20, bottom: 60, left: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                          <XAxis
                            dataKey="neighborhood"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-35}
                            textAnchor="end"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={formatAxisValue}
                          />
                          <Tooltip
                            formatter={(value: any, name: any) => {
                              const num = Number(value || 0);
                              if (isCountChart) return [num.toLocaleString(), name];
                              return [`$${num.toLocaleString()}`, name];
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          {areaBarKeys.map((k, idx) => (
                            <Bar
                              key={k}
                              dataKey={k}
                              name={k}
                              fill={AREA_COLORS[idx % AREA_COLORS.length]}
                              radius={[3, 3, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const MonthlySaleChart = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow p-6 mt-10 min-h-130 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span>Loading sales chart...</span>
          </div>
        </div>
      }
    >
      <MonthlySaleChartContent />
    </Suspense>
  );
};

export default MonthlySaleChart;
