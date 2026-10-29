// /* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { GeoJSON as LeafletGeoJSON, Marker, useMap } from "react-leaflet";
// import L from "leaflet";
// import axios from "axios";
// import {
//   Alert,
//   Box,
//   Checkbox,
//   CircularProgress,
//   Dialog,
//   FormControlLabel,
//   IconButton,
//   Typography,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import type { Geometry } from "geojson";

// export type SchoolItem = {
//   id?: string;
//   documentId: string;
//   badge?: string | number | null;
//   latitude: number;
//   longitude: number;
// };

// type CatchmentItem = {
//   geometry?: Geometry;
//   properties?: Record<string, any>;
// };

// type SchoolDetails = {
//   documentId: string;
//   school_id: string;
//   school_type?: string | null;
//   name?: string | null;
//   fraser_name?: string | null;
//   level?: string | null;
//   school_governance_type?: string | null;
//   district?: number | string | null;
//   city?: string | null;
//   address?: string | null;
//   rating?: number | null;
//   rank?: number | null;
//   rank_out_of?: number | null;
//   rating_5yr?: number | null;
//   rank_5yr?: number | null;
//   trend?: string | null;
//   ranking_year?: string | null;
//   ranking_report?: string | null;
//   badge?: string | null;
//   has_catchment?: boolean;
//   matched_catchment_count?: number;
//   matched_catchments?: CatchmentItem | CatchmentItem[] | null;
// };

// type Props = {
//   school: SchoolItem;
//   selected: boolean;
//   onSelect: (documentId: string) => void;
//   onClose: () => void;
//   getSchoolDetailUrl?: (documentId: string) => string;
// };

// const getRatingColor = (value: unknown): string => {
//   if (
//     value === null ||
//     value === undefined ||
//     String(value).trim() === "" ||
//     !Number.isFinite(Number(value))
//   ) {
//     return "#8a9692"; // --nr
//   }

//   const rating = Number(value);

//   if (rating <= 4) return "#c4322b"; // --b1
//   if (rating < 6) return "#e07b24"; // --b2
//   if (rating <= 7.5) return "#c9a514"; // --b3

//   return "#2e8a4e"; // --b4
// };

// export default function OpenStreetMapSchoolMarker({
//   school,
//   selected,
//   onSelect,
//   onClose,
//   getSchoolDetailUrl = (documentId) =>
//     `/api/schools/${encodeURIComponent(documentId)}`,
// }: Props) {

//   const [details, setDetails] = useState<SchoolDetails | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [catchmentChecked, setCatchmentChecked] = useState(false);

//   const map = useMap();

//   const previousMapView = useRef<{
//     center: L.LatLng;
//     zoom: number;
//   } | null>(null);

//   const handleCatchmentChange = (checked: boolean) => {
//     if (checked) {
//       if (!previousMapView.current) {
//         previousMapView.current = {
//           center: map.getCenter(),
//           zoom: map.getZoom(),
//         };
//       }

//       setCatchmentChecked(true);

//       map.setView(
//         [school.latitude, school.longitude],
//         18,
//         { animate: true },
//       );
//     } else {
//       setCatchmentChecked(false);

//       if (previousMapView.current) {
//         const previous = previousMapView.current;

//         map.setView(previous.center, previous.zoom, {
//           animate: true,
//         });

//         previousMapView.current = null;
//       }
//     }
//   };

//   const getSchoolDetailUrlRef = useRef(getSchoolDetailUrl);

//   useEffect(() => {
//     getSchoolDetailUrlRef.current = getSchoolDetailUrl;
//   }, [getSchoolDetailUrl]);

//   const ratingValue =
//     school.badge !== null &&
//       school.badge !== undefined &&
//       String(school.badge).trim() !== ""
//       ? Number(school.badge)
//       : null;

//   const markerColor = getRatingColor(ratingValue);

