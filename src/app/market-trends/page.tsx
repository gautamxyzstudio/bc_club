import TrendStepPage from "@/src/mainComponents/marketTrendsComponents/TrendStepPage";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BC Real Estate Market Trends & Statistics",
  description:
    "Explore BC real estate market trends, monthly sales reports, housing statistics, and property price movements to make informed real estate decisions.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Real Estate Market Trends, Housing Market BC, Property Prices BC, BC Housing Market Analysis, Real Estate Statistics BC, Vancouver Real Estate Trends, Toronto Real Estate Trends, Canadian Real Estate Market",
  robots: "index, follow",
  openGraph: {
   title: "BC Real Estate Market Trends & Statistics",
  description:
    "Explore BC real estate market trends, monthly sales reports, housing statistics, and property price movements to make informed real estate decisions.",
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
    title: "BC Real Estate Market Trends & Statistics",
  description:
    "Explore BC real estate market trends, monthly sales reports, housing statistics, and property price movements to make informed real estate decisions.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const Page = () => {
  return (
    <Suspense>
      <TrendStepPage />
    </Suspense>
  );
};

export default Page;
