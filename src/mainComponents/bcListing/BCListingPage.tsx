/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * Listing details page (designer version Nov 13 F) on our data.
 * The design's own code (bcListingEngine.js) draws the page; this component feeds it the listing,
 * BC Assessment, MLS® history, commute & nearby, schools, market snapshot and similar homes,
 * and connects Book a showing / Ask / Save / Share / photos / sign-in to the site.
 */
import "./bcListing.css";
import "yet-another-react-lightbox/styles.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Lightbox from "yet-another-react-lightbox";
import { toast } from "react-toastify";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import {
  useGetRealEstateListingById,
  useGetSimilarRealEstateProperties,
  useGetSimilarRealEstateSoldProperties,
  useToggleRealEstateFavorite,
} from "@/src/hooks/listing/useRealEstateListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";
import PropertyInfoSkeleton from "../propertyInfo/PropertyInfoSkeleton";
import GetInTouch from "../getInTouch/GetInTouch";
import { mountBCListing } from "./bcListingEngine";
import { loadAssessment, loadNearby, toCards, toPageListing, type ListingKind } from "./bcListingData";

type Engine = { render: (l: any) => void; refresh: (l?: any) => void; destroy: () => void };

const sendLead = async (lead: any) => {
  try {
    const res = await fetch("/api/listing-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || "Could not send");
  } catch (e: any) {
    toast.error(e?.message || "Could not send right now. Please call us instead.");
  }
};

export default function BCListingPage({ paramsId, kind = "sale" }: { paramsId: string; kind?: ListingKind }) {
  const router = useRouter();
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const { data: me } = useGetMe();
  const toggleFavorite = useToggleRealEstateFavorite();

  const { data: listing, isLoading, error } = useGetRealEstateListingById(paramsId, { select: (res: any) => res?.data || res });
  const { data: similar } = useGetSimilarRealEstateProperties(paramsId, { select: (res: any) => res?.data || [] });
  const { data: similarSold } = useGetSimilarRealEstateSoldProperties(paramsId, { select: (res: any) => res?.data || [] });

  const [assessment, setAssessment] = useState<any>(undefined);
  const [nearby, setNearby] = useState<any>(undefined);
  const [photoIndex, setPhotoIndex] = useState(-1);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const cfgRef = useRef<any>(null);

  // the page's listing object, built from everything we have so far
  const pageListing = useMemo(() => {
    if (!listing) return null;
    const l: any = toPageListing(listing, kind);
    if (assessment) l.assessment = assessment;
    if (nearby) l.nearby = nearby;
    l.similar = toCards(similar || []).slice(0, 6);
    l.sold = toCards(similarSold || [], true).slice(0, 6);
    return l;
  }, [listing, kind, assessment, nearby, similar, similarSold]);

  const isSaved = useMemo(() => {
    const id = listing?.documentId;
    return !!(id && me?.favorites?.some((f: any) => (f?.documentId || f?.id || f) === id));
  }, [me, listing]);

  // the slower parts: BC Assessment and commute & nearby
  useEffect(() => {
    if (!listing) return;
    let alive = true;
    const l = toPageListing(listing, kind);
    loadAssessment(l).then((a) => alive && setAssessment(a || null)).catch(() => alive && setAssessment(null));
    loadNearby(l.lat, l.lng).then((n) => alive && setNearby(n || null)).catch(() => alive && setNearby(null));
    return () => { alive = false; };
  }, [listing, kind]);

  // log the visit once per listing (same as before)
  const logged = useRef<string | null>(null);
  useEffect(() => {
    const id = listing?.documentId || paramsId;
    if (!listing || logged.current === id) return;
    logged.current = id;
    logPropertySearchActivity({ propertySearchType: "find_home", searchTerm: listing.address || "", propertyId: id });
  }, [listing, paramsId]);

  // settings + hooks for the design's code (kept fresh through cfgRef)
  useEffect(() => {
    cfgRef.current = Object.assign(cfgRef.current || {}, {
      demo: false,
      theme: { brand: "#1e4e8c", accent: "#f5a20a", font: "Plus Jakarta Sans" },
      agent: { name: "BC Real Estate Market", role: "Book a private showing or ask us anything" },
      signedIn: isLoggedIn,
      historyNeedsSignIn: true,
      isSaved: () => isSaved,
      onSave: (l: any, saved: boolean) => {
        if (!isLoggedIn) { setOpenLogin(true); return false; }   // sign in first: the heart goes back
        if (l?.id && saved !== isSaved) toggleFavorite.mutate(l.id);
      },
      onBookShowing: (lead: any) => sendLead(lead),
      onQuestion: (lead: any) => sendLead(lead),
      onPartnerLead: (lead: any) => sendLead(lead),
      onPhotos: () => setPhotoIndex(0),
      onSignIn: () => setOpenLogin(true),
      mapUrl: (l: any) => (l.lat && l.lng ? `/map-search#home=${l.lat},${l.lng}` : "/map-search"),
      onNavigate: (href: string) => router.push(href),
    });
  }, [isLoggedIn, isSaved, setOpenLogin, toggleFavorite, router]);

  // draw the page, then update it in place as more data arrives (calculator inputs and scroll stay)
  useEffect(() => {
    if (!pageListing || !hostRef.current) return;
    if (!engineRef.current) {
      engineRef.current = mountBCListing(hostRef.current, cfgRef.current) as Engine;
      engineRef.current.render(pageListing);
    } else {
      engineRef.current.refresh(pageListing);
    }
  }, [pageListing, isLoggedIn, isSaved]);

  // a different listing (or leaving the page): start clean
  useEffect(() => () => { engineRef.current?.destroy(); engineRef.current = null; }, [paramsId]);

  if (isLoading) return <PropertyInfoSkeleton />;
  if (error || !listing) {
    return (
      <div className="p-10 text-gray-500 xl:max-w-screen-2xl mx-auto w-full h-[50svh] flex justify-center items-center">
        {error ? (error as any).message || "Something went wrong" : "Property not found"}
      </div>
    );
  }

  const photos: string[] = pageListing?.photos || [];
  return (
    <>
      {/* the site header is fixed: sticky tabs and the side card sit just under it */}
      <div className="xl:pt-24 md:pt-20 pt-16 bg-[#f8fafc] [--bcl-sticky-top:64px] md:[--bcl-sticky-top:80px]">
        <div ref={hostRef} />
      </div>
      <Lightbox
        open={photoIndex >= 0}
        close={() => setPhotoIndex(-1)}
        index={Math.max(0, photoIndex)}
        slides={photos.map((src) => ({ src }))}
      />
      <GetInTouch />
    </>
  );
}
