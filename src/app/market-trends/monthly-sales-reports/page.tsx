import { Suspense } from "react";
import { Metadata } from "next";
import MarketSalesReportsNew from "@/src/mainComponents/marketTrendsComponents/monthlySalesReports/MarketSalesReportsNew";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";

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
        url: "https://bcrealestatemarket.com/bcrealestatemarket.webp",
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
    images: ["https://bcrealestatemarket.com/bcrealestatemarket.webp"],
  },
};

const Page = () => {
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
      <GetInTouch/>
    </Suspense>
  );
};

export default Page;

