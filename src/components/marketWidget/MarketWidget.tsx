/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MarketReportData,
  MarketWidgetProps,
  PriceRange,
  Neighbourhood,
  FormattedMarketReport,
} from "./types";

const DEFAULT_MAX_AGE = 3; // months

const MONTHS = [
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

const KL: Record<"buyer" | "balanced" | "seller", string> = {
  buyer: "Buyer's market",
  balanced: "Balanced market",
  seller: "Seller's market",
};

const KS: Record<"buyer" | "balanced" | "seller", string> = {
  buyer: "Buyer's",
  balanced: "Balanced",
  seller: "Seller's",
};

function slug(t: string): string {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+]+/g, "-")
    .replace(/^-|-$/g, "");
}

function typeKey(t: string): "townhouses" | "apartments" | "detached" {
  const s = String(t || "").toLowerCase();
  if (/town|row|duplex|triplex|fourplex/.test(s)) return "townhouses";
  if (/apart|condo/.test(s)) return "apartments";
  return "detached";
}

function num(n: number): string {
  return Math.round(n).toLocaleString("en-CA");
}

function big(n: number): string {
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(2) + "M"
    : "$" + Math.round(n / 1000) + "K";
}

function short(n: number): string {
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M"
    : "$" + Math.round(n / 1000) + "K";
}

function rangeLabel(min: number, max: number | null): string {
  if (min === 0 && max != null) return "Under " + short(max + 1);
  if (max == null) return short(min) + "+";
  return short(min) + "–" + short(max + 1);
}

function isNum(v: any): v is number {
  return typeof v === "number" && isFinite(v);
}

function ratioOf(
  r: { sold: number; inventory: number } | null | undefined,
): number {
  if (!r) return 0;
  if (!(r.inventory > 0)) return r.sold > 0 ? 100 : 0;
  return (r.sold / r.inventory) * 100;
}

function plural(n: number, one: string): string {
  return num(n) + " " + (Math.round(n) === 1 ? one : one + "s");
}

function monthsOld(ym: string): number {
  const p = String(ym || "").split("-");
  const now = new Date();
  return (now.getFullYear() - +p[0]) * 12 + (now.getMonth() - (+p[1] - 1));
}

function kindOf(x: number): "buyer" | "balanced" | "seller" {
  return x < 12 ? "buyer" : x <= 20 ? "balanced" : "seller";
}

function c100(v: number): string {
  return v > 0 && v < 0.5 ? "fewer than 1" : String(Math.round(v));
}

function chg(
  a: number | null | undefined,
  b: number | null | undefined,
): number | null {
  return isNum(a) && isNum(b) && b > 0 ? ((a - b) / b) * 100 : null;
}

function areaNames(r: MarketReportData): string[] {
  const n = [slug(r.areaShort), slug(r.region)];
  n.push(n[1].replace(/^city-of-/, ""), "city-of-" + n[0]);
  (r.aliases || []).forEach((x) => {
    n.push(slug(x));
  });
  return n;
}

function pick(
  data: MarketReportData | MarketReportData[],
  area: string,
  tk: string,
  maxAge: number = DEFAULT_MAX_AGE,
): MarketReportData | null {
  const list = Array.isArray(data) ? data : [data];
  const a = slug(area);
  return (
    list.find((r) => {
      return (
        r &&
        r.summary &&
        r.summary.thisYear &&
        isNum(r.summary.thisYear.sold) &&
        isNum(r.summary.thisYear.inventory) &&
        (r.summary.thisYear.sold > 0 || r.summary.thisYear.inventory > 0) &&
        /^\d{4}-\d{2}$/.test(r.month || "") &&
        monthsOld(r.month) <= maxAge &&
        r.areaShort &&
        r.propertyType &&
        (!a || areaNames(r).includes(a)) &&
        typeKey(r.propertyType) === tk
      );
    }) || null
  );
}

function autoGroupFrom(rows: PriceRange[]): number | null {
  if (rows.length <= 8) return null;
  const tot = rows.reduce((a, r) => a + r.inventory, 0);
  let acc = 0;
  if (!tot) return null;
  for (let t = rows.length - 1; t > 0; t--) {
    acc += rows[t].inventory;
    if (acc / tot >= 0.15) return t < rows.length - 1 ? rows[t].min : null;
  }
  return null;
}