//   const icon = useMemo(
//     () =>
//       L.divIcon({
//         className: "bc-osm-marker",
//         html: `
//           <div style="
//             display:flex;
//             align-items:center;
//             justify-content:center;
//             gap:3px;
//             height:28px;
//             min-width:38px;
//             padding:0 5px;
//             box-sizing:border-box;
//             border-radius:8px;
//             background:${markerColor};
//             color:#fff;
//             border:2px solid #fff;
//             box-shadow:0 2px 7px rgba(0,0,0,.3);
//             font-size:11px;
//             font-weight:800;
//           ">
//             <svg viewBox="0 0 24 24" width="15" height="15"
//               fill="currentColor" aria-hidden="true">
//               <path d="M12 3 1 9l11 6 9-4.91V16h2V9L12 3Zm-7 9.5V17c0 2.21 3.13 4 7 4s7-1.79 7-4v-4.5l-7 3.82-7-3.82Z"/>
//             </svg>
//             ${ratingValue !== null && Number.isFinite(ratingValue)
//             ? `<span>${ratingValue.toFixed(1)}</span>`
//             : ""
//           }
//           </div>
//         `,
//         iconSize: [48, 32],
//         iconAnchor: [24, 16],
//       }),
//     [markerColor, ratingValue],
//   );

//   // Fetch school details only when the selected state or school changes.
//   // Catchment checkbox changes and map zoom changes will NOT refetch details.
//   useEffect(() => {
//     if (!selected) {
//       setCatchmentChecked(false);
//       return;
//     }

//     // Details are already cached in this marker component.
//     if (details) return;

//     let cancelled = false;

//     const fetchDetails = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const url = getSchoolDetailUrlRef.current(school.documentId);
//         const response = await axios.get(url);

//         if (cancelled) return;

//         const result: SchoolDetails =
//           response.data?.data ?? response.data;

//         setDetails(result);
//       } catch (err) {
//         if (cancelled) return;

//         console.error("Failed to fetch school details:", err);
//         setError("Unable to load school details. Please try again.");
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     void fetchDetails();

//     return () => {
//       cancelled = true;
//     };

//     // Intentionally exclude details and getSchoolDetailUrl.
//     // Details are cached, and the URL callback is accessed through a ref.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selected, school.documentId]);

//   const catchments = details?.matched_catchments;

//   const catchment = Array.isArray(catchments)
//     ? catchments[0]
//     : catchments;

//   const catchmentGeometry = catchment?.geometry;

//   const hasValidGeometry =
//     catchmentGeometry?.type === "Polygon" ||
//     catchmentGeometry?.type === "MultiPolygon";

//   const hasCatchment =
//     details?.has_catchment === true && hasValidGeometry;

//   const handleMarkerClick = () => {
//     onSelect(school.documentId);
//   };

//   const handleDialogClose = () => {
//     setCatchmentChecked(false);
//     onClose();
//   };

//   const retryFetch = async () => {
//     setDetails(null);
//     setError("");
//     setLoading(true);

//     try {
//       const response = await axios.get(
//         getSchoolDetailUrl(school.documentId),
//       );

//       const result: SchoolDetails =
//         response.data?.data ?? response.data;

//       setDetails(result);
//     } catch (err) {
//       console.error("Failed to fetch school details:", err);
//       setError("Unable to load school details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Marker
//         position={[school.latitude, school.longitude]}
//         icon={icon}
//         eventHandlers={{
//           click: handleMarkerClick,
//         }}
//       />

//       <Dialog
//         open={selected}
//         onClose={handleDialogClose}
//         hideBackdrop
//         disableAutoFocus
//         disableEnforceFocus
//         disableRestoreFocus
//         maxWidth={false}
//         sx={{
//           pointerEvents: "none",

//           "& .MuiDialog-container": {
//             alignItems: "flex-start",
//             justifyContent: "flex-end",
//             pointerEvents: "none",
//             padding: {
//               xs: "8px",
//               sm: "16px",
//             },
//           },

//           "& .MuiDialog-paper": {
//             pointerEvents: "auto",
//             position: "fixed",
//             top: {
//               xs: "8px",
//               sm: "56px",
//             },
//             right: {
//               xs: "8px",
//               sm: "16px",
//             },
//             left: "auto",
//             m: 0,

//             width: {
//               xs: "calc(100vw - 16px)",
//               sm: "min(430px, calc(100vw - 32px))",
//             },

//             maxWidth: {
//               xs: "calc(100vw - 16px)",
//               sm: "430px",
//             },

//             maxHeight: {
//               xs: "calc(100dvh - 16px)",
//               sm: "calc(100dvh - 32px)",
//             },

//             overflowX: "hidden",
//             overflowY: "auto",
//             boxSizing: "border-box",
//             borderRadius: {
//               xs: "12px",
//               sm: "16px",
//             },

