/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Listing page SEO, built from each listing's own data (designer file "listing-details.html", Nov 13 P:
 * faqList, seoMeta and jsonLd), moved to the server so the questions, the title and the structured data
 * are in the first HTML Google reads.
 *
 *   listingTitle(l)       "1204 2350 Main Street, Vancouver · 2 Bed Condo for Sale"
 *   listingDescription(l) "$1,298,000 · 2 bed, 2 bath condo in Mount Pleasant VE. See the strata details, ..."
 *   listingFaq(l)         up to 6 questions that name the address (price, assessment, taxes/strata, schools, transit, flood, ...)
 *   listingJsonLd(l,url)  RealEstateListing + FAQPage (schema.org)
 *
 * Sold listings: sold prices are for signed-in members only (MLS® rules), so they never appear here.
 */

export type SeoListing = Record<string, any>;

const money = (n: any, d = 0) =>
  n == null || isNaN(Number(n)) ? "" : "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
const num = (n: any) => Number(n).toLocaleString("en-CA");
const has = (v: any) => v != null && v !== "" && !(Array.isArray(v) && !v.length);
const isSold = (l: SeoListing) => l.status === "sold";
const isCondo = (l: SeoListing) => /apartment|condo/i.test(l.type || "");
const minutes = (o: any) =>
  o?.walk != null ? `${o.walk}-minute walk` : o?.drive != null ? `${o.drive}-minute drive` : "";
const article = (s: string) => (/^(8|11|18|80)\b|^8\d-/.test(s) ? "an " : "a ") + s;

/** "Condo", "House", "Townhouse", ... from the listing type */
export function homeKind(l: SeoListing) {
  const t = String(l.type || "");
  if (/apartment|condo/i.test(t)) return "Condo";
  if (/town/i.test(t)) return "Townhouse";
  if (/duplex|half/i.test(t)) return "Duplex";
  if (/manufactured|mobile/i.test(t)) return "Manufactured Home";
  if (/land|lot/i.test(t) && !l.beds) return "Land";
  if (/single|house|detached|residence/i.test(t)) return "House";
  return t.split("/")[0].trim() || "Home";
}

export const where = (l: SeoListing) => `${l.address}${l.city ? ", " + l.city : ""}`;

/** Page title (Google + browser tab) */
export function listingTitle(l: SeoListing) {
  const kind = homeKind(l);
  return `${where(l)} · ${l.beds ? l.beds + " Bed " : ""}${kind} ${isSold(l) ? "Sold" : "for Sale"}`;
}

/** Meta description */
export function listingDescription(l: SeoListing) {
  const kind = homeKind(l).toLowerCase(), sold = isSold(l);
  const lead = sold ? `Sold${l.beds ? ` ${l.beds} bed` : ""}${l.baths ? `, ${l.baths} bath` : ""} ${kind}` : `${money(l.price)}${l.beds ? ` · ${l.beds} bed` : ""}${l.baths ? `, ${l.baths} bath` : ""} ${kind}`;
  return `${lead}${l.area ? " in " + l.area : l.city ? " in " + l.city : ""}. ${sold ? "Sign in free to see the sold price. " : ""}See the ${isCondo(l) ? "strata details" : "lot lines"}, floodplain check, catchment schools and commute times the listing doesn't show.`;
}