function groupFor(D: MarketReportData, price: number): PriceRange | null {
  const rows = (D.priceRanges || [])
    .filter((r) => r && isNum(r.min) && isNum(r.sold) && isNum(r.inventory))
    .sort((a, b) => a.min - b.min);
  const st = D.settings || {};
  const from =
    st.groupPricesFrom != null ? st.groupPricesFrom : autoGroupFrom(rows);
  let top: PriceRange | null = null;
  const out: PriceRange[] = [];
  rows.forEach((r) => {
    if (from && r.min >= from) {
      top = top || { min: from, max: null, sold: 0, inventory: 0, new: 0 };
      top.sold += r.sold;
      top.inventory += r.inventory;
      top.new = (top.new || 0) + (r.new || 0);
    } else {
      out.push({
        min: r.min,
        max: r.max,
        sold: r.sold,
        inventory: r.inventory,
        new: r.new,
      });
    }
  });
  if (top) out.push(top);
  const g =
    out.find((x) => price >= x.min && (x.max == null || price <= x.max)) ||
    null;
  return g && g.inventory + g.sold >= 8 ? g : null;
}

function nbFor(
  D: MarketReportData,
  name: string | null | undefined,
): Neighbourhood | null {
  if (!name) return null;
  const s = slug(name);
  const list = D.neighbourhoods || [];
  return (
    list.find(
      (n) =>
        slug(n.slug || n.name) === s ||
        slug(n.name) === s ||
        (n.aliases || []).some((x) => slug(x) === s),
    ) ||
    list.find((n) => {
      const x = slug(n.name);
      return x.indexOf(s) === 0 || s.indexOf(x) === 0;
    }) ||
    null
  );
}

function buildUrl(
  D: MarketReportData,
  tpl: string | undefined,
  prm: Record<string, any>,
): string | null {
  if (!tpl) return null;
  const v: Record<string, string> = {
    area: slug(D.areaShort),
    type: slug(D.propertyType),
    month: D.month,
    neighbourhood: "",
    min: "",
    max: "",
    beds: "",
  };
  for (const k in prm) {
    v[k] = prm[k] == null ? "" : String(prm[k]);
  }
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    encodeURIComponent(v[k] != null ? v[k] : ""),
  );
}

