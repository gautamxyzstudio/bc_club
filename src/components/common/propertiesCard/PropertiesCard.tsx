"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import React from "react";
import LineGradient from "../lineGradient/LineGradient";
import Description, { IDescriptionTypes } from "../../description/Description";
import { Icons } from "@/src/app/exports";
import CustomButton from "../../button/CustomButton";
import { usePathname } from "next/navigation";
import Link from "next/link";

export interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  daysAgo: number;
  address: string;
  sqft: string | number;
  beds: number;
  baths: number;
  priceDrop?: number;
  assessedDiff: number;
  mls: string;
  realtor: string;
  isLogin?: boolean;
}

const PropertiesCard: React.FC<PropertyCardProps> = ({
  id,
  image,
  title,
  price,
  daysAgo,
  address,
  sqft,
  beds,
  baths,
  priceDrop,
  assessedDiff,
  mls,
  realtor,
  isLogin,
}) => {
  const pathname = usePathname();

  return (
    <Link
      href={`${!isLogin ? "#" : `/property-info/${id}`}`}
      className={`${
        pathname === "/properties" ? "md:w-[49%] w-full " : "w-full"
      }`}
    >
      <div
        className={`relative rounded-xl flex overflow-hidden border border-borderColor hover:border-none hover:shadow-[0_0_20px_0_rgba(0,0,0,0.12)] transition h-auto w-full ${
          isLogin && "group"
        }`}
      >
        <div className="flex flex-col gap-y-3 xl:p-5 p-4 w-full h-auto">
          <div className="relative">
            <div className="w-full h-56 overflow-clip rounded-lg">
              <Image
                src={image}
                alt={title}
                className="w-full h-56 object-cover rounded-lg group-hover:scale-125 transition duration-300 ease-in-out"
                width={700}
                height={403}
              />
            </div>

            {/* Favorite Icon */}
            <button className="absolute top-3 left-3 bg-background p-2 rounded-full shadow">
              <Heart className="w-5 h-5 text-primary" />
            </button>

            {/* Days Ago */}
            <span className="absolute top-3 right-3 bg-background text-primary px-3 py-1.5 text-sm rounded-full">
              {daysAgo} days ago
            </span>

            {/* Price Drop Banner */}
            {priceDrop && (
              <span
                className="absolute bottom-3 right-0 bg-secondary text-background pl-7 pr-3 pt-2 pb-2 text-xs h-auto font-medium"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 15% 50%)",
                }}
              >
                Price Drop {priceDrop}%
              </span>
            )}
          </div>

          <div className="space-y-3 mt-1">
            <h3 className="font-bold text-xl">{title}</h3>
            <div
              className={`flex justify-between ${
                pathname === "/properties"
                  ? "xl:flex-col gap-y-1 xl:items-start items-end-safe "
                  : "items-end-safe"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs text-lightWhite">List Price Now</span>
                <p className="text-2xl font-bold text-primary">
                  ${price.toLocaleString()}
                </p>
              </div>
              {/* Assessed Diff */}
              <p
                className={`text-xs font-medium inline-flex items-center gap-1 p-1 rounded-md ${
                  assessedDiff >= 0
                    ? "text-green bg-lightGreen"
                    : "text-red bg-lightRed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    width="20"
                    height="20"
                    rx="2"
                    className={`${
                      assessedDiff >= 0 ? "fill-green" : "fill-red"
                    }`}
                  />
                  {assessedDiff >= 0 ? (
                    <path
                      d="M15 7.5L12.3535 10.1465C12.2597 10.2402 12.1326 10.2929 12 10.2929C11.8674 10.2929 11.7403 10.2402 11.6465 10.1465L10.8535 9.3535C10.7597 9.25976 10.6326 9.20711 10.5 9.20711C10.3674 9.20711 10.2403 9.25976 10.1465 9.3535L8 11.5"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M15.8319 11.2963L12.4012 7.86562C12.2797 7.74411 12.1149 7.67585 11.943 7.67585C11.7711 7.67585 11.6063 7.74411 11.4848 7.86562L10.4568 8.89358C10.3352 9.01509 10.1704 9.08335 9.99855 9.08335C9.82669 9.08335 9.66186 9.01509 9.54031 8.89358L6.75781 6.11108"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  <path
                    d="M4.16406 4.16663V13.7592C4.16406 14.4851 4.16406 14.8481 4.30536 15.1255C4.42964 15.3694 4.62794 15.5677 4.87184 15.692C5.14925 15.8333 5.51221 15.8333 6.23814 15.8333H15.8307"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {Math.abs(assessedDiff)}% than Assessed Value 2025
              </p>
            </div>

            <p className="text-lightWhite text-sm">{address}</p>

            {/* Specs */}
            <div
              className={`flex items-center justify-between ${
                pathname === "/properties" ? "gap-x-1" : "gap-3"
              }`}
            >
              <div
                className={`flex flex-row items-center gap-x-1 justify-center py-2 rounded-md bg-gray text-lightWhite text-sm ${
                  pathname === "/properties" ? "w-full" : "w-full"
                }`}
              >
                <Image
                  src={Icons.scale}
                  alt="sqft"
                  width={100}
                  height={100}
                  className="w-5 h-5 object-contain"
                />
                <span>{sqft} sqft</span>
              </div>
              <div
                className={`flex flex-row items-center gap-x-1 justify-center py-2 rounded-md bg-gray text-lightWhite text-sm ${
                  pathname === "/properties" ? "w-full" : "w-full"
                }`}
              >
                <Image
                  src={Icons.bedroom}
                  alt="bedroom"
                  width={100}
                  height={100}
                  className="w-5 h-5 object-contain"
                />
                <span>{beds}</span>
              </div>
              <div
                className={`flex flex-row items-center gap-x-1 justify-center py-2 rounded-md bg-gray text-lightWhite text-sm ${
                  pathname === "/properties" ? "w-full" : "w-full"
                }`}
              >
                <Image
                  src={Icons.bathtub}
                  alt="bathtub"
                  width={100}
                  height={100}
                  className="w-5 h-5 object-contain"
                />
                <span>{baths}</span>
              </div>
            </div>
            <LineGradient />
            <div className="w-full flex flex-row flex-wrap items-center justify-between">
              <Description
                content={realtor}
                type={IDescriptionTypes.dec14}
                customClasses="text-lightWhite"
              />
              <Description
                content={`MLS® ${mls}`}
                type={IDescriptionTypes.dec14}
                customClasses="text-lightWhite"
              />
            </div>
          </div>
        </div>
        {!isLogin && (
          <div className="bg-[#FFFFFF1f] backdrop-blur-md w-full h-full absolute rounded-xl justify-center items-center-safe flex flex-col">
            <span className="absolute top-9 right-9 bg-background text-primary px-3 py-1.5 text-sm rounded-full">
              ## days ago
            </span>
            <CustomButton
              label="Login Required"
              buttonType="primary"
              customClasses="font-bold py-4 px-18.5 absolute bottom-[105px]"
              onClick={() => console.log(isLogin)}
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertiesCard;
