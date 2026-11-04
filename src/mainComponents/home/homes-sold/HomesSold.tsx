/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/* ==========================================================================
   "Homes sold" section (replaces "Number of Sales Reported")

   Every view is worked out from DAILY numbers, the same way as the design demo:
     15 days  -> last 15 days, one bar per day
     1 month  -> last 30 days, one bar per day
     3 / 6 months -> one bar per calendar month (daily numbers added up);
                     an unfinished month is marked "*" / "month so far"

   Data: existing /api/real-estate-board/sales-reported endpoint
   (useGetSalesReported). We ask for days=6M&full=1 once (full=1 = every
   calendar day, zero-filled; added to the Strapi salesReported handler). Row:
     { name, detached_sold, detached_listed, apartment_sold, apartment_listed,
       townhouse_sold, townhouse_listed }
   If the server is still the old version (12 sampled dates per range), each
   period is requested on its own and the totals come from its summary.

   Public: no sign-in needed. Styles: homes-sold.css (classes prefixed .hs-).
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

/* API field prefix + /properties structureType value for each home type */
const TYPES: Record<FilterKey, { name: string; plural: string; api?: string; structureType?: string }> = {
  all: { name: "All homes", plural: "homes" },
  det: { name: "Detached", plural: "detached homes", api: "detached", structureType: "Single Family" },
  town: { name: "Townhouse", plural: "townhouses", api: "townhouse", structureType: "Townhouse" },
  apt: { name: "Condo / Apt", plural: "condos", api: "apartment", structureType: "Apartment" },
};