export const MarketWidget: React.FC<MarketWidgetProps> = ({
  marketReport,
  data,
  property,
  area = "",
  propertyType = "",
  neighbourhood = "",
  price,
  dataSrc,
  initialData = null,
  maxAgeMonths = 12,
  className = "",
  style,
  onStateChange,
}) => {
  // Resolve pre-formatted report if provided
  const directFormattedReport: FormattedMarketReport | null = useMemo(() => {
    const candidate = marketReport || data || property?.marketReport;
    if (!candidate) return null;

    // If candidate has nested candidate.marketReport, unwrap it
    const target =
      typeof candidate === "object" && candidate !== null && "marketReport" in candidate
        ? (candidate as any).marketReport
        : candidate;

    if (!target) return null;

    if (
      ("snapshot" in target && target.snapshot) ||
      ("metrics" in target && target.metrics) ||
      ("badge" in target && target.badge)
    ) {
      return target as FormattedMarketReport;
    }

    return null;
  }, [marketReport, data, property]);

  const [rawReport, setRawReport] = useState<MarketReportData | null>(
    directFormattedReport ? null : (initialData as MarketReportData | null),
  );
  const [loading, setLoading] = useState<boolean>(
    !directFormattedReport && !initialData && Boolean(dataSrc),
  );

  const cleanArea =
    area ||
    property?.city ||
    (typeof directFormattedReport?.snapshot?.area === "string"
      ? directFormattedReport.snapshot.area
      : "");

  const cleanPropertyType =
    propertyType ||
    property?.property_sub_type ||
    property?.property_type ||
    (typeof directFormattedReport?.snapshot?.propertyType === "string"
      ? directFormattedReport.snapshot.propertyType
      : "");

  const cleanNeighbourhood =
    neighbourhood ||
    property?.neighborhood ||
    property?.neighbourhood ||
    property?.raw_data?.SubdivisionName ||
    "";

  const rawPriceVal = price ?? property?.price ?? property?.close_price;
  const numericPrice =
    typeof rawPriceVal === "string"
      ? parseFloat(rawPriceVal.replace(/[^0-9.]/g, "")) || 0
      : Number(rawPriceVal || 0);

  const tk = typeKey(cleanPropertyType);

  // Dynamic Google Font Injection (Fraunces & Figtree)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector('link[href*="family=Fraunces"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Figtree:wght@400;600&display=swap";
    document.head.appendChild(link);
  }, []);

  // Fetch report if no direct pre-formatted report is provided and dataSrc or initialData is present
  useEffect(() => {
    if (directFormattedReport) {
      setLoading(false);
      onStateChange?.(true);
      return;
    }

    if (!dataSrc && !initialData) {
      setLoading(false);
      setRawReport(null);
      onStateChange?.(false);
      return;
    }

    let active = true;

    if (initialData && "summary" in initialData) {
      const picked = pick(initialData as MarketReportData, cleanArea, tk, maxAgeMonths);
      setRawReport(picked);
      setLoading(false);
      onStateChange?.(Boolean(picked));
      return;
    }

    // Check if global preloaded data is available on window
    if (typeof window !== "undefined" && (window as any).SIDHU_MARKET_DATA) {
      const picked = pick(
        (window as any).SIDHU_MARKET_DATA,
        cleanArea,
        tk,
        maxAgeMonths,
      );
      if (picked) {
        setRawReport(picked);
        setLoading(false);
        onStateChange?.(true);
        return;
      }
    }

    if (!dataSrc || !cleanArea || !tk) {
      setLoading(false);
      setRawReport(null);
      onStateChange?.(false);
      return;
    }

    const url = dataSrc
      .replace("{area}", encodeURIComponent(slug(cleanArea)))
      .replace("{type}", tk);

    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Report not found");
        return res.json();
      })
      .then((fetchedData) => {
        if (!active) return;
        const picked = pick(fetchedData, cleanArea, tk, maxAgeMonths);
        if (picked) {
          setRawReport(picked);
          onStateChange?.(true);
        } else {
          setRawReport(null);
          onStateChange?.(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setRawReport(null);
        onStateChange?.(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    directFormattedReport,
    cleanArea,
    tk,
    dataSrc,
    initialData,
    maxAgeMonths,
    onStateChange,
  ]);

  // Unified Render View Model
  const viewModel = useMemo(() => {
    // 1. Direct Pre-formatted Market Report (from backend response)
    if (directFormattedReport) {
      const fr = directFormattedReport;
      const snap = fr.snapshot;
      const metrics = fr.metrics;

      const title =
        snap?.title ||
        fr.title ||
        (cleanArea && cleanPropertyType
          ? `${cleanArea} ${cleanPropertyType}`
          : cleanArea || cleanPropertyType || "Local Market Snapshot");

      const eyebrow =
        snap?.eyebrow ||
        fr.eyebrow ||
        (snap?.monthLabel ? `MARKET SNAPSHOT · ${snap.monthLabel.toUpperCase()}` : "MARKET SNAPSHOT");

      const badge = snap?.badge || fr.badge || "";
      const marketType = (snap?.marketType ||
        fr.marketType ||
        "balanced") as "buyer" | "balanced" | "seller";
      const narrative = snap?.narrative || fr.narrative || "";

      const gaugeObj = snap?.gauge || fr.gauge;
      const soldPer100 = gaugeObj?.soldPer100 != null ? Number(gaugeObj.soldPer100) : 0;
      const gaugeLabel = gaugeObj?.label || (soldPer100 ? `Out of 100, ${soldPer100} sold` : "");

      const markerPercent = (Math.min(soldPer100, 30) / 30) * 100;
      const markerClass =
        soldPer100 < 7.5 ? "l" : soldPer100 > 22.5 ? "r" : "";

      const stats = [
        {
          title: metrics?.medianPrice?.label || "MEDIAN PRICE",
          val:
            metrics?.medianPrice?.value != null
              ? String(metrics.medianPrice.value)
              : fr.medianPrice?.value != null
                ? String(fr.medianPrice.value)
                : "—",
          sub:
            metrics?.medianPrice?.subtext ||
            fr.medianPrice?.subtext ||
            "",
        },
        {
          title: metrics?.daysToSell?.label || "DAYS TO SELL",
          val:
            metrics?.daysToSell?.value != null
              ? String(metrics.daysToSell.value)
              : fr.daysToSell?.value != null
                ? String(fr.daysToSell.value)
                : "—",
          sub:
            metrics?.daysToSell?.subtext ||
            fr.daysToSell?.subtext ||
            "",
        },
        {
          title: metrics?.pricePaidVsAsking?.label || "PRICE PAID VS ASKING",
          val:
            metrics?.pricePaidVsAsking?.value != null
              ? String(metrics.pricePaidVsAsking.value)
              : fr.pricePaidVsAsking?.value != null
                ? String(fr.pricePaidVsAsking.value)
                : "—",
          sub:
            metrics?.pricePaidVsAsking?.subtext ||
            fr.pricePaidVsAsking?.subtext ||
            "",
        },
        {
          title: metrics?.soldOverAsking?.label || "SOLD OVER ASKING",
          val:
            metrics?.soldOverAsking?.value != null
              ? String(metrics.soldOverAsking.value)
              : fr.soldOverAsking?.value != null
                ? String(fr.soldOverAsking.value)
                : "—",
          sub:
            metrics?.soldOverAsking?.subtext ||
            fr.soldOverAsking?.subtext ||
            "",
        },
      ];

      return {
        eyebrow,
        title,
        badge,
        marketType,
        narrative,
        gaugeLabel,
        markerPercent,
        markerClass,
        stats,
        neighbourhood: fr.neighbourhood || null,
        priceBracket: fr.priceBracket || null,
        vsText: fr.listingComparison?.text || null,
        ctaUrl: fr.cta?.url || null,
        ctaText: fr.cta?.text || `See the full ${title} report`,
        footerSource: fr.footer?.source || "",
      };
    }

    // 2. Computed from Raw Market Report (from JSON or sample data)
    if (!rawReport || !rawReport.summary || !rawReport.summary.thisYear) {
      return null;
    }

    const D = rawReport;
    const T = D.summary.thisYear;
    const L = D.summary.lastYear || ({} as any);
    const LK = D.links || {};

    const hasLY = L.inventory > 0 && isNum(L.sold);
    const hasPrice = T.sold > 0 && T.medianPrice > 0;
    const few = T.sold < 10;

    const p = (D.month || "").split("-");
    const monthIndex = +p[1] - 1;
    const mName =
      monthIndex >= 0 && monthIndex < 12
        ? `${MONTHS[monthIndex]} ${p[0]}`
        : D.month;
    const mOnly =
      monthIndex >= 0 && monthIndex < 12 ? MONTHS[monthIndex] : D.month;
    const lastLbl =
      monthIndex >= 0 && monthIndex < 12
        ? `${MONTHS[monthIndex].slice(0, 3)} ${+p[0] - 1}`
        : "Last Year";

    const type = (D.propertyType || "").toLowerCase();
    const A = D.areaShort || D.region || cleanArea;

    const R = ratioOf(T);
    const K = kindOf(R);
    const pc =
      hasLY && hasPrice && !few && L.sold >= 10
        ? chg(T.medianPrice, L.medianPrice)
        : null;

    let priceTxt =
      pc == null
        ? hasPrice
          ? `The median sold price was ${big(T.medianPrice)}.`
          : ""
        : Math.abs(pc) < 1.5
          ? "Prices are about the same as last year."
          : `Prices are ${pc < 0 ? "down " : "up "}${Math.abs(pc).toFixed(1)}% from last year.`;

    if (few && T.sold > 0) {
      priceTxt += ` Only ${plural(T.sold, "home")} sold, so read these numbers with care.`;
    }

    // Match neighbourhood
    let nbMatch = nbFor(D, cleanNeighbourhood);
    if (nbMatch && !(nbMatch.inventory > 0 || nbMatch.sold > 0)) nbMatch = null;

    // Match price group
    const gMatch = numericPrice ? groupFor(D, numericPrice) : null;

    // Comparison Sentence (vs)
    let vs = "";
    if (numericPrice && hasPrice && !few) {
      const d = chg(numericPrice, T.medianPrice);
      if (d !== null) {
        vs =
          Math.abs(d) < 3
            ? `This home is listed close to the median sold price for ${A} ${type} (${big(T.medianPrice)}).`
            : d >= 50
              ? `This home is listed at about ${(
                Math.round((numericPrice / T.medianPrice) * 10) / 10
              )
                .toString()
                .replace(/\.0$/, "")} times the median sold price for ${A} ${type} (${big(T.medianPrice)}).`
              : `This home is listed ${Math.abs(d).toFixed(0)}% ${d < 0 ? "below" : "above"
              } the median sold price for ${A} ${type} (${big(T.medianPrice)}).`;
      }
    }

    const sold = T.sold > 0;
    const NA = "Not enough sales";
    const stats = [
      {
        title: "Median price",
        val: hasPrice ? big(T.medianPrice) : "—",
        sub:
          pc == null
            ? hasPrice
              ? "Half sold for more, half for less"
              : NA
            : `${Math.abs(pc) < 0.05 ? "No change" : (pc > 0 ? "↑ " : "↓ ") + Math.abs(pc).toFixed(1) + "%"} vs ${lastLbl}`,
      },
      {
        title: "Days to sell",
        val: sold && isNum(T.dom) ? num(T.dom) : "—",
        sub:
          sold && isNum(T.dom)
            ? hasLY && L.sold > 0 && isNum(L.dom)
              ? `Was ${num(L.dom)} in ${lastLbl}`
              : "Typical time on the market"
            : NA,
      },
      {
        title: "Price paid vs asking",
        val: sold && isNum(T.soldToAsk) ? `${T.soldToAsk.toFixed(1)}%` : "—",
        sub:
          sold && isNum(T.soldToAsk)
            ? `About $${Math.round(T.soldToAsk)} for every $100 asked`
            : NA,
      },
      {
        title: "Sold over asking",
        val:
          sold && isNum(T.pctOverAsk)
            ? `${c100(T.pctOverAsk)} out of 100`
            : "—",
        sub:
          sold && isNum(T.pctOverAsk)
            ? hasLY && L.sold > 0 && isNum(L.pctOverAsk)
              ? `Was ${c100(L.pctOverAsk)} out of 100`
              : "Homes that sold above asking"
            : NA,
      },
    ];

    const markerPercent = (Math.min(R, 30) / 30) * 100;
    const markerClass = R < 7.5 ? "l" : R > 22.5 ? "r" : "";

    const neighbourhoodCard = nbMatch
      ? {
        title: `This neighbourhood: ${nbMatch.name}`,
        name: nbMatch.name,
        forSale: nbMatch.inventory,
        sold: nbMatch.sold,
        ratio: ratioOf(nbMatch),
        badge: KS[kindOf(ratioOf(nbMatch))],
        marketType: kindOf(ratioOf(nbMatch)),
        text:
          nbMatch.inventory > 0
            ? `Out of ${nbMatch.inventory} for sale, ${nbMatch.sold} sold in ${mOnly}${nbMatch.sold < 3 ? " · few sales, read with care" : ""}`
            : `${nbMatch.sold} sold, none left for sale in ${mOnly}`,
        urlSold: buildUrl(D, LK.sold, {
          neighbourhood: nbMatch.slug || slug(nbMatch.name),
        }),
        urlForSale: buildUrl(D, LK.forSale, {
          neighbourhood: nbMatch.slug || slug(nbMatch.name),
        }),
      }
      : null;

    const priceBracketCard =
      gMatch && (gMatch.inventory > 0 || gMatch.sold > 0)
        ? {
          label: `Homes priced ${rangeLabel(gMatch.min, gMatch.max).replace("Under", "under")}`,
          forSale: gMatch.inventory,
          sold: gMatch.sold,
          ratio: ratioOf(gMatch),
          badge: KS[kindOf(ratioOf(gMatch))],
          marketType: kindOf(ratioOf(gMatch)),
          text:
            gMatch.inventory > 0
              ? `Out of ${gMatch.inventory} for sale, ${gMatch.sold} sold in ${mOnly}${gMatch.sold < 3 ? " · few sales, read with care" : ""}`
              : `${gMatch.sold} sold, none left for sale in ${mOnly}`,
          urlSold: buildUrl(D, LK.sold, { min: gMatch.min, max: gMatch.max }),
          urlForSale: buildUrl(D, LK.forSale, {
            min: gMatch.min,
            max: gMatch.max,
          }),
        }
        : null;

    return {
      eyebrow: `Market snapshot · ${mName}`,
      title: `${A} ${type}`,
      badge: KL[K],
      marketType: K,
      narrative: `Out of every 100 ${type} for sale in ${A}, about ${c100(R)} sold in ${mOnly}. ${priceTxt}`,
      gaugeLabel: `Out of 100, ${c100(R)} sold`,
      markerPercent,
      markerClass,
      stats,
      neighbourhood: neighbourhoodCard,
      priceBracket: priceBracketCard,
      vsText: vs || null,
      ctaUrl: D.pageUrl || null,
      ctaText: `See the full ${A} ${type} report`,
      footerSource: `${D.source || "MLS® System data"}, ${mName}. Updated monthly.`,
    };
  }, [
    directFormattedReport,
    rawReport,
    cleanArea,
    cleanPropertyType,
    cleanNeighbourhood,
    numericPrice,
  ]);

  if (loading) {
    return (
      <div className={`sidhu-market animate-pulse ${className}`} style={style}>
        <div className="w min-h-90 bg-white rounded-[20px] border border-[#E6E0D6] p-6 flex flex-col justify-between">
          <div className="h-6 w-1/3 bg-slate-200 rounded-md" />
          <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-10 w-1/4 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (!viewModel) {
    return null;
  }

  const {
    eyebrow,
    title,
    badge,
    marketType,
    narrative,
    gaugeLabel,
    markerPercent,
    markerClass,
    stats,
    neighbourhood: nb,
    priceBracket: pb,
    vsText,
    ctaUrl,
    ctaText,
    footerSource,
  } = viewModel;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WIDGET_CSS }} />
      <div
        className={`sidhu-market ${className}`}
        data-state="shown"
        style={style}
      >
        <section className="w" aria-label={title}>
          {/* Header */}
          <div className="hd">
            <div className="top">
              <div>
                <div className="eb">{eyebrow}</div>
                <div className="tt">{title}</div>
              </div>
              <span className={`badge ${marketType}`}>{badge}</span>
            </div>

            <p className="sum">{narrative}</p>

            {/* Gauge */}
            <div className="gw">
              <div
                className="gauge"
                role="img"
                aria-label={`${gaugeLabel}: ${badge}`}
              >
                <i />
                <i />
                <i />
                <span
                  className={`mk ${markerClass}`}
                  style={{ left: `${markerPercent}%` }}
                >
                  <span>{gaugeLabel}</span>
                </span>
              </div>
              <div className="gl">
                <span>Buyer&apos;s</span>
                <span>Balanced</span>
                <span>Seller&apos;s</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bd">
            {/* 4 Stats Cards */}
            <div className="stats">
              {stats.map((s, idx) => (
                <div className="st" key={idx}>
                  <small>{s.title}</small>
                  <b>{s.val}</b>
                  <span>{s.sub}</span>
                </div>
              ))}
            </div>

            {/* Context Rows (Neighbourhood & Price Bracket) */}
            {(nb || pb) && (
              <div className="ctx">
                {nb && (
                  <div className="cr">
                    <div className="crh">
                      <b>{nb.title || `This neighbourhood: ${nb.name}`}</b>
                      <span className={`pill ${nb.marketType || "buyer"}`}>
                        {nb.badge}
                      </span>
                    </div>
                    <div className="cm">
                      {"urlForSale" in nb && (nb as any).urlForSale ? (
                        <>
                          Out of{" "}
                          <Link
                            href={(nb as any).urlForSale}
                            className="dl"
                            title={`See ${title} for sale in ${nb.name}`}
                          >
                            {num(nb.forSale)} for sale
                          </Link>
                          ,{" "}
                          {(nb as any).urlSold ? (
                            <Link
                              href={(nb as any).urlSold}
                              className="dl"
                              title={`See sold ${title} in ${nb.name}`}
                            >
                              {num(nb.sold)} sold
                            </Link>
                          ) : (
                            `${num(nb.sold)} sold`
                          )}
                        </>
                      ) : (
                        nb.text
                      )}
                    </div>
                    <div
                      className="bar"
                      role="img"
                      aria-label={`${nb.title || nb.name}: out of ${nb.forSale} for sale, ${nb.sold} sold`}
                    >
                      <i
                        className={nb.marketType || "buyer"}
                        style={{
                          width: `${Math.max(
                            Math.min(((nb.ratio || 0) / 30) * 100, 100),
                            nb.sold ? 3 : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {pb && (
                  <div className="cr">
                    <div className="crh">
                      <b>{pb.label}</b>
                      <span className={`pill ${pb.marketType || "seller"}`}>
                        {pb.badge}
                      </span>
                    </div>
                    <div className="cm">
                      {"urlForSale" in pb && (pb as any).urlForSale ? (
                        <>
                          Out of{" "}
                          <Link
                            href={(pb as any).urlForSale}
                            className="dl"
                            title={`See homes for sale in this price range`}
                          >
                            {num(pb.forSale)} for sale
                          </Link>
                          ,{" "}
                          {(pb as any).urlSold ? (
                            <Link
                              href={(pb as any).urlSold}
                              className="dl"
                              title={`See sold homes in this price range`}
                            >
                              {num(pb.sold)} sold
                            </Link>
                          ) : (
                            `${num(pb.sold)} sold`
                          )}
                        </>
                      ) : (
                        pb.text
                      )}
                    </div>
                    <div
                      className="bar"
                      role="img"
                      aria-label={`${pb.label}: out of ${pb.forSale} for sale, ${pb.sold} sold`}
                    >
                      <i
                        className={pb.marketType || "seller"}
                        style={{
                          width: `${Math.max(
                            Math.min(((pb.ratio || 0) / 30) * 100, 100),
                            pb.sold ? 3 : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comparison Callout */}
            {vsText && <p className="vs">{vsText}</p>}

            {/* Footer */}
            <div className="ft">
              {ctaUrl ? (
                <Link className="btn" href={ctaUrl}>
                  {ctaText}
                </Link>
              ) : null}
              <span className="src">{footerSource}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MarketWidget;

/**
 * Exact CSS verbatim from widget-preview.html scoped to .sidhu-market
 */
const WIDGET_CSS = `
.sidhu-market {
  --ink: #0F2438;
  --navy2: #1D3B57;
  --card: #fff;
  --line: #E6E0D6;
  --muted: #5B6B7A;
  --gold: #FFC20E;
  --teal: #1B7F79;
  --paper: #FBF9F5;
  --buyer: #1B7F79;
  --buyer-bg: #E2F1EF;
  --buyer-ink: #0F4F4B;
  --balanced: #FFC20E;
  --balanced-bg: #FFF1BF;
  --balanced-ink: #5B4A00;
  --seller: #B4372B;
  --seller-bg: #FBE4E1;
  --seller-ink: #7E241B;
  display: block;
  margin: 28px 0;
  box-sizing: border-box;
}
.sidhu-market[data-flush] {
  margin: 0;
}
.sidhu-market * {
  box-sizing: border-box;
}
.sidhu-market .w {
  font: 400 16px/1.55 Figtree, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 36, 56, .06);
}
.sidhu-market .hd {
  background: linear-gradient(120deg, var(--ink), var(--navy2));
  color: #fff;
  padding: 20px 22px 18px;
  border-bottom: 4px solid var(--gold);
}
.sidhu-market .top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.sidhu-market .eb {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--gold);
}
.sidhu-market .tt {
  font: 600 24px/1.15 Fraunces, Georgia, serif;
  margin-top: 4px;
}
.sidhu-market .badge {
  font-weight: 600;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 999px;
  white-space: nowrap;
}
.sidhu-market .buyer {
  background: var(--buyer-bg);
  color: var(--buyer-ink);
}
.sidhu-market .balanced {
  background: var(--balanced-bg);
  color: var(--balanced-ink);
}
.sidhu-market .seller {
  background: var(--seller-bg);
  color: var(--seller-ink);
}
.sidhu-market .sum {
  margin: 12px 0 0;
  color: #E4ECF3;
  font-size: 15.5px;
  max-width: 62ch;
}
.sidhu-market .gw {
  margin-top: 30px;
  max-width: 420px;
}
.sidhu-market .gauge {
  position: relative;
  display: grid;
  grid-template-columns: 40% 26.67% 33.33%;
  height: 10px;
}
.sidhu-market .gauge i {
  display: block;
  height: 10px;
}
.sidhu-market .gauge i:nth-child(1) {
  background: var(--buyer);
  border-radius: 99px 0 0 99px;
}
.sidhu-market .gauge i:nth-child(2) {
  background: var(--balanced);
}
.sidhu-market .gauge i:nth-child(3) {
  background: var(--seller);
  border-radius: 0 99px 99px 0;
}
.sidhu-market .mk {
  position: absolute;
  top: -5px;
  width: 4px;
  height: 20px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 0 0 2px var(--ink);
  transform: translateX(-2px);
}
.sidhu-market .mk span {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.sidhu-market .mk.l span {
  left: -2px;
  transform: none;
}
.sidhu-market .mk.r span {
  left: auto;
  right: -2px;
  transform: none;
}
.sidhu-market .gl {
  display: grid;
  grid-template-columns: 40% 26.67% 33.33%;
  font-size: 11.5px;
  color: #C9D8E6;
  margin-top: 6px;
}
.sidhu-market .gl span:nth-child(2) {
  text-align: center;
}
.sidhu-market .gl span:nth-child(3) {
  text-align: right;
}
.sidhu-market .bd {
  padding: 18px 22px 20px;
}
.sidhu-market .stats {
  display: grid;
  grid-auto-flow:dense;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}
.sidhu-market .st {
  background: var(--paper);
  border-radius: 12px;
  padding: 12px 14px;
}
.sidhu-market .st small {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.sidhu-market .st b {
  display: block;
  font: 600 24px/1.15 Fraunces, Georgia, serif;
  color: var(--teal);
  margin-top: 4px;
}
.sidhu-market .st span {
  display: block;
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 2px;
  line-height: 1.35;
}
.sidhu-market .ctx {
  margin-top: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
}
.sidhu-market .cr {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}
.sidhu-market .cr:last-child {
  border-bottom: 0;
}
.sidhu-market .crh {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.sidhu-market .crh b {
  font-weight: 600;
}
.sidhu-market .pill {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.sidhu-market .cm {
  font-size: 14px;
  color: var(--muted);
  margin-top: 2px;
}
.sidhu-market .cm em {
  font-style: normal;
  color: var(--seller-ink);
}
.sidhu-market .bar {
  height: 8px;
  background: #EFEAE0;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 8px;
}
.sidhu-market .bar i {
  display: block;
  height: 100%;
  border-radius: 99px;
}
.sidhu-market .bar i.buyer {
  background: var(--buyer);
}
.sidhu-market .bar i.balanced {
  background: var(--balanced);
}
.sidhu-market .bar i.seller {
  background: var(--seller);
}
.sidhu-market .vs {
  font-size: 14.5px;
  margin: 14px 0 0;
  padding: 10px 14px;
  background: #FFF8E1;
  border-left: 4px solid var(--gold);
  border-radius: 0 10px 10px 0;
  color: #3D3516;
}
.sidhu-market a.dl {
  color: var(--teal);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sidhu-market a.dl:hover {
  color: var(--ink);
}
.sidhu-market .ft {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
}
.sidhu-market .btn {
  display: flex;
  background: var(--gold);
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 15px;
  height: max-content;
  transition: background 0.15s ease;
}
.sidhu-market .btn:hover {
  background: #FFD34D;
}
.sidhu-market .src {
  font-size: 12px;
  color: var(--muted);
}
.sidhu-market a:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
  border-radius: 6px;
}
`;
