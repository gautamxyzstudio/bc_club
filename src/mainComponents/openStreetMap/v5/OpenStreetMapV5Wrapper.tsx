"use client";

import dynamic from "next/dynamic";
import MapLoading from "../MapLoading";

const OpenStreetMapV5Wrapper = dynamic(
  () => import("./OpenStreetMapSearchV5"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default OpenStreetMapV5Wrapper;
