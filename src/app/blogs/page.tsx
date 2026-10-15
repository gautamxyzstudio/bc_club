
import BlogPage from "@/src/mainComponents/blog/BlogPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BC Real Estate Blog | Market News & Buying Guides",
  description:
    "Read the latest BC real estate news, market updates, home-buying tips, selling guides, and neighbourhood insights to make informed property decisions.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Condos for Sale BC, Houses for Sale BC, Townhouses for Sale BC, Vancouver Real Estate, Burnaby Real Estate, Surrey Real Estate, Richmond Real Estate, Coquitlam Real Estate, Victoria Real Estate, Kelowna Real Estate, Abbotsford Real Estate, White Rock Real Estate, Nanaimo Real Estate, New Westminster Real Estate, North Vancouver Real Estate, West Vancouver Real Estate, Langley Real Estate, Delta Real Estate, Maple Ridge Real Estate, Chilliwack Real Estate",
  robots: "index, follow",
  openGraph: {
    title: "BC Real Estate Blog | Market News & Buying Guides",
    description:
      "Read the latest BC real estate news, market updates, home-buying tips, selling guides, and neighbourhood insights to make informed property decisions.",
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
    title: "BC Real Estate Blog | Market News & Buying Guides",
    description:
      "Read the latest BC real estate news, market updates, home-buying tips, selling guides, and neighbourhood insights to make informed property decisions.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};

const page = () => {
  return (
    <BlogPage />
  );
};

export default page;
