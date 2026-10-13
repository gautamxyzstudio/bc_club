import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import HomePropertiesSold from "@/src/mainComponents/home/HomePropertiesSold";
import DiscoverHomeValue from "@/src/mainComponents/homeEstimation/DiscoverHomeValue";
import HomeEstimationTop from "@/src/mainComponents/homeEstimation/HomeEstimationTop";
import HomeAssessmentSearchSection from "@/src/mainComponents/homeEstimation/HomeAssessmentSearchSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Home Evaluation in BC | Estimate Your Property Value",
  description:
    "Estimate your home's value in British Columbia using property insights and local market trends to better understand its potential selling price.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Real Estate Market Trends, Housing Market BC, Property Prices BC, BC Housing Market Analysis, Real Estate Statistics BC, Vancouver Real Estate Trends, Toronto Real Estate Trends, Canadian Real Estate Market",
  robots: "index, follow",
  openGraph: {
   title: "Free Home Evaluation in BC | Estimate Your Property Value",
  description:
    "Estimate your home's value in British Columbia using property insights and local market trends to better understand its potential selling price.",
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
    title: "Free Home Evaluation in BC | Estimate Your Property Value",
  description:
    "Estimate your home's value in British Columbia using property insights and local market trends to better understand its potential selling price.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};
const page = () => {
  return (
    <>
      <HomeEstimationTop />
      {/* <DiscoverHomeValue /> */}
      <HomeAssessmentSearchSection />
      <HomePropertiesSold />
      <GetInTouch />
    </>
  );
};

export default page;
