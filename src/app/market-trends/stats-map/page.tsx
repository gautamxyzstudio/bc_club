import { Suspense } from "react";
import { Metadata } from "next";
import StatsMap from "@/src/mainComponents/marketTrendsComponents/statsMap/StatsMap";

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
        url: "https://bcrealestatemarket.com/bcrealestatemarket.webp",
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
    images: ["https://bcrealestatemarket.com/bcrealestatemarket.webp"],
  },
};

const Page = () => {
  return (
    <Suspense>
      <StatsMap />
    </Suspense>
  );
};

export default Page;