//             backgroundColor: "#14231f",
//             color: "#e5eeeb",
//             backgroundImage: "none",
//             boxShadow: "0 12px 40px rgba(0,0,0,.35)",

//             // Keep content usable on narrow screens.
//             "& .MuiTypography-root": {
//               overflowWrap: "anywhere",
//             },
//           },
//         }}
//       >
//         {/* Dialog header */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "flex-start",
//             gap: 1.5,
//             p: { xs: 1.5, sm: 2 },
//             borderBottom: "1px solid rgba(255,255,255,.10)",
//           }}
//         >

//           <Box sx={{ minWidth: 0, flex: 1 }}>
//             <Typography
//               sx={{
//                 color: "#9aada6",
//                 fontSize: 11,
//                 fontWeight: 800,
//                 letterSpacing: 1,
//                 textTransform: "uppercase",
//               }}
//             >
//               {details?.level || "School"}
//               {" · "}
//               {details?.school_type || "Unknown"}
//               {details?.city ? ` · ${details.city}` : ""}
//             </Typography>

//             <Typography
//               sx={{
//                 mt: 0.5,
//                 fontSize: { xs: 17, sm: 19 },
//                 lineHeight: 1.3,
//                 fontWeight: 800,
//                 overflowWrap: "anywhere",
//               }}
//             >
//               {details?.name || "School details"}
//             </Typography>

//             <Typography
//               sx={{ mt: 0.5, fontSize: 13, color: "#a6b7b0" }}
//             >
//               {details?.address || "Address unavailable"}
//             </Typography>
//           </Box>

//           <IconButton
//             aria-label="Close school details"
//             onClick={handleDialogClose}
//             size="small"
//             sx={{
//               color: "#e5eeeb",
//               backgroundColor: "rgba(255,255,255,.08)",
//               "&:hover": { backgroundColor: "rgba(255,255,255,.16)" },
//             }}
//           >
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </Box>

//         {/* Loading state */}
//         {loading && (
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1.5,
//               p: 3,
//             }}
//           >
//             <CircularProgress size={22} sx={{ color: "#e07b24" }} />
//             <Typography sx={{ color: "#a6b7b0", fontSize: 14 }}>
//               Loading school details...
//             </Typography>
//           </Box>
//         )}

//         {/* Error state */}
//         {!loading && error && (
//           <Box sx={{ p: 2 }}>
//             <Alert
//               severity="error"
//               action={
//                 <button
//                   type="button"
//                   onClick={() => void retryFetch()}
//                   className="font-semibold"
//                 >
//                   Retry
//                 </button>
//               }
//             >
//               {error}
//             </Alert>
//           </Box>
//         )}

//         {/* School details */}
//         {!loading && !error && details && (
//           <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
//             {/* Fraser ranking */}
//             <Typography
//               sx={{
//                 mb: 1.5,
//                 color: "#a6b7b0",
//                 fontSize: 11,
//                 fontWeight: 800,
//                 letterSpacing: 1,
//                 textTransform: "uppercase",
//               }}
//             >
//               Fraser Ranking
//             </Typography>

//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 flexWrap: "wrap",
//                 gap: 1.5,
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "baseline",
//                   justifyContent: "center",
//                   minWidth: 100,
//                   px: 1.5,
//                   py: 1,
//                   borderRadius: "12px",
//                   backgroundColor: getRatingColor(details.rating),
//                   color: "#fff",
//                 }}
//               >
//                 <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
//                   {details.rating != null
//                     ? Number(details.rating).toFixed(1)
//                     : "N/A"}
//                 </Typography>

//                 {details.rating != null && (
//                   <Typography sx={{ ml: 0.5, fontWeight: 700 }}>
//                     /10
//                   </Typography>
//                 )}
//               </Box>

//               <Box sx={{ minWidth: 0 }}>

//                 <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
//                   {details.rank != null
//                     ? `Rank ${details.rank}${details.rank_out_of != null
//                       ? ` of ${details.rank_out_of}`
//                       : ""
//                     }`
//                     : "Rank unavailable"}
//                 </Typography>

//                 <Typography sx={{ mt: 0.5, fontSize: 13, color: "#c4d0cb" }}>
//                   BC {details.level?.toLowerCase() || ""} schools
//                 </Typography>
//               </Box>
//             </Box>

