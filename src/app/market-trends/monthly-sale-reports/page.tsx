import TrendStepPage from "@/src/mainComponents/marketTrendsComponents/TrendStepPage";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Sales Reports | BC Real Estate Market Trends",
  description:
    "Explore comprehensive BC real estate monthly sales reports, market activity, sales to active ratios, and inventory stats.",
  keywords:
    "BC Real Estate Monthly Sales Reports, Housing Market Reports, BC Home Sales Data, British Columbia Real Estate Reports",
  robots: "index, follow",
  openGraph: {
    title: "Monthly Sales Reports | BC Real Estate Market Trends",
    description:
      "Explore comprehensive BC real estate monthly sales reports, market activity, sales to active ratios, and inventory stats.",
    images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate Monthly Sales Reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monthly Sales Reports | BC Real Estate Market Trends",
    description:
      "Explore comprehensive BC real estate monthly sales reports, market activity, sales to active ratios, and inventory stats.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const Page = () => {
  return (
    <Suspense>
      <TrendStepPage initialTab={2} />
    </Suspense>
  );
};

export default Page;

