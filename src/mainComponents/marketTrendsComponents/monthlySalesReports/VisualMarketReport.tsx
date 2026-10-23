/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  FiPrinter,
  FiShare2,
  FiTable,
} from "react-icons/fi";
import styles from "./market-report.module.css";
import { useGetMonthlySalesReports } from "@/src/hooks/listing/useListingQueries";
import { useGetBridgeCities } from "@/src/hooks/listing/useRealEstateListingQueries";
import { cities } from "../../home";
import { useSearchParams } from "next/navigation";

interface VisualMarketReportProps {
  onSwitchToTableView?: () => void;
  initialRegion?: string;
  initialPropertyType?: string;
  initialYear?: number;
  initialMonth?: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
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

const PROPERTY_TYPES = [
  { label: "Detached", value: "detached", display: "Detached homes" },
  { label: "Townhouses", value: "townhouse", display: "Townhouses" },
  { label: "Apartments", value: "apartment", display: "Apartments" },
];

const getMonthOptions = () => {
  const options: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() - 1; // Last completed month

  if (month < 0) {
    month = 11;
    year -= 1;
  }

  for (let i = 0; i < 24; i++) {
    options.push({
      label: `${MONTH_SHORT[month]} ${year}`,
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

/* Formatters */
function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "0";
  return Math.round(n).toLocaleString("en-CA");
}

function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("en-CA");
}

function fmtBig(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n) || n === 0) return "$0";
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  return "$" + Math.round(n / 1000) + "K";
}

function calcPctChange(curr: number, prev: number): number | null {
  if (!prev || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

function regionCapitalize(region: string): string {
  return region
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const PACE_MAP = {
  buyer: "Slow pace · room to negotiate",
  balanced: "Steady pace",
  seller: "Fast pace · expect competition",
};

const SEQ_COLORS = ["#CFE6E3", "#7FB8B2", "#1B7F79", "#0F4F4B", "#0A3431"];

export default function VisualMarketReport({
  onSwitchToTableView,
  initialRegion = "Surrey",
  initialPropertyType = "detached",
  initialYear,
  initialMonth,
}: VisualMarketReportProps) {
  const searchParams = useSearchParams()

  const city = searchParams.get("city")
  const property = searchParams.get("propertyType")
  console.log(city, property)

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

  const normalizeRegion = (value: string) =>
    value
      .replace(/-/g, " ")
      .trim()
      .toLowerCase();

  const [region, setRegion] = useState<string>(normalizeRegion(city || initialRegion));
  const [propertyType, setPropertyType] = useState<string>(property?.toLocaleLowerCase() || initialPropertyType);
  const [selectedMonthOption, setSelectedMonthOption] = useState(() => {
    if (initialYear && initialMonth) {
      const found = monthOptions.find(
        (m) => m.year === initialYear && m.month === initialMonth,
      );
      if (found) return found;
    }
    return monthOptions[0];
  });

  const [showAllNeighbourhoods, setShowAllNeighbourhoods] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch from the getMonthlySalesReport Strapi API!
  const queryParams = useMemo(() => {
    return {
      region: region.toLowerCase(),
      propertyType: propertyType.toLowerCase(),
      year: selectedMonthOption.year,
      month: selectedMonthOption.month,
      type: "report",
    };
  }, [region, propertyType, selectedMonthOption]);

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMonthlySalesReports(queryParams);

  /* Extract Metrics */
  const currentYearData = reportData?.regionSummary?.currentYear;
  const prevYearData = reportData?.regionSummary?.previousYear;

  const thisYearMetrics = useMemo(() => {
    return {
      year: currentYearData?.year || selectedMonthOption.year,
      month: currentYearData?.month || selectedMonthOption.month,
      sold: Number(currentYearData?.soldCount || 0),
      inventory: Number(currentYearData?.inventoryOnLastDay || 0),
      newListings: Number(currentYearData?.newListings || 0),
      medianPrice: Number(currentYearData?.medianSoldPrice || 0),
      pricePerSqft: Number(currentYearData?.medianPricePerSqFt || 0),
      soldToAsk: Number(currentYearData?.soldToOrigAskRatio || 0),
      pctOverAsk: Number(currentYearData?.percentSoldAboveOrigAsk || 0),
      dom: Number(currentYearData?.medianDaysOnMarket || 0),
    };
  }, [currentYearData, selectedMonthOption]);

  const lastYearMetrics = useMemo(() => {
    return {
      year: prevYearData?.year || selectedMonthOption.year - 1,
      month: prevYearData?.month || selectedMonthOption.month,
      sold: Number(prevYearData?.soldCount || 0),
      inventory: Number(prevYearData?.inventoryOnLastDay || 0),
      newListings: Number(prevYearData?.newListings || 0),
      medianPrice: Number(prevYearData?.medianSoldPrice || 0),
      pricePerSqft: Number(prevYearData?.medianPricePerSqFt || 0),
      soldToAsk: Number(prevYearData?.soldToOrigAskRatio || 0),
      pctOverAsk: Number(prevYearData?.percentSoldAboveOrigAsk || 0),
      dom: Number(prevYearData?.medianDaysOnMarket || 0),
    };
  }, [prevYearData, selectedMonthOption]);

  // Sell rate % (ratio of sold / inventory)
  const sellRateThis = useMemo(() => {
    if (thisYearMetrics.inventory <= 0) return 0;
    return (thisYearMetrics.sold / thisYearMetrics.inventory) * 100;
  }, [thisYearMetrics]);

  const sellRateLast = useMemo(() => {
    if (lastYearMetrics.inventory <= 0) return 0;
    return (lastYearMetrics.sold / lastYearMetrics.inventory) * 100;
  }, [lastYearMetrics]);

  const getMarketType = (rate: number): "buyer" | "balanced" | "seller" => {
    if (rate < 12) return "buyer";
    if (rate <= 20) return "balanced";
    return "seller";
  };

  const marketType = getMarketType(sellRateThis);
  const marketTypeLast = getMarketType(sellRateLast);

  const marketTitle = {
    buyer: "Buyer's market",
    balanced: "Balanced market",
    seller: "Seller's market",
  }[marketType];

  // Gauge position calculation (0 to 100%)
  const gaugePercent = useMemo(() => {
    let p = 0;
    if (sellRateThis <= 12) {
      p = (sellRateThis / 12) * 40;
    } else if (sellRateThis <= 20) {
      p = 40 + ((sellRateThis - 12) / 8) * 26.67;
    } else {
      p = 66.67 + Math.min(1, (sellRateThis - 20) / 20) * 33.33;
    }
    return Math.max(2, Math.min(97, p));
  }, [sellRateThis]);

  const monthName = MONTH_NAMES[selectedMonthOption.month - 1];
  const thisMonthLabel = `${MONTH_SHORT[selectedMonthOption.month - 1]} ${thisYearMetrics.year}`;
  const lastMonthLabel = `${MONTH_SHORT[selectedMonthOption.month - 1]} ${lastYearMetrics.year}`;

  const currentPropertyConfig = useMemo(() => {
    return (
      PROPERTY_TYPES.find((p) => p.value === propertyType) || PROPERTY_TYPES[0]
    );
  }, [propertyType]);

  // Advice Generator matching the rule engine
  const advice = useMemo(() => {
    const buy: { priority: number; text: string }[] = [];
    const sell: { priority: number; text: string }[] = [];

    const belowAsk = Math.max(0, 100 - thisYearMetrics.soldToAsk);
    const priceChange = calcPctChange(thisYearMetrics.medianPrice, lastYearMetrics.medianPrice);
    const dDom = thisYearMetrics.dom - lastYearMetrics.dom;
    const dR = sellRateThis - sellRateLast;

    if (marketType === "buyer") {
      buy.push({
        priority: 5,
        text: `Homes sold for about ${Math.round(belowAsk)}% below asking price, so there is room to negotiate.`,
      });
      buy.push({
        priority: 4,
        text: `Homes took about ${thisYearMetrics.dom} days to sell, giving you time to view, inspect, and arrange financing.`,
      });
      buy.push({
        priority: 3,
        text: `With ${fmtNum(thisYearMetrics.inventory)} homes for sale, you can compare multiple options before deciding.`,
      });

      sell.push({
        priority: 5,
        text: `Only about ${Math.round(thisYearMetrics.pctOverAsk)} out of 100 homes sold over asking, so plan for negotiation rather than a bidding war.`,
      });
      sell.push({
        priority: 4,
        text: `Price from this month's recent comparable sales, not last year's peak numbers.`,
      });
      sell.push({
        priority: 3,
        text: `Presentation and staging matter significantly when buyers have ${fmtNum(thisYearMetrics.inventory)} homes to choose from.`,
      });
    } else if (marketType === "balanced") {
      buy.push({
        priority: 5,
        text: `Buyers paid about $${Math.round(thisYearMetrics.soldToAsk)} for every $100 asked, so modest negotiation is common.`,
      });
      buy.push({
        priority: 4,
        text: `Well-priced homes still move in about ${thisYearMetrics.dom} days. Have your mortgage pre-approval ready.`,
      });
      buy.push({
        priority: 3,
        text: `Keep standard subject conditions like home inspection and financing intact.`,
      });

      sell.push({
        priority: 5,
        text: `Pricing right at market value based on recent sales is the primary factor in how fast your home sells.`,
      });
      sell.push({
        priority: 4,
        text: `Homes took about ${thisYearMetrics.dom} days to sell. Overpriced properties linger on the market.`,
      });
      sell.push({
        priority: 3,
        text: `High quality professional photos and cleanliness help your listing stand out from the competition.`,
      });
    } else {
      buy.push({
        priority: 5,
        text: `Expect competition: ${Math.round(thisYearMetrics.pctOverAsk)}% of homes sold over asking price.`,
      });
      buy.push({
        priority: 4,
        text: `Be pre-approved and ready to act quickly. Desirable homes are selling in about ${thisYearMetrics.dom} days.`,
      });
      buy.push({
        priority: 3,
        text: `Work closely with an experienced agent on contract terms and offer strategy.`,
      });

      sell.push({
        priority: 5,
        text: `Demand is strong, but buyers still compare value. Price accurately from recent sales to spark competition.`,
      });
      sell.push({
        priority: 4,
        text: `Homes sell rapidly in about ${thisYearMetrics.dom} days on average.`,
      });
      sell.push({
        priority: 3,
        text: `Plan your next purchase or living arrangements early so you are not rushed once sold.`,
      });
    }

    // Trend adjustments
    if (priceChange !== null && priceChange >= 5) {
      buy.push({
        priority: 8,
        text: `Prices are up ${priceChange}% from last year; calibrate your search budget based on current sales.`,
      });
      sell.push({
        priority: 8,
        text: `Prices have risen ${priceChange}% from a year ago. Your property may be worth more than expected.`,
      });
    } else if (priceChange !== null && priceChange <= -5) {
      buy.push({
        priority: 8,
        text: `Median prices are down ${Math.abs(priceChange)}% from a year ago, improving buying power.`,
      });
      sell.push({
        priority: 8,
        text: `Prices are down ${Math.abs(priceChange)}% from last year; adjust your pricing expectations accordingly.`,
      });
    }

    if (dR >= 3) {
      buy.push({
        priority: 7,
        text: `Market is tighter than last year: ${Math.round(sellRateThis)} sold per 100 for sale, up from ${Math.round(sellRateLast)}.`,
      });
    } else if (dR <= -3) {
      buy.push({
        priority: 7,
        text: `Buyers have more leverage than last year: sell rate declined to ${Math.round(sellRateThis)}% from ${Math.round(sellRateLast)}%.`,
      });
    }

    if (dDom <= -5) {
      buy.push({
        priority: 6,
        text: `Homes are selling faster than last year (${thisYearMetrics.dom} days vs ${lastYearMetrics.dom} days).`,
      });
    } else if (dDom >= 5) {
      buy.push({
        priority: 6,
        text: `Homes are taking longer to sell (${thisYearMetrics.dom} days vs ${lastYearMetrics.dom} days), giving you more breathing room.`,
      });
    }

    return {
      buy: buy.sort((a, b) => b.priority - a.priority).slice(0, 4).map((x) => x.text),
      sell: sell.sort((a, b) => b.priority - a.priority).slice(0, 4).map((x) => x.text),
    };
  }, [thisYearMetrics, lastYearMetrics, sellRateThis, sellRateLast, marketType]);

  // Clean Price Ranges
  const priceRanges = useMemo(() => {
    const raw = reportData?.priceRanges || [];
    return raw.filter((r: any) => r.priceRange !== "Total");
  }, [reportData]);

  // Price Donut data grouping
  const priceDonutData = useMemo(() => {
    const buckets = [
      { label: "Under $1M", max: 999999, count: 0 },
      { label: "$1M - $1.5M", min: 1000000, max: 1499999, count: 0 },
      { label: "$1.5M - $2M", min: 1500000, max: 1999999, count: 0 },
      { label: "Over $2M", min: 2000000, count: 0 },
    ];

    priceRanges.forEach((pr: any) => {
      const sold = Number(pr.sold || 0);
      const min = pr.min !== undefined ? pr.min : 0;
      if (min < 1000000) buckets[0].count += sold;
      else if (min < 1500000) buckets[1].count += sold;
      else if (min < 2000000) buckets[2].count += sold;
      else buckets[3].count += sold;
    });

    const totalSold = buckets.reduce((acc, b) => acc + b.count, 0);

    return {
      buckets,
      totalSold,
      topBucket: [...buckets].sort((a, b) => b.count - a.count)[0],
    };
  }, [priceRanges]);

  // Neighbourhoods
  const neighbourhoods = useMemo(() => {
    const raw = reportData?.neighborhoods || [];
    return raw
      .filter((n: any) => n.neighborhood !== "Total")
      .map((n: any) => ({
        name: n.name || n.neighborhood,
        sold: Number(n.sold || 0),
        inventory: Number(n.inventory || 0),
        new: Number(n.new || 0),
        ratio:
          n.ratio !== undefined
            ? Number(n.ratio)
            : n.inventory > 0
              ? Math.round((Number(n.sold) / Number(n.inventory)) * 100 * 10) / 10
              : 0,
      }))
      .sort((a: any, b: any) => b.ratio - a.ratio);
  }, [reportData]);

  // Neighbourhood market split (Buyer vs Balanced vs Seller)
  const nbSplit = useMemo(() => {
    let buyer = 0;
    let balanced = 0;
    let seller = 0;

    neighbourhoods.forEach((n: any) => {
      const k = getMarketType(n.ratio);
      if (k === "buyer") buyer++;
      else if (k === "balanced") balanced++;
      else seller++;
    });

    const total = neighbourhoods.length || 1;
    return {
      buyer,
      balanced,
      seller,
      total: neighbourhoods.length,
      buyerPct: Math.round((buyer / total) * 100),
      balancedPct: Math.round((balanced / total) * 100),
      sellerPct: Math.round((seller / total) * 100),
    };
  }, [neighbourhoods]);

  // Top picks: selling fastest vs most choice
  const hotNeighbourhoods = useMemo(() => {
    return neighbourhoods
      .filter((n: any) => n.sold >= 3)
      .slice(0, 3);
  }, [neighbourhoods]);

  const dealsNeighbourhoods = useMemo(() => {
    return [...neighbourhoods]
      .filter((n: any) => n.inventory >= 10)
      .sort((a: any, b: any) => a.ratio - b.ratio)
      .slice(0, 3);
  }, [neighbourhoods]);

  // Bedrooms breakdown
  const bedrooms = useMemo(() => {
    const raw = reportData?.bedrooms || [];
    return raw
      .filter((b: any) => b.bedroomRange !== "Total")
      .map((b: any) => {
        const sold = Number(b.sold || 0);
        const inv = Number(b.inventory || 0);
        const ratio =
          b.ratio !== undefined
            ? Number(b.ratio)
            : inv > 0
              ? Math.round((sold / inv) * 100 * 10) / 10
              : 0;
        const kind = getMarketType(ratio);
        return {
          label: b.label || `${b.bedroomRange} bedrooms`,
          sold,
          inventory: inv,
          new: Number(b.new || 0),
          ratio,
          kind,
          pace: PACE_MAP[kind],
        };
      });
  }, [reportData]);

  const bedDonutData = useMemo(() => {
    const totalSold = bedrooms.reduce((acc: number, b: any) => acc + (b.sold || 0), 0);
    const topBed = [...bedrooms].sort((a: any, b: any) => (b.sold || 0) - (a.sold || 0))[0];
    return { totalSold, topBed };
  }, [bedrooms]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className={styles.reportWrapper}>
      {/* ===== Control Bar ===== */}
      <div className={styles.controlBar}>
        <div className={styles.wrap}>
          <div className={styles.controlFlex}>
            <div className={styles.selectGroup}>
              {/* City / Region selector */}
              <div>
                <select
                  value={
                    citiesList.find(
                      (c) => normalizeRegion(c) === normalizeRegion(city || region)
                    ) || ""
                  }
                  onChange={(e) => setRegion(normalizeRegion(e.target.value))}
                  className={styles.controlSelect}
                >
                  {citiesList.map((c, idx) => (
                    <option
                      key={idx}
                      value={c}
                      className="bg-[#152A3E] text-white"
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month selector */}
              <div>
                <select
                  value={`${selectedMonthOption.year}-${selectedMonthOption.month}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split("-").map(Number);
                    const opt = monthOptions.find(
                      (item) => item.year === y && item.month === m,
                    );
                    if (opt) setSelectedMonthOption(opt);
                  }}
                  className={styles.controlSelect}
                >
                  {monthOptions.map((opt, idx) => (
                    <option
                      key={idx}
                      value={`${opt.year}-${opt.month}`}
                      className="bg-[#152A3E] text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Updating pill when refetching */}
              {(isLoading || isFetching) && (
                <div className="md:block hidden">
                  <div className={styles.updatingPill}>
                    <div className={styles.updatingSpinner} />
                    <span>Generating {regionCapitalize(region)} report...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onSwitchToTableView && (
                <button
                  onClick={onSwitchToTableView}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm bg-[#152A3E] border border-white/20 text-white hover:border-[#FFC20E] cursor-pointer"
                >
                  <FiTable size={14} />
                  <span>Table View</span>
                </button>
              )}
              {/* Updating pill when refetching */}
              {(isLoading || isFetching) && (
                <div className="block md:hidden">

                  <div className={styles.updatingPill}>
                    <div className={styles.updatingSpinner} />
                    <span>Generating {regionCapitalize(region)} report...</span>
                  </div> </div>
              )}
              <button
                onClick={handlePrint}
                className="p-2 bg-[#152A3E] hover:bg-white/10 rounded-full border border-white/20 text-white cursor-pointer"
                title="Print report"
              >
                <FiPrinter size={16} />
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 p-2 px-3 bg-[#152A3E] hover:bg-white/10 rounded-full border border-white/20 text-white text-xs cursor-pointer"
                title="Share link"
              >
                <FiShare2 size={16} />
                <span>{copiedLink ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && !reportData ? (
        <section className={styles.loadingScreen}>
          <div className={styles.wrap}>
            <div className={styles.loadingHero}>
              <div className={styles.loadingSpinnerRing} />
              <div className={styles.loadingBadge}>
                <span className={styles.loadingPulseDot} />
                <span>GENERATING MARKET REPORT</span>
              </div>
              <h2 className={styles.loadingTitle}>
                Generating {regionCapitalize(region)} Market Report
              </h2>
              <p className={styles.loadingSubtitle}>
                Compiling official MLS® sales data, benchmark pricing, absorption rates, and neighborhood statistics for {currentPropertyConfig.display.toLowerCase()} ({selectedMonthOption.label})...
              </p>
              <div className={styles.loadingSteps}>
                <span className={styles.loadingStepItem}>
                  <span className="text-[#1B7F79]">●</span> Fetching MLS® sales &amp; inventory data
                </span>
                <span className={styles.loadingStepItem}>
                  <span className="text-[#FFC20E]">●</span> Calculating absorption rate &amp; price segments
                </span>
                <span className={styles.loadingStepItem}>
                  <span className="text-[#9DB8C9]">●</span> Structuring neighborhood &amp; bedroom analytics
                </span>
              </div>
            </div>

            {/* Skeleton metric cards */}
            <div className={styles.skeletonGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.skeletonItem}>
                  <div className={styles.skeletonBar} style={{ width: "45%", height: 12 }} />
                  <div className={styles.skeletonBar} style={{ width: "70%", height: 32 }} />
                  <div className={styles.skeletonBar} style={{ width: "90%", height: 14 }} />
                </div>
              ))}
            </div>

            {/* Skeleton gauge card */}
            <div className={styles.skeletonCard}>
              <div className={styles.skeletonBar} style={{ width: "30%", height: 14, marginBottom: 16 }} />
              <div className={styles.skeletonBar} style={{ width: "60%", height: 26, marginBottom: 20 }} />
              <div className={`${styles.skeletonBar} ${styles.skeletonGauge}`} />
              <div className={styles.skeletonBar} style={{ width: "40%", height: 12, marginTop: 12 }} />
            </div>

            {/* Skeleton two col cards */}
            <div className={styles.twoCol}>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonBar} style={{ width: "40%", height: 20, marginBottom: 16 }} />
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className={styles.skeletonBar} style={{ width: "35%", height: 16 }} />
                    <div className={styles.skeletonBar} style={{ width: "25%", height: 16 }} />
                  </div>
                ))}
              </div>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonBar} style={{ width: "40%", height: 20, marginBottom: 16 }} />
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className={styles.skeletonBar} style={{ width: "35%", height: 16 }} />
                    <div className={styles.skeletonBar} style={{ width: "25%", height: 16 }} />

                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : error && !reportData ? (
        <section className={styles.loadingScreen}>
          <div className={styles.wrap}>
            <div className={styles.errorCard}>
              <h3 className={styles.errorTitle}>Unable to load market report</h3>
              <p className={styles.errorText}>
                {error instanceof Error ? error.message : "We encountered an issue retrieving real estate report data. Please try again."}
              </p>
              <button onClick={() => refetch()} className={styles.retryBtn}>
                Retry Generation
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div style={{ opacity: isFetching ? 0.75 : 1, transition: "opacity 0.25s ease" }}>
          {/* ===== Hero Header ===== */}
          <header className={styles.hero}>
            <div className={styles.wrap}>
              {/* Property Type Navigation Tabs */}
              <nav className={styles.typesNav} aria-label="Property type">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setPropertyType(pt.value)}
                    className={`${styles.typeTab} ${propertyType === pt.value ? styles.typeTabActive : ""
                      }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </nav>

              <div className={styles.eyebrow}>
                {regionCapitalize(region)} Market Report · {monthName} {thisYearMetrics.year}
              </div>

              <h1 className={styles.heroTitle}>
                {regionCapitalize(region)} real estate market: {currentPropertyConfig.display.toLowerCase()}, {monthName} {thisYearMetrics.year}
              </h1>

              <p className={styles.heroSum}>
                Median prices{" "}
                {thisYearMetrics.medianPrice < lastYearMetrics.medianPrice
                  ? `fell ${Math.abs(calcPctChange(thisYearMetrics.medianPrice, lastYearMetrics.medianPrice) || 0)}% from ${monthName} ${lastYearMetrics.year} to ${fmtMoney(thisYearMetrics.medianPrice)}`
                  : thisYearMetrics.medianPrice > lastYearMetrics.medianPrice
                    ? `rose ${calcPctChange(thisYearMetrics.medianPrice, lastYearMetrics.medianPrice) || 0}% from ${monthName} ${lastYearMetrics.year} to ${fmtMoney(thisYearMetrics.medianPrice)}`
                    : `remained steady at ${fmtMoney(thisYearMetrics.medianPrice)}`}
                . With {fmtNum(thisYearMetrics.sold)} sales and {fmtNum(thisYearMetrics.inventory)} homes for sale, {regionCapitalize(region)} is in a{" "}
                <strong className="text-[#FFC20E]">{marketTitle.toLowerCase()}</strong>.
              </p>

              <div className={styles.verdict}>
                <span
                  className={`${styles.badge} ${marketType === "buyer"
                    ? styles.badgeBuyer
                    : marketType === "balanced"
                      ? styles.badgeBalanced
                      : styles.badgeSeller
                    }`}
                >
                  {marketTitle}
                </span>

                <div className={styles.gwrap}>
                  <div className={styles.gauge} role="img" aria-label={`Market gauge at ${Math.round(sellRateThis)}%`}>
                    <i />
                    <i />
                    <i />
                    <span className={styles.mark} style={{ left: `${gaugePercent}%` }}>
                      <span className={styles.markLabel}>{Math.round(sellRateThis)}%</span>
                    </span>
                  </div>
                  <div className={styles.gl}>
                    <span>Buyer&apos;s (&lt;12%)</span>
                    <span>Balanced (12-20%)</span>
                    <span>Seller&apos;s (&gt;20%)</span>
                  </div>
                </div>
              </div>

              <div className={styles.byline}>
                Source: MLS® System data reported by Real Estate Board · Updated {monthName} {thisYearMetrics.year}
              </div>
            </div>
          </header>

          {/* ===== Floating Key Facts Cards ===== */}
          <div className={styles.wrap}>
            <div className={styles.factsGrid}>
              <div className={styles.factItem}>
                <small className={styles.factSmall}>Median Sold Price</small>
                <b className={styles.factValue}>{fmtBig(thisYearMetrics.medianPrice)}</b>
                <span className={styles.factChange}>
                  {(() => {
                    const diff = calcPctChange(thisYearMetrics.medianPrice, lastYearMetrics.medianPrice);
                    if (diff === null) return "No change";
                    return diff >= 0 ? `▲ ${diff}% from ${lastMonthLabel}` : `▼ ${Math.abs(diff)}% from ${lastMonthLabel}`;
                  })()}
                </span>
              </div>

              <div className={styles.factItem}>
                <small className={styles.factSmall}>Sold vs Original Ask</small>
                <b className={styles.factValue}>
                  {thisYearMetrics.soldToAsk ? `${thisYearMetrics.soldToAsk.toFixed(1)}%` : "-"}
                </b>
                <span className={styles.factChange}>
                  {(() => {
                    const diff = Math.round((thisYearMetrics.soldToAsk - lastYearMetrics.soldToAsk) * 10) / 10;
                    return diff >= 0 ? `▲ ${diff} pts from ${lastMonthLabel}` : `▼ ${Math.abs(diff)} pts from ${lastMonthLabel}`;
                  })()}
                </span>
              </div>

              <div className={styles.factItem}>
                <small className={styles.factSmall}>Days on Market</small>
                <b className={styles.factValue}>{thisYearMetrics.dom}</b>
                <span className={styles.factChange}>
                  {(() => {
                    const diff = thisYearMetrics.dom - lastYearMetrics.dom;
                    return diff >= 0 ? `▲ ${diff} days from ${lastMonthLabel}` : `▼ ${Math.abs(diff)} days from ${lastMonthLabel}`;
                  })()}
                </span>
              </div>

              <div className={styles.factItem}>
                <small className={styles.factSmall}>Homes Sold</small>
                <b className={styles.factValue}>{fmtNum(thisYearMetrics.sold)}</b>
                <span className={styles.factChange}>
                  {(() => {
                    const diff = calcPctChange(thisYearMetrics.sold, lastYearMetrics.sold);
                    if (diff === null) return "No change";
                    return diff >= 0 ? `▲ ${diff}% from ${lastMonthLabel}` : `▼ ${Math.abs(diff)}% from ${lastMonthLabel}`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* ===== Main Content Sections ===== */}
          <main className={styles.wrap}>
            {/* Section: What this means for you */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>What the {regionCapitalize(region)} market means for you</h2>
              <p className={styles.leadText}>
                Tailored market insights and tactical advice based on current sell rates and inventory levels.
              </p>

              <div className={styles.twoCol}>
                <div className={styles.cardBox}>
                  <div className={styles.cardTitle}>
                    <span className={`${styles.iconCircle} ${styles.icBuyer}`}>B</span>
                    If you&apos;re buying
                  </div>
                  <ul className={styles.adviceList}>
                    {advice.buy.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardBox}>
                  <div className={styles.cardTitle}>
                    <span className={`${styles.iconCircle} ${styles.icBalanced}`}>S</span>
                    If you&apos;re selling
                  </div>
                  <ul className={styles.adviceList}>
                    {advice.sell.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section: How many homes sold? (Waffle Grid) */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>How many {regionCapitalize(region)} {currentPropertyConfig.display.toLowerCase()} sold?</h2>
              <p className={styles.leadText}>
                Picture 100 homes for sale. Each coloured square represents a home that sold this month. We call this the{" "}
                <strong>sell rate</strong>. Every market classification on this page comes from it.
              </p>

              <div className={styles.wafflesGrid}>
                <div className={styles.cardBox}>
                  <div className="mb-2">
                    <b className={styles.wcapHeadline}>
                      Out of 100, {Math.round(sellRateThis)} sold
                    </b>
                    <span className={styles.wcapSubtitle}>
                      {thisMonthLabel}: {fmtNum(thisYearMetrics.sold)} sold out of {fmtNum(thisYearMetrics.inventory)} for sale. {marketTitle}.
                    </span>
                  </div>
                  <div className={styles.wfGrid}>
                    {Array.from({ length: 100 }).map((_, idx) => (
                      <i
                        key={idx}
                        className={`${styles.wfCell} ${idx < Math.round(sellRateThis) ? styles.wfCellOn : ""
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.cardBox}>
                  <div className="mb-2">
                    <b className={styles.wcapHeadline}>
                      Out of 100, {Math.round(sellRateLast)} sold
                    </b>
                    <span className={styles.wcapSubtitle}>
                      {lastMonthLabel}: {fmtNum(lastYearMetrics.sold)} sold out of {fmtNum(lastYearMetrics.inventory)} for sale.{" "}
                      {getMarketType(sellRateLast) === "buyer"
                        ? "Buyer's market"
                        : getMarketType(sellRateLast) === "balanced"
                          ? "Balanced market"
                          : "Seller's market"}
                      .
                    </span>
                  </div>
                  <div className={styles.wfGrid}>
                    {Array.from({ length: 100 }).map((_, idx) => (
                      <i
                        key={idx}
                        className={`${styles.wfCell} ${idx < Math.round(sellRateLast) ? styles.wfCellLyOn : ""
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.legendKey}>
                <span>
                  <i className={styles.keyBox} style={{ background: "var(--teal)" }} />
                  Sold this month ({thisMonthLabel})
                </span>
                <span>
                  <i className={styles.keyBox} style={{ background: "var(--mist)" }} />
                  Sold same month last year ({lastMonthLabel})
                </span>
                <span>
                  <i className={styles.keyBox} style={{ background: "#EFEAE0" }} />
                  Still active for sale
                </span>
              </div>

              <p className={styles.noteText}>
                Out of 100 homes for sale: if fewer than 12 sell, it is a buyer&apos;s market. If 12 to 20 sell, it is balanced. If more than 20 sell, it is a seller&apos;s market.
              </p>
            </section>

            {/* Section: Prices - What sold & where competition is */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>{regionCapitalize(region)} home prices: what sold and where the competition is</h2>
              <p className={styles.leadText}>
                Two views of the same market: what buyers actually purchased, and how competition varies across price brackets.
              </p>

              {/* Donut Chart: What buyers bought */}
              <div className={styles.cardBox}>
                <div className={styles.subHeading}>What buyers bought</div>
                <p className={styles.subLead}>
                  Share of the {fmtNum(priceDonutData.totalSold)} homes sold in {monthName}, by price range.
                  {priceDonutData.topBucket && (
                    <>
                      {" "}The most active bracket was {priceDonutData.topBucket.label} (
                      {priceDonutData.totalSold > 0
                        ? Math.round((priceDonutData.topBucket.count / priceDonutData.totalSold) * 100)
                        : 0}
                      %).
                    </>
                  )}
                </p>

                <div className={styles.vizGrid}>
                  {/* SVG Donut */}
                  <div className="flex justify-center">
                    <svg className={styles.donutSvg} viewBox="0 0 220 220" role="img">
                      {(() => {
                        const R0 = 80;
                        const C = 2 * Math.PI * R0;
                        let currentOffset = 0;

                        return priceDonutData.buckets.map((b, ix) => {
                          const share = priceDonutData.totalSold > 0 ? b.count / priceDonutData.totalSold : 0;
                          const dashLength = share * C;
                          const color = SEQ_COLORS[ix % SEQ_COLORS.length];
                          const strokeDasharray = `${Math.max(dashLength - 2, 0.5)} ${C - Math.max(dashLength - 2, 0.5)}`;
                          const strokeDashoffset = -currentOffset;
                          currentOffset += dashLength;

                          if (dashLength <= 0) return null;

                          return (
                            <circle
                              key={ix}
                              className={styles.donutSeg}
                              cx="110"
                              cy="110"
                              r={R0}
                              fill="none"
                              stroke={color}
                              strokeWidth="34"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              transform="rotate(-90 110 110)"
                            >
                              <title>
                                {b.label}: {b.count} sold ({Math.round(share * 100)}%)
                              </title>
                            </circle>
                          );
                        });
                      })()}
                      <text
                        x="110"
                        y="106"
                        textAnchor="middle"
                        style={{
                          font: "600 32px 'Fraunces', Georgia, serif",
                          fill: "var(--ink)",
                        }}
                      >
                        {fmtNum(priceDonutData.totalSold)}
                      </text>
                      <text
                        x="110"
                        y="132"
                        textAnchor="middle"
                        style={{
                          font: "500 14px 'Figtree', sans-serif",
                          fill: "var(--muted)",
                        }}
                      >
                        homes sold
                      </text>
                    </svg>
                  </div>

                  {/* Legend rows */}
                  <ul className={styles.legendList}>
                    {priceDonutData.buckets.map((b, ix) => {
                      const share =
                        priceDonutData.totalSold > 0
                          ? Math.round((b.count / priceDonutData.totalSold) * 100)
                          : 0;
                      const color = SEQ_COLORS[ix % SEQ_COLORS.length];
                      return (
                        <li key={ix} className={styles.legendRow}>
                          <i className={styles.legendDot} style={{ background: color }} />
                          <span className="font-medium text-gray-800">{b.label}</span>
                          <span className="text-gray-500 text-sm">{b.count} sold</span>
                          <b className="font-semibold min-w-10 text-right">{share}%</b>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Competition in each price range */}
              <div className="mt-8">
                <div className={styles.subHeading}>Competition in each price range</div>
                <p className={styles.subLead}>
                  Find your price tier. Each row shows how many homes were for sale and how many sold. A longer bar signifies higher buyer competition.
                </p>

                <div className={styles.pillLegend}>
                  <span className={`${styles.pill} ${styles.pillBuyer}`}>Buyer&apos;s: under 12% sold</span>
                  <span className={`${styles.pill} ${styles.pillBalanced}`}>Balanced: 12% to 20% sold</span>
                  <span className={`${styles.pill} ${styles.pillSeller}`}>Seller&apos;s: over 20% sold</span>
                </div>

                <ul className={styles.progressList}>
                  {priceRanges.map((pr: any, idx: number) => {
                    const s = Number(pr.sold || 0);
                    const inv = Number(pr.inventory || 0);
                    const n = Number(pr.new || 0);
                    const ratio =
                      pr.ratio !== undefined
                        ? Number(pr.ratio)
                        : inv > 0
                          ? Math.round((s / inv) * 100 * 10) / 10
                          : 0;
                    const kind = getMarketType(ratio);
                    const barWidth = Math.min(100, Math.max(ratio, inv > 0 ? 3 : 0));
                    const min = pr.min
                    const max = pr.max

                    return (
                      <li key={idx} className={styles.progressItem}>
                        <div>
                          <strong className={styles.rowTitle}>{fmtBig(min)}-{fmtBig(max)}</strong>
                          <span className={styles.rowMeta}>
                            {s} sold out of {inv} for sale · {n} new
                          </span>
                        </div>

                        <div className={styles.barTrack}>
                          <i
                            className={`${styles.barFill} ${kind === "buyer"
                              ? styles.barFillBuyer
                              : kind === "balanced"
                                ? styles.barFillBalanced
                                : styles.barFillSeller
                              }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        <div className={styles.rowRight}>
                          <span
                            className={`${styles.pill} ${kind === "buyer"
                              ? styles.pillBuyer
                              : kind === "balanced"
                                ? styles.pillBalanced
                                : styles.pillSeller
                              }`}
                          >
                            {kind === "buyer"
                              ? `Buyer's ${ratio}%`
                              : kind === "balanced"
                                ? `Balanced ${ratio}%`
                                : `Seller's ${ratio}%`}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {/* Section: Neighbourhoods */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>{regionCapitalize(region)} neighbourhoods: homes sold in {monthName}</h2>
              <p className={styles.leadText}>
                Local market conditions by neighbourhood. Explore which areas have the highest buyer demand or offer the most negotiation leverage.
              </p>

              {/* Neighbourhood Split Bar */}
              <div className={styles.cardBox}>
                <div className={styles.subHeading}>
                  Neighbourhood market balance ({nbSplit.total} neighbourhoods)
                </div>
                <div className={styles.splitBar} role="img" aria-label="Neighbourhood split">
                  {nbSplit.buyerPct > 0 && (
                    <i
                      className={styles.splitBuyer}
                      style={{ width: `${nbSplit.buyerPct}%` }}
                      title={`Buyer's: ${nbSplit.buyer} neighbourhoods (${nbSplit.buyerPct}%)`}
                    />
                  )}
                  {nbSplit.balancedPct > 0 && (
                    <i
                      className={styles.splitBalanced}
                      style={{ width: `${nbSplit.balancedPct}%` }}
                      title={`Balanced: ${nbSplit.balanced} neighbourhoods (${nbSplit.balancedPct}%)`}
                    />
                  )}
                  {nbSplit.sellerPct > 0 && (
                    <i
                      className={styles.splitSeller}
                      style={{ width: `${nbSplit.sellerPct}%` }}
                      title={`Seller's: ${nbSplit.seller} neighbourhoods (${nbSplit.sellerPct}%)`}
                    />
                  )}
                </div>

                <ul className={styles.splitKeyList}>
                  <li className={styles.splitKeyItem}>
                    <i style={{ background: "var(--buyer)", borderRadius: 4, height: 16, width: 16 }} />
                    <span>Buyer&apos;s market (&lt;12% sold)</span>
                    <span className="text-gray-500 font-medium lg:text-right col-2 lg:col-3">
                      {nbSplit.buyer} areas ({nbSplit.buyerPct}%)
                    </span>
                  </li>
                  <li className={styles.splitKeyItem}>
                    <i style={{ background: "var(--balanced)", borderRadius: 4, height: 16, width: 16 }} />
                    <span>Balanced market (12–20% sold)</span>
                    <span className="text-gray-500 font-medium lg:text-right col-2 lg:col-3">
                      {nbSplit.balanced} areas ({nbSplit.balancedPct}%)
                    </span>
                  </li>
                  <li className={styles.splitKeyItem}>
                    <i style={{ background: "var(--seller)", borderRadius: 4, height: 16, width: 16 }} />
                    <span>Seller&apos;s market (&gt;20% sold)</span>
                    <span className="text-gray-500 font-medium lg:text-right col-2 lg:col-3">
                      {nbSplit.seller} areas ({nbSplit.sellerPct}%)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Top Picks Side by Side */}
              <div className={`${styles.twoCol} mt-4`}>
                {/* Selling Fastest */}
                <div className={styles.cardBox}>
                  <div className={styles.cardTitle}>
                    <span className={`${styles.iconCircle} ${styles.icSeller}`}>▲</span>
                    Selling fastest
                  </div>
                  <p className="text-sm text-gray-500 -mt-2 mb-3">
                    Highest percentage of inventory sold. Expect tight competition.
                  </p>
                  <ul className={styles.picksList}>
                    {hotNeighbourhoods.length > 0 ? (
                      hotNeighbourhoods.map((n: any, idx: number) => (
                        <li key={idx} className={styles.picksItem}>
                          <div>
                            <strong>{n.name}</strong>
                            <div className="text-xs text-gray-500">
                              {n.sold} sold out of {n.inventory}
                            </div>
                          </div>
                          <span className={`${styles.pill} ${styles.pillSeller}`}>
                            {n.ratio}% sold
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="py-3 text-sm text-gray-500 italic">
                        No neighbourhoods with sufficient sales this period
                      </li>
                    )}
                  </ul>
                </div>

                {/* Most Choice */}
                <div className={styles.cardBox}>
                  <div className={styles.cardTitle}>
                    <span className={`${styles.iconCircle} ${styles.icBuyer}`}>▼</span>
                    Most choice for buyers
                  </div>
                  <p className="text-sm text-gray-500 -mt-2 mb-3">
                    Highest inventory relative to sales. More room for negotiation.
                  </p>
                  <ul className={styles.picksList}>
                    {dealsNeighbourhoods.length > 0 ? (
                      dealsNeighbourhoods.map((n: any, idx: number) => (
                        <li key={idx} className={styles.picksItem}>
                          <div>
                            <strong>{n.name}</strong>
                            <div className="text-xs text-gray-500">
                              {n.sold} sold out of {n.inventory}
                            </div>
                          </div>
                          <span className={`${styles.pill} ${styles.pillBuyer}`}>
                            {n.ratio}% sold
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="py-3 text-sm text-gray-500 italic">
                        Ample selection across multiple areas
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* All Neighbourhoods List */}
              <div className="mt-8">
                <h3 className="font-serif text-2xl font-semibold mb-2">Every neighbourhood</h3>
                <p className={styles.subLead}>
                  Ranked from fastest-selling to slowest. Longer bars indicate faster-moving inventory.
                </p>

                <ul className={styles.progressList}>
                  {(showAllNeighbourhoods ? neighbourhoods : neighbourhoods.slice(0, 8)).map(
                    (n: any, idx: number) => {
                      const kind = getMarketType(n.ratio);
                      const barWidth = Math.min(100, Math.max(n.ratio, n.inventory > 0 ? 3 : 0));

                      return (
                        <li key={idx} className={styles.progressItem}>
                          <div>
                            <strong className={styles.rowTitle}>{n.name}</strong>
                            <span className={styles.rowMeta}>
                              {n.sold} sold out of {n.inventory} for sale · {n.new} new
                            </span>
                          </div>

                          <div className={styles.barTrack}>
                            <i
                              className={`${styles.barFill} ${kind === "buyer"
                                ? styles.barFillBuyer
                                : kind === "balanced"
                                  ? styles.barFillBalanced
                                  : styles.barFillSeller
                                }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>

                          <div className={styles.rowRight}>
                            <span
                              className={`${styles.pill} ${kind === "buyer"
                                ? styles.pillBuyer
                                : kind === "balanced"
                                  ? styles.pillBalanced
                                  : styles.pillSeller
                                }`}
                            >
                              {kind === "buyer"
                                ? `Buyer's ${n.ratio}%`
                                : kind === "balanced"
                                  ? `Balanced ${n.ratio}%`
                                  : `Seller's ${n.ratio}%`}
                            </span>
                          </div>
                        </li>
                      );
                    },
                  )}
                </ul>

                {neighbourhoods.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllNeighbourhoods((prev) => !prev)}
                    className={styles.moreBtn}
                  >
                    {showAllNeighbourhoods
                      ? "Show fewer"
                      : `Show all ${neighbourhoods.length} neighbourhoods`}
                  </button>
                )}
              </div>
            </section>

            {/* Section: By Number of Bedrooms */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>
                {regionCapitalize(region)} {currentPropertyConfig.display.toLowerCase()} sold by number of bedrooms
              </h2>
              <p className={styles.leadText}>
                Market dynamics often differ between smaller and larger properties.
              </p>

              {/* Donut Chart */}
              <div className={styles.cardBox}>
                <div className={styles.subHeading}>What buyers bought</div>
                <p className={styles.subLead}>
                  Share of sales in {monthName} by bedroom count.
                  {bedDonutData.topBed && (
                    <>
                      {" "}Homes with {bedDonutData.topBed.label} were the most common (
                      {bedDonutData.totalSold > 0
                        ? Math.round((bedDonutData.topBed.sold / bedDonutData.totalSold) * 100)
                        : 0}
                      %).
                    </>
                  )}
                </p>

                <div className={styles.vizGrid}>
                  <div className="flex justify-center">
                    <svg className={styles.donutSvg} viewBox="0 0 220 220" role="img">
                      {(() => {
                        const R0 = 80;
                        const C = 2 * Math.PI * R0;
                        let currentOffset = 0;

                        return bedrooms.map((b: any, ix: number) => {
                          const share = bedDonutData.totalSold > 0 ? b.sold / bedDonutData.totalSold : 0;
                          const dashLength = share * C;
                          const color = SEQ_COLORS[ix % SEQ_COLORS.length];
                          const strokeDasharray = `${Math.max(dashLength - 2, 0.5)} ${C - Math.max(dashLength - 2, 0.5)}`;
                          const strokeDashoffset = -currentOffset;
                          currentOffset += dashLength;

                          if (dashLength <= 0) return null;

                          return (
                            <circle
                              key={ix}
                              className={styles.donutSeg}
                              cx="110"
                              cy="110"
                              r={R0}
                              fill="none"
                              stroke={color}
                              strokeWidth="34"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              transform="rotate(-90 110 110)"
                            >
                              <title>
                                {b.label}: {b.sold} sold ({Math.round(share * 100)}%)
                              </title>
                            </circle>
                          );
                        });
                      })()}
                      <text
                        x="110"
                        y="106"
                        textAnchor="middle"
                        style={{
                          font: "600 32px 'Fraunces', Georgia, serif",
                          fill: "var(--ink)",
                        }}
                      >
                        {fmtNum(bedDonutData.totalSold)}
                      </text>
                      <text
                        x="110"
                        y="132"
                        textAnchor="middle"
                        style={{
                          font: "500 14px 'Figtree', sans-serif",
                          fill: "var(--muted)",
                        }}
                      >
                        homes sold
                      </text>
                    </svg>
                  </div>

                  <ul className={styles.legendList}>
                    {bedrooms.map((b: any, ix: number) => {
                      const share =
                        bedDonutData.totalSold > 0
                          ? Math.round((b.sold / bedDonutData.totalSold) * 100)
                          : 0;
                      const color = SEQ_COLORS[ix % SEQ_COLORS.length];
                      return (
                        <li key={ix} className={styles.legendRow}>
                          <i className={styles.legendDot} style={{ background: color }} />
                          <span className="font-medium text-gray-800">{b.label}</span>
                          <span className="text-gray-500 text-sm">{b.sold} sold</span>
                          <b className="font-semibold min-w-10 text-right">{share}%</b>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* 4 Bedroom Tiles */}
              <div className="mt-8">
                <div className={styles.subHeading}>Competition by bedrooms</div>
                <p className={styles.subLead}>
                  Inventory, sales volume, and sell rates by bedroom count.
                </p>

                <div className={styles.bedsGrid}>
                  {bedrooms.map((b: any, idx: number) => (
                    <div key={idx} className={styles.bedCard}>
                      <div className={styles.bedTitle}>{b.label}</div>
                      <b className={styles.bedSoldNumber}>{b.sold} sold</b>
                      <div className="text-xs text-gray-500 mb-2">
                        out of {b.inventory} for sale
                      </div>
                      <span
                        className={`${styles.pill} ${b.kind === "buyer"
                          ? styles.pillBuyer
                          : b.kind === "balanced"
                            ? styles.pillBalanced
                            : styles.pillSeller
                          }`}
                      >
                        {b.kind === "buyer"
                          ? "Buyer's market"
                          : b.kind === "balanced"
                            ? "Balanced market"
                            : "Seller's market"}
                      </span>
                      <div className="text-xs text-gray-500 mt-2">{b.pace}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section: Full Numbers Comparison Table */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>
                {regionCapitalize(region)} {currentPropertyConfig.display.toLowerCase()}: {thisMonthLabel} vs {lastMonthLabel}
              </h2>
              <p className={styles.leadText}>
                Direct year-over-year comparison of all core benchmark indicators.
              </p>

              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Measure</th>
                      <th className={styles.numCol}>{lastMonthLabel}</th>
                      <th className={styles.numCol}>{thisMonthLabel}</th>
                      <th className={styles.numCol}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Homes sold</td>
                      <td className={styles.numCol}>{fmtNum(lastYearMetrics.sold)}</td>
                      <td className={styles.numCol}>{fmtNum(thisYearMetrics.sold)}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = calcPctChange(thisYearMetrics.sold, lastYearMetrics.sold);
                          if (diff === null) return "no change";
                          return diff >= 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Homes for sale (end of month)</td>
                      <td className={styles.numCol}>{fmtNum(lastYearMetrics.inventory)}</td>
                      <td className={styles.numCol}>{fmtNum(thisYearMetrics.inventory)}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = calcPctChange(thisYearMetrics.inventory, lastYearMetrics.inventory);
                          if (diff === null) return "no change";
                          return diff >= 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>New listings</td>
                      <td className={styles.numCol}>{fmtNum(lastYearMetrics.newListings)}</td>
                      <td className={styles.numCol}>{fmtNum(thisYearMetrics.newListings)}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = calcPctChange(thisYearMetrics.newListings, lastYearMetrics.newListings);
                          if (diff === null) return "no change";
                          return diff >= 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Median sold price</td>
                      <td className={styles.numCol}>{fmtMoney(lastYearMetrics.medianPrice)}</td>
                      <td className={styles.numCol}>{fmtMoney(thisYearMetrics.medianPrice)}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = calcPctChange(thisYearMetrics.medianPrice, lastYearMetrics.medianPrice);
                          if (diff === null) return "no change";
                          return diff >= 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Median price per sq. ft.</td>
                      <td className={styles.numCol}>{fmtMoney(lastYearMetrics.pricePerSqft)}</td>
                      <td className={styles.numCol}>{fmtMoney(thisYearMetrics.pricePerSqft)}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = calcPctChange(thisYearMetrics.pricePerSqft, lastYearMetrics.pricePerSqft);
                          if (diff === null) return "no change";
                          return diff >= 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Sold price vs original asking</td>
                      <td className={styles.numCol}>{lastYearMetrics.soldToAsk.toFixed(1)}%</td>
                      <td className={styles.numCol}>{thisYearMetrics.soldToAsk.toFixed(1)}%</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = Math.round((thisYearMetrics.soldToAsk - lastYearMetrics.soldToAsk) * 10) / 10;
                          return diff >= 0 ? `▲ +${diff} pts` : `▼ ${diff} pts`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Homes sold over asking</td>
                      <td className={styles.numCol}>{lastYearMetrics.pctOverAsk.toFixed(1)}%</td>
                      <td className={styles.numCol}>{thisYearMetrics.pctOverAsk.toFixed(1)}%</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = Math.round((thisYearMetrics.pctOverAsk - lastYearMetrics.pctOverAsk) * 10) / 10;
                          return diff >= 0 ? `▲ +${diff} pts` : `▼ ${diff} pts`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Median days to sell</td>
                      <td className={styles.numCol}>{lastYearMetrics.dom}</td>
                      <td className={styles.numCol}>{thisYearMetrics.dom}</td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = thisYearMetrics.dom - lastYearMetrics.dom;
                          return diff >= 0 ? `▲ +${diff} days` : `▼ ${diff} days`;
                        })()}
                      </td>
                    </tr>

                    <tr>
                      <td>Sell rate (homes sold per 100 for sale)</td>
                      <td className={styles.numCol}>
                        <span className="mr-2">{Math.round(sellRateLast)}</span>
                        <span
                          className={`${styles.pill} ${marketTypeLast === "buyer"
                            ? styles.pillBuyer
                            : marketTypeLast === "balanced"
                              ? styles.pillBalanced
                              : styles.pillSeller
                            }`}
                        >
                          {marketTypeLast === "buyer"
                            ? "Buyer's"
                            : marketTypeLast === "balanced"
                              ? "Balanced"
                              : "Seller's"}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className="mr-2">{Math.round(sellRateThis)}</span>
                        <span
                          className={`${styles.pill} ${marketType === "buyer"
                            ? styles.pillBuyer
                            : marketType === "balanced"
                              ? styles.pillBalanced
                              : styles.pillSeller
                            }`}
                        >
                          {marketType === "buyer"
                            ? "Buyer's"
                            : marketType === "balanced"
                              ? "Balanced"
                              : "Seller's"}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        {(() => {
                          const diff = Math.round(sellRateThis - sellRateLast);
                          if (diff === 0) return "no change";
                          return diff > 0 ? `▲ +${diff}` : `▼ ${diff}`;
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section: How to read the market */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>How to read the market</h2>
              <p className={styles.leadText}>
                Every designation on this page originates from the sell rate: out of all active listings, what percentage completed a sale this month.
              </p>

              <div className={styles.readGrid}>
                <div className={styles.readCard}>
                  <span className={`${styles.pill} ${styles.pillBuyer}`}>Buyer&apos;s market</span>
                  <p className={styles.readText}>
                    Fewer than 12 homes sold for every 100 listed. High inventory gives buyers time, options, and negotiation room on price and subject conditions.
                  </p>
                </div>

                <div className={styles.readCard}>
                  <span className={`${styles.pill} ${styles.pillBalanced}`}>Balanced market</span>
                  <p className={styles.readText}>
                    Between 12 and 20 homes sold for every 100 listed. Neither buyer nor seller holds an overwhelming advantage. Pricing accuracy and condition decide the outcome.
                  </p>
                </div>

                <div className={styles.readCard}>
                  <span className={`${styles.pill} ${styles.pillSeller}`}>Seller&apos;s market</span>
                  <p className={styles.readText}>
                    More than 20 homes sold for every 100 listed. Strong buyer demand and constrained inventory lead to faster sales, multiple offers, and upward pricing momentum.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Frequently Asked Questions (FAQ) */}
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>{regionCapitalize(region)} real estate market questions</h2>
              <p className={styles.leadText}>Answers updated with this month&apos;s official data.</p>

              <div>
                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    <span>Is {regionCapitalize(region)} currently a buyer&apos;s or seller&apos;s market for {currentPropertyConfig.display.toLowerCase()}?</span>
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <p className={styles.faqAnswer}>
                    In {monthName} {thisYearMetrics.year}, {regionCapitalize(region)} {currentPropertyConfig.display.toLowerCase()} were in a{" "}
                    <strong>{marketTitle.toLowerCase()}</strong>. Out of every 100 homes for sale, about {Math.round(sellRateThis)} sold (
                    {fmtNum(thisYearMetrics.sold)} sales out of {fmtNum(thisYearMetrics.inventory)} available). When fewer than 12 out of 100 sell, it is a buyer&apos;s market.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    <span>What is the median sold price of a {currentPropertyConfig.label.toLowerCase()} in {regionCapitalize(region)}?</span>
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <p className={styles.faqAnswer}>
                    The median sold price was {fmtMoney(thisYearMetrics.medianPrice)} in {monthName} {thisYearMetrics.year}, compared to{" "}
                    {fmtMoney(lastYearMetrics.medianPrice)} in {monthName} {lastYearMetrics.year}. Half of the reported properties sold for more, and half for less.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    <span>How long does it take to sell in {regionCapitalize(region)}?</span>
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <p className={styles.faqAnswer}>
                    The typical home took approximately {thisYearMetrics.dom} days on market to sell in {monthName} {thisYearMetrics.year}, compared to{" "}
                    {lastYearMetrics.dom} days during the same month last year.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    <span>Are {regionCapitalize(region)} {currentPropertyConfig.display.toLowerCase()} selling over asking price?</span>
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <p className={styles.faqAnswer}>
                    Approximately {Math.round(thisYearMetrics.pctOverAsk)} out of 100 homes sold above the original list price in {monthName}{" "}
                    {thisYearMetrics.year}. Overall, buyers paid on average {thisYearMetrics.soldToAsk.toFixed(1)}% of the original asking price.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    <span>Which {regionCapitalize(region)} neighbourhoods have the highest sales activity?</span>
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <p className={styles.faqAnswer}>
                    {hotNeighbourhoods.length > 0
                      ? `The most active neighbourhoods include ${hotNeighbourhoods.map((n: any) => `${n.name} (${n.sold} sold)`).join(", ")}.`
                      : "Sales activity is evenly distributed across multiple neighbourhoods."}
                  </p>
                </details>
              </div>
            </section>

            {/* Section: CTA Banner */}
            <div className={styles.ctaBanner}>
              <div>
                <h2 className={styles.ctaTitle}>Thinking of buying or selling in {regionCapitalize(region)}?</h2>
                <p className={styles.ctaDesc}>
                  Tell us your neighbourhood and goals, and we will prepare a personalized valuation and recent comparable sales report for your specific property.
                </p>
              </div>

              <div className={styles.agentCard}>
                <b className={styles.agentName}>Harjit Sidhu</b>
                <small className={styles.agentRole}>
                  Personal Real Estate Corporation<br />
                  The Sidhu Team | Planet Group Realty Inc.
                </small>
                <a href="tel:7788962478" className={styles.ctaBtnGold}>
                  Call 778-896-2478
                </a>
                <a href="/properties" className={styles.ctaBtnLine}>
                  Browse active &amp; sold homes
                </a>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <footer className={styles.reportFooter}>
              Source: Real Estate Board MLS® System data, {regionCapitalize(region)}, {currentPropertyConfig.display.toLowerCase()}, {monthName} {thisYearMetrics.year}. Pending and completed sales are included. Small sample sizes in specific neighbourhoods or price tiers can create wider percentage swings. This market report is prepared for general informational purposes only and does not constitute financial or legal advice. Not intended to solicit properties or individuals already under active representation contracts.
            </footer>
          </main>
        </div>
      )}
    </div>
  );
}
