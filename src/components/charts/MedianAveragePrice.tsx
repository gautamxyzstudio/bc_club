import dynamic from "next/dynamic";
import React, { useState } from "react";

// Register Apex Charts components
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MedianAveragePrice() {
  const [series] = useState([
    {
      name: "Price",
      data: [120, 350, 280, 260, 270, 280, 400], // sample values
    },
  ]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },

    stroke: {
      curve: "smooth",
      width: 4,
      colors: ["#1E4B87"],
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#1E4B87",
            opacity: 0.35,
          },
          {
            offset: 100,
            color: "#1E4B87",
            opacity: 0,
          },
        ],
      },
    },

    grid: {
      borderColor: "#E9ECEF",
      strokeDashArray: 4,
      padding: { left: 15, right: 15, top: 10, bottom: 10 },
    },

    markers: {
      size: 8,
      strokeWidth: 3,
      strokeColors: "#1E4B87",
      colors: "#ffffff",
      hover: { size: 10 },
    },

    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const value = series[seriesIndex][dataPointIndex];
        const date = "29 July 2023"; // You can dynamically format dates here

        return `
          <div style="
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0px 4px 20px rgba(0,0,0,0.12);
            font-family: Inter, sans-serif;
            text-align: center;
          ">
            <div style="font-size: 12px; color: #777">${date}</div>
            <div style="font-size: 20px; font-weight: 600; color: #000">
              $${value.toLocaleString()}
            </div>
          </div>
        `;
      },
    },

    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: {
        style: { colors: "#777", fontSize: "14px" },
      },
      axisBorder: { show: false },
    },

    yaxis: {
      labels: {
        formatter: (val: number) => `$${val}`,
        style: { colors: "#777", fontSize: "14px" },
      },
    },
  };

  return (
    <div className="p-5 bg-background rounded-[20px] w-full">
      <h2 className="text-xl font-bold">Median & Average Price</h2>

      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
}
