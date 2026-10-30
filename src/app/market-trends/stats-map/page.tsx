import TrendStepPage from "@/src/mainComponents/marketTrendsComponents/TrendStepPage";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats Map | BC Real Estate Market Trends",
  description:
    "Interactive BC real estate statistics map. View regional property benchmarks, sales data, and price trends across British Columbia.",
  keywords:
    "BC Real Estate Stats Map, Regional Housing Statistics, British Columbia Property Map, Market Trends Map",
  robots: "index, follow",
  openGraph: {
    title: "Stats Map | BC Real Estate Market Trends",
    description:
      "Interactive BC real estate statistics map. View regional property benchmarks, sales data, and price trends across British Columbia.",
    images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate Stats Map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stats Map | BC Real Estate Market Trends",
    description:
      "Interactive BC real estate statistics map. View regional property benchmarks, sales data, and price trends across British Columbia.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const Page = () => {
  return (
    <Suspense>
      <TrendStepPage initialTab={3} />
    </Suspense>
  );
};

export default Page;

