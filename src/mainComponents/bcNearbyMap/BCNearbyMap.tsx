/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * Map search (Commute & Nearby, Nov 13 AA package) on our own data.
 *
 * The map itself lives in /public/bcnearby (plain JS + Leaflet) and runs in a same-origin iframe,
 * so its styles and scripts can't touch the rest of the site (DEVELOPER-CHECKLIST.md, way A).
 * This component hands it window.BCNearbyConfig: theme, and hooks that call our Strapi API
 * for homes (clusters + price tags), search, lots (BC Assessment + parcel outlines),
 * favourites, sign-in, listing pages and seller leads.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { addRealEstateFavorite, removeRealEstateFavorite } from "@/src/api/listing/realEstateListing";
import { submitHomeEvaluationRequest } from "@/src/api/homeEvaluation/homeEvaluationApi";
import { cityCoords, OpenStreetMapDefaultCenter } from "../openStreetMap/osmMapConfig";
import GetInTouch from "../getInTouch/GetInTouch";
import {
  assessAt, loadAssessPoints, loadLotDetails, loadNeighbourhoods, loadParcels, loadView,
  parcelAt, resolveLot, searchSite, toAssessPoint,
  type AssessPoint, type BCNListing, type BCNQuery,
} from "./bcNearbyApi";

const FRAME_SRC = "/bcnearby/index.html";
const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/positron"; // same basemap as the rest of the site
const LOT_ZOOM = 16; // lots, outlines and lot cards from this zoom in

type BCNApi = {
  setListings: (list: BCNListing[], opt?: { clusters?: any[]; total?: number }) => void;
  getListing: (lat: number, lng: number) => BCNListing | null;
  refresh: () => void;
  signedIn?: () => void;
  setSaved?: (pts: [number, number][]) => void;
};

const listingPath = (l: BCNListing) =>
  l.src === "fc" ? `/forecloser-property-info/${l.id}` : l.kind === "sold" || l.kind === "exp" ? `/sold-property-info/${l.id}` : `/property-info/${l.id}`;

/** First view: ?lat=&lng=&zoom= or ?city= in the page address, else Vancouver */
function startView(sp: { get(k: string): string | null } | null) {
  const lat = Number(sp?.get("lat")), lng = Number(sp?.get("lng")), zoom = Number(sp?.get("zoom"));
  if (lat && lng) return { lat, lng, zoom: zoom || 15, fromUrl: true };
  const city = sp?.get("city") || sp?.get("location");
  const c = city ? Object.entries(cityCoords).find(([k]) => k.toLowerCase() === city.toLowerCase()) : null;
  if (c) return { lat: c[1][0], lng: c[1][1], zoom: 13, fromUrl: true };
  return { lat: OpenStreetMapDefaultCenter[0], lng: OpenStreetMapDefaultCenter[1], zoom: 13, fromUrl: false };
}

