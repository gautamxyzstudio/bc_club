/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/* ==========================================================================
   "Homes sold" section (replaces "Number of Sales Reported")
   Data: existing /api/real-estate-board/sales-reported endpoint via
   useGetSalesReported({ location, days }) where days = 12D | 1M | 3M | 6M.
   Each chartData row is one bar:
     { name, detached_sold, detached_listed, apartment_sold, apartment_listed,
       townhouse_sold, townhouse_listed }
   All styles live in homes-sold.css (every class prefixed .hs-).
   ========================================================================== */
import React, { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Poppins, Roboto_Condensed } from "next/font/google";
import { useGetSalesReported } from "@/src/hooks/listing/useListingQueries";
import "./homes-sold.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--hs-font-poppins",
  display: "swap",
});
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--hs-font-condensed",
  display: "swap",
});

type TypeKey = "det" | "town" | "apt";
type FilterKey = "all" | TypeKey;

const KEYS: TypeKey[] = ["det", "town", "apt"];

/* API field prefix + listings-page structureType value for each home type */
const TYPES: Record<
  FilterKey,
  { name: string; plural: string; api?: string; structureType?: string }
> = {
  all: { name: "All homes", plural: "homes" },
  det: { name: "Detached", plural: "detached homes", api: "detached", structureType: "Single Family" },
  town: { name: "Townhouse", plural: "townhouses", api: "townhouse", structureType: "Townhouse" },
  apt: { name: "Condo / Apt", plural: "condos", api: "apartment", structureType: "Apartment" },
};

