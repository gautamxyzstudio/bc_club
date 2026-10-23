import React, { Suspense } from "react";
import { Metadata } from "next";
import MarketSalesReportsNew from "@/src/mainComponents/marketTrendsComponents/monthlySalesReports/MarketSalesReportsNew";

export const metadata: Metadata = {
  title: "BC Real Estate Market Sales Reports | The Sidhu Team",
  description:
    "BC real estate market sales reports, home prices, homes sold by neighbourhood, price range, and bedrooms, with a plain-English buyer's or seller's market verdict.",
  keywords:
    "BC Real Estate Market, Market Sales Reports, Surrey Real Estate Market, Vancouver Real Estate Market, Buyer's Market, Seller's Market, Median Sold Price, Real Estate Board Reports",
  robots: "index, follow",
  openGraph: {
    title: "BC Real Estate Market Sales Reports | The Sidhu Team",
    description:
      "BC real estate market sales reports, home prices, homes sold by neighbourhood, price range, and bedrooms, with a plain-English buyer's or seller's market verdict.",
    images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate Market Reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BC Real Estate Market Sales Reports | The Sidhu Team",
    description:
      "BC real estate market sales reports, home prices, homes sold by neighbourhood, price range, and bedrooms, with a plain-English buyer's or seller's market verdict.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

export default function MarketSalesReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5]">
          <div className="w-10 h-10 border-4 border-[#1B7F79] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <div className="pt-16 xl:pt-19.5 min-h-screen bg-[#FBF9F5]">
        <MarketSalesReportsNew />
      </div>
    </Suspense>
  );
}
