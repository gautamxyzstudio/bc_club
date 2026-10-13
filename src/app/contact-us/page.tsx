import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact BC Real Estate Market | Get in Touch",
  description:
    "Contact BC Real Estate Market for assistance with property searches, home evaluations, neighbourhood insights, and real estate market information.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Real Estate Market Trends, Housing Market BC, Property Prices BC, BC Housing Market Analysis, Real Estate Statistics BC, Vancouver Real Estate Trends, Toronto Real Estate Trends, Canadian Real Estate Market",
  robots: "index, follow",
  openGraph: {
   title: "Contact BC Real Estate Market | Get in Touch",
  description:
    "Contact BC Real Estate Market for assistance with property searches, home evaluations, neighbourhood insights, and real estate market information.",
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
    title: "Contact BC Real Estate Market | Get in Touch",
  description:
    "Contact BC Real Estate Market for assistance with property searches, home evaluations, neighbourhood insights, and real estate market information.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const page = () => {
  return <GetInTouch />;
};

export default page;
