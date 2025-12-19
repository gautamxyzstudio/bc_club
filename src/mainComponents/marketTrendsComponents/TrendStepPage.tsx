"use client";
import React, { useState } from "react";
import MarketTrend from "./trendSaleChart/MarketTrend";
import MonthlySale from "./monthlySale/MonthlySale";
import { FiPrinter, FiShare2 } from "react-icons/fi";
import GetInTouch from "../getInTouch/GetInTouch";
import TotalMonthySale from "./totalMonthlySale/TotalMonthySale";
import StatsMap from "../statsMap/StatsMap";
import MonthlySalesReports from "../monthlySalesReports/MonthlySalesReports";

const TrendStepPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full px-6 md:px-13 xl:px-16 space-y-10 py-30">
        {/* ===== Header ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="font-bold max-w-xl text-base sm:text-lg w-85.5">
            Print the chart with a Landscape orientation for best results
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab(1)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${
                activeTab === 1
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-600"
              }`}
            >
              Monthly Sales Chart
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${
                activeTab === 2
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
              }`}
            >
              Monthly Sales
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${
                activeTab === 3
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
              }`}
            >
              Stats Map
            </button>

            <button
              onClick={() => setActiveTab(4)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${
                activeTab === 4
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
              }`}
            >
              Monthly Sales Reports
            </button>

            <button className="p-2 bg-[#3054871A] rounded-md">
              <FiPrinter size={18} />
            </button>

            <button className="p-2 bg-[#3054871A] rounded-md">
              <FiShare2 size={18} />
            </button>
          </div>
        </div>

        {activeTab === 0 && <MarketTrend />}
        {activeTab === 1 && <MonthlySale />}
        {activeTab === 2 && <TotalMonthySale />}
        {activeTab === 3 && <StatsMap />}
        {activeTab === 4 && <MonthlySalesReports />}
      </section>

      {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
        <GetInTouch />
      )}
    </>
  );
};

export default TrendStepPage;