/** Questions people ask, with answers from this listing's own data. Each question names the address. */
export function listingFaq(l: SeoListing): [string, string][] {
  const q: [string, string][] = [], w = where(l), n = l.nearby || {}, s = n.schools || {}, a = l.assessment, sold = isSold(l);

  // 1. price (not for sold homes: sold prices are for signed-in members)
  if (l.price && !sold) {
    q.push([`How much is ${w} listed for?`,
      `${w}${l.area ? " in " + l.area : ""} is listed at ${money(l.price)}${l.mls ? " (MLS® " + l.mls + ")" : ""}.` +
      (l.beds != null ? ` It has ${l.beds} bedrooms, ${l.baths ?? 0} bathrooms${l.sqft ? ` and ${num(l.sqft)} sq ft of living space` : ""}.` : "")]);
  }

  // 2. assessment
  if (a?.total) {
    if (!sold && l.price) {
      const p = ((l.price - a.total) / a.total) * 100, abs = Math.abs(p);
      q.push([`How does the price of ${w} compare to its assessed value?`,
        `The asking price is ${abs < 1 ? "about the same as" : abs.toFixed(1) + "% " + (p > 0 ? "above" : "below")} the ${a.year} assessed value of ${money(a.total)} (assessment public data). The assessed value is not an appraisal.`]);
    } else {
      q.push([`What is the assessed value of ${w}?`,
        `The ${a.year} assessed value is ${money(a.total)}${a.land ? ` (land ${money(a.land)}, building ${money(a.building || a.total - a.land)})` : ""}, from assessment public data. The assessed value is not an appraisal.`]);
    }
  }

  // 3. taxes and strata fee
  if (l.taxes || l.maintenance) {
    q.push([`What are the property taxes${l.maintenance ? " and strata fees" : ""} for ${w}?`,
      `${l.taxes ? `Property taxes were ${money(l.taxes)}${l.taxYear ? " for " + l.taxYear : ""}, as reported in the listing.` : ""}${l.maintenance ? ` The strata fee is ${money(l.maintenance, 2)} a month${has(l.maintIncludes) ? ", including " + l.maintIncludes.slice(0, 4).join(", ").toLowerCase() : ""}.` : ""}`.trim()]);
  }

  // 4. catchment schools
  if (s.elem || s.sec) {
    const sc = [s.elem && `${s.elem.name} (elementary${s.elem.rating != null ? ", Fraser rating " + s.elem.rating + "/10" : ""})`,
      s.sec && `${s.sec.name} (secondary${s.sec.rating != null ? ", Fraser rating " + s.sec.rating + "/10" : ""})`].filter(Boolean);
    q.push([`Which schools serve ${w}?`, `The catchment schools are ${sc.join(" and ")}. Confirm catchments with the school district.`]);
  }

  // 5. transit
  if (n.sky || n.bus) {
    q.push([`How close is ${w} to transit?`,
      `${n.sky ? `${n.sky.name} SkyTrain station is about ${article(minutes(n.sky))} away.` : ""}${n.bus ? ` The nearest bus stop is about ${article(minutes(n.bus))} away (${n.bus.name}).` : ""}${n.walk != null ? ` Walkability is ${n.walk} out of 100.` : ""}`.trim()]);
  }

  // 6. flood
  if (n.flood != null) {
    q.push([`Is ${w} in a flood area?`,
      n.flood
        ? `It's inside a mapped flood or hazard area, based on public map data${has(n.floodTypes) ? ": " + n.floodTypes.join(", ") : ""}. Ask your insurer and check the city's flood maps.`
        : "It's not inside a mapped flood or hazard area, based on public map data. Check the city's maps for details."]);
  }

  // more from the listing itself, when there's room
  if (l.year) q.push([`When was ${w} built?`, `It was built in ${l.year}, so it's about ${new Date().getFullYear() - l.year} years old.${l.type ? " It's listed as " + String(l.type).replace(/\s*\/\s*/g, " / ") + (l.ownership ? " (" + l.ownership + ")" : "") + "." : ""}`]);
  if (l.lot?.sqft) q.push([`How big is the lot at ${w}?`, `The lot is about ${num(l.lot.sqft)} sq ft (${(l.lot.sqft / 43560).toFixed(2)} acres)${l.lot.front ? `, with ${l.lot.front} ft of frontage` : ""}${l.lot.zoning ? `, zoned ${l.lot.zoning}` : ""}. Lot lines on our map come from public parcel data and are not a survey.`]);
  if (has(l.openHouses) && !sold) q.push([`Is there an open house at ${w}?`, `Yes: ${l.openHouses.map((o: any) => [o.day, o.time].filter(Boolean).join(", ")).join("; ")}. You can also book a private showing.`]);

  return q.filter((x) => x[1]).slice(0, 6);
}

/** schema.org structured data: the listing + its questions */
export function listingJsonLd(l: SeoListing, url: string, faq = listingFaq(l)) {
  const sold = isSold(l);
  const listing: any = {
    "@type": "RealEstateListing",
    name: listingTitle(l),
    description: listingDescription(l),
    url,
    datePosted: l.listedOn || undefined,
    image: (l.photos || []).slice(0, 3),
    offers: sold ? undefined : { "@type": "Offer", price: l.price || undefined, priceCurrency: "CAD", availability: "https://schema.org/InStock" },
    about: {
      "@type": isCondo(l) ? "Apartment" : "SingleFamilyResidence",
      numberOfRooms: l.beds ?? undefined,
      numberOfBathroomsTotal: l.baths ?? undefined,
      floorSize: l.sqft ? { "@type": "QuantitativeValue", value: l.sqft, unitCode: "FTK" } : undefined,
      yearBuilt: l.year || undefined,
      address: { "@type": "PostalAddress", streetAddress: l.address, addressLocality: l.city || undefined, addressRegion: "BC", postalCode: l.postal || undefined, addressCountry: "CA" },
      geo: l.lat ? { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } : undefined,
    },
  };
  const graph: any[] = [listing];
  if (faq.length) graph.push({ "@type": "FAQPage", mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
  return { "@context": "https://schema.org", "@graph": graph };
}
