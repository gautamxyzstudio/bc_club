"use client";

import dynamic from "next/dynamic";
import MapLoading from "../openStreetMap/MapLoading";

/** Map search page body (client only: the map needs the browser). */
const BCNearbyMapWrapper = dynamic(() => import("./BCNearbyMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default BCNearbyMapWrapper;