//             <Typography
//               sx={{ mt: 1.5, color: "#a6b7b0", fontSize: 13 }}
//             >
//               {details.rating_5yr != null
//                 ? `5-year average ${Number(details.rating_5yr).toFixed(1)}`
//                 : "No 5-year average available"}
//               {details.rank_5yr != null
//                 ? ` · rank ${details.rank_5yr}`
//                 : ""}
//               {details.trend ? ` · ${details.trend}` : ""}
//             </Typography>

//             {details.ranking_report && (
//               <Typography
//                 sx={{
//                   mt: 1.5,
//                   color: "#a6b7b0",
//                   fontSize: 12,
//                   lineHeight: 1.7,
//                 }}
//               >
//                 {details.fraser_name || details.name}
//                 {details.ranking_year
//                   ? `, ${details.ranking_year} school year. `
//                   : ". "}
//                 {details.ranking_report}
//               </Typography>
//             )}

//             {/* Catchment option */}
//             {details.has_catchment === true ? (
//               <Box
//                 sx={{
//                   mt: 2,
//                   pt: 0.5,
//                   borderTop: "1px solid rgba(255,255,255,.10)",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     mt: 2,
//                     p: 1.5,
//                     borderRadius: "12px",
//                     border: "1px solid rgba(255,255,255,.12)",
//                     backgroundColor: "rgba(255,255,255,.035)",
//                   }}
//                 >
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={catchmentChecked}
//                         onChange={(event) =>
//                           handleCatchmentChange(event.target.checked)
//                         }
//                         sx={{
//                           color: "#a6b7b0",
//                           "&.Mui-checked": { color: "#e07b24" },
//                         }}
//                       />
//                     }
//                     label={
//                       <Box>
//                         <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
//                           Show school catchment
//                         </Typography>
//                         <Typography
//                           sx={{ fontSize: 12, color: "#a6b7b0" }}
//                         >
//                           {details.matched_catchment_count ?? 0} matched
//                           catchment(s)
//                         </Typography>
//                       </Box>
//                     }
//                     sx={{ m: 0, alignItems: "center" }}
//                   />
//                 </Box>
//               </Box>
//             ) : (
//               <Box
//                 sx={{
//                   mt: 2,
//                   pt: 0.5,
//                   borderTop: "1px solid rgba(255,255,255,.10)",
//                 }}
//               ><Box
//                 sx={{
//                   mt: 2,
//                   p: 1.5,
//                   borderRadius: "12px",
//                   border: "1px solid rgba(255,255,255,.12)",
//                   backgroundColor: "rgba(255,255,255,.035)",
//                 }}
//               ><Typography
//                 sx={{ mt: 1, color: "#e0b44c", fontSize: 12 }}
//               >
//                     No valid catchment polygon is available for this school.
//                   </Typography>
//                 </Box></Box>)
//             }
//           </Box>
//         )}
//       </Dialog>

//       {/* Catchment layer: visible only when the checkbox is checked. */}
//       {selected && catchmentChecked && hasCatchment && (
//         <LeafletGeoJSON
//           key={`${school.documentId}-catchment`}
//           data={{
//             type: "Feature",
//             properties: catchment?.properties ?? {},
//             geometry: catchmentGeometry!,
//           }}
//           style={{
//             color: "#e07b24",
//             weight: 3,
//             opacity: 0.95,
//             fillColor: "#e07b24",
//             fillOpacity: 0.15,
//           }}
//         />
//       )}
//     </>
//   );
// }



/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import axios from "axios";
import {
  GeoJSON as LeafletGeoJSON,
  Marker,
  useMap,
} from "react-leaflet";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Geometry } from "geojson";

export type SchoolItem = {
  id?: string;
  documentId: string;
  badge?: string | number | null;
  latitude: number;
  longitude: number;
};

type CatchmentItem = {
  geometry?: Geometry;
  properties?: Record<string, any>;
};

type SchoolDetails = {
  documentId: string;
  school_id: string;
  school_type?: string | null;
  name?: string | null;
  fraser_name?: string | null;
  level?: string | null;
  school_governance_type?: string | null;
  district?: number | string | null;
  city?: string | null;
  address?: string | null;
  rating?: number | null;
  rank?: number | null;
  rank_out_of?: number | null;
  rating_5yr?: number | null;
  rank_5yr?: number | null;
  trend?: string | null;
  ranking_year?: string | null;
  ranking_report?: string | null;
  badge?: string | null;
  has_catchment?: boolean;
  matched_catchment_count?: number;
  matched_catchments?: CatchmentItem | CatchmentItem[] | null;
};

