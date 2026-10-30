import TrendStepPage from "@/src/mainComponents/marketTrendsComponents/TrendStepPage";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Sales Chart | BC Real Estate Market Trends",
  description:
    "Explore BC real estate monthly sales charts, median and average prices, active listings, and market trends across British Columbia.",
  keywords:
    "BC Real Estate Monthly Sales Chart, Real Estate Market Trends, BC Property Prices, British Columbia Housing Market",
  robots: "index, follow",
  openGraph: {
    title: "Monthly Sales Chart | BC Real Estate Market Trends",
    description:
      "Explore BC real estate monthly sales charts, median and average prices, active listings, and market trends across British Columbia.",
    images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate Monthly Sales Chart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monthly Sales Chart | BC Real Estate Market Trends",
    description:
      "Explore BC real estate monthly sales charts, median and average prices, active listings, and market trends across British Columbia.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const Page = () => {
  return (
    <Suspense>
      <TrendStepPage initialTab={1} />
    </Suspense>
  );
};

export default Page;

