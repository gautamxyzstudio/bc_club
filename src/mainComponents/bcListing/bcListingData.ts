/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Listing details page: turns our API data into the shape the page design expects (bcListingEngine.js).
 * Every part is optional: when something is missing the page simply leaves that section out.
 */
import axios from "axios";
import { Endpoints } from "@/src/api/endpoints";
import { toOpenHouses } from "../bcNearbyMap/bcNearbyApi";

const num = (v: any) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const str = (v: any) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : v == null ? "" : String(v).trim());
const list = (v: any): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : typeof v === "string" && v.trim() ? v.split(/\s*,\s*/).filter(Boolean) : []);
const day = (v: any) => {
  const s = String(v ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};
const daysSince = (v: any) => { const d = day(v); if (!d) return undefined; return Math.max(0, Math.round((Date.now() - new Date(d + "T12:00:00").getTime()) / 864e5)); };

const lotSqft = (area: any, units: any) => {
  const a = num(area); if (!a) return 0;
  const u = String(units || "").toLowerCase();
  if (u.includes("acre")) return Math.round(a * 43560);
  if (u.includes("hect")) return Math.round(a * 107639);
  if (u.includes("metre") || u.includes("meter") || u === "m2" || u.includes("sqm")) return Math.round(a * 10.7639);
  return Math.round(a);
};

export type ListingKind = "sale" | "sold" | "fc";

/** Status for the page: active / drop (price drop) / sold */
function statusOf(p: any, kind: ListingKind) {
  const st = String(p?.standard_status || p?.status || "").toLowerCase();
  if (kind === "sold" || /closed|sold|pending/.test(st)) return "sold";
  if (num(p?.old_price) > num(p?.price) && num(p?.price) > 0) return "drop";
  return "active";
}

/** Our listing (real-estate-boards / forecloser-properties) -> the page's listing object */
export function toPageListing(p: any, kind: ListingKind = "sale") {
  const r = p?.raw_data && typeof p.raw_data === "object" ? p.raw_data : {};
  const status = statusOf(p, kind);
  const price = num(p?.price || r.ListPrice);
  const was = num(p?.old_price);
  const photos: string[] = (Array.isArray(p?.media_url) ? p.media_url : Array.isArray(p?.media) ? p.media.map((m: any) => (typeof m === "string" ? m : m?.MediaURL)) : []).filter(Boolean);
  const ownership = str(r.CommonInterest || r.Ownership || (p?.property_sub_type && /apartment|condo|town/i.test(p.property_sub_type) ? "Strata" : ""));
  const fee = num(r.AssociationFee);
  const strataish = /strata|condo/i.test(ownership) || fee > 0;
  const lotArea = lotSqft(p?.lot_size_area ?? r.LotSizeArea, p?.lot_size_units ?? r.LotSizeUnits) || num(r.LotSizeSquareFeet);
  const isHouse = !/apartment|condo/i.test(String(p?.property_sub_type || ""));
  const rooms = (Array.isArray(p?.rooms) ? p.rooms : Array.isArray(r.Rooms) ? r.Rooms : [])
    .map((x: any) => [str(x.RoomType || x.room_type), str(x.RoomLevel || x.room_level),
      str(x.RoomDimensions || x.room_dimensions || (x.RoomWidth || x.room_width ? `${x.RoomWidth || x.room_width} × ${x.RoomLength || x.room_length}` : ""))])
    .filter((x: string[]) => x[0]);
  const soldPrice = num(p?.close_price || r.ClosePrice);
  const listed = day(p?.Listing_contract_date || p?.OriginalEntryTimestamp || r.OriginalEntryTimestamp);
  const year = num(r.YearBuilt) || undefined;

  // MLS® history we know from the listing itself: listed, price changes, sold
  const history: any[] = [];
  const firstPrice = num(r.OriginalListPrice) || (was > price ? was : price);
  if (listed) history.push({ date: listed, event: "Listed", price: firstPrice });
  if (was && was !== price && p?.priceChangedAt) history.push({ date: day(p.priceChangedAt), event: price < was ? "Price drop" : "Price change", price });
  if (status === "sold" && soldPrice) history.push({ date: day(p?.soldDate || r.BCRES_SoldDate || r.CloseDate), event: "Sold", price: soldPrice });
  history.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return {
    id: String(p?.documentId || ""),
    mls: str(p?.listing_id || r.ListingId),
    status,
    address: str(p?.address || r.UnparsedAddress) || "Address not available",
    city: str(p?.city || r.City),
    area: str(p?.neighborhood || r.SubdivisionName || r.MLSAreaMinor),
    postal: str(p?.postal_code || r.PostalCode),
    lat: num(p?.latitude) || undefined,
    lng: num(p?.longitude) || undefined,
    price,
    priceWas: status === "drop" ? was : undefined,
    soldPrice: status === "sold" ? soldPrice || price : undefined,
    soldDate: status === "sold" ? day(p?.soldDate || r.BCRES_SoldDate || r.CloseDate) : undefined,
    type: str(p?.property_sub_type || r.PropertySubType || p?.structure_type),
    ownership: ownership || undefined,
    beds: p?.bedrooms ?? undefined,
    baths: p?.bathrooms ?? undefined,
    sqft: num(p?.Living_area || r.LivingArea) || undefined,
    year,
    taxes: num(p?.annual_tax || r.TaxAnnualAmount) || undefined,
    taxYear: num(r.TaxYear) || undefined,
    parking: str(r.ParkingTotal ? `${r.ParkingTotal} ${num(r.ParkingTotal) === 1 ? "space" : "spaces"}${list(r.ParkingFeatures).length ? " · " + list(r.ParkingFeatures).join(", ") : ""}` : list(r.ParkingFeatures).join(", ")) || undefined,
    heating: list(r.Heating).join(", ") || undefined,
    water: list(r.WaterSource).join(", ") || undefined,
    brokerage: str(p?.office_name || r.ListOfficeName || r.OfficeName) || undefined,
    listedOn: listed || undefined,
    daysOnMarket: num(r.DaysOnMarket || r.CumulativeDaysOnMarket) || daysSince(listed),
    photoCount: photos.length,
    photos,
    description: str(p?.public_remarks || r.PublicRemarks) || undefined,
    maintenance: strataish && fee ? fee : undefined,
    maintIncludes: strataish ? list(r.AssociationFeeIncludes) : [],
    strata: strataish ? {
      complex: str(r.BuildingName || r.BCRES_ComplexName || r.ComplexName) || undefined,
      plan: str(r.BCRES_StrataPlan || r.StrataPlan) || undefined,
      units: num(r.NumberOfUnitsInCommunity || r.BCRES_UnitsInDevelopment) || undefined,
      storeys: num(r.StoriesTotal || r.BCRES_StoreysInBuilding) || undefined,
      pets: str(list(r.PetsAllowed).join(", ")) || undefined,
      rentals: str(r.BCRES_RentalsAllowed || r.RentalRestrictions) || undefined,
      amenities: list(r.AssociationAmenities),
    } : undefined,
    lot: isHouse && lotArea ? {
      sqft: lotArea,
      front: num(r.FrontageLength) || undefined,
      depth: num(r.LotSizeDepth || r.BCRES_LotDepth) || undefined,
      zoning: str(r.Zoning || r.ZoningDescription) || undefined,
    } : undefined,
    rooms,
    history: history.length > 1 || status === "sold" ? history : [],
    openHouses: status === "sold" ? [] : toOpenHouses(p?.open_houses),
    pid: str(p?.pid || r.ParcelNumber) || undefined,
    market: toMarket(p?.marketReport),
  };
}

/** marketReport (findOne) -> the page's market snapshot */
function toMarket(m: any) {
  const s = m?.snapshot, k = m?.metrics;
  if (!s || !k?.medianPrice?.raw) return undefined;
  const per = num(s.gauge?.soldPer100);
  const pos = per < 12 ? (per / 12) * 33 : per <= 20 ? 33 + ((per - 12) / 8) * 33 : 66 + (Math.min(per - 20, 20) / 20) * 34;
  return {
    name: s.title, month: s.monthLabel, label: s.badge,
    pos: Math.round(pos), sold: per,
    median: num(k.medianPrice.raw), medianChange: num(k.medianPrice.diffPercent),
    days: num(k.daysToSell?.value), daysWas: num(k.daysToSell?.previousValue),
    paid: num(k.pricePaidVsAsking?.raw), over: num(k.soldOverAsking?.raw), overWas: num(k.soldOverAsking?.previousValue),
  };
}

/** Similar / recently sold homes (our similar endpoints) -> cards */
export function toCards(items: any[], sold = false) {
  return (items || []).slice(0, 8).map((h: any) => ({
    address: h.address || "",
    price: num(sold ? h.close_price || h.price : h.price),
    beds: h.bedrooms ?? 0, baths: h.bathrooms ?? 0, sqft: num(h.Living_area || h.area),
    km: h.distanceKm != null ? Number(h.distanceKm).toFixed(1) : "",
    photo: Array.isArray(h.media_url) ? h.media_url[0] : h.media_url || "",
    date: sold ? new Date(h.soldDate || h.ModificationTimestamp || Date.now()).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) : undefined,
    url: h.documentId ? `${sold ? "/sold-property-info/" : "/property-info/"}${h.documentId}` : "",
  })).filter((h: any) => h.price > 0);
}

