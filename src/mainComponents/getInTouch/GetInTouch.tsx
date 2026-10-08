"use client";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import Link from "next/link";
import React from "react";
import { GetInTouchLinkListProps, realEstateBC, saleBC, soldBC } from ".";
import GetInTouchForm from "./GetInTouchForm";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import { Icons } from "@/src/app/exports";
import { usePathname, useRouter } from "next/navigation";
import { useListingStore } from "@/src/store/useListingStore";
import { useAuthContext } from "../auth/AuthContext";

const GetInTouchLink: React.FC<
  GetInTouchLinkListProps & {
    onTitleClick?: (title: string) => void;
    onLinkClick?: (label: string) => void;
  }
> = ({ title, linkList, onTitleClick, onLinkClick }) => {
  return (
    <div className="flex flex-col gap-y-5 text-nowrap">
      <span
        className={`font-bold text-base ${onTitleClick ? "cursor-pointer hover:text-primary transition-all underline-offset-4 hover:underline" : ""}`}
        onClick={() => onTitleClick?.(title)}
      >
        {title}
      </span>
      <ul className="list-none flex flex-col text-sm text-lightWhite space-y-4">
        {linkList.map((item, idx) => (
          <li
            key={idx}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => onLinkClick?.(item.label)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const GetInTouch = () => {
  const path = usePathname();
  const router = useRouter();
  const { updateInstanceFilter } = useListingStore();
  const { isLoggedIn, setOpenLogin } = useAuthContext();

  const handleTitleClick = (title: string) => {
    let status = "forSale";
    if (title.toLowerCase().includes("sold")) {
      status = "sold";
    } else if (title.toLowerCase().includes("market")) {
      status = "expired";
    }

    if ((status === "sold" || status === "expired") && !isLoggedIn) {
      setOpenLogin(true);
      return;
    }

    updateInstanceFilter("list", "status", status);

    if (path !== "/properties") {
      router.push("/properties");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLinkClick = (label: string) => {
    // Determine status
    let status = "forSale";
    if (label.toLowerCase().includes("sold")) {
      status = "sold";
    }

    if (status === "sold" && !isLoggedIn) {
      setOpenLogin(true);
      return;
    }

    // Extract city/location from "Homes For Sale in Vancouver"
    const cityMatch = label.match(/in\s+(.+)$/i);
    const location = cityMatch ? cityMatch[1].trim() : "";

    updateInstanceFilter("list", "status", status);
    if (location && !location.toLowerCase().includes("sitemap")) {
      updateInstanceFilter("list", "location", location);
    }

    if (path !== "/properties") {
      router.push("/properties");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      className={`xl:max-w-screen-2xl mx-auto w-full flex flex-col xl:px-16 md:px-13 px-6 ${path == "/contact-us" ? "xl:py-30 md:pt-28 md:pb-20 pt-25 pb-12" : "xl:py-20 md:py-20.5 pt-13 pb-8"} bg-gray `}
    >
      <div className="w-full flex flex-col xl:flex-row items-start justify-between gap-y-5">
        <div className="w-full xl:w-[43%] flex flex-col">
          <Heading
            tagType="h2"
            type={IHeadingTypes.heading48}
            content={`Love To Hear From You,\nGet In Touch`}
            customClasses="whitespace-break-spaces md:text-start text-center"
          />
          <Description
            type={IDescriptionTypes.dec16}
            customClasses="text-black70 md:text-start text-center md:mt-5 mt-4 whitespace-break-spaces"
            content={`Whether you're buying, selling, investing, or researching the BC real estate market, we're here to help.\n\nBC Real Estate Market helps you search BC homes for sale, explore neighbourhood trends, compare property values, track local market activity, and discover valuable property insights across British Columbia.\n\nHave questions about a property, neighbourhood, market trends, or using our platform? Fill out the form below and we'll get back to you as soon as possible.
 `}
          />
          {/* <div className="flex flex-row items-center-safe gap-x-3 md:mt-6 mt-4">
            <div className="bg-secondary cursor-pointer md:p-1.5 p-1 rounded-lg md:w-12.5 md:h-12.5 w-10 h-10">
              <Image
                title="image title"
                src={Icons.emailIcon}
                alt={"mail"}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Mail</span>
              <Link
                href={"mailto:info@bcrealestatemarket.com"}
                className="text-lg font-medium"
              >
                info@bcrealestatemarket.com
              </Link>
            </div>
          </div> */}
        </div>
        <GetInTouchForm />
      </div>
      <LineGradient customClasses="md:my-13 my-8" />
      <div className="flex flex-row w-full flex-nowrap whitespace-break-spaces justify-between gap-x-15 items-start overflow-x-scroll scrollBar overflow-hidden">
        <GetInTouchLink
          title={saleBC.title}
          linkList={saleBC.linkList}
          onTitleClick={handleTitleClick}
          onLinkClick={handleLinkClick}
        />
        <GetInTouchLink
          title={soldBC.title}
          linkList={soldBC.linkList}
          onTitleClick={handleTitleClick}
          onLinkClick={handleLinkClick}
        />
        <GetInTouchLink
          title={realEstateBC.title}
          linkList={realEstateBC.linkList}
          onTitleClick={handleTitleClick}
          onLinkClick={handleLinkClick}
        />
      </div>
    </section>
  );
};

export default GetInTouch;