export default function BCNearbyMap() {
  const router = useRouter();
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const [frameSrc, setFrameSrc] = useState<string | null>(null);

  // latest values for the hooks (the config object is made once per visit to the page)
  const authRef = useRef({ isLoggedIn, setOpenLogin });
  const routerRef = useRef(router);
  useEffect(() => {
    authRef.current = { isLoggedIn, setOpenLogin };
    routerRef.current = router;
  }, [isLoggedIn, setOpenLogin, router]);

  const apiRef = useRef<BCNApi | null>(null);
  const mapRef = useRef<any>(null);
  const viewAbort = useRef<AbortController | null>(null);
  const lotAbort = useRef<AbortController | null>(null);
  const lotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assessRef = useRef<AssessPoint[]>([]);
  const parcelsRef = useRef<{ features: any[] } | null>(null);
  const lotLayerRef = useRef<any>(null);
  const lastQuery = useRef<BCNQuery | null>(null);

  // tell the map when the visitor signs in or out (sold prices, reminders)
  useEffect(() => {
    if (isLoggedIn) apiRef.current?.signedIn?.();
    if (lastQuery.current && lastQuery.current.group !== "sale") apiRef.current?.refresh();
  }, [isLoggedIn]);

  useEffect(() => {
    const w = window as any;
    const start = startView(new URLSearchParams(window.location.search));

    // sold / expired need a free account (same rule as before): don't reopen them for a signed-out visitor
    if (!authRef.current.isLoggedIn) {
      try {
        const k = JSON.parse(localStorage.getItem("bcNearby.lst.v1") || "null");
        if (Array.isArray(k) && k.some((x: string) => x === "sold" || x === "fcs" || x === "exp")) localStorage.setItem("bcNearby.lst.v1", JSON.stringify(["active", "drop"]));
      } catch { /* private mode */ }
    }

    // a property found by search goes into the lot list, so its lot card opens straight away
    const keepLot = (d: any) => {
      const p = toAssessPoint(d);
      if (p) assessRef.current = [p, ...assessRef.current.filter((x) => x.documentId !== p.documentId)];
    };

    const loadLots = (q: BCNQuery) => {
      if (lotTimer.current) clearTimeout(lotTimer.current);
      if (q.zoom < LOT_ZOOM) return;
      lotTimer.current = setTimeout(async () => {
        lotAbort.current?.abort();
        const ac = (lotAbort.current = new AbortController());
        const [pts, fc] = await Promise.allSettled([loadAssessPoints(q, ac.signal), loadParcels(q, ac.signal)]);
        if (ac.signal.aborted) return;
        if (pts.status === "fulfilled") {
          // keep what we had nearby too, so a tap right after panning still finds its lot
          const seen = new Set(pts.value.map((p) => p.documentId));
          assessRef.current = pts.value.concat(assessRef.current.filter((p) => !seen.has(p.documentId))).slice(0, 8000);
        }
        if (fc.status === "fulfilled" && fc.value?.features) {
          parcelsRef.current = fc.value;
          const lay = lotLayerRef.current;
          if (lay) { lay.clearLayers(); try { lay.addData(fc.value); } catch { /* skip a bad outline */ } }
        }
      }, 250);
    };

    const config = {
      demo: false,
      serverFilters: true,          // our API does the filtering; the map only shows what comes back
      openHouses: true,             // "Only open houses" + orange dot; times come with each listing (open_houses)
      hideRanges: ["fee", "ppsf"],  // strata fee and price per sq ft are not on the API yet
      start: { lat: start.lat, lng: start.lng, zoom: start.zoom },
      minZoom: 8,
      maxZoom: 20,
      basemap: { style: VECTOR_STYLE },
      theme: { brand: "#1e4e8c", accent: "#f5a20a", font: "Plus Jakarta Sans" },
      homeValueUrl: "/home-estimation",
      cities: Object.entries(cityCoords).map(([n, [la, lo]]) => [n, la, lo]),

      onReady: (api: BCNApi, map: any) => {
        apiRef.current = api;
        mapRef.current = map;
        if (authRef.current.isLoggedIn) api.signedIn?.();
        // no place in the page address: start where the visitor is, like the old map did
        if (!start.fromUrl && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (p) => map.setView([p.coords.latitude, p.coords.longitude], 14),
            () => { /* keep Vancouver */ },
            { timeout: 8000, maximumAge: 600000 },
          );
        }
      },

      // the map moved or a filter changed: load homes for this view
      onViewChange: async (q: BCNQuery) => {
        lastQuery.current = q;
        loadLots(q);
        viewAbort.current?.abort();
        const ac = (viewAbort.current = new AbortController());
        try {
          const r = await loadView(q, ac.signal);
          if (ac.signal.aborted) return;
          apiRef.current?.setListings(r.listings as any, { clusters: r.clusters, total: r.total });
        } catch (e: any) {
          if (!ac.signal.aborted) console.warn("[BCNearby] could not load homes", e?.message);
        }
      },

      // search box: our listings + BC Assessment lots, then BC addresses (added by the map)
      searchListings: (q: string, o?: { signal?: AbortSignal }) => searchSite(q, { signal: o?.signal, onLotFound: keepLot }),
      // a saved search hit (or a recent search) for a property not for sale: find it again by its id
      resolveResult: (r: any) => (r?.kind === "lot" && r.id ? resolveLot(String(r.id), keepLot) : null),

      // lot card: BC Assessment value + parcel outline for any home not for sale
      makeLotLinesLayer: (L: any) => {
        const lay = L.geoJSON(null, {
          pane: "lots", interactive: false,
          style: { color: "#64748b", weight: 1, opacity: 0.85, fillOpacity: 0 },
        });
        lotLayerRef.current = lay;
        return lay;
      },
      getLotInfo: (lat: number, lng: number) => {
        const parcel = parcelAt(parcelsRef.current, lat, lng);
        const a = assessAt(assessRef.current, lat, lng, parcel?.pid);
        if (!a) return null;
        return {
          address: a.address || "This property", sub: "",
          roll: a.roll, pid: a.pid || parcel?.pid, plan: a.plan,
          total: a.total, land: a.land, building: a.building || Math.max(0, a.total - a.land),
          year: new Date().getFullYear(), history: a.total ? [[new Date().getFullYear(), a.total]] : [],
          outline: parcel?.outline || null,
          fullUrl: `/property-assessment/${a.documentId}`,
          documentId: a.documentId,
        };
      },
      loadLotDetails: (d: any) => (d?.documentId ? loadLotDetails(d.documentId) : null),
      getAddressAt: (lat: number, lng: number) => {
        const a = assessAt(assessRef.current, lat, lng, undefined, 45);
        return a?.address ? { addr: a.address } : null;
      },

      // filters: neighbourhoods per city from our listings
      loadNeighbourhoods: (city: string) => loadNeighbourhoods(city),

      // account
      canSeeSold: () => authRef.current.isLoggedIn,
      onSignIn: () => authRef.current.setOpenLogin(true),
      onSave: async (lat: number, lng: number) => {
        const l = apiRef.current?.getListing(lat, lng);
        if (!authRef.current.isLoggedIn) { authRef.current.setOpenLogin(true); return; }
        if (!l || l.src !== "reb") return;
        try { await addRealEstateFavorite(l.id); } catch (e: any) { toast.error(e?.message || "Could not save this home"); }
      },
      onUnsave: async (lat: number, lng: number) => {
        const l = apiRef.current?.getListing(lat, lng);
        if (!authRef.current.isLoggedIn || !l || l.src !== "reb") return;
        try { await removeRealEstateFavorite(l.id); } catch { /* already removed */ }
      },

      // listing pages and links
      onListingDetails: (lat: number, lng: number) => {
        const l = apiRef.current?.getListing(lat, lng);
        if (l) routerRef.current.push(listingPath(l));
      },
      shareUrl: (lat: number, lng: number) => {
        const l = apiRef.current?.getListing(lat, lng);
        return l ? `${location.origin}${listingPath(l)}` : `${location.origin}/map-search#home=${lat.toFixed(5)},${lng.toFixed(5)}`;
      },

      // "Own this home? Get a free home value report" -> our home evaluation requests
      onSellerLead: async (lead: any) => {
        const email = /\S+@\S+\.\S+/.test(lead?.contact || "") ? lead.contact : "";
        try {
          await submitHomeEvaluationRequest({
            fullName: lead?.name || "",
            email,
            phoneNumber: email ? "" : lead?.contact || "",
            address: lead?.address || "",
            propertySizeInSquareFeet: "",
          });
        } catch (e: any) {
          toast.error(e?.message || "Could not send the request");
        }
      },
    };

    w.BCNearbyConfig = config;
    // a shared "#home=lat,lng" link opens that home inside the map
    const raf = requestAnimationFrame(() => setFrameSrc(FRAME_SRC + (location.hash.startsWith("#home=") ? location.hash : "")));

    return () => {
      cancelAnimationFrame(raf);
      viewAbort.current?.abort();
      lotAbort.current?.abort();
      if (lotTimer.current) clearTimeout(lotTimer.current);
      apiRef.current = null;
      mapRef.current = null;
      lotLayerRef.current = null;
      if (w.BCNearbyConfig === config) delete w.BCNearbyConfig;
    };
    // the map is set up once per visit; later changes reach it through the refs above
  }, []);

  return (
    <>
      <div className="relative md:mt-19 mt-15 w-full lg:h-[calc(100vh-80px)] h-[calc(100vh-140px)] overflow-hidden">
        {frameSrc && (
          <iframe
            key={frameSrc}
            src={frameSrc}
            title="Map search: homes for sale and what's nearby"
            className="absolute inset-0 h-full w-full border-0"
            allow="geolocation; clipboard-write; web-share"
          />
        )}
      </div>
      <GetInTouch />
    </>
  );
}
