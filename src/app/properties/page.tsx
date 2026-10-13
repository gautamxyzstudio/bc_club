import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import PropertiesListingPage from "@/src/mainComponents/properties/PropertiesListingPage";
import { Metadata } from "next";
import { connection } from "next/server";
export const metadata: Metadata = {
  title: "Properties for Sale in BC | Search Homes & Condos",
  description:
    "Browse homes for sale in BC, compare property prices, and filter listings by location, budget, bedrooms, and bathrooms to find your ideal property.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Condos for Sale BC, Houses for Sale BC, Townhouses for Sale BC, Vancouver Real Estate, Burnaby Real Estate, Surrey Real Estate, Richmond Real Estate, Coquitlam Real Estate, Victoria Real Estate, Kelowna Real Estate, Abbotsford Real Estate, White Rock Real Estate, Nanaimo Real Estate, New Westminster Real Estate, North Vancouver Real Estate, West Vancouver Real Estate, Langley Real Estate, Delta Real Estate, Maple Ridge Real Estate, Chilliwack Real Estate",
  robots: "index, follow",
  openGraph: {
   title: "Properties for Sale in BC | Search Homes & Condos",
  description:
    "Browse homes for sale in BC, compare property prices, and filter listings by location, budget, bedrooms, and bathrooms to find your ideal property.",
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
    title: "Properties for Sale in BC | Search Homes & Condos",
  description:
    "Browse homes for sale in BC, compare property prices, and filter listings by location, budget, bedrooms, and bathrooms to find your ideal property.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const page = async () => {
  await connection();
  return (
    <>
      <PropertiesListingPage />
      <GetInTouch />
    </>
  );
};

export default page;
