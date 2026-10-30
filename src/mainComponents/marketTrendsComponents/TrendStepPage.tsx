"use client";
import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MarketTrend from "./marketTrend/MarketTrend";
import { FiPrinter, FiShare2 } from "react-icons/fi";
import GetInTouch from "../getInTouch/GetInTouch";
import StatsMap from "./statsMap/StatsMap";
import MonthlySaleChart from "./monthlySaleChart/MonthlySaleChart";
import MonthlySalesReports from "./monthlySalesReports/MonthlySalesReports";
import StatisticsSalesTable from "./statisticsSalesTable/StatisticsSalesTable";

const getTabFromPathname = (pathname: string | null, fallback: number): number => {
  if (pathname?.includes("monthly-sale-cart") || pathname?.includes("monthly-sale-chart")) {
    return 1;
  }
  if (pathname?.includes("monthly-sale-reports")) {
    return 2;
  }
  if (pathname?.includes("stats-map")) {
    return 3;
  }
  return fallback;
};

interface TrendStepPageProps {
  initialTab?: number;
}

const TrendStepPage: React.FC<TrendStepPageProps> = ({ initialTab = 1 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [localTab, setLocalTab] = useState<number>(() =>
    getTabFromPathname(pathname, initialTab)
  );

  const activeTab = useMemo(() => {
    if (pathname?.includes("monthly-sale-cart") || pathname?.includes("monthly-sale-chart")) {
      return 1;
    }
    if (pathname?.includes("monthly-sale-reports")) {
      return 2;
    }
    if (pathname?.includes("stats-map")) {
      return 3;
    }
    return localTab;
  }, [pathname, localTab]);

  const handleTabClick = (tab: number, route?: string) => {
    setLocalTab(tab);
    if (route) {
      router.push(route);
    }
  };

  return (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full px-6 md:px-9 xl:px-16 space-y-10 py-30">
        {/* ===== Header ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="font-bold max-w-xl text-base sm:text-lg w-85.5">
            Print the chart with a Landscape orientation for best results
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTabClick(1, "/market-trends/monthly-sale-cart")}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${activeTab === 1
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-600"
                }`}
            >
              Monthly Sales Chart
            </button>

            <button
              onClick={() => handleTabClick(2, "/market-trends/monthly-sale-reports")}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${activeTab === 2
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
                }`}
            >
              Monthly Sales Reports
            </button>

            <button
              onClick={() => handleTabClick(3, "/market-trends/stats-map")}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${activeTab === 3
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
                }`}
            >
              Stats Map
            </button>

            <button
              onClick={() => handleTabClick(4)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border cursor-pointer ${activeTab === 4
                  ? "bg-[#22558b] text-white border-[#22558b]"
                  : "border-borderColor text-gray-500"
                }`}
            >
              Statistics Sales Table
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
        {activeTab === 1 && <MonthlySaleChart />}
        {activeTab === 2 && <MonthlySalesReports />}
        {activeTab === 3 && <StatsMap />}
        {activeTab === 4 && <StatisticsSalesTable />}
      </section>

      {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
        <GetInTouch />
      )}
    </>
  );
};

export default TrendStepPage;