/** BC Assessment for this home: same parcel (PID) first, else the closest one at the same spot; then its value history */
export async function loadAssessment(l: { lat?: number; lng?: number; pid?: string; address?: string }) {
  if (!l.lat || !l.lng) return undefined;
  const d = 0.0012;
  const res = await axios.get(Endpoints.getMapZoomAssignmentList, {
    params: { north: l.lat + d, south: l.lat - d, east: l.lng + d * 1.5, west: l.lng - d * 1.5, zoom: 18 },
  }).catch(() => null);
  const rows: any[] = res?.data?.data || [];
  if (!rows.length) return undefined;
  const pidKey = (x: any) => String(x || "").replace(/\D/g, "").replace(/^0+/, "");
  const pidOf = (row: any) => (Array.isArray(row.legal) ? row.legal[0]?.pid : row.legal?.pid);
  const kx = 111320 * Math.cos((l.lat * Math.PI) / 180);
  const dist = (row: any) => Math.hypot((num(row.longitude) - l.lng!) * kx, (num(row.latitude) - l.lat!) * 110540);
  const unitOf = (a: any) => String(a || "").trim().split(/\s+/)[0].toLowerCase();
  let hit = l.pid ? rows.find((row) => pidOf(row) && pidKey(pidOf(row)) === pidKey(l.pid)) : undefined;
  if (!hit) {
    // condos share one spot: match the unit / house number too
    const want = unitOf(l.address);
    const close = rows.filter((row) => dist(row) < 30).sort((a, b) => dist(a) - dist(b));
    hit = close.find((row) => unitOf(row.address) === want) || (close.length === 1 ? close[0] : undefined);
  }
  if (!hit) return undefined;
  const det = await axios.get(Endpoints.getPropertiesAssignmentDetails(hit.documentId)).then((x) => x.data).catch(() => null);
  const history = (Array.isArray(det?.valueHistory) ? det.valueHistory : [])
    .map((h: any) => [num(h.year), num(h.value)] as [number, number]).filter(([y, v]: [number, number]) => y && v)
    .sort((a: [number, number], b: [number, number]) => b[0] - a[0]);
  const total = num(det?.totalValue) || num(hit.price);
  if (!total) return undefined;
  const land = num(det?.landValue) || num(hit.landValue), building = num(det?.buildingValue) || num(hit.buildingValue);
  return {
    year: history[0]?.[0] || new Date().getFullYear(),
    total, land: land || undefined, building: building || undefined,
    history: history.length > 1 ? history : undefined,
    url: `/property-assessment/${hit.documentId}`,
  };
}

/** Commute & nearby + schools, worked out in the browser from the map's data (same rules as the map) */
let calcPromise: Promise<any> | null = null;
function loadScript(src: string) {
  return new Promise<void>((ok, bad) => {
    if (document.querySelector(`script[src="${src}"]`)) { ok(); return; }
    const s = document.createElement("script"); s.src = src; s.async = false; s.onload = () => ok(); s.onerror = () => bad(new Error("load " + src));
    document.head.appendChild(s);
  });
}
export async function loadNearby(lat?: number, lng?: number) {
  if (!lat || !lng) return undefined;
  if (!calcPromise) {
    calcPromise = loadScript("/bcnearby/bcnearby-data.js?v=20261113ae")
      .then(() => loadScript("/bcnearby/bcnearby-calc.js?v=20261113ae"))
      .then(() => (window as any).BCNearbyCalc)
      .catch((e) => { calcPromise = null; throw e; });
  }
  const calc = await calcPromise;
  return calc?.nearbyFor(lat, lng);
}
