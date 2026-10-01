"use client";
import React, { useEffect, useRef } from "react";
import PropertyTopAddressSection from "./PropertyTopAddressSection";
import PropertyGallery from "./PropertyGallery";
import PropertyInformation from "./propertyInformation/PropertyInformation";
import GetInTouch from "../getInTouch/GetInTouch";
import PropertyInfoSkeleton from "./PropertyInfoSkeleton";
import Image from "next/image";
import { Images } from "@/src/app/exports";
import PropertySimilarAndSoldListing from "./PropertySimilarAndSoldListing";
import FaqsSection from "./propertyInformation/FaqsSection";
import { useGetRealEstateListingById } from "@/src/hooks/listing/useRealEstateListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

const PropertyInfo = ({
  paramsId,
  isDialog = false,
}: {
  paramsId: string;
  isDialog?: boolean;
}) => {
  const {
    data: listing,
    isLoading: loading,
    error,
  } = useGetRealEstateListingById(paramsId, {
    select: (res: any) => res?.data || res,
  });

  const hasLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (listing && (listing.documentId || paramsId)) {
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
  }, [listing, paramsId]);

  if (loading) return <PropertyInfoSkeleton />;
  if (error)
    return (
      <div className="p-10 text-red-500 xl:max-w-screen-2xl mx-auto w-full h-[50svh] flex justify-center items-center">
        {error.message || "An error occurred"}
      </div>
    );
  if (!listing)
    return (
      <div className="p-10 text-gray-500 xl:max-w-screen-2xl mx-auto w-full h-[50svh] flex justify-center items-center">
        Property not found
      </div>
    );

  return (
    <>
      <section
        className={`xl:max-w-screen-2xl mx-auto w-full bg-background flex flex-col xl:px-16 md:px-13 px-6 xl:pb-28.25 md:pb-25 pb-13 items-center-safe ${
          isDialog
            ? "pt-6 md:pt-8 xl:pt-10"
            : "xl:pt-35.5 md:pt-28 pt-21"
        }`}
      >
        <PropertyTopAddressSection property={listing} />
        {listing?.media_url && listing.media_url.length > 0 ? (
          <PropertyGallery images={listing?.media_url} />
        ) : listing?.media && listing.media.length > 0 ? (
          <PropertyGallery images={listing?.media} />
        ) : (
          <div className="w-1/2 xl:h-134 md:h-76.5 h-56.5 relative cursor-pointer md:rounded-2xl rounded-xl">
            <Image
              title="Property image not found*"
              className="w-full h-full object-cover rounded-xl"
              src={Images.apartment}
              alt="property image not found*"
              width={1400}
              height={1400}
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
        livingArea={listing.Living_area}
      />

      <FaqsSection />

      <GetInTouch />
    </>
  );
};

export default PropertyInfo;
