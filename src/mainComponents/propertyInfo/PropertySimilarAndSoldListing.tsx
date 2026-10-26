/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getOfficeName } from "@/src/utilities/utilities";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAuthContext } from "../auth/AuthContext";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCardSkeleton from "@/src/components/common/propertiesCard/PropertyCardSkeleton";
import { PropertyCardProps } from "@/src/components/common/propertiesCard/PropertiesCard";
import SimilarPropertiesCard, {
  SimilarPropertiesCardProps,
} from "@/src/components/common/propertiesCard/SimilarPropertiesCard";
import {
  useGetSimilarRealEstateProperties,
  useGetSimilarRealEstateSoldProperties,
} from "@/src/hooks/listing/useRealEstateListingQueries";

const swiperConfig = {
  spaceBetween: 12,
  slidesPerView: 1,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  modules: [Pagination, Navigation, Autoplay],
  loop: false,
  pagination: {
    clickable: true,
    dynamicBullets: true,
  },
  breakpoints: {
    640: { slidesPerView: 1.5, spaceBetween: 20 },
    1024: { slidesPerView: 3.2, spaceBetween: 20 },
    1600: {
      slidesPerView: 4.1,
      spaceBetween: 24,
    },
  },
  speed: 900,
};

const PropertySimilarAndSoldListing = ({
  city,
  propertyId,
  beds,
  lotSize,
  price,
  baths,
  livingArea,
  isDialog =false,
}: {
  city?: string;
  beds: number;
  lotSize?: number;
  propertyId: string;
  price?: number;
  baths?: number;
  livingArea?: number;
  isDialog?: boolean;
}) => {
  const { isLoggedIn } = useAuthContext();
  const { data: me } = useGetMe();

  // 🔹 Mapping Function
  const mapProperty = (
    listing: any,
    isDdf?: boolean,
  ): SimilarPropertiesCardProps => ({
    id: listing.documentId,
    image: listing?.media_url,
    title: listing?.property_sub_type,
    price: listing?.price,
    daysAgo:
      Number(listing?.old_price) > 0 || listing?.standard_status === "Closed"
        ? listing?.ModificationTimestamp
        : (listing?.OriginalEntryTimestamp ??
          listing?.raw_data?.BridgeModificationTimestamp ??
          0),
    address: listing?.address,
    sqft: listing?.area ?? listing?.Living_area ?? 0,
    beds: listing?.bedrooms ?? 0,
    baths: listing?.bathrooms ?? 0,
    likesCount: listing?.likesCount ?? 0,
    lotSize: listing?.lot_size_area ?? 0,
    lotSizeUnits: listing?.lot_size_units,
    structureType: listing?.structure_type ?? "",
    oldPrice: Number(listing?.old_price) || 0,
    assessedDiff: listing.price
      ? Number(
        ((listing.price - (listing.annual_tax ?? 0)) / listing.price).toFixed(
          1,
        ),
      )
      : 0,
    mls: listing?.listing_id,
    realtor: listing?.office_name ?? getOfficeName(listing),
    status: listing?.standard_status || "",
    age: listing?.age,
    distance: listing?.distanceKm,
    listingDate: listing?.OriginalEntryTimestamp,
    isFavourite: listing?.users?.some(
      (user: any) => user?.documentId === me?.documentId,
    ),
    isDdf: !!isDdf,
  });

  // Similar Properties
  const { data: similarList = [], isLoading: isLoadingSimilar } =
    useGetSimilarRealEstateProperties(propertyId, {
      select(data) {
        return data?.data
          ?.sort((a: any, b: any) => {
            const aTime = a?.distanceKm
              ? parseFloat(a.distanceKm)
              : 0;

            const bTime = b?.distanceKm
              ? parseFloat(b.distanceKm)
              : 0;

            return aTime - bTime; // closest first
          })
          .map((item: any) => mapProperty(item, true));
      },
    });
  // Similar Sold Properties
  const { data: similarSoldList = [], isLoading: isLoadingSimilarSold } =
    useGetSimilarRealEstateSoldProperties(propertyId, {
      select(data) {
        return data?.data
          ?.sort((a: any, b: any) => {
            const aTime = a?.OriginalEntryTimestamp
              ? Date.parse(a.OriginalEntryTimestamp)
              : 0;

            const bTime = b?.OriginalEntryTimestamp
              ? Date.parse(b.OriginalEntryTimestamp)
              : 0;

            return bTime - aTime; // newest first
          })
          .map((item: any) => mapProperty(item, false));
      },
    });

  const renderSlider = (
    list: PropertyCardProps[],
    isLoading: boolean,
    isLoginOverride?: boolean,
    navId?: string,
    typeProperty?: string
  ) => {
    if (isLoading) {
      return (
        <div className="flex gap-6 justify-center-safe">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!list.length) {
      return (
        <p className="text-center py-10 font-semibold">{`No ${typeProperty} Properties Found in ${city}`}</p>
      );
    }

    return (
      <div className="relative group/slider ">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 flex justify-between pointer-events-none px-1 md:-mx-5">
          {/* Prev */}
          <button
            className={[
              `${navId}-prev`,
              "pointer-events-auto",
              "relative overflow-hidden",
              "w-16 h-16 rounded-full",
              "flex items-center justify-center",
              "bg-white",
              // clean shadow edge — no CSS border
              "shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.06)]",
              "text-primary",
              // hover: blue glow, no border
              "hover:shadow-[0_0_0_4px_rgba(34,85,139,0.12),0_4px_20px_rgba(34,85,139,0.22)]",
              "group/btn",
              "-translate-x-3 opacity-0",
              "group-hover/slider:translate-x-0 group-hover/slider:opacity-100",
              "transition-all duration-300 ease-out",
              "disabled:opacity-0 disabled:pointer-events-none",
            ].join(" ")}
          >
            <span className="absolute inset-0 rounded-full bg-primary scale-0 group-hover/btn:scale-100 transition-transform duration-300 ease-out origin-center" />
            <ChevronLeft
              size={22}
              strokeWidth={2.5}
              className="relative z-10 text-primary group-hover/btn:text-white transition-all duration-300 group-hover/btn:-translate-x-0.5"
            />
          </button>

          {/* Next */}
          <button
            className={[
              `${navId}-next`,
              "pointer-events-auto",
              "relative overflow-hidden",
              "w-16 h-16 rounded-full",
              "flex items-center justify-center",
              "bg-white",
              // clean shadow edge — no CSS border
              "shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.06)]",
              "text-primary",
              // hover: blue glow, no border
              "hover:shadow-[0_0_0_4px_rgba(34,85,139,0.12),0_4px_20px_rgba(34,85,139,0.22)]",
              "group/btn",
              "translate-x-3 opacity-0",
              "group-hover/slider:translate-x-0 group-hover/slider:opacity-100",
              "transition-all duration-300 ease-out",
              "disabled:opacity-0 disabled:pointer-events-none",
            ].join(" ")}
          >
            <span className="absolute inset-0 rounded-full bg-primary scale-0 group-hover/btn:scale-100 transition-transform duration-300 ease-out origin-center" />
            <ChevronRight
              size={22}
              strokeWidth={2.5}
              className="relative z-10 text-primary group-hover/btn:text-white transition-all duration-300 group-hover/btn:translate-x-0.5"
            />
          </button>
        </div>
        <Swiper
          {...swiperConfig}
          navigation={{
            prevEl: `.${navId}-prev`,
            nextEl: `.${navId}-next`,
          }}
          className="pt-3! pb-9! mySwiper w-full h-full grid!"
        >
          {list.map((item) => (
            <SwiperSlide key={item.id}>
              <SimilarPropertiesCard
                {...item}
                isLogin={isLoginOverride ?? isLoggedIn}
                isSold={item.status === "Closed" || item.status === "Pending"}
                isExpired={item.status === "Expired"}
                targetPrice={price}
                targetBeds={beds}
                targetBaths={baths}
                targetLotSize={lotSize}
                targetLivingArea={livingArea}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };
  return (
    <div
      className={`space-y-10 lg:mb-20 mb-10 h-auto xl:max-w-screen-2xl mx-auto w-full ${isDialog ? "md:px-9 px-6" : "xl:px-16 md:px-9 px-6"
        }`}
    >
      <div className="flex flex-col gap-4 h-full">
        <Heading
          tagType="h3"
          type={IHeadingTypes.heading20}
          content="Similar Properties"
        />
        {renderSlider(similarList, isLoadingSimilar, true, "newly-listed", "Similar")}
      </div>

      <div className="flex flex-col gap-4">
        <Heading
          tagType="h3"
          type={IHeadingTypes.heading20}
          content="Sold Properties"
        />
        {renderSlider(
          similarSoldList,
          isLoadingSimilarSold,
          isLoggedIn,
          "sold",
          "Sold"
        )}
      </div>
    </div>
  );
};

export default PropertySimilarAndSoldListing;
