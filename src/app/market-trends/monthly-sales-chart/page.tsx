import { Suspense } from "react";
import { Metadata } from "next";
import MonthlySaleChart from "@/src/mainComponents/marketTrendsComponents/monthlySaleChart/MonthlySaleChart";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";

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
        url: "https://bcrealestatemarket.com/bcrealestatemarket.webp",
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
      }>
      <div className="py-16 xl:py-19.5 max-w-screen-2xl mx-auto xl:px-16 md:px-9 px-6 bg-[#FBF9F5]">
        <MonthlySaleChart />
      </div>
      <GetInTouch />
    </Suspense>
  );
};

export default Page;