type Period = { id: string; api: string; short: string; long: string; kind: "day" | "month"; count: number };
const PERIODS: Period[] = [
  { id: "15d", api: "15D", short: "15 days", long: "15 days", kind: "day", count: 15 },
  { id: "1m", api: "1M", short: "1 month", long: "1 month", kind: "day", count: 30 },
  { id: "3m", api: "3M", short: "3 mo", long: "3 months", kind: "month", count: 3 },
  { id: "6m", api: "6M", short: "6 mo", long: "6 months", kind: "month", count: 6 },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Counts = Record<TypeKey, number>;
type Day = { y: number; m: number; d: number; sold: Counts; listed: Counts; missing?: boolean };
type Bucket = { name: string; short: string; partial?: boolean; missing?: boolean; y?: number; m?: number; d?: number; sold: Counts; listed: Counts };

const num = (v: any) => (typeof v === "number" ? v : Number(v) || 0);
const sum = (a: number[]) => a.reduce((t, v) => t + v, 0);
const fmt = (n: number) => n.toLocaleString("en-CA");
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const zero = (): Counts => ({ det: 0, town: 0, apt: 0 });

function rowCounts(row: any) {
  const sold = zero();
  const listed = zero();
  KEYS.forEach((k) => {
    sold[k] = num(row?.[`${TYPES[k].api}_sold`]);
    listed[k] = num(row?.[`${TYPES[k].api}_listed`]);
  });
  return { sold, listed };
}

/* Read day / month / year out of whatever label the API sends
   ("2026-10-05", "Oct 5", "5 Oct", "Oct 2026", "October", ...) */
function parseLabel(raw: any): { d?: number; m?: number; y?: number } {
  const s = String(raw ?? "").trim();
  const iso = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (iso) return { y: +iso[1], m: +iso[2] - 1, d: iso[3] ? +iso[3] : undefined };
  const lower = s.toLowerCase();
  const mi = MONTHS.findIndex((mo) => lower.includes(mo.toLowerCase()));
  const nums = (s.match(/\d+/g) || []).map(Number);
  const y = nums.find((n) => n > 1900);
  const d = nums.find((n) => n >= 1 && n <= 31);
  return { m: mi >= 0 ? mi : undefined, d, y };
}

/* Turn API rows into dated daily records (oldest first). Returns null if the
   rows are not daily (e.g. monthly buckets). Missing years are worked out by
   walking back from today. */
function toDays(rows: any[], minRows = 20): Day[] | null {
  if (!rows?.length || rows.length < minRows) return null;
  const parsed = rows.map((r) => ({ ...parseLabel(r?.date ?? r?.name), ...rowCounts(r) }));
  if (parsed.some((p) => p.m === undefined || p.d === undefined)) return null;
  const today = new Date();
  let year = parsed[parsed.length - 1].y ?? (parsed[parsed.length - 1].m! > today.getMonth() ? today.getFullYear() - 1 : today.getFullYear());
  const out: Day[] = [];
  for (let i = parsed.length - 1; i >= 0; i--) {
    const p = parsed[i];
    if (p.y) year = p.y;
    else if (i < parsed.length - 1 && p.m! > out[0].m) year -= 1; /* crossed back over New Year */
    out.unshift({ y: year, m: p.m!, d: p.d!, sold: p.sold, listed: p.listed });
  }
  return out;
}

/* Fill calendar days the API skipped (no activity) with zeros */
function fillGaps(days: Day[], markMissing = false): Day[] {
  if (days.length < 2) return days;
  const key = (y: number, m: number, d: number) => Date.UTC(y, m, d);
  const map = new Map(days.map((r) => [key(r.y, r.m, r.d), r]));
  const out: Day[] = [];
  const end = key(days[days.length - 1].y, days[days.length - 1].m, days[days.length - 1].d);
  for (let t = key(days[0].y, days[0].m, days[0].d); t <= end; t += 86400000) {
    const dt = new Date(t);
    out.push(map.get(t) || { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate(), sold: zero(), listed: zero(), missing: markMissing });
  }
  return out;
}

/* Same bucket logic as the design demo */
function bucketsFromDays(days: Day[], period: Period): Bucket[] {
  if (period.kind === "day") {
    /* exactly N calendar days ending on the latest day; a day the API did not
       send (old sampled server) is an empty slot, not a fake 0 */
    const last = days[days.length - 1];
    const byKey = new Map(days.map((r) => [Date.UTC(r.y, r.m, r.d), r]));
    const end = Date.UTC(last.y, last.m, last.d);
    return Array.from({ length: period.count }, (_, i) => {
      const t = end - (period.count - 1 - i) * 86400000;
      const dt = new Date(t);
      const r = byKey.get(t);
      const y = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
      return {
        name: `${MONTHS[m]} ${d}`, short: String(d), y, m, d,
        missing: !r || !!r.missing,
        sold: r ? r.sold : zero(), listed: r ? r.listed : zero(),
      };
    });
  }
  const byMonth = new Map<string, { y: number; m: number; last: number; sold: Counts; listed: Counts }>();
  days.forEach((r) => {
    const key = `${r.y}-${r.m}`;
    if (!byMonth.has(key)) byMonth.set(key, { y: r.y, m: r.m, last: 0, sold: zero(), listed: zero() });
    const b = byMonth.get(key)!;
    b.last = Math.max(b.last, r.d);
    KEYS.forEach((k) => {
      b.sold[k] += r.sold[k];
      b.listed[k] += r.listed[k];
    });
  });
  return Array.from(byMonth.values())
    .slice(-period.count)
    .map((b) => {
      const partial = b.last < daysInMonth(b.y, b.m);
      return {
        name: `${MONTHS_LONG[b.m]} ${b.y}${partial ? " (so far)" : ""}`,
        short: MONTHS[b.m] + (partial ? "*" : ""),
        partial, y: b.y, m: b.m, sold: b.sold, listed: b.listed,
      };
    });
}

/* Fallback when the API only gives pre-grouped rows */
function bucketsFromRows(rows: any[], period: Period): Bucket[] {
  const now = new Date();
  return rows.slice(-period.count).map((row, i, arr) => {
    const p = parseLabel(row?.name);
    const { sold, listed } = rowCounts(row);
    if (period.kind === "day") {
      return { name: String(row?.name ?? ""), short: p.d !== undefined ? String(p.d) : String(row?.name ?? ""), m: p.m, d: p.d, y: p.y, sold, listed };
    }
    const partial = i === arr.length - 1 && p.m === now.getMonth() && (p.y === undefined || p.y === now.getFullYear()) && now.getDate() < daysInMonth(now.getFullYear(), now.getMonth());
    const short = (p.m !== undefined ? MONTHS[p.m] : String(row?.name ?? "")) + (partial ? "*" : "");
    return { name: `${row?.name ?? ""}${partial ? " (so far)" : ""}`, short, partial, m: p.m, y: p.y ?? (p.m !== undefined ? now.getFullYear() : undefined), sold, listed };
  });
}

function captionFor(b: Bucket[], period: Period) {
  const a = b[0];
  const z = b[b.length - 1];
  if (a.m === undefined || z.m === undefined) return `${a.name.replace(" (so far)", "")} – ${z.name.replace(" (so far)", "")}`;
  if (period.kind === "day") {
    return `${MONTHS[a.m]} ${a.d ?? ""} – ${MONTHS[z.m]} ${z.d ?? ""}${z.y ? `, ${z.y}` : ""}`;
  }
  return `${MONTHS[a.m]}${a.y && z.y && a.y !== z.y ? ` ${a.y}` : ""} – ${MONTHS[z.m]}${z.y ? ` ${z.y}` : ""}`;
}

function updatedText(iso: any) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Updated today at ${d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}`;
  }
  return `Updated ${MONTHS[d.getMonth()]} ${d.getDate()}`;
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
  /** Most recent daily bars drawn lighter ("may still update"). 0 = off */
  lagDays?: number;
  className?: string;
};

export default function HomesSold({ cities, defaultCity = "Surrey", lagDays = 3, className = "" }: HomesSoldProps) {
  const uid = "hs" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wide = useIsWide();
  const [city, setCity] = useState(defaultCity);
  const [periodId, setPeriodId] = useState("1m");
  const [type, setType] = useState<FilterKey>("all");
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    if (cities.length && !cities.includes(city)) setCity(cities.includes(defaultCity) ? defaultCity : cities[0]);
  }, [cities, city, defaultCity]);

  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[1];

  /* One 6-month daily request feeds every view */
  const sixParams = useMemo(() => ({ location: city, days: "6M", full: "1" }), [city]);
  const six = useGetSalesReported(sixParams, { enabled: !!city, placeholderData: (prev: any) => prev } as any);
  const sixRows: any[] = useMemo(() => six.data?.data?.chartData || [], [six.data]);
  const days = useMemo(() => {
    const d = toDays(sixRows);
    return d ? fillGaps(d) : null;
  }, [sixRows]);

  /* Fallback for the old server (12 sampled dates): request this period on its
     own; bars use the sampled dates, totals use the API summary (all days). */
  const fallback = !!six.data && !days;
  const perParams = useMemo(() => ({ location: city, days: period.api, full: "1" }), [city, period.api]);
  const per = useGetSalesReported(perParams, { enabled: !!city && fallback, placeholderData: (prev: any) => prev } as any);

  const buckets = useMemo<Bucket[]>(() => {
    if (days) return bucketsFromDays(days, period);
    const rows: any[] = per.data?.data?.chartData || [];
    const d = toDays(rows, 1);
    return d ? bucketsFromDays(period.kind === "day" ? fillGaps(d, true) : fillGaps(d), period) : bucketsFromRows(rows, period);
  }, [days, period, per.data]);

  const active = fallback ? per : six;
  const res: any = active.data;
  const isLoading = active.isLoading && !res;
  const isError = active.isError && !res;
  const fallbackSummary = fallback ? per.data?.data?.summary : undefined;
  const updatedAt = six.data?.data?.updatedAt ?? six.data?.updatedAt;

  const choosePeriod = (id: string) => {
    setPeriodId(id);
    setSel(null);
  };

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

  let content: React.ReactNode;

  if (isLoading || (!res && !isError)) {
    content = <div className="hs-loading" aria-label="Loading sales" />;
  } else if (isError) {
    content = (
      <div className="hs-empty">
        <h3>Sales numbers are unavailable</h3>
        <p>Please try again in a few minutes.</p>
        <button type="button" onClick={() => active.refetch()}>Try again</button>
      </div>
    );
  } else {
    /* Totals are added up from the daily bars, so they match the chart.
       (Old-server fallback: use the API summary, which covers every day.) */
    const totals = {} as Record<FilterKey, { sold: number; listed: number }>;
    KEYS.forEach((k) => {
      const fs = fallbackSummary?.[`total_${TYPES[k].api}_sold`];
      const fl = fallbackSummary?.[`total_${TYPES[k].api}_listed`];
      totals[k] = {
        sold: fs !== undefined ? num(fs) : sum(buckets.map((b) => b.sold[k])),
        listed: fl !== undefined ? num(fl) : sum(buckets.map((b) => b.listed[k])),
      };
    });
    totals.all = { sold: sum(KEYS.map((k) => totals[k].sold)), listed: sum(KEYS.map((k) => totals[k].listed)) };

    if (!totals.all.sold || !buckets.length) {
      content = (
        <div className="hs-empty">
          <h3>No sales reported yet</h3>
          <p>There are no recorded sales in {city} for this period yet.</p>
          {period.id !== "6m" && (
            <button type="button" onClick={() => choosePeriod("6m")}>Show last 6 months</button>
          )}
        </div>
      );
    } else {
      const n = buckets.length;
      const act = type === "all" ? KEYS : [type];
      const series = buckets.map((b) => sum(act.map((k) => b.sold[k])));
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
      const source = ["Fraser Valley Real Estate Board data, counted daily by BCRealEstateMarket", updatedText(updatedAt)]
        .filter(Boolean)
        .join(" · ");

      content = (
        <div className={`hs-body${active.isFetching ? " is-fetching" : ""}`}>
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
                    aria-label={b.missing ? `${b.name}: no daily figure` : `${b.name}: ${v} ${T.plural} sold${recent ? " (may still update)" : ""}`}
                    onClick={() => setSel(i)}
                  >
                    <span className="hs-val">{b.missing ? "" : v}</span>
                    <span className="hs-bar" style={{ height: b.missing ? 0 : h }} />
                    <span className="hs-lab">{showLabel ? b.short : ""}</span>
                  </button>
                );
              })}
            </div>

            <div className="hs-caption">
              <strong>{captionFor(buckets, period)}</strong>
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
            <p className="hs-source">Source: {source}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <section className={`hs ${poppins.variable} ${robotoCondensed.variable} ${className}`} aria-labelledby={`${uid}-title`}>
      {header}
      <div className="hs-content" aria-live="polite">
        {content}
      </div>
    </section>
  );
}