type Props = {
  school: SchoolItem;
  selected: boolean;
  onSelect: (documentId: string) => void;
  onClose: () => void;
  getSchoolDetailUrl?: (documentId: string) => string;
};

const DEFAULT_DETAIL_URL = (documentId: string) =>
  `/api/schools/${encodeURIComponent(documentId)}`;

const getRatingColor = (value: unknown): string => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "#8a9692";
  }

  const rating = Number(value);

  if (rating <= 4) return "#c4322b";
  if (rating < 6) return "#e07b24";
  if (rating <= 7.5) return "#c9a514";

  return "#2e8a4e";
};

export default function OpenStreetMapSchoolMarker({
  school,
  selected,
  onSelect,
  onClose,
  getSchoolDetailUrl = DEFAULT_DETAIL_URL,
}: Props) {
  const map = useMap();

  const [details, setDetails] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catchmentChecked, setCatchmentChecked] = useState(false);

  // Track requests so an older request cannot overwrite newer school data.
  const requestIdRef = useRef(0);
  const activeSchoolIdRef = useRef(school.documentId);

  const getUrlRef = useRef(getSchoolDetailUrl);
  const onCloseRef = useRef(onClose);

  const previousMapView = useRef<{
    center: L.LatLng;
    zoom: number;
  } | null>(null);

  useEffect(() => {
    getUrlRef.current = getSchoolDetailUrl;
  }, [getSchoolDetailUrl]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // A school change invalidates requests and any previous catchment view.
  useEffect(() => {
    activeSchoolIdRef.current = school.documentId;
    requestIdRef.current += 1;
    previousMapView.current = null;

    setCatchmentChecked(false);
    setError("");
    setLoading(false);

    // Details from the previous school are never shown for this school.
    setDetails((current) =>
      current?.documentId === school.documentId ? current : null
    );

    return () => {
      requestIdRef.current += 1;
    };
  }, [school.documentId]);

  const fetchDetails = useCallback(
    async (force = false) => {
      const requestedSchoolId = school.documentId;

      // Reuse cached details only for the same school.
      if (!force && details?.documentId === requestedSchoolId) {
        return;
      }

      const requestId = ++requestIdRef.current;

      setDetails((current) =>
        current?.documentId === requestedSchoolId ? current : null
      );
      setLoading(true);
      setError("");

      try {
        const url = getUrlRef.current(requestedSchoolId);

        const response = await axios.get(url, {
          // Avoid reusing a cached HTTP response.
          headers: { "Cache-Control": "no-cache" },
        });

        const result: SchoolDetails =
          response.data?.data ?? response.data;

        // Ignore responses for a school that is no longer current.
        if (
          requestId !== requestIdRef.current ||
          activeSchoolIdRef.current !== requestedSchoolId
        ) {
          return;
        }

        if (
          !result ||
          result.documentId !== requestedSchoolId
        ) {
          throw new Error(
            "The API returned details for a different school."
          );
        }

        setDetails(result);
      } catch (err) {
        if (
          requestId !== requestIdRef.current ||
          activeSchoolIdRef.current !== requestedSchoolId
        ) {
          return;
        }

        console.error("Failed to fetch school details:", err);
        setError("Unable to load school details. Please try again.");
      } finally {
        if (
          requestId === requestIdRef.current &&
          activeSchoolIdRef.current === requestedSchoolId
        ) {
          setLoading(false);
        }
      }
    },
    [school.documentId, details]
  );

  // Fetch details when selected. Do not fetch because of zoom or checkbox changes.
  useEffect(() => {
    if (!selected) {
      setCatchmentChecked(false);
      previousMapView.current = null;
      return;
    }

    if (details?.documentId !== school.documentId) {
      void fetchDetails();
    }
  }, [selected, school.documentId, details?.documentId, fetchDetails]);

  // Never render a previous school's details, even for one render.
  const currentDetails =
    details?.documentId === school.documentId ? details : null;

  const catchments = currentDetails?.matched_catchments;

  const catchment = Array.isArray(catchments)
    ? catchments[0]
    : catchments;

  const catchmentGeometry = catchment?.geometry;

  const hasValidGeometry =
    catchmentGeometry?.type === "Polygon" ||
    catchmentGeometry?.type === "MultiPolygon";

  const hasCatchment =
    currentDetails?.has_catchment === true && hasValidGeometry;

  const ratingValue =
    school.badge !== null &&
    school.badge !== undefined &&
    String(school.badge).trim() !== ""
      ? Number(school.badge)
      : null;

  const markerColor = getRatingColor(ratingValue);

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "bc-osm-marker",
        html: `
          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            gap:3px;
            height:28px;
            min-width:38px;
            padding:0 5px;
            box-sizing:border-box;
            border-radius:8px;
            background:${markerColor};
            color:#fff;
            border:2px solid #fff;
            box-shadow:0 2px 7px rgba(0,0,0,.3);
            font-size:11px;
            font-weight:800;
          ">
            <svg viewBox="0 0 24 24" width="15" height="15"
              fill="currentColor" aria-hidden="true">
              <path d="M12 3 1 9l11 6 9-4.91V16h2V9L12 3Zm-7 9.5V17c0 2.21 3.13 4 7 4s7-1.79 7-4v-4.5l-7 3.82-7-3.82Z"/>
            </svg>
            ${
              ratingValue !== null && Number.isFinite(ratingValue)
                ? `<span>${ratingValue.toFixed(1)}</span>`
                : ""
            }
          </div>
        `,
        iconSize: [48, 32],
        iconAnchor: [24, 16],
      }),
    [markerColor, ratingValue]
  );

  const handleCatchmentChange = (checked: boolean) => {
    if (checked) {
      if (!hasCatchment) return;

      if (!previousMapView.current) {
        previousMapView.current = {
          center: map.getCenter(),
          zoom: map.getZoom(),
        };
      }

      setCatchmentChecked(true);

      // Zoom without fetching school details again.
      map.setView(
        [school.latitude, school.longitude],
        18,
        { animate: true }
      );
    } else {
      setCatchmentChecked(false);

      if (previousMapView.current) {
        const previous = previousMapView.current;

        map.setView(previous.center, previous.zoom, {
          animate: true,
        });

        previousMapView.current = null;
      }
    }
  };

  const handleMarkerClick = () => {
    onSelect(school.documentId);
  };

  const handleDialogClose = () => {
    setCatchmentChecked(false);
    previousMapView.current = null;
    onCloseRef.current();
  };

  const retryFetch = () => {
    void fetchDetails(true);
  };

  return (
    <>
      <Marker
        position={[school.latitude, school.longitude]}
        icon={icon}
        eventHandlers={{ click: handleMarkerClick }}
      />

      <Dialog
        open={selected}
        onClose={handleDialogClose}
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        maxWidth={false}
        sx={{
          pointerEvents: "none",
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "flex-end",
            pointerEvents: "none",
            padding: { xs: "8px", sm: "16px" },
          },
          "& .MuiDialog-paper": {
            pointerEvents: "auto",
            position: "fixed",
            top: { xs: "38px", sm: "56px" },
            right: { xs: "8px", sm: "16px" },
            left: "auto",
            m: 0,
            width: {
              xs: "calc(100vw - 16px)",
              sm: "min(430px, calc(100vw - 32px))",
            },
            maxWidth: {
              xs: "calc(100vw - 16px)",
              sm: "430px",
            },
            maxHeight: {
              xs: "calc(100dvh - 16px)",
              sm: "calc(100dvh - 32px)",
            },
            overflowX: "hidden",
            overflowY: "auto",
            boxSizing: "border-box",
            borderRadius: { xs: "12px", sm: "16px" },
            backgroundColor: "#14231f",
            color: "#e5eeeb",
            backgroundImage: "none",
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            "& .MuiTypography-root": {
              overflowWrap: "anywhere",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            p: { xs: 1.5, sm: 2 },
            borderBottom: "1px solid rgba(255,255,255,.10)",
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                color: "#9aada6",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {currentDetails?.level || "School"}
              {" · "}
              {currentDetails?.school_type || "Unknown"}
              {currentDetails?.city ? ` · ${currentDetails.city}` : ""}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: 17, sm: 19 },
                lineHeight: 1.3,
                fontWeight: 800,
              }}
            >
              {currentDetails?.name ||
                (loading ? "Loading school details..." : "School details")}
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "#a6b7b0" }}>
              {currentDetails?.address || "Address unavailable"}
            </Typography>
          </Box>

          <IconButton
            aria-label="Close school details"
            onClick={handleDialogClose}
            size="small"
            sx={{
              color: "#e5eeeb",
              backgroundColor: "rgba(255,255,255,.08)",
              "&:hover": { backgroundColor: "rgba(255,255,255,.16)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 3,
            }}
          >
            <CircularProgress size={22} sx={{ color: "#e07b24" }} />
            <Typography sx={{ color: "#a6b7b0", fontSize: 14 }}>
              Loading school details...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <button
                  type="button"
                  onClick={retryFetch}
                  className="font-semibold"
                >
                  Retry
                </button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && currentDetails && (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography
              sx={{
                mb: 1.5,
                color: "#a6b7b0",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Fraser Ranking
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  minWidth: 100,
                  px: 1.5,
                  py: 1,
                  borderRadius: "12px",
                  backgroundColor: getRatingColor(currentDetails.rating),
                  color: "#fff",
                }}
              >
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                  {currentDetails.rating != null
                    ? Number(currentDetails.rating).toFixed(1)
                    : "N/A"}
                </Typography>

                {currentDetails.rating != null && (
                  <Typography sx={{ ml: 0.5, fontWeight: 700 }}>
                    /10
                  </Typography>
                )}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                  {currentDetails.rank != null
                    ? `Rank ${currentDetails.rank}${
                        currentDetails.rank_out_of != null
                          ? ` of ${currentDetails.rank_out_of}`
                          : ""
                      }`
                    : "Rank unavailable"}
                </Typography>

                <Typography sx={{ mt: 0.5, fontSize: 13, color: "#c4d0cb" }}>
                  BC {currentDetails.level?.toLowerCase() || ""} schools
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ mt: 1.5, color: "#a6b7b0", fontSize: 13 }}>
              {currentDetails.rating_5yr != null
                ? `5-year average ${Number(currentDetails.rating_5yr).toFixed(1)}`
                : "No 5-year average available"}
              {currentDetails.rank_5yr != null
                ? ` · rank ${currentDetails.rank_5yr}`
                : ""}
              {currentDetails.trend ? ` · ${currentDetails.trend}` : ""}
            </Typography>

            {currentDetails.ranking_report && (
              <Typography
                sx={{
                  mt: 1.5,
                  color: "#a6b7b0",
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                {currentDetails.fraser_name || currentDetails.name}
                {currentDetails.ranking_year
                  ? `, ${currentDetails.ranking_year} school year. `
                  : ". "}
                {currentDetails.ranking_report}
              </Typography>
            )}

            <Box
              sx={{
                mt: 2,
                pt: 0.5,
                borderTop: "1px solid rgba(255,255,255,.10)",
              }}
            >
              {currentDetails.has_catchment === true ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,.12)",
                    backgroundColor: "rgba(255,255,255,.035)",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={catchmentChecked}
                        disabled={!hasCatchment}
                        onChange={(event) =>
                          handleCatchmentChange(event.target.checked)
                        }
                        sx={{
                          color: "#a6b7b0",
                          "&.Mui-checked": { color: "#e07b24" },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                          Show school catchment
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#a6b7b0" }}>
                          {currentDetails.matched_catchment_count ?? 0} matched
                          catchment(s)
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: "center" }}
                  />

                  {!hasCatchment && (
                    <Typography sx={{ mt: 1, color: "#e0b44c", fontSize: 12 }}>
                      No valid catchment polygon is available for this school.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography sx={{ mt: 2, color: "#e0b44c", fontSize: 12 }}>
                  No school catchment is available.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Dialog>

      {/* Render the already-fetched geometry; no API request on zoom. */}
      {selected && catchmentChecked && hasCatchment && catchmentGeometry && (
        <LeafletGeoJSON
          key={`${school.documentId}-catchment`}
          data={{
            type: "Feature",
            properties: catchment?.properties ?? {},
            geometry: catchmentGeometry,
          } as GeoJSON.Feature}
          style={{
            color: "#e07b24",
            weight: 3,
            opacity: 0.95,
            fillColor: "#e07b24",
            fillOpacity: 0.15,
          }}
        />
      )}
    </>
  );
}
