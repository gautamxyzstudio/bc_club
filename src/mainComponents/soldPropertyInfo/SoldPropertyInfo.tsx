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
  const { isLoggedIn, setOpenLogin, authLoading } = useAuthContext();
  const {
    data: listing,
    isLoading: loading,
    error,
  } = useGetRealEstateListingById(paramsId, {
    select: (res: any) => res?.data || res,
    enabled: !!paramsId && isLoggedIn,
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

  if (authLoading || loading) return <PropertyInfoSkeleton />;
  if (error)
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

  return !isLoggedIn ? (
    <section className="xl:max-w-screen-2xl mx-auto min-h-[80svh] flex flex-col justify-center items-center w-full px-6 py-12 text-center xl:pt-35.5 xl:pb-28.25 md:pt-28 md:pb-25 pt-21 pb-13">
      <h3 className="text-xl font-semibold mb-2">Login Required</h3>

      <p className="text-gray-600 mb-5">
        Please login to view sold properties details.
      </p>

      <button
        onClick={() => setOpenLogin(true)}
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium"
      >
        Login
      </button>
    </section>
  ) : (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full bg-background flex flex-col xl:px-16 md:px-13 px-6 xl:pt-35.5 xl:pb-28.25 md:pt-28 md:pb-25 pt-21 pb-13 items-center-safe">
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
