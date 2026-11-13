/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * BC Nearby map ⇄ site API.
 * The map (public/bcnearby, inside an iframe) tells us what is on screen and which filters are on;
 * this file turns that into calls to our Strapi endpoints and turns the answers back into map data.
 */
import axios from "axios";
import { Endpoints } from "@/src/api/endpoints";

/* ------------------------------------------------------------------ types */

/** Filters as the map keeps them (bcNearby.flt.v2). 0 / "" / [] = not set. */
export type BCNFilters = {
  pmin?: number; pmax?: number;   // price
  amin?: number; amax?: number;   // living area (sq ft)
  lmin?: number; lmax?: number;   // lot size (sq ft)
  tmin?: number; tmax?: number;   // property tax ($/yr)
  fmin?: number; fmax?: number;   // strata fee (not on our API, hidden)
  smin?: number; smax?: number;   // price per sq ft (not on our API, hidden)
  beds?: number; baths?: number;  // "at least"
  types?: string[]; feats?: string[];
  city?: string; hood?: string; oh?: number;
};

export type BCNQuery = {
  north: number; south: number; east: number; west: number; zoom: number;
  filters: BCNFilters;
  kinds: string[];                 // active, drop, fc | sold, fcs | exp
  group: "sale" | "sold" | "exp";
  /** "Only open houses" is on: BC dates (YYYY-MM-DD) to look in, from the map (this weekend or next 7 days) */
  openHouse?: { from: string; to: string } | null;
};

/** One open house as the map shows it: { date: "2026-11-15", day: "Sun, Nov 15", time: "1:00 to 3:00 pm" } */
export type BCNOpenHouse = { date: string; day: string; time?: string; start?: string; end?: string };

export type BCNListing = {
  id: string; src: "reb" | "fc";
  lat: number; lng: number;
  kind: "active" | "drop" | "sold" | "fc" | "fcs" | "exp";
  priceText: string; price: string; priceNum: number;
  status: string; listed?: string;
  beds?: number; baths?: number; sqft?: number; lot?: number; tax?: number;
  type?: string; address?: string; city?: string; area?: string;
  features?: string[]; photo?: string; mls?: string; office?: string;
  openHouses?: BCNOpenHouse[];
};

export type BCNCluster = { lat: number; lng: number; count: number; zoom: number; kind?: string };

/* ------------------------------------------------------------------ helpers */

const num = (v: any) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** "$1.25M" / "$899K" for the price tag on the map */
export const shortPrice = (v: number) => {
  if (!v) return "";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace(/\.?0+$/, "") + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "K";
  return "$" + Math.round(v);
};
export const fullPrice = (v: number) => (v ? "$" + Math.round(v).toLocaleString("en-CA") : "");

