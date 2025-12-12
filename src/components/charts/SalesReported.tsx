"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";

// Register Apex Charts components
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// const metrics = ["New Listings", "Sold", "Active", "Canceled"];
const timeRanges = ["15D", "1M", "3M", "6M", "Custom"];
type SeriesKey = "detached" | "apartment" | "townhouse";

/* -------------------------------
   1️⃣ Fake Dynamic Sample Data Generator
-----------------------------------*/
const generateRandomSeries = (days: number) => {
  return Array.from({ length: days }, () =>
    Math.floor(Math.random() * (200 - 30) + 30)
  );
};

const generateDashboardData = (location: string, range: string) => {
  const days =
    range === "15D"
      ? 15
      : range === "1M"
      ? 30
      : range === "3M"
      ? 90
      : range === "6M"
      ? 180
      : 30;

  return {
    summary: {
      sold: Math.floor(Math.random() * 1500 + 400),
      newListings: Math.floor(Math.random() * 2000 + 500),
      // active: Math.floor(Math.random() * 1800 + 300),
      // canceled: Math.floor(Math.random() * 300 + 50),
    },
    series: {
      detached: generateRandomSeries(days),
      apartment: generateRandomSeries(days),
      townhouse: generateRandomSeries(days),
    },
    labels: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
  };
};

/* Summary Card Component */
const SummaryCard = ({ title, value }: { title: string; value: number }) => (
  <div className="rounded p-2.5 bg-gray flex flex-col justify-center gap-y-0.5">
    <h3 className="text-foreground text-xs">{title}</h3>
    <p className="text-2xl font-bold text-foreground">
      {value.toLocaleString()}
    </p>
  </div>
);

/* -------------------------------
   2️⃣ SalesReported Component
-----------------------------------*/

export default function SalesReported({ location }: { location: string }) {
  const [range, setRange] = useState("15D");
  // const [metric, setMetric] = useState("New Listings");

  // Generate dynamic data
  const data = useMemo(
    () => generateDashboardData(location, range),
    [location, range]
  );

  /* Legends toggling */
  const [visibleSeries, setVisibleSeries] = useState({
    detached: true,
    apartment: true,
    townhouse: true,
  });

  /* Chart Config */
  const chartSeries = [
    visibleSeries.detached
      ? { name: "Detached", data: data.series.detached }
      : { name: "Detached", data: [] },
    visibleSeries.apartment
      ? { name: "Apartment", data: data.series.apartment }
      : { name: "Apartment", data: [] },
    visibleSeries.townhouse
      ? { name: "Townhouse", data: data.series.townhouse }
      : { name: "Townhouse", data: [] },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { width: 3, curve: "stepline" },
    markers: { size: 0 },
    colors: ["#2E93fA", "#66DA26", "#F44336"],
    xaxis: {
      categories: data.labels,
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      axisBorder: {
        show: true,
      },
    },
    legend: { show: false },
    grid: { borderColor: "transparent" },
  };

  return (
    <div className="p-6 space-y-6 bg-background rounded-2xl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {/* Summary Cards */}
        <div className="flex flex-row gap-x-1.5 items-center">
          <SummaryCard
            title="Total Properties Sold"
            value={data.summary.sold}
          />
          <SummaryCard
            title="Total Properties Listed"
            value={data.summary.newListings}
          />
        </div>

        {/* Legends */}
        <div className="flex gap-4 items-center overflow-clip overflow-x-scroll p-5">
          {["detached", "apartment", "townhouse"].map((key) => (
            <button
              key={key}
              onClick={() =>
                setVisibleSeries((prev) => ({
                  ...prev,
                  [key as SeriesKey]: !prev[key as SeriesKey],
                }))
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background ${
                visibleSeries[key as keyof typeof visibleSeries]
                  ? "shadow-[0_0_20px_0_rgba(0,0,0,0.12)]"
                  : "border border-[#E7EAEE]"
              }`}
            >
              <span
                className="w-4 h-4 rounded"
                style={{
                  background:
                    key === "detached"
                      ? "#EA3423"
                      : key === "apartment"
                      ? "#1A01F5"
                      : "#147C65",
                }}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex gap-2">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-base ${
                range === r
                  ? "bg-secondary text-background"
                  : "bg-gray text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-black opacity-50 font-bold text-xl">
          Properties
        </span>
        {/* Metrics */}
        {/* <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-4 py-2 rounded-4xl bg-gray focus:outline-0 "
        >
          {metrics.map((m) => (
            <option
              key={m}
              className="text-black opacity-50 text-base font-semibold"
            >
              {m}
            </option>
          ))}
        </select> */}
      </div>

      {/* Chart */}
      <div className="overflow-clip overflow-x-scroll">

      <Chart options={chartOptions} series={chartSeries} height={350}/>
      </div>
    </div>
  );
}
