/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server only: loads one listing for its page's title, description, questions and structured data.
 * cache() = the page and generateMetadata share one load per request.
 */
import { cache } from "react";
import type { Metadata } from "next";
import { getForecloserListingById, getListingById } from "@/src/api/listing/realEstateListing";
import { loadAssessment, toPageListing, type ListingKind } from "../bcListingData";
import { nearbyOnServer } from "./nearbyServer";
import { listingDescription, listingFaq, listingJsonLd, listingTitle, where } from "./listingSeo";

const SITE = (process.env.NEXT_PUBLIC_BASE_MAIN_URL || "https://bcrealestatemarket.com").replace(/\/$/, "");
const PATH: Record<ListingKind, string> = { sale: "/property-info/", sold: "/sold-property-info/", fc: "/forecloser-property-info/" };

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<undefined>((ok) => setTimeout(() => ok(undefined), ms))]).catch(() => undefined);

export const getListingSeo = cache(async (id: string, kind: ListingKind) => {
  const res = await (kind === "fc" ? getForecloserListingById(id) : getListingById(id)).catch(() => null);
  const raw = res?.data || res;
  if (!raw || !(raw.address || raw.raw_data)) return null;
  const l: any = toPageListing(raw, kind);
  const [assessment, nearby] = await Promise.all([
    withTimeout(loadAssessment(l), 2500),   // public assessment data; skipped if slow
    nearbyOnServer(l.lat, l.lng),
  ]);
  if (assessment) l.assessment = assessment;
  if (nearby) l.nearby = nearby;
  const url = SITE + PATH[kind] + id;
  const faq = listingFaq(l);
  return { listing: l, url, faq, jsonLd: listingJsonLd(l, url, faq), title: listingTitle(l), description: listingDescription(l), name: where(l) };
});

export async function listingMetadata(id: string, kind: ListingKind): Promise<Metadata> {
  const s = await getListingSeo(id, kind);
  if (!s) return { title: "Property not found | BC Real Estate Market", robots: { index: false } };
  const img = s.listing.photos?.[0];
  return {
    title: s.title,
    description: s.description,
    openGraph: {
      siteName: "BC Real Estate Market",
      locale: "en_CA",
      type: "website",
      title: s.title,
      description: s.description,
      url: s.url,
      images: img ? [{ url: img, width: 1144, height: 636, alt: s.name }] : ["/share-image-1200x630.png"],
    },
    twitter: { card: "summary_large_image", title: s.title, description: s.description, images: [img || "/share-image-1200x630.png"] },
  };
}
