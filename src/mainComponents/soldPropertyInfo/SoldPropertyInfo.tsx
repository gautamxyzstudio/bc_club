/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef } from "react";
import GetInTouch from "../getInTouch/GetInTouch";
import Image from "next/image";
import { Images } from "@/src/app/exports";
import { useAuthContext } from "../auth/AuthContext";
import { useGetRealEstateListingById } from "@/src/hooks/listing/useRealEstateListingQueries";
import FaqsSection from "../propertyInfo/propertyInformation/FaqsSection";
import PropertySimilarAndSoldListing from "../propertyInfo/PropertySimilarAndSoldListing";
import PropertyTopAddressSection from "../propertyInfo/PropertyTopAddressSection";
import PropertyGallery from "../propertyInfo/PropertyGallery";
import PropertyInformation from "../propertyInfo/propertyInformation/PropertyInformation";
import PropertyInfoSkeleton from "../propertyInfo/PropertyInfoSkeleton";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

const SoldPropertyInfo = ({ paramsId }: { paramsId: string }) => {
  const { isLoggedIn, setOpenLogin, setOpenSignup, authLoading } = useAuthContext();
  const {
    data: listing,
    isLoading: loading,
    error,
  } = useGetRealEstateListingById(paramsId, {
    select: (res: any) => res?.data || res,
    enabled: !!paramsId,
    retry: false,
  });

  const hasLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && listing && (listing.documentId || paramsId)) {
      const targetId = listing.documentId || paramsId;
      if (hasLoggedRef.current !== targetId) {
        hasLoggedRef.current = targetId;
        logPropertySearchActivity({
          propertySearchType: "find_home",
          searchTerm: listing.address || "",
          propertyId: targetId,
        });
      }
    }
  }, [isLoggedIn, listing, paramsId]);

  if (authLoading || (isLoggedIn && loading)) return <PropertyInfoSkeleton />;
  if (isLoggedIn && error)
    return (
      <div className="p-10 text-red-500 xl:max-w-screen-2xl mx-auto w-full h-[50svh] flex justify-center items-center">
        {error.message || "An error occurred"}
      </div>
    );
  if (!listing && isLoggedIn)
    return (
      <div className="p-10 text-gray-500 xl:max-w-screen-2xl mx-auto w-full h-[50svh] flex justify-center items-center">
        Property not found
      </div>
    );

  const photoUrl =
    listing?.media?.[0]?.url ||
    listing?.media?.[0] ||
    (Array.isArray(listing?.media_url)
      ? listing?.media_url[0]
      : listing?.media_url);

  const displayAddress = listing?.address
    ? `${listing.address}${listing.city ? `, ${listing.city}` : ""}`
    : "[Street address], [City]";

  return !isLoggedIn ? (
    <section className="xl:max-w-screen-2xl mx-auto min-h-[80svh] flex flex-col justify-center items-center w-full px-4 sm:px-6 py-12 xl:pt-20 xl:pb-24 md:pt-24 md:pb-20 pt-16 pb-12">
      <main className="max-w-140 w-full mx-auto p-4 sm:p-5 sm:px-6 pb-8 flex flex-col gap-3.5 bg-white text-left">
        {/* Sold Card */}
        <article className="border border-[#E5E7EB] rounded-[18px] overflow-hidden bg-white shadow-xs">
          <div className="h-35 bg-[#CBD5E1] relative flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayAddress}
                className="w-full h-full object-cover filter blur-[3px] scale-105"
              />
            ) : (
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
              </svg>
            )}
            <span className="absolute top-2.5 left-2.5 bg-[#9F1239] text-white text-xs font-extrabold tracking-[0.5px] px-2.5 py-1 rounded-lg uppercase z-10">
              SOLD
            </span>
          </div>

          <div className="p-3.5 sm:p-4 flex flex-col gap-2.5">
            <div className="text-[15px] font-bold text-[#111827]">
              {displayAddress}
            </div>
            <dl className="grid grid-cols-2 gap-2.5 m-0">
              <div>
                <dt className="text-xs text-[#4B5563]">Sold price</dt>
                <dd
                  className="m-0 text-lg font-extrabold text-[#111827] blur-[6px] select-none"
                  aria-label="Hidden until you sign in"
                >
                  $1,248,000
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4B5563]">Sold date</dt>
                <dd
                  className="m-0 text-lg font-extrabold text-[#111827] blur-[6px] select-none"
                  aria-label="Hidden until you sign in"
                >
                  Sep 14
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4B5563]">vs. asking</dt>
                <dd
                  className="m-0 text-lg font-extrabold text-[#111827] blur-[6px] select-none"
                  aria-label="Hidden until you sign in"
                >
                  +3.2%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4B5563]">Days on market</dt>
                <dd
                  className="m-0 text-lg font-extrabold text-[#111827] blur-[6px] select-none"
                  aria-label="Hidden until you sign in"
                >
                  12
                </dd>
              </div>
            </dl>
          </div>
        </article>

        {/* Free for everyone badge */}
        <span className="self-start inline-block bg-[#F5B800] text-[#111827] text-xs font-extrabold tracking-wider px-3 py-1.5 rounded-full uppercase">
          FREE FOR EVERYONE
        </span>

        {/* Heading & Subtitle */}
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#111827] tracking-tight leading-tight m-0">
          See what this home really sold for
        </h1>
        <p className="text-[15px] leading-relaxed text-[#4B5563] m-0">
          One free account unlocks all of this across BC:
        </p>

        {/* Pills */}
        <ul
          className="flex flex-wrap gap-1.5 list-none m-0 p-0"
          aria-label="Included free"
        >
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Sold prices
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Foreclosures
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Floodplain maps
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Lot lines
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Map tools
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            School rankings
          </li>
          <li className="bg-[#EEF3F9] text-[#1F4F86] text-[13px] font-bold px-2.5 py-1.5 rounded-full">
            Catchments
          </li>
        </ul>

        {/* Unlock Button */}
        <button
          type="button"
          onClick={() => setOpenSignup(true)}
          className="flex items-center justify-center gap-2 w-full h-13.5 border-0 rounded-[14px] bg-[#1F4F86] hover:bg-[#163A63] text-white text-[17px] font-bold cursor-pointer transition shadow-xs"
        >
          Unlock for free
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        {/* Fine print */}
        <p className="m-0 text-center text-sm text-[#4B5563]">
          Takes 30 seconds ·{" "}
          <button
            type="button"
            onClick={() => setOpenLogin(true)}
            className="font-bold text-[#111827] underline decoration-[#F5B800] decoration-2 underline-offset-2 hover:opacity-80 cursor-pointer bg-transparent border-0 p-0"
          >
            I already have an account
          </button>
        </p>
      </main>
    </section>
  ) : (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full bg-background flex flex-col xl:px-16 md:px-9 px-6 xl:pt-35.5 xl:pb-28.25 md:pt-28 md:pb-25 pt-21 pb-13 items-center-safe">
        <PropertyTopAddressSection property={listing} />
        {listing?.media && listing.media.length > 0 ? (
          <PropertyGallery images={listing?.media} />
        ) : (
          <div className="w-1/2 xl:h-134 md:h-76.5 h-56.5 relative cursor-pointer md:rounded-2xl rounded-xl">
            <Image
              title="image title"
              className="w-full h-full object-cover rounded-xl"
              src={Images.apartment}
              alt="property image not found*"
              width={1400}
              height={1400}
              loading="eager"
            />
          </div>
        )}
        <PropertyInformation property={listing} />
      </section>

      {/* Sections */}
      <PropertySimilarAndSoldListing
        propertyId={listing.documentId}
        city={listing?.city}
        beds={listing.bedrooms}
        lotSize={listing?.lot_size_area}
        price={listing.price}
        baths={listing.bathrooms}
        livingArea={listing.area}
      />

      <FaqsSection />

      <GetInTouch />
    </>
  );
};

export default SoldPropertyInfo;