type Period = { id: string; short: string; long: string; kind: "day" | "month" };
const PERIODS: Period[] = [
  { id: "12D", short: "12 days", long: "12 days", kind: "day" },
  { id: "1M", short: "1 month", long: "1 month", kind: "day" },
  { id: "3M", short: "3 mo", long: "3 months", kind: "month" },
  { id: "6M", short: "6 mo", long: "6 months", kind: "month" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Bucket = {
  name: string;
  short: string;
  partial?: boolean;
  sold: Record<TypeKey, number>;
  listed: Record<TypeKey, number>;
};

const num = (v: any) => (typeof v === "number" ? v : Number(v) || 0);
const sum = (a: number[]) => a.reduce((t, v) => t + v, 0);
const fmt = (n: number) => n.toLocaleString("en-CA");

/* Pull day / month / year out of whatever label the API sends
   ("2026-10-05", "Oct 5", "5 Oct", "Oct 2026", "October", ...) */
function parseLabel(raw: string): { d?: number; m?: number; y?: number } {
  const s = String(raw || "").trim();
  const iso = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (iso) return { y: +iso[1], m: +iso[2] - 1, d: iso[3] ? +iso[3] : undefined };
  const mi = MONTHS.findIndex((mo) => s.toLowerCase().includes(mo.toLowerCase()));
  const nums = (s.match(/\d+/g) || []).map(Number);
  const y = nums.find((n) => n > 1900);
  const d = nums.find((n) => n >= 1 && n <= 31);
  return { m: mi >= 0 ? mi : undefined, d, y };
}

function toBuckets(chartData: any[], period: Period): Bucket[] {
  const now = new Date();
  return (chartData || []).map((row: any, i: number, arr: any[]) => {
    const name = String(row?.name ?? "");
    const p = parseLabel(name);
    const sold = {} as Record<TypeKey, number>;
    const listed = {} as Record<TypeKey, number>;
    KEYS.forEach((k) => {
      sold[k] = num(row?.[`${TYPES[k].api}_sold`]);
      listed[k] = num(row?.[`${TYPES[k].api}_listed`]);
    });
    let short = name;
    let partial = false;
    if (period.kind === "day") {
      if (p.d !== undefined) short = String(p.d);
    } else {
      if (p.m !== undefined) short = MONTHS[p.m];
      const isLast = i === arr.length - 1;
      partial =
        isLast &&
        p.m === now.getMonth() &&
        (p.y === undefined || p.y === now.getFullYear());
      if (partial) short += "*";
    }
    return { name: partial ? `${name} (so far)` : name, short, partial, sold, listed };
  });
}

function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

const Chev = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12304F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#21548B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export type HomesSoldProps = {
  cities: string[];
  defaultCity?: string;
  /** Number of most recent daily bars drawn lighter ("may still update"). 0 = off */
  lagDays?: number;
  className?: string;
};

export default function HomesSold({ cities, defaultCity = "Surrey", lagDays = 3, className = "" }: HomesSoldProps) {
  const uid = "hs" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wide = useIsWide();
  const [city, setCity] = useState(defaultCity);
  const [periodId, setPeriodId] = useState("1M");
  const [type, setType] = useState<FilterKey>("all");
  const [sel, setSel] = useState<number | null>(null);

  /* keep the selected city valid once the city list arrives */
  useEffect(() => {
    if (cities.length && !cities.includes(city)) setCity(cities.includes(defaultCity) ? defaultCity : cities[0]);
  }, [cities, city, defaultCity]);

  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[1];
  const params = useMemo(() => ({ location: city, days: period.id }), [city, period.id]);
  const { data: res, isLoading, isFetching, isError, refetch } = useGetSalesReported(params, {
    enabled: !!city,
    placeholderData: (prev: any) => prev,
  } as any);

  const summary = res?.data?.summary;
  const buckets = useMemo(() => toBuckets(res?.data?.chartData || [], period), [res, period]);

  const choosePeriod = (id: string) => {
    setPeriodId(id);
    setSel(null);
  };

  /* ---------- links into the existing /properties page ---------- */
  const soldHref = (k: FilterKey) => {
    const q = new URLSearchParams({ location: city, status: "sold" });
    if (TYPES[k].structureType) q.set("structureType", TYPES[k].structureType!);
    return `/properties?${q.toString()}`;
  };
  const listedHref = (k: FilterKey) => {
    const q = new URLSearchParams({ location: city });
    if (TYPES[k].structureType) q.set("structureType", TYPES[k].structureType!);
    return `/properties?${q.toString()}`;
  };

  /* ---------- header (always shown) ---------- */
  const header = (
    <div className="hs-head">
      <div>
        <div className="hs-eyebrow">Selling trends</div>
        <h2 className="hs-title" id={`${uid}-title`}>Homes sold</h2>
      </div>
      <div className="hs-controls">
        <div className="hs-select">
          <label className="hs-sr" htmlFor={`${uid}-city`}>City</label>
          <select
            id={`${uid}-city`}
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSel(null);
            }}
          >
            {(cities.length ? cities : [city]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown />
        </div>
        <div className="hs-tabs" role="group" aria-label="Time period">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" aria-pressed={p.id === period.id} onClick={() => choosePeriod(p.id)}>
              <span className="hs-short">{p.short}</span>
              <span className="hs-long">{p.long}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------- content ---------- */
  let content: React.ReactNode;

  if (isLoading && !res) {
    content = <div className="hs-loading" aria-label="Loading sales" />;
  } else if (isError && !res) {
    content = (
      <div className="hs-empty">
        <h3>Sales numbers are unavailable</h3>
        <p>Please try again in a few minutes.</p>
        <button type="button" onClick={() => refetch()}>Try again</button>
      </div>
    );
  } else {
    /* totals per type: prefer the API summary, fall back to summing the bars */
    const totals = {} as Record<FilterKey, { sold: number; listed: number }>;
    KEYS.forEach((k) => {
      const api = TYPES[k].api;
      const s = summary?.[`total_${api}_sold`];
      const l = summary?.[`total_${api}_listed`];
      totals[k] = {
        sold: s !== undefined ? num(s) : sum(buckets.map((b) => b.sold[k])),
        listed: l !== undefined ? num(l) : sum(buckets.map((b) => b.listed[k])),
      };
    });
    totals.all = {
      sold: summary?.sold !== undefined ? num(summary.sold) : sum(KEYS.map((k) => totals[k].sold)),
      listed: summary?.newListings !== undefined ? num(summary.newListings) : sum(KEYS.map((k) => totals[k].listed)),
    };

    const grand = totals.all.sold || sum(buckets.map((b) => sum(KEYS.map((k) => b.sold[k]))));

    if (!grand || !buckets.length) {
      content = (
        <div className="hs-empty">
          <h3>No sales reported yet</h3>
          <p>There are no recorded sales in {city} for this period yet.</p>
          {period.id !== "6M" && (
            <button type="button" onClick={() => choosePeriod("6M")}>Show last 6 months</button>
          )}
        </div>
      );
    } else {
      const n = buckets.length;
      const active = type === "all" ? KEYS : [type];
      const series = buckets.map((b) => sum(active.map((k) => b.sold[k])));
      const totSold = totals[type].sold;
      const max = Math.max(1, ...series);
      const selIdx = sel === null ? n - 1 : Math.min(sel, n - 1);
      const dense = n > 20;
      const mid = n > 10 && !dense;
      const every = !wide && dense ? 5 : 1;
      const maxH = wide ? 200 : 90;
      const lag = period.kind === "day" ? lagDays : 0;
      const T = TYPES[type];
      const scale = Math.max(totals.all.listed, totals.all.sold, 1);

      const notes: string[] = [];
      if (lag) notes.push(`Lighter bars: last ${lag} days may still update`);
      if (period.kind === "month" && buckets[n - 1].partial) notes.push("* month so far");

      content = (
        <div className={`hs-body${isFetching ? " is-fetching" : ""}`}>
          <div>
            <Link className="hs-hero" href={soldHref(type)} aria-label={`See the ${fmt(totSold)} sold ${T.plural}`}>
              <b>{fmt(totSold)}</b>
              <span>{T.plural} sold</span>
              <Chev />
            </Link>

            <div className={`hs-chart hs-f-${type}${dense ? " is-dense" : ""}${mid ? " is-mid" : ""}`}>
              {series.map((v, i) => {
                const b = buckets[i];
                const on = i === selIdx;
                const recent = i >= n - lag;
                const h = Math.max(4, Math.round((v / max) * maxH));
                const showLabel = (n - 1 - i) % every === 0;
                return (
                  <button
                    key={`${b.name}-${i}`}
                    type="button"
                    className={`hs-col${recent ? " is-recent" : ""}`}
                    aria-pressed={on}
                    aria-label={`${b.name}: ${v} ${T.plural} sold${recent ? " (may still update)" : ""}`}
                    onClick={() => setSel(i)}
                  >
                    <span className="hs-val">{v}</span>
                    <span className="hs-bar" style={{ height: h }} />
                    <span className="hs-lab">{showLabel ? b.short : ""}</span>
                  </button>
                );
              })}
            </div>

            <div className="hs-caption">
              <strong>
                {buckets[0].name.replace(" (so far)", "")} – {buckets[n - 1].name.replace(" (so far)", "")}
              </strong>
              {notes.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="hs-side">
            <div className="hs-side-head">
              <strong>Sold vs. listed</strong>
              <span>Tap to filter</span>
            </div>

            {(["all", ...KEYS] as FilterKey[]).map((k) => {
              const t = totals[k];
              const on = type === k;
              const pl = TYPES[k].plural;
              return (
                <div
                  key={k}
                  className={`hs-row hs-t-${k}${on ? " is-on" : ""}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) return;
                    setType(k);
                  }}
                >
                  <button type="button" className="hs-row-name" aria-pressed={on}>
                    <span className="hs-dot" />
                    {TYPES[k].name}
                  </button>
                  <span className="hs-grid">
                    <span className="hs-k">Sold</span>
                    <span className="hs-track">
                      <i className="is-sold" style={{ width: `${Math.max(2, Math.round((t.sold / scale) * 100))}%` }} />
                    </span>
                    <Link className="hs-v hs-link" href={soldHref(k)} aria-label={`See the ${fmt(t.sold)} sold ${pl}`}>
                      {fmt(t.sold)}
                      <Chev />
                    </Link>
                    <span className="hs-k is-listed">Listed</span>
                    <span className="hs-track">
                      <i className="is-listed" style={{ width: `${Math.max(2, Math.round((t.listed / scale) * 100))}%` }} />
                    </span>
                    <Link className="hs-v hs-link is-listed" href={listedHref(k)} aria-label={`See ${pl} listed for sale`}>
                      {fmt(t.listed)}
                      <Chev />
                    </Link>
                  </span>
                </div>
              );
            })}

            <Link className="hs-cta" href={soldHref(type)}>
              See the {fmt(totSold)} sold {T.plural} <Arrow />
            </Link>
            <Link className="hs-more" href="/market-trends/monthly-sales-reports">
              Custom date range &amp; monthly reports
            </Link>
            <p className="hs-source">Source: Fraser Valley Real Estate Board</p>
          </div>
        </div>
      );
    }
  }

  return (
    <section
      className={`hs ${poppins.variable} ${robotoCondensed.variable} ${className}`}
      aria-labelledby={`${uid}-title`}
    >
      {header}
      <div className="hs-content" aria-live="polite">
        {content}
      </div>
    </section>
  );
}
