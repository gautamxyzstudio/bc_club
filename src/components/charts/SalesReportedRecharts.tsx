/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import PoweredBy from "../common/poweredby/PoweredBy";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import ChartSignInOverlay from "../common/charts/ChartSignInOverlay";
import { monthName } from "@/src/utilities/utilities";
import { useGetSalesReported } from "@/src/hooks/listing/useListingQueries";

export const timeRanges = ["12D", "1M", "3M", "6M", "Custom"];
type SeriesKey = "detached" | "apartment" | "townhouse";

/* Custom Tooltip Component */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col gap-2.5 min-w-45">
        <p className="text-sm font-bold text-black border-b border-gray-100 pb-2 mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs font-medium text-gray-500 capitalize">
                {entry.name.replace("_", " ")}
              </span>
            </div>
            <span className="text-xs font-bold text-black">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* Summary Card Component */
const SummaryCard = ({
  title,
  value,
  isLoading,
  isLoggedIn,
  onLogin,
}: {
  title: string;
  value: number;
  isLoading: boolean;
  isLoggedIn?: boolean;
  onLogin?: () => void;
}) => (
  <div
    onClick={!isLoggedIn ? onLogin : undefined}
    className={`rounded-xl lg:p-6 p-2 bg-gray flex flex-col items-center justify-center gap-y-2 flex-1 w-1/2 transition-all ${!isLoggedIn ? "cursor-pointer hover:bg-gray/80 group" : ""
      }`}
  >
    <h3 className="text-foreground lg:text-sm text-xs font-medium opacity-70 text-center">
      {title}
    </h3>
    {isLoading ? (
      <div className="h-8 lg:w-40 w-24 bg-white/50 animate-pulse rounded" />
    ) : !isLoggedIn ? (
      <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/80 group-hover:bg-white text-primary transition-all shadow-xs border border-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-[#EEA500] shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span className="lg:text-sm text-xs font-semibold whitespace-nowrap">
          Login to view
        </span>
      </div>
    ) : (
      <p className="lg:text-4xl text-base font-bold text-black">
        {(value || 0).toLocaleString()}
      </p>
    )}
  </div>
);

/* -------------------------------
   2️⃣ SalesReportedRecharts Component
-----------------------------------*/

const SalesReportedRecharts = ({ location }: { location: string }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoggedIn, setOpenLogin, authLoading } = useAuthContext();
  const [range, setRange] = useState("1M");

  // const isProtectedRange = useMemo(
  //   () => !isLoggedIn && ["12D", "1M", "3M", "6M", "Custom"].includes(range),
  //   [isLoggedIn, range],
  // );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const salesParams = useMemo(
    () => ({
      location,
      days: range,
    }),
    [location, range],
  );

  const {
    data: salesRes,
    isLoading,
    isFetching,
  } = useGetSalesReported(salesParams, {
    enabled: !!location && !isLoggedIn && range !== "Custom",
  });

  const data = salesRes?.data || {
    summary: {
      sold: 0,
      newListings: 0,

      total_detached_sold: 0,
      total_apartment_sold: 0,
      total_townhouse_sold: 0,

      total_detached_listed: 0,
      total_apartment_listed: 0,
      total_townhouse_listed: 0,
    },
    chartData: [],
  };

  const isChartLoading = isLoading || isFetching;
  const isCardLoading = authLoading || isChartLoading;

  const ChartSkeleton = () => (
    <div className="flex flex-col w-full h-full">
      <div className="w-full h-full animate-pulse flex">
        <div className="h-full w-px bg-gray-300" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-end gap-1 px-3">
            <div className="w-3 bg-gray-200 rounded-t-md h-30" />
            <div className="w-3 bg-gray-200 rounded-t-md h-45" />
            <div className="w-3 bg-gray-200 rounded-t-md h-22.5" />
          </div>
        ))}
      </div>
      <div className="w-full h-px bg-gray-300" />
    </div>
  );

  const [visibleSeries, setVisibleSeries] = useState({
    detached: true,
    apartment: true,
    townhouse: true,
  });

  // Always show all names generated for the chart
  const xTicks = data.chartData.map((d: any) => d.name);

  if (!isMounted)
    return (
      <div className="p-8 space-y-8 bg-white border border-gray-100 rounded-3xl min-h-125 shadow-sm"></div>
    );

  return (
    <div className="lg:p-8 p-4 space-y-3 md:space-y-8 bg-white border border-transparent rounded-3xl w-full">
      {/* 1st Row: Summary Cards */}
      <div className="flex flex-row flex-wrap md:gap-6 gap-2 justify-center w-full">
        <SummaryCard
          title="Total properties sold"
          value={data.summary.sold}
          isLoading={isCardLoading}
          isLoggedIn={true}
          onLogin={() => setOpenLogin(true)}
        />
        <SummaryCard
          title="Total properties listed"
          value={data.summary.newListings}
          isLoading={isCardLoading}
          isLoggedIn={true}
          onLogin={() => setOpenLogin(true)}
        />
      </div>

      {/* 2nd Row: Filters and Series Toggles */}
      <div className="flex flex-wrap items-center gap-6 justify-between">
        <div className="flex flex-wrap md:gap-3 gap-2 items-center">
          {[
            { key: "detached", color: "#22558B" },
            { key: "apartment", color: "#EEA500" },
            { key: "townhouse", color: "#007E64" },
          ].map(({ key, color }) => (
            <button
              key={key}
              onClick={() =>
                setVisibleSeries((prev) => {
                  const nextState = {
                    ...prev,
                    [key as SeriesKey]: !prev[key as SeriesKey],
                  };
                  if (
                    !nextState.detached &&
                    !nextState.apartment &&
                    !nextState.townhouse
                  ) {
                    nextState.detached = true;
                  }
                  return nextState;
                })
              }
              className={`flex items-center md:gap-2 md:px-4 md:py-2.5 gap-1 px-2 py-1.5 rounded-xl bg-white border transition-all ${visibleSeries[key as keyof typeof visibleSeries]
                  ? "border-gray-200"
                  : "border-transparent opacity-40 shadow-none"
                } shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]`}
            >
              <span
                className="md:w-4 md:h-4 w-2 h-2 rounded-md"
                style={{ background: color }}
              />
              <span className="md:text-sm text-xs font-medium capitalize">
                {key}
              </span>
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex flex-col gap-3 items-end">
          <div className="flex flex-wrap bg-[#F5F5F5] p-1.5 rounded-xl gap-1">
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => {
                  if (r === "Custom") {
                    router.push("/market-trends");
                  } else {
                    setRange(r);
                  }
                }}
                className={`md:px-5 md:py-2 px-3 py-1 rounded-lg md:text-sm text-xs font-medium transition-all cursor-pointer ${range === r
                    ? "bg-[#FFA500] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="space-y-4 w-full"> */}
      <h2 className="md:text-xl text-lg font-bold text-black px-2">
        All Properties
      </h2>

      {/* Chart */}
      <div className="w-full h-87.5 relative overflow-x-auto touch-pan-x scrollbar-hide">
        {!isLoggedIn ? (
          <ChartSignInOverlay
            monthContent={monthName(range)}
            onSignIn={() => setOpenLogin(true)}
          />
        ) : isChartLoading ? (
          <ChartSkeleton />
        ) : (
          <div
            style={{
              minWidth: `${Math.max(600, (data?.chartData?.length || 0) * 45)}px`,
              width: "100%",
              height: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#F0F0F0"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  ticks={xTicks}
                  tick={{ fontSize: 10, fill: "#9CA3AF", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 25, 50, 100]}
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#9CA3AF", fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={<CustomTooltip />}
                />

                {visibleSeries.detached && (
                  <Bar
                    dataKey="detached_listed"
                    stackId="detached"
                    fill="#22558B"
                    barSize={12}
                    radius={0}
                    background={{ fill: "#F2F2F2", radius: 4 }}
                  />
                )}
                {visibleSeries.detached && (
                  <Bar
                    dataKey="detached_sold"
                    stackId="detached"
                    fill="#7FA6D1"
                    barSize={12}
                    radius={[4, 4, 0, 0] as [number, number, number, number]}
                  />
                )}

                {visibleSeries.apartment && (
                  <Bar
                    dataKey="apartment_listed"
                    stackId="apartment"
                    fill="#EEA500"
                    barSize={12}
                    radius={0}
                    background={{ fill: "#F2F2F2", radius: 4 }}
                  />
                )}
                {visibleSeries.apartment && (
                  <Bar
                    dataKey="apartment_sold"
                    stackId="apartment"
                    fill="#FFC875"
                    barSize={12}
                    radius={[4, 4, 0, 0] as [number, number, number, number]}
                  />
                )}

                {visibleSeries.townhouse && (
                  <Bar
                    dataKey="townhouse_listed"
                    stackId="townhouse"
                    fill="#007E64"
                    barSize={12}
                    radius={0}
                    background={{ fill: "#F2F2F2", radius: 4 }}
                  />
                )}
                {visibleSeries.townhouse && (
                  <Bar
                    dataKey="townhouse_sold"
                    stackId="townhouse"
                    fill="#80C1B3"
                    barSize={12}
                    radius={[4, 4, 0, 0] as [number, number, number, number]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* </div> */}
      <div className="w-full flex flex-col sm:flex-row flex-wrap sm:flex-nowrap justify-between items-start gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 w-full sm:w-fit">
          {[
            {
              key: "Total Detached Listed",
              color: "#22558B",
              total: data?.summary?.total_detached_listed || 0,
            },
            {
              key: "Total Apartment Listed",
              color: "#EEA500",
              total: data?.summary?.total_apartment_listed || 0,
            },
            {
              key: "Total Townhouse Listed",
              color: "#007E64",
              total: data?.summary?.total_townhouse_listed || 0,
            },
            {
              key: "Total Detached Sold",
              color: "#7FA6D1",
              total: data?.summary?.total_detached_sold || 0,
            },

            {
              key: "Total Apartment Sold",
              color: "#FFC875",
              total: data?.summary?.total_apartment_sold || 0,
            },

            {
              key: "Total Townhouse Sold",
              color: "#80C1B3",
              total: data?.summary?.total_townhouse_sold || 0,
            },
          ].map(({ key, color, total }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ background: color }}
              />
              <span className="text-xs sm:text-sm font-medium capitalize">
                {key}: {isLoggedIn ? total : "-"}
              </span>
            </div>
          ))}
        </div>
        <PoweredBy className="justify-end shrink-0" />
      </div>
    </div>
  );
};

export default SalesReportedRecharts;
