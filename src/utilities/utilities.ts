export const getCurrentYear = () => {
  const date = new Date();
  return date.getFullYear();
};

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type TimeFormatMode = "short" | "long";

const BC_TIMEZONE = "America/Vancouver";

export const getTime = (
  timestamp: string | number | Date,
  mode: TimeFormatMode = "long",
): string => {
  const now = dayjs().tz(BC_TIMEZONE);
  const target = dayjs.utc(timestamp).tz(BC_TIMEZONE);

  if (!target.isValid()) return "";

  const seconds = now.diff(target, "second");

  if (seconds < 0) return mode === "short" ? "now" : "just now";

  const minutes = now.diff(target, "minute");
  const hours = now.diff(target, "hour");
  const days = now.diff(target, "day");

  if (mode === "short") {
    if (seconds < 60) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;

    const months = now.diff(target, "month");
    if (months < 12) return `${months}mo`;

    const years = now.diff(target, "year");
    return `${years}y`;
  }

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const months = now.diff(target, "month");
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = now.diff(target, "year");
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

export const getDaysAgoTime = (
  timestamp: string | number | Date,
  mode: TimeFormatMode = "long",
): string => {
  const now = dayjs().tz(BC_TIMEZONE);
  const target = dayjs.utc(timestamp).tz(BC_TIMEZONE);

  if (!target.isValid()) return "";

  const seconds = now.diff(target, "second");

  if (seconds < 0) return mode === "short" ? "now" : "just now";

  const minutes = now.diff(target, "minute");
  const hours = now.diff(target, "hour");
  const days = now.diff(target, "day");

  if (mode === "short") {
    if (seconds < 60) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days === 1) return "yesterday";

  return `${days} day${days !== 1 ? "s" : ""}`;
};

export const getOfficeName = (listing: any): string => {
  const values = [
    listing?.office_name,
    listing?.OFFICE_NAME,
    listing?.OfficeName,
    listing?.officeName,
    listing?.office_data?.OfficeName,
    listing?.office_data?.name,
    listing?.brokerage,
    listing?.realtor_name,
    listing?.raw_data?.ListOfficeName,
    listing?.raw_data?.OfficeName,
  ];

  for (const val of values) {
    if (!val || typeof val !== "string") continue;

    const clean = val.trim();
    const lower = clean.toLowerCase();

    if (
      clean &&
      !["pending office name", "unknown office", "unknown", ""].includes(lower)
    ) {
      return clean;
    }
  }

  return "Office Not Available";
};

export function getDisplayPropertyType(listing: any): string {
  if (!listing) return "Property";

  const status = (listing?.standard_status || "Active").trim().toLowerCase();
  const isActive = status === "active" || status === "for sale";

  const rawType = (
    listing?.property_sub_type ||
    listing?.PropertySubType ||
    listing?.raw_data?.PropertySubType ||
    ""
  )
    .trim()
    .toLowerCase();

  if (!rawType) return "Property";

  if (isActive) {
    if (rawType.includes("single family") || rawType.includes("single-family"))
      return "Single-Family";
    if (rawType.includes("multi family") || rawType.includes("multi-family"))
      return "Multi-Family";
    if (rawType.includes("office")) return "Office";
    if (rawType.includes("business") || rawType.includes("commercial"))
      return "Business";
    if (rawType.includes("agriculture") || rawType.includes("farm"))
      return "Agriculture";
    if (rawType.includes("vacant land") || rawType.includes("land"))
      return "Vacant Land";

    return rawType
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (rawType.includes("condo") || rawType.includes("apartment"))
    return "Apartment/Condo";
  if (
    rawType.includes("single family") ||
    rawType.includes("house") ||
    rawType.includes("single family residence")
  )
    return "Single Family Residence";
  if (rawType.includes("half duplex") || rawType.includes("duplex"))
    return "Half Duplex";
  if (rawType.includes("row house") || rawType.includes("row"))
    return "Row House (Non-Strata)";
  if (rawType.includes("townhouse") || rawType.includes("townhome"))
    return "Townhouse";

  return "Property";
}

export function matchesPropertyFilter(
  listing: any,
  selectedType: string,
): boolean {
  if (!selectedType || selectedType.toLowerCase() === "any") return true;
  return (
    getDisplayPropertyType(listing).toLowerCase() ===
    selectedType.trim().toLowerCase()
  );
}

export const monthName = (range: string) => {
  return range === "12D"
    ? "last 12 days"
    : range === "1M"
      ? "last month"
      : range === "3M"
        ? "last 3 months"
        : range === "6M"
          ? "last 6 months"
          : range === "Custom"
            ? ""
            : "";
};

export const calculateAge = (yearBuilt?: string | number | null) => {
  const year = Number(yearBuilt);

  if (!year || Number.isNaN(year)) return null;

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  return age >= 0 ? age : null;
};

export const sqftToAcresFormatted = (sqft: number, decimals = 2): string => {
  if (!sqft || isNaN(sqft)) return "0";

  return (sqft / 43560).toFixed(decimals);
};