const ago = (ts: any) => {
  const t = ts ? new Date(ts).getTime() : 0;
  if (!t || Number.isNaN(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 60) return m <= 1 ? "just now" : `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24); if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.round(d / 30); if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const y = Math.round(mo / 12); return `${y} year${y === 1 ? "" : "s"} ago`;
};

const lotSqft = (area: any, units: any) => {
  const a = num(area); if (!a) return 0;
  const u = String(units || "").toLowerCase();
  if (u.includes("acre")) return Math.round(a * 43560);
  if (u.includes("hect")) return Math.round(a * 107639);
  if (u.includes("metre") || u.includes("meter") || u === "m2" || u.includes("sqm")) return Math.round(a * 10.7639);
  return Math.round(a);
};

/** Filter keys used by the map -> values our API matches against property_sub_type (same as the site's Filters popup) */
const TYPE_MAP: Record<string, string> = {
  detached: "Single Family", townhouse: "Townhouse", duplex: "Duplex", apartment: "Apartment",
  multi: "Multi-Family", land: "Vacant Land", office: "Office", business: "Business",
  agri: "Agriculture", industrial: "Industrial",
};
const FEAT_MAP: Record<string, string> = {
  View: "view", Fireplace: "firePlace", Suite: "suite", Waterfront: "waterfront", Pool: "pool", Workshop: "workshop",
};

/** Map filters -> query params understood by /real-estate-board/map-zoom-clusters (and the foreclosure twin) */
export function toApiParams(q: BCNQuery): Record<string, any> {
  const f = q.filters || {};
  const p: Record<string, any> = { north: q.north, south: q.south, east: q.east, west: q.west, zoom: q.zoom };
  if (f.pmin) p.minPrice = f.pmin;
  if (f.pmax) p.maxPrice = f.pmax;
  if (f.amin) p.minSqft = f.amin;
  if (f.amax) p.maxSqft = f.amax;
  if (f.lmin) p.minLotSizeArea = f.lmin;
  if (f.lmax) p.maxLotSizeArea = f.lmax;
  if (f.tmin) p.minTax = f.tmin;
  if (f.tmax) p.maxTax = f.tmax;
  if (f.beds) p.minBeds = f.beds;
  if (f.baths) p.minBaths = f.baths;
  const types = (f.types || []).map((t) => TYPE_MAP[t]).filter(Boolean);
  if (types.length) p.structureType = types.join(",");
  const feats = (f.feats || []).map((x) => FEAT_MAP[x] || x.toLowerCase()).filter(Boolean);
  if (feats.length) p.features = feats.join(",");
  if (f.city) p.location = f.city;
  if (f.hood) p.neighborhood = f.hood;
  if (q.openHouse && q.group === "sale") { p.openHouseFrom = q.openHouse.from; p.openHouseTo = q.openHouse.to; }
  return p;
}

/* ------------------------------------------------------------------ open houses */

/** "13:00" / "1:00 PM" / "2026-11-15T13:00:00" -> "13:00" (BC local time) */
function hhmm(v: any): string {
  const t = String(v ?? "").trim(); if (!t) return "";
  const iso = /T(\d{2}):(\d{2})/.exec(t);
  if (iso) {
    // a full timestamp: show it in BC time
    const d = new Date(t);
    if (!Number.isNaN(d.getTime()) && /Z|[+-]\d{2}:?\d{2}$/.test(t)) {
      return new Intl.DateTimeFormat("en-GB", { timeZone: "America/Vancouver", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    }
    return `${iso[1]}:${iso[2]}`;
  }
  const m = /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?$/i.exec(t.replace(/\./g, ""));
  if (!m) return "";
  let h = Number(m[1]); const min = m[2] || "00", ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}
const ampm = (hm: string) => { const [h, m] = hm.split(":").map(Number); return { t: `${h % 12 || 12}:${String(m).padStart(2, "0")}`, ap: h >= 12 ? "pm" : "am" }; };
/** "13:00", "15:00" -> "1:00 to 3:00 pm" (same style as the map's sample cards) */
const timeRange = (start: string, end: string) => {
  const a = ampm(start), b = ampm(end);
  return a.ap === b.ap ? `${a.t} to ${b.t} ${b.ap}` : `${a.t} ${a.ap} to ${b.t} ${b.ap}`;
};

/** BC date of a value: "2026-11-15", or a timestamp shown in BC time */
function bcDate(v: any): string {
  const t = String(v ?? "").trim(); if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const d = new Date(t); if (Number.isNaN(d.getTime())) return "";
  if (!/T\d{2}:\d{2}/.test(t)) return t.slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/**
 * Open houses from a listing, whatever shape the feed used:
 * our API ({ date, start, end }), RESO / Bridge (OpenHouseDate, OpenHouseStartTime, OpenHouseEndTime, OpenHouseStatus)
 * or CREA DDF (StartDateTime / EndDateTime). Cancelled and past ones are dropped; soonest first.
 */
export function toOpenHouses(raw: any): BCNOpenHouse[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const today = bcDate(new Date().toISOString());
  const out: BCNOpenHouse[] = [];
  for (const o of list) {
    if (!o || typeof o !== "object") continue;
    if (/cancel/i.test(String(o.status ?? o.OpenHouseStatus ?? ""))) continue;
    const startRaw = o.start ?? o.startTime ?? o.OpenHouseStartTime ?? o.StartDateTime ?? o.StartTime;
    const endRaw = o.end ?? o.endTime ?? o.OpenHouseEndTime ?? o.EndDateTime ?? o.EndTime;
    const date = bcDate(o.date ?? o.OpenHouseDate ?? o.OpenHouseDateTime ?? startRaw);
    if (!date || date < today) continue;
    const start = hhmm(startRaw), end = hhmm(endRaw);
    const day = new Date(date + "T12:00:00Z").toLocaleDateString("en-CA", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
    out.push({ date, day, start: start || undefined, end: end || undefined,
      time: start && end ? timeRange(start, end) : start ? `from ${ampm(start).t} ${ampm(start).ap}` : undefined });
  }
  return out.sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")));
}

/* ------------------------------------------------------------------ listings */

function toListing(it: any, src: "reb" | "fc", group: BCNQuery["group"]): BCNListing | null {
  const lat = num(it.latitude), lng = num(it.longitude), price = num(it.price), old = num(it.old_price);
  if (!lat || !lng || !price) return null;
  const kind: BCNListing["kind"] =
    src === "fc" ? (group === "sold" ? "fcs" : "fc")
      : group === "sold" ? "sold" : group === "exp" ? "exp"
        : old > price ? "drop" : "active";
  const status = kind === "sold" || kind === "fcs" ? "Sold" : kind === "exp" ? "Expired" : kind === "fc" ? "Foreclosure" : kind === "drop" ? "Price drop" : "Active";
  const when = kind === "sold" || kind === "fcs" ? it.soldDate || it.ModificationTimestamp
    : kind === "drop" ? it.priceChangedAt || it.ModificationTimestamp
      : it.OriginalEntryTimestamp || it.ModificationTimestamp;
  return {
    id: String(it.documentId || it.id || `${lat},${lng}`), src, lat, lng, kind,
    priceText: shortPrice(price), price: fullPrice(price), priceNum: price, status,
    listed: ago(when) || undefined,
    beds: num(it.bedrooms) || undefined, baths: num(it.bathrooms) || undefined,
    sqft: num(it.Living_area ?? it.area) || undefined, lot: lotSqft(it.lot_size_area, it.lot_size_units) || undefined,
    tax: num(it.annual_tax) || undefined,
    type: it.property_sub_type || it.structure_type || undefined,
    address: it.address || undefined, city: it.city || undefined, area: it.neighborhood || undefined,
    features: Array.isArray(it.features) ? it.features : undefined,
    photo: (Array.isArray(it.media_url) ? it.media_url[0] : it.media_url) || undefined,
    mls: it.listing_id || undefined, office: it.office_name || undefined,
    openHouses: kind === "active" || kind === "drop" || kind === "fc" ? toOpenHouses(it.open_houses ?? it.openHouses) : undefined,
  };
}

type Source = { url: string; src: "reb" | "fc"; params: Record<string, any>; clusterKind?: string };

/** Which endpoints to ask for the kinds the visitor picked */
function sourcesFor(q: BCNQuery): Source[] {
  const base = toApiParams(q), k = new Set(q.kinds || []), out: Source[] = [];
  if (q.group === "sold") {
    if (k.has("sold")) out.push({ url: Endpoints.mapZoomWithClusters, src: "reb", params: { ...base, status: "closed" }, clusterKind: "sold" });
    if (k.has("fcs")) out.push({ url: Endpoints.getForecloserMapZoomWithClusters, src: "fc", params: { ...base, status: "Closed" }, clusterKind: "fc" });
  } else if (q.group === "exp") {
    out.push({ url: Endpoints.mapZoomWithClusters, src: "reb", params: { ...base, status: "expired" }, clusterKind: "exp" });
  } else {
    if (k.has("active") || k.has("drop")) out.push({ url: Endpoints.mapZoomWithClusters, src: "reb", params: base });
    if (k.has("fc")) out.push({ url: Endpoints.getForecloserMapZoomWithClusters, src: "fc", params: { ...base, status: "Active" }, clusterKind: "fc" });
  }
  return out;
}

/** Load homes + clusters for one map view. Cancels with the AbortSignal when the map moves again. */
export async function loadView(q: BCNQuery, signal?: AbortSignal) {
  const listings: BCNListing[] = [], clusters: BCNCluster[] = [];
  let total = 0;
  const results = await Promise.allSettled(sourcesFor(q).map(async (s) => {
    const res = await axios.get(s.url, { params: s.params, signal });
    return { s, body: res.data };
  }));
  for (const r of results) {
    if (r.status !== "fulfilled") { if (!axios.isCancel((r as any).reason)) console.warn("[BCNearby] listings", (r as any).reason?.message); continue; }
    const { s, body } = r.value;
    total += num(body?.count);
    for (const it of body?.data || []) {
      if (it?.isCluster) {
        const lat = num(it.latitude), lng = num(it.longitude);
        if (lat && lng) clusters.push({ lat, lng, count: num(it.pointCount), zoom: num(it.expansionZoom) || q.zoom + 2, kind: s.clusterKind });
      } else {
        const l = toListing(it, s.src, q.group); if (l) listings.push(l);
      }
    }
  }
  return { listings, clusters, total };
}

/* ------------------------------------------------------------------ search box */

export type BCNSearchResult = {
  kind: "listing" | "lot"; main: string; sub?: string; lat?: number; lon?: number;
  tag?: string; tagCls?: string; id: string; resolve?: () => Promise<{ lat: number; lon: number } | null>;
};

/** Find a BC Assessment property on the map (and hand its record to `onLotFound` so the lot card has it) */
export async function resolveLot(documentId: string, onLotFound?: (lot: any) => void) {
  const d = await axios.get(Endpoints.getPropertiesAssignmentDetails(documentId)).then((r) => r.data).catch(() => null);
  const lat = num(d?.latitude), lon = num(d?.longitude);
  if (!lat || !lon) return null;
  onLotFound?.(d);
  return { lat, lon };
}

/**
 * Our own listings (search-by-address) + BC Assessment properties, shown above the BC address results.
 * Small answers only (6 homes, 4 properties) so the box stays fast; `signal` cancels when the visitor keeps typing.
 */
export async function searchSite(
  q: string,
  opts: { signal?: AbortSignal; onLotFound?: (lot: any) => void } = {},
): Promise<BCNSearchResult[]> {
  const term = q.trim(); if (term.length < 3) return [];
  const { signal, onLotFound } = opts;
  const [reb, ass] = await Promise.allSettled([
    axios.post(Endpoints.getRealEstatePropertiesListByAddress, null, { params: { address: term, limit: 10 }, signal }),
    axios.get(Endpoints.getAssessmentPropertiesList, { params: { address: term, limit: 4 }, signal }),
  ]);
  const out: BCNSearchResult[] = [], ids = new Set<string>();
  if (reb.status === "fulfilled") {
    for (const it of reb.value.data?.data || []) {
      const id = String(it.documentId); if (ids.has(id)) continue; ids.add(id);   // draft + published rows: show once
      const price = num(it.price), st = String(it.status || "").toLowerCase(), sold = /closed|sold|pending/.test(st);
      const lat = num(it.latitude), lon = num(it.longitude);
      out.push({
        kind: "listing", id, main: it.address || "Listing",
        sub: [it.city, sold ? "Sold" : st.includes("expired") ? "Expired" : "For sale", it.property_sub_type].filter(Boolean).join(" · "),
        lat: lat || undefined, lon: lon || undefined,
        tag: price ? shortPrice(price) : undefined, tagCls: sold ? "sold" : num(it.old_price) > price ? "drop" : "",
      });
      if (out.length >= 6) break;
    }
  }
  if (ass.status === "fulfilled") {
    const seen = new Set(out.map((r) => r.main.toLowerCase()));
    for (const it of (ass.value.data?.data || []).slice(0, 4)) {
      if (!it?.address || seen.has(String(it.address).toLowerCase())) continue;
      out.push({
        kind: "lot", id: String(it.documentId), main: it.address, sub: "BC Assessment · not for sale", tag: "Lot", tagCls: "lot",
        resolve: () => resolveLot(String(it.documentId), onLotFound),
      });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ lots (BC Assessment + parcel outlines) */

export type AssessPoint = {
  documentId: string; roll?: string; address?: string; lat: number; lng: number;
  total: number; land: number; building: number; pid?: string; plan?: string;
};

export function toAssessPoint(it: any): AssessPoint | null {
  const lat = num(it.latitude), lng = num(it.longitude);
  if (!lat || !lng) return null;
  const legal = Array.isArray(it.legal) ? it.legal[0] : it.legal;
  return {
    documentId: String(it.documentId), roll: it.roll || undefined, address: it.address || undefined, lat, lng,
    total: num(it.price ?? it.totalValue), land: num(it.landValue), building: num(it.buildingValue),
    pid: legal?.pid || it.pid || undefined, plan: legal?.plan || undefined,
  };
}

export async function loadAssessPoints(q: Pick<BCNQuery, "north" | "south" | "east" | "west" | "zoom">, signal?: AbortSignal) {
  const res = await axios.get(Endpoints.getMapZoomAssignmentList, {
    params: { north: q.north, south: q.south, east: q.east, west: q.west, zoom: Math.max(q.zoom, 15) }, signal,
  });
  return (res.data?.data || []).map(toAssessPoint).filter(Boolean) as AssessPoint[];
}

export async function loadParcels(q: Pick<BCNQuery, "north" | "south" | "east" | "west" | "zoom">, signal?: AbortSignal) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await axios.get(`${base}/api/parcels/findGeoJSON`, {
    params: { north: q.north, south: q.south, east: q.east, west: q.west, zoom: q.zoom }, signal,
  });
  return res.data as { type: "FeatureCollection"; features: any[] };
}

/** Point in polygon (ring of [lng, lat]) */
const inRing = (lat: number, lng: number, ring: number[][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** The parcel outline under a point, as [[lat, lng], ...] (outer ring of the first polygon that holds it) */
export function parcelAt(fc: { features: any[] } | null, lat: number, lng: number) {
  for (const f of fc?.features || []) {
    const g = f?.geometry; if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      if (poly?.[0] && inRing(lat, lng, poly[0])) {
        return { pid: f.properties?.pid ? String(f.properties.pid) : undefined, outline: poly[0].map(([x, y]: number[]) => [y, x]) as [number, number][] };
      }
    }
  }
  return null;
}

const metres = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const kx = 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot((a.lng - b.lng) * kx, (a.lat - b.lat) * 110540);
};
const pidKey = (p?: string) => String(p || "").replace(/\D/g, "").replace(/^0+/, "");

/** Assessment record for a point: same parcel PID first, else the closest within `maxM` metres */
export function assessAt(points: AssessPoint[], lat: number, lng: number, pid?: string, maxM = 28) {
  if (pid) { const k = pidKey(pid); const hit = points.find((p) => p.pid && pidKey(p.pid) === k); if (hit) return hit; }
  let best: AssessPoint | null = null, bd = maxM;
  for (const p of points) { const d = metres(p, { lat, lng }); if (d < bd) { bd = d; best = p; } }
  return best;
}

/** Full assessment (value history, official land size) for the lot card */
export async function loadLotDetails(documentId: string) {
  const d = await axios.get(Endpoints.getPropertiesAssignmentDetails(documentId)).then((r) => r.data);
  const history = (Array.isArray(d?.valueHistory) ? d.valueHistory : [])
    .map((h: any) => [num(h.year), num(h.value)] as [number, number])
    .filter(([y, v]: [number, number]) => y && v)
    .sort((a: [number, number], b: [number, number]) => b[0] - a[0]);
  const prev = num(d?.previousTotalValue), total = num(d?.totalValue);
  if (!history.length && total) {
    const y = new Date().getFullYear();
    history.push([y, total]); if (prev) history.push([y - 1, prev]);
  }
  const landTxt = String(d?.propertyInfo?.["Land size"] || "");
  let landSqft = 0;
  const n = num(landTxt.split(/\s/)[0]);
  if (n) landSqft = /acre/i.test(landTxt) ? Math.round(n * 43560) : /m2|sq\.?\s*m|metre|meter/i.test(landTxt) ? Math.round(n * 10.7639) : Math.round(n);
  const out: Record<string, any> = {};
  if (history.length) { out.history = history; out.year = history[0][0]; }
  if (total) out.total = total;
  if (num(d?.landValue)) out.land = num(d.landValue);
  if (num(d?.buildingValue)) out.building = num(d.buildingValue);
  if (landSqft) out.landSqft = landSqft;
  return out;
}

/* ------------------------------------------------------------------ filters: locations */

export async function loadNeighbourhoods(city: string): Promise<string[]> {
  const r = await axios.get(Endpoints.getNeighborhoods(city)).then((x) => x.data).catch(() => null);
  const list = Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : [];
  return list.map((c: any) => (typeof c === "string" ? c : c?.neighborhood || c?.name)).filter(Boolean)
    .filter((h: string) => !/^all\b/i.test(h));
}
