"use client";
import dynamic from "next/dynamic";
import React from "react";

// Register Apex Charts components
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MedianAverageDays() {
//   const [range, setRange] = useState("1 Week");

  const values = [100, 120, 95, 130, 70, 100, 80];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const series = [
    {
      name: "Median Price",
      data: values,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "90%",
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },

    fill: {
      type: "gradient",
      colors:["#214C86"],
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["#214C86"],
        opacityFrom: 0.1,
        opacityTo: 0.9,
      },
    },

    colors: ["#22558B"],

    dataLabels: {
      enabled: true,
      formatter: (val) => `$${val}k`,
      offsetY: 9,
      style: {
        colors: ["#1e3d75"],
        fontSize: "16px",
        fontWeight: 400,
      },
    },

    xaxis: {
      categories: days,
      labels: {
        rotate: -90,
        rotateAlways: true,
        offsetY: -50,
        style: {
          colors: "#fff",
          fontSize: "16px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      show: false,
    },

    grid: {
      show: false,
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="p-5 bg-background rounded-[20px] w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Median & Average Days</h2>
        {/* <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-500 font-medium">
          {range} ▼
        </button> */}
      </div>

      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
