/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiChevronDown,
  FiArrowUpRight,
  FiArrowDownRight,
  FiMinus,
} from "react-icons/fi";
import { useGetMonthlySalesReports } from "@/src/hooks/listing/useListingQueries";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { useGetBridgeCities } from "@/src/hooks/listing/useRealEstateListingQueries";
import { cities } from "../../home";

/* ================= SELECT ================= */
interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={selectRef} className="relative flex-1 min-w-0 w-full">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center border border-[#E6EAEE] rounded-full px-4 py-2 text-sm bg-white cursor-pointer"
      >
        <span className="truncate">{value}</span>
        <FiChevronDown
          size={18}
          className={`text-[#EEA500] shrink-0 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-[#E6EAEE] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
          {options.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className="px-4 py-2 text-sm hover:bg-[#F3F3F3] cursor-pointer text-black"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= TYPES & CONSTANTS ================= */
type SortDirection = "asc" | "desc";

interface SortState {
  key: string;
  direction: SortDirection;
}

interface HeaderCol {
  label: string;
  key: string;
}

interface TrendItem {
  percent: number | null;
  direction: "up" | "down" | "neutral";
}

const PROPERTY_TYPE_OPTIONS = [
  "All Residential",
  "Apartment",
  "Detached",
  "Townhouse",
];

const YEAR_BACK_OPTIONS = [
  "Select Years Back",
  "1 Year",
  "2 Years",
  "3 Years",
  "4 Years",
  "5 Years",
  "6 Years",
  "7 Years",
  "8 Years",
];

const PRICE_COLUMNS: HeaderCol[] = [
  { label: "Price Range $", key: "priceRange" },
  { label: "Homes sold", key: "sold" },
  { label: "Inventory", key: "inventory" },
  { label: "Ratio", key: "ratio" },
  { label: "New", key: "new" },
];

const BEDS_COLUMNS: HeaderCol[] = [
  { label: "Bedrooms", key: "bedroomRange" },
  { label: "Homes sold", key: "sold" },
  { label: "Inventory", key: "inventory" },
  { label: "Ratio", key: "ratio" },
  { label: "New", key: "new" },
];

const NEIGHBOR_COLUMNS: HeaderCol[] = [
  { label: "Neighbourhood", key: "neighborhood" },
  { label: "Homes sold", key: "sold" },
  { label: "Inventory", key: "inventory" },
  { label: "Ratio", key: "ratio" },
  { label: "New", key: "new" },
];

const getMonthOptions = () => {
  const options: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() - 1;

  if (month < 0) {
    month = 11;
    year -= 1;
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i < 24; i++) {
    options.push({
      label: `${monthNames[month]} ${year}`,
      year: year,
      month: month + 1,
    });

    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  return options;
};

const parseRangeValue = (val: string): number => {
  if (!val) return 0;
  const match = val.match(/\d[\d,]*/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ""), 10);
  }
  return 0;
};

const sortReportData = (
  data: any[],
  sortKey: string,
  sortDirection: SortDirection,
  labelKey: string,
) => {
  if (!data || data.length === 0) return [];

  const regularRows = data.filter((row) => row[labelKey] !== "Total");
  const totalRow = data.find((row) => row[labelKey] === "Total");

  const sorted = [...regularRows].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    let comparison = 0;

    if (sortKey === "priceRange" || sortKey === "bedroomRange") {
      const numA = parseRangeValue(String(valA));
      const numB = parseRangeValue(String(valB));
      comparison = numA - numB;
    } else if (typeof valA === "number" && typeof valB === "number") {
      comparison = valA - valB;
    } else if (
      !isNaN(Number(valA)) &&
      !isNaN(Number(valB)) &&
      valA !== "" &&
      valB !== ""
    ) {
      comparison = Number(valA) - Number(valB);
    } else {
      comparison = String(valA).localeCompare(String(valB));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  if (totalRow) {
    sorted.push(totalRow);
  }

  return sorted;
};

/* ================= STAT FORMATTER ================= */
const formatStatValue = (
  val: number | undefined | null,
  formatType: "number" | "currency" | "percent" | "days",
) => {
  if (val === undefined || val === null || isNaN(val)) return "-";
  if (formatType === "currency") {
    return `$${val.toLocaleString()}`;
  }
  if (formatType === "percent") {
    return `${val}%`;
  }
  if (formatType === "days") {
    return `${val} Days`;
  }
  return val.toLocaleString();
};

/* ================= CHART HELPERS ================= */
const SquareDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <rect
      x={cx - 4}
      y={cy - 4}
      width={8}
      height={8}
      fill="#008000"
      stroke="#008000"
    />
  );
};

const formatPriceLabel = (val: any) => {
  const num = Number(val);
  if (!num) return "";
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  return `$${Math.round(num / 1000)}K`;
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload || !payload.value) return null;
  const parts = String(payload.value).split(" ");
  const month = parts[0] || "";
  const year = parts[1] || "";
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fill="#000"
        fontSize={11}
        fontWeight="bold"
      >
        {month}
      </text>
      <text
        x={0}
        y={23}
        textAnchor="middle"
        fill="#000"
        fontSize={11}
        fontWeight="bold"
      >
        {year}
      </text>
    </g>
  );
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedPrice = data.medianSoldPrice
      ? `$${Number(data.medianSoldPrice).toLocaleString()}`
      : "-";

    return (
      <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-48 max-w-70 sm:max-w-none">
        <div className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-1">
          {data.label || label}
        </div>
        {data.neighborhood && (
          <div className="text-gray-500 italic text-[11px]">
            {data.neighborhood}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0"></span>
          <span>
            Median Sold Price: <strong>{formattedPrice}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <span className="w-2.5 h-2.5 bg-green-700 inline-block shrink-0"></span>
          <span>
            Inventory Count: <strong>{data.inventoryCount ?? "-"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <span className="w-3 h-2.5 bg-amber-500 rounded-sm inline-block shrink-0"></span>
          <span>
            Sold Count: <strong>{data.soldCount ?? "-"}</strong>
          </span>
        </div>
        {data.soldToOrigAskRatio !== undefined && (
          <div className="text-gray-600 pt-1 border-t border-gray-100">
            Median Sold:Ask Ratio: <strong>{data.soldToOrigAskRatio}%</strong>
          </div>
        )}
        {data.medianDaysOnMarket !== undefined && (
          <div className="text-gray-600">
            Median Days on Market: <strong>{data.medianDaysOnMarket}</strong>
          </div>
        )}
        {data.newListings !== undefined && (
          <div className="text-gray-600">
            New Listings: <strong>{data.newListings}</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

/* ================= MAIN COMPONENT ================= */
const MonthlySalesReports = () => {
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const { data: bridgeCitiesRes } = useGetBridgeCities();
    const citiesList: string[] = useMemo(() => {
      if (Array.isArray(bridgeCitiesRes?.data) && bridgeCitiesRes.data.length > 0) {
        return bridgeCitiesRes.data;
      }
      if (Array.isArray(bridgeCitiesRes) && bridgeCitiesRes.length > 0) {
        return bridgeCitiesRes;
      }
      return cities;
    }, [bridgeCitiesRes]);

  const [property, setProperty] = useState("All Residential");
  const [neighborhood, setNeighborhood] = useState("Vancouver");
  const [yearsBack, setYearsBack] = useState("Select Years Back");
  const [selectedMonthLabel, setSelectedMonthLabel] = useState(
    monthOptions[0]?.label || "",
  );
  const [activeMode, setActiveMode] = useState<"month" | "yearsBack">("month");

  const handleYearsBackChange = (val: string) => {
    setYearsBack(val);
    if (val !== "Select Years Back") {
      setActiveMode("yearsBack");
    } else {
      setActiveMode("month");
    }
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonthLabel(val);
    setActiveMode("month");
    setYearsBack("Select Years Back");
  };

  const currentOption = useMemo(() => {
    return (
      monthOptions.find((opt) => opt.label === selectedMonthLabel) ||
      monthOptions[0]
    );
  }, [monthOptions, selectedMonthLabel]);

  const commonParams = useMemo(() => {
    const baseParams: any = {
      propertyType: property.toLowerCase(),
      region: neighborhood.toLowerCase(),
    };

    if (activeMode === "yearsBack" && yearsBack !== "Select Years Back") {
      const yNum = parseInt(yearsBack, 10) || 1;
      baseParams.yearsBack = yNum;
    } else if (currentOption) {
      baseParams.year = currentOption.year;
      baseParams.month = currentOption.month;
    }

    return baseParams;
  }, [activeMode, yearsBack, currentOption, property, neighborhood]);

  const reportsQuery = useGetMonthlySalesReports(
    commonParams ? commonParams : undefined,
    {
      enabled: !!commonParams,
    },
  );

  const loading = reportsQuery.isLoading;
  const error = (reportsQuery.error as Error)?.message || null;

  const regionSummary = useMemo(
    () => reportsQuery.data?.regionSummary || null,
    [reportsQuery.data],
  );
  const priceData = useMemo(
    () => reportsQuery.data?.priceRanges || [],
    [reportsQuery.data],
  );
  const neighborData = useMemo(
    () => reportsQuery.data?.neighborhoods || [],
    [reportsQuery.data],
  );
  const bedsData = useMemo(
    () => reportsQuery.data?.bedrooms || [],
    [reportsQuery.data],
  );
  const chartData = useMemo(
    () => reportsQuery.data?.chart?.series || [],
    [reportsQuery.data],
  );

  const handleRetry = () => {
    reportsQuery.refetch();
  };

  // Sorting state for each table
  const [priceSort, setPriceSort] = useState<SortState>({
    key: "priceRange",
    direction: "asc",
  });
  const [bedsSort, setBedsSort] = useState<SortState>({
    key: "bedroomRange",
    direction: "asc",
  });
  const [neighborSort, setNeighborSort] = useState<SortState>({
    key: "neighborhood",
    direction: "asc",
  });

  const handleSort = (
    setSort: React.Dispatch<React.SetStateAction<SortState>>,
    key: string,
  ) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const monthLabelsList = useMemo(
    () => monthOptions.map((opt) => opt.label),
    [monthOptions],
  );

  const sortedPriceData = useMemo(
    () =>
      sortReportData(
        priceData,
        priceSort.key,
        priceSort.direction,
        "priceRange",
      ),
    [priceData, priceSort],
  );

  const sortedBedsData = useMemo(
    () =>
      sortReportData(
        bedsData,
        bedsSort.key,
        bedsSort.direction,
        "bedroomRange",
      ),
    [bedsData, bedsSort],
  );

  const sortedNeighborData = useMemo(
    () =>
      sortReportData(
        neighborData,
        neighborSort.key,
        neighborSort.direction,
        "neighborhood",
      ),
    [neighborData, neighborSort],
  );

  const renderTableHeader = (
    columns: HeaderCol[],
    currentSort: SortState,
    onSort: (key: string) => void,
  ) => (
    <thead className="bg-[#F9FAFB]">
      <tr className="text-left text-gray-500">
        {columns.map((col) => {
          const isActive = currentSort.key === col.key;
          return (
            <th
              key={col.key}
              onClick={() => onSort(col.key)}
              className="px-4 py-3 cursor-pointer select-none hover:text-black hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>{col.label}</span>
                <span className="text-xs text-[#EEA500]">
                  {isActive
                    ? currentSort.direction === "asc"
                      ? "▲"
                      : "▼"
                    : "▲"}
                </span>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );

  return (
    <section className="space-y-6 mt-10">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <CustomSelect
          label="Property Type"
          options={PROPERTY_TYPE_OPTIONS}
          value={property}
          onChange={setProperty}
        />
        <CustomSelect
          label="Region"
          options={citiesList}
          value={neighborhood}
          onChange={setNeighborhood}
        />
        <CustomSelect
          label="Years Back"
          options={YEAR_BACK_OPTIONS}
          value={yearsBack}
          onChange={handleYearsBackChange}
        />
        <CustomSelect
          label="Month"
          options={monthLabelsList}
          value={
            activeMode === "yearsBack" ? "Select Month" : selectedMonthLabel
          }
          onChange={handleMonthChange}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="underline font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Cards */}
      <div className="w-full flex flex-wrap gap-5">
        <div className="w-full md:w-[calc(50%-10px)] flex flex-col gap-5">
          {/* Table 1: Price Range */}
          <div className="bg-white rounded-2xl shadow overflow-hidden w-full h-fit">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="min-w-140 md:min-w-full w-full text-sm">
                {renderTableHeader(PRICE_COLUMNS, priceSort, (key) =>
                  handleSort(setPriceSort, key),
                )}

                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </td>
                      </tr>
                    ))
                  ) : sortedPriceData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    sortedPriceData.map((row, i) => {
                      const isTotal = row.priceRange === "Total";
                      return (
                        <tr
                          key={i}
                          className={
                            isTotal
                              ? "font-bold bg-[#EAEAEA] text-black"
                              : i % 2
                                ? "bg-[#F3F3F3]"
                                : "bg-white"
                          }
                        >
                          <td className="px-4 py-3 font-medium">
                            {row.priceRange}
                          </td>
                          <td className="px-4 py-3">{row.sold}</td>
                          <td className="px-4 py-3">{row.inventory}</td>
                          <td className="px-4 py-3">
                            {row.ratio !== undefined && row.ratio !== null
                              ? `${row.ratio}%`
                              : "-"}
                          </td>
                          <td className="px-4 py-3">{row.new}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Bedrooms */}
          <div className="bg-white rounded-2xl shadow overflow-hidden w-full h-fit">
            <div className="overflow-x-auto scrollbar-hide">
              {sortedBedsData.length > 0 && (
                <table className="min-w-140 md:min-w-full w-full text-sm">
                  {renderTableHeader(BEDS_COLUMNS, bedsSort, (key) =>
                    handleSort(setBedsSort, key),
                  )}
                  <tbody>
                    {sortedBedsData.map((row, i) => {
                      const isTotal = row.bedroomRange === "Total";
                      return (
                        <tr
                          key={i}
                          className={
                            isTotal
                              ? "font-bold bg-[#EAEAEA] text-black"
                              : i % 2
                                ? "bg-[#F3F3F3]"
                                : "bg-white"
                          }
                        >
                          <td className="px-4 py-3 font-medium">
                            {row.bedroomRange}
                          </td>
                          <td className="px-4 py-3">{row.sold}</td>
                          <td className="px-4 py-3">{row.inventory}</td>
                          <td className="px-4 py-3">
                            {row.ratio !== undefined && row.ratio !== null
                              ? `${row.ratio}%`
                              : "-"}
                          </td>
                          <td className="px-4 py-3">{row.new}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Region Summary Section */}
          {regionSummary && (
            <div className="bg-white rounded-2xl shadow overflow-hidden w-full">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Region Summary ({" "}
                  {dayjs()
                    .month(regionSummary.currentYear?.month - 1)
                    .format("MMM")}{" "}
                  {regionSummary.currentYear?.year} vs{" "}
                  {dayjs()
                    .month(regionSummary.previousYear?.month - 1)
                    .format("MMM")}{" "}
                  {regionSummary.previousYear?.year})
                </h3>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full w-full text-sm">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="text-left text-gray-500 font-medium">
                      <th className="px-4 py-3">Metric</th>
                      <th className="px-4 py-3">
                        {dayjs()
                          .month(regionSummary.previousYear?.month - 1)
                          .format("MMM")}{" "}
                        {regionSummary.previousYear?.year || "Previous Year"}
                      </th>
                      <th className="px-4 py-3">
                        {dayjs()
                          .month(regionSummary.currentYear?.month - 1)
                          .format("MMM")}{" "}
                        {regionSummary.currentYear?.year || "Current Year"}
                      </th>
                      <th className="px-4 py-3">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Sold Count",
                        key: "soldCount",
                        format: "number" as const,
                      },
                      {
                        label: "% Sold Above Ask",
                        key: "percentSoldAboveOrigAsk",
                        format: "percent" as const,
                      },
                      {
                        label: "Median Sold Price",
                        key: "medianSoldPrice",
                        format: "currency" as const,
                      },
                      {
                        label: "Sold : Orig Ask Ratio",
                        key: "soldToOrigAskRatio",
                        format: "percent" as const,
                      },
                      {
                        label: "Median Price / SqFt",
                        key: "medianPricePerSqFt",
                        format: "currency" as const,
                      },
                      {
                        label: "Median Days on Market",
                        key: "medianDaysOnMarket",
                        format: "days" as const,
                      },
                      {
                        label: "New Listings",
                        key: "newListings",
                        format: "number" as const,
                      },
                      {
                        label: "Inventory (Last Day)",
                        key: "inventoryOnLastDay",
                        format: "number" as const,
                      },
                    ].map((item, idx) => {
                      const prevVal = regionSummary.previousYear?.[item.key];
                      const curVal = regionSummary.currentYear?.[item.key];
                      const trend = regionSummary.trend?.[item.key] as
                        | TrendItem
                        | undefined;

                      const isUp = trend?.direction === "up";
                      const isDown = trend?.direction === "down";

                      return (
                        <tr
                          key={item.key}
                          className={idx % 2 ? "bg-[#F3F3F3]" : "bg-white"}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.label}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatStatValue(prevVal, item.format)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatStatValue(curVal, item.format)}
                          </td>
                          <td className="px-4 py-3">
                            {trend && trend.percent !== null ? (
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${isUp
                                    ? "bg-green-100 text-green-700"
                                    : isDown
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                {isUp && (
                                  <FiArrowUpRight className="text-green-600" />
                                )}
                                {isDown && (
                                  <FiArrowDownRight className="text-red-600" />
                                )}
                                {!isUp && !isDown && (
                                  <FiMinus className="text-gray-400" />
                                )}
                                {trend.percent > 0
                                  ? `+${trend.percent}%`
                                  : `${trend.percent}%`}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Table 3: Neighbourhood */}
        <div className="bg-white rounded-2xl shadow overflow-hidden w-full h-fit md:w-[calc(50%-10px)]">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-140 md:min-w-full w-full text-sm">
              {renderTableHeader(NEIGHBOR_COLUMNS, neighborSort, (key) =>
                handleSort(setNeighborSort, key),
              )}

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                    </tr>
                  ))
                ) : sortedNeighborData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  sortedNeighborData.map((row, i) => {
                    const isTotal = row.neighborhood === "Total";
                    return (
                      <tr
                        key={i}
                        className={
                          isTotal
                            ? "font-bold bg-[#EAEAEA] text-black"
                            : i % 2
                              ? "bg-[#F3F3F3]"
                              : "bg-white"
                        }
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.neighborhood}
                        </td>
                        <td className="px-4 py-3">{row.sold}</td>
                        <td className="px-4 py-3">{row.inventory}</td>
                        <td className="px-4 py-3">
                          {row.ratio !== undefined && row.ratio !== null
                            ? `${row.ratio}%`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">{row.new}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="bg-[#F2FBF3] border border-gray-400 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 mt-6 h-80 sm:h-105 flex flex-col justify-center items-center">
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs sm:text-sm font-semibold text-gray-700">
            Loading Chart Data...
          </span>
        </div>
      ) : chartData && chartData.length > 0 ? (
        <div className="bg-[#F2FBF3] border border-gray-400 rounded-xl p-3 sm:p-5 shadow-sm space-y-4 mt-6">
          {/* Top Legend */}
          <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-gray-800 border-b border-gray-300/60 pb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-600 inline-block shrink-0"></span>
              <span>Median Sold Price</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-700 inline-block shrink-0"></span>
              <span>Inventory Count</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-3.5 h-3 sm:w-4 sm:h-3.5 bg-amber-500 rounded-sm inline-block shrink-0"></span>
              <span>Sold Count</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="w-full h-72 sm:h-80 md:h-96 overflow-x-auto touch-pan-x scrollbar-hide">
            <div
              style={{
                minWidth: `${Math.max(600, chartData.length * 60)}px`,
                width: "100%",
                height: "100%",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 25, right: 15, left: 15, bottom: 25 }}
                >
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: "#000", strokeWidth: 1.5 }}
                    tickLine={true}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />

                  {/* Hidden Y-axes for vertical scaling */}
                  <YAxis
                    yAxisId="price"
                    hide
                    domain={["dataMin * 0.82", "dataMax * 1.18"]}
                  />
                  <YAxis
                    yAxisId="inventory"
                    hide
                    domain={[0, "dataMax * 1.45"]}
                  />
                  <YAxis yAxisId="sold" hide domain={[0, "dataMax * 2.8"]} />

                  <Tooltip content={<CustomChartTooltip />} />

                  {/* Sold Count Bars */}
                  <Bar
                    yAxisId="sold"
                    dataKey="soldCount"
                    fill="#FFA500"
                    barSize={28}
                    radius={[2, 2, 0, 0]}
                  >
                    <LabelList
                      dataKey="soldCount"
                      position="top"
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        fill: "#000",
                      }}
                    />
                  </Bar>

                  {/* Inventory Count Line */}
                  <Line
                    yAxisId="inventory"
                    type="monotone"
                    dataKey="inventoryCount"
                    stroke="#008000"
                    strokeWidth={2}
                    dot={<SquareDot />}
                  >
                    <LabelList
                      dataKey="inventoryCount"
                      position="top"
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        fill: "#000",
                      }}
                    />
                  </Line>

                  {/* Median Sold Price Line */}
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="medianSoldPrice"
                    stroke="#DC2626"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#DC2626", stroke: "#DC2626" }}
                  >
                    <LabelList
                      dataKey="medianSoldPrice"
                      position="top"
                      formatter={formatPriceLabel}
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        fill: "#000",
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default MonthlySalesReports;
