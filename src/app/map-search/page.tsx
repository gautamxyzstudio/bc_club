import MapLoading from "@/src/mainComponents/openStreetMap/MapLoading";
import { Suspense } from "react";
import { Metadata } from "next";
import { OpenStreetMapV5Wrapper } from "@/src/mainComponents/openStreetMap";

export const metadata: Metadata = {
  title: "BC Real Estate Map Search | Explore Properties",
  description:
    "Explore real estate across British Columbia with map-based property search. Discover locations and find homes in neighbourhoods that suit your needs.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Condos for Sale BC, Houses for Sale BC, Townhouses for Sale BC, Vancouver Real Estate, Burnaby Real Estate, Surrey Real Estate, Richmond Real Estate, Coquitlam Real Estate, Victoria Real Estate, Kelowna Real Estate, Abbotsford Real Estate, White Rock Real Estate, Nanaimo Real Estate, New Westminster Real Estate, North Vancouver Real Estate, West Vancouver Real Estate, Langley Real Estate, Delta Real Estate, Maple Ridge Real Estate, Chilliwack Real Estate",
  robots: "index, follow",
  openGraph: {
   title: "BC Real Estate Map Search | Explore Properties",
  description:
    "Explore real estate across British Columbia with map-based property search. Discover locations and find homes in neighbourhoods that suit your needs.",
     images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate | Homes, Condos & Townhouses for Sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BC Real Estate Map Search | Explore Properties",
  description:
    "Explore real estate across British Columbia with map-based property search. Discover locations and find homes in neighbourhoods that suit your needs.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

export default function MapSearchPage() {
  return (
    <Suspense fallback={<MapLoading />}>
      <OpenStreetMapV5Wrapper />
    </Suspense>
  );
}
