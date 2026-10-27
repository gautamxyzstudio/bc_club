import MapLoading from "@/src/mainComponents/openStreetMap/MapLoading";
import { Suspense } from "react";
import { Metadata } from "next";
import OpenStreetMapSearchWrapper from "@/src/mainComponents/openStreetMap/OpenStreetMapSearchWrapper";

export const metadata: Metadata = {
  title: "BC Real Estate Map V5 | Explore Properties",
  description:
    "Explore real estate across British Columbia with the redesigned V5 map-based property search. Discover locations, lot lines, floodplains, and catchments.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Map Search, Lot Lines, Vancouver Real Estate, Surrey Real Estate",
  robots: "index, follow",
};

export default function MapV5Page() {
  return (
    <Suspense fallback={<MapLoading />}>
      <OpenStreetMapSearchWrapper />
    </Suspense>
  );
}
