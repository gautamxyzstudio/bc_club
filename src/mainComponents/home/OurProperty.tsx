/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Dialog } from "@mui/material";
import { FiArrowLeft, FiMaximize2, FiMinimize2 } from "react-icons/fi";

import "swiper/css/navigation";

import CustomButton from "@/src/components/button/CustomButton";
import PropertiesCard, {
  PropertyCardProps,
} from "@/src/components/common/propertiesCard/PropertiesCard";
import PropertyCardSkeleton from "@/src/components/common/propertiesCard/PropertyCardSkeleton";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import { getOfficeName } from "@/src/utilities/utilities";
import { useRouter } from "next/navigation";
import RippleButton from "@/src/components/button/RippleButton";
import { useAuthContext } from "../auth/AuthContext";
import { useGetRealEstateListings } from "@/src/hooks/listing/useRealEstateListingQueries";
import PropertyInfo from "@/src/mainComponents/propertyInfo/PropertyInfo";

const tabList = [
  "Newly Listed properties",
  "Recent Priced Properties",
  "Previously Listed Properties",
  "Sold properties",
];

const OFFSET = 120;

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
    640: { slidesPerView: 2.3, spaceBetween: 20 },
    1024: { slidesPerView: 3.2, spaceBetween: 16 },
  },
  speed: 900,
};

const OurProperty = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  const [tab, setTab] = useState(tabList[0]);

  const [city, setCity] = useState("Vancouver"); // default fallback

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  const refs = {
    "Newly Listed properties": useRef<HTMLDivElement>(null),
    "Recent Priced Properties": useRef<HTMLDivElement>(null),
    "Previously Listed Properties": useRef<HTMLDivElement>(null),
    "Sold properties": useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (tabName: string) => {
    setTab(tabName);
    const target = refs[tabName as keyof typeof refs]?.current;

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;

      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const { data: me } = useGetMe();

  // 🔹 Mapping Function
  const mapProperty = (listing: any, isDdf?: boolean): PropertyCardProps => ({
    id: listing.documentId,
    image: listing?.media_url,
    title: listing?.property_sub_type,
    price: listing?.price,
    daysAgo:
      listing.standard_status !== "Active"
        ? listing?.ModificationTimestamp
        : Number(listing?.old_price) > 0
          ? listing?.ModificationTimestamp
          : (listing?.OriginalEntryTimestamp ??
            listing?.raw_data?.BridgeModificationTimestamp ??
            0),
    address: listing?.address,
    neighborhood: listing?.neighborhood,
    sqft: listing?.area ?? listing?.Living_area ?? 0,
    beds: listing?.bedrooms ?? 0,
    baths: listing?.bathrooms ?? 0,
    likesCount: listing?.likesCount ?? 0,
    lotSize: listing?.lot_size_area ?? "",
    lotSizeUnits: listing?.lot_size_units ?? "",
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
    isFavourite: listing?.users?.some(
      (user: any) => user?.documentId === me?.documentId,
    ),
    isDdf: !!isDdf,
  });

  const { data: newList = [], isLoading: isLoadingNew } =
    useGetRealEstateListings(
      { location: city, page: 1, pageSize: 30 },
      {
        select: (res: any) => {
          return (
            res?.data
              ?.filter((l: any) => l?.priceChangedAt === null && l?.property_sub_type?.toLowerCase() !== 'other')
              ?.sort((a: any, b: any) => {
                const aTime = a?.OriginalEntryTimestamp
                  ? Date.parse(a.OriginalEntryTimestamp)
                  : 0;

                const bTime = b?.OriginalEntryTimestamp
                  ? Date.parse(b.OriginalEntryTimestamp)
                  : 0;

                return bTime - aTime; // newest first
              })
              ?.map((l: any) => mapProperty(l, true)) || []
          );
        },
      },
    );

  const { data: priceUpdateList = [], isLoading: isLoadingPriceUpdate } =
    useGetRealEstateListings(
      { location: city, page: 1, pageSize: 30, priceChange: "all" },
      {
        select: (res: any) => {
          return (
            res?.data
              ?.sort((a: any, b: any) => {
                const aTime = a?.priceChangedAt
                  ? Date.parse(a.priceChangedAt)
                  : 0;

                const bTime = b?.priceChangedAt
                  ? Date.parse(b.priceChangedAt)
                  : 0;

                return bTime - aTime; // newest first
              })
              ?.map((l: any) => mapProperty(l, true)) || []
          );
        },
      },
    );

  const { data: soldList = [], isLoading: isLoadingSold } =
    useGetRealEstateListings(
      {
        status: "sold",
        location: city,
        page: 1,
        pageSize: 30,
      },
      {
        select: (res: any) => {
          return (
            res?.data
              ?.filter((l: any) => l?.address && Number(l?.price) > 0)
              ?.sort((a: any, b: any) => {
                const aTime = a?.ModificationTimestamp
                  ? Date.parse(a.ModificationTimestamp)
                  : 0;

                const bTime = b?.ModificationTimestamp
                  ? Date.parse(b.ModificationTimestamp)
                  : 0;

                return bTime - aTime; // newest first
              })
              .map((l: any) => mapProperty(l, false)) || []
          );
        },
      },
    );

  const { data: expiredList = [], isLoading: isLoadingExpired } =
    useGetRealEstateListings(
      {
        status: "expired",
        location: city,
        page: 1,
        pageSize: 30,
      },
      {
        select: (res: any) => {
          return (
            res?.data
              ?.filter((l: any) => l?.address && Number(l?.price) > 0)
              .sort((a: any, b: any) => {
                const aTime = a?.ModificationTimestamp
                  ? Date.parse(a.ModificationTimestamp)
                  : 0;

                const bTime = b?.ModificationTimestamp
                  ? Date.parse(b.ModificationTimestamp)
                  : 0;

                return bTime - aTime; // newest first
              })
              .map((l: any) => mapProperty(l, false)) || []
          );
        },
      },
    );

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );

          const data = await res.json();

          const detectedCity =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            null;

          // ✅ If API returns nothing → fallback
          setCity(detectedCity || "Vancouver");
        } catch (err) {
          // ✅ If API fails
          setCity("Vancouver");
        }
      },

      // ✅ If user clicks DENY or any error
      (error) => {
        setCity("Vancouver");
      },
    );
  };

  useEffect(() => {
    // ✅ Only run after API finishes loading
    if (isLoadingNew) return;

    // ✅ If no properties found for detected city → fallback
    if (newList.length === 0 && city !== "Vancouver") {
      setCity("Vancouver");
    }
  }, [isLoadingNew, newList, city]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Vancouver");
      return;
    }

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      // ❌ If already denied → DON'T call API again
      if (result.state === "denied") {
        setCity("Vancouver");
        return;
      }
      getUserLocation();
    });
  }, []);

  const renderSlider = (
    list: PropertyCardProps[],
    isLoading: boolean,
    isLoginOverride?: boolean,
    navId?: string,
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
      return <p className="text-center py-10">No properties found</p>;
    }

    return (
      <div className="relative group/slider">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 flex justify-between pointer-events-none px-1 md:-mx-5 xl:-mx-6">
          {/* Prev */}
          <button
            className={[
              `${navId}-prev`,
              "pointer-events-auto",
              "relative overflow-hidden",
              "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full",
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
              className="relative z-10 text-primary group-hover/btn:text-white transition-all duration-300 group-hover/btn:-translate-x-0.5 w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6"
            />
          </button>

          {/* Next */}
          <button
            className={[
              `${navId}-next`,
              "pointer-events-auto",
              "relative overflow-hidden",
              "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full",
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
              className="relative z-10 text-primary group-hover/btn:text-white transition-all duration-300 group-hover/btn:translate-x-0.5 w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6"
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
              <PropertiesCard
                {...item}
                isLogin={isLoginOverride ?? isLoggedIn}
                isSold={item.status === "Closed" ? true : false}
                isExpired={item.status === "Expired" ? true : false}
                onCardClick={(id) => setSelectedPropertyId(id)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 py-16 overflow-clip">
      <Heading
        tagType="h2"
        type={IHeadingTypes.heading32}
        content="Explore Our Property"
        customClasses="text-center"
      />

      {/* Tab  */}
      <div className="xl:mt-13 md:mt-6 mt-4 w-full flex items-center-safe justify-between flex-col gap-y-2 md:flex-row">
        <div className="w-full md:w-[70%] xl:w-[80%] grid grid-cols-2 gap-3 xl:flex flex-nowrap flex-row h-auto shadow-[0_0_20px_0_rgba(0,0,0,0.12)] gap-x-2 rounded-xl p-2">
          {tabList.map((item, idx) => (
            <CustomButton
              buttonType={tab === item ? "primary" : "disabled"}
              key={idx}
              label={item}
              onClick={() => scrollToSection(item)}
              customClasses="w-full"
            />
          ))}
        </div>
        <RippleButton
          title="View All"
          buttonType="tertiary"
          onClick={() => router.push("/properties")}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M8.7842 17.7042C8.87716 17.7979 8.98777 17.8723 9.10962 17.9231C9.23148 17.9739 9.36219 18 9.4942 18C9.62621 18 9.75692 17.9739 9.87878 17.9231C10.0006 17.8723 10.1112 17.7979 10.2042 17.7042L15.2042 12.7042C15.2979 12.6112 15.3723 12.5006 15.4231 12.3788C15.4739 12.2569 15.5 12.1262 15.5 11.9942C15.5 11.8622 15.4739 11.7315 15.4231 11.6096C15.3723 11.4878 15.2979 11.3772 15.2042 11.2842L10.2042 6.2842C10.1112 6.19047 10.0006 6.11608 9.87878 6.06531C9.75692 6.01454 9.62621 5.9884 9.4942 5.9884C9.36219 5.9884 9.23148 6.01454 9.10962 6.06531C8.98777 6.11608 8.87716 6.19047 8.7842 6.2842C8.69047 6.37717 8.61608 6.48777 8.56531 6.60962C8.51454 6.73148 8.4884 6.86219 8.4884 6.9942C8.4884 7.12621 8.51454 7.25692 8.56531 7.37878C8.61608 7.50064 8.69047 7.61124 8.7842 7.7042L13.0842 11.9942L8.7842 16.2842C8.69047 16.3772 8.61608 16.4878 8.56531 16.6096C8.51454 16.7315 8.4884 16.8622 8.4884 16.9942C8.4884 17.1262 8.51454 17.2569 8.56531 17.3788C8.61608 17.5006 8.69047 17.6112 8.7842 17.7042Z"
                fill="currentColor"
              />
            </svg>
          }
          customClassName="font-black md:py-3 xl:px-5 py-2.5 px-7 rounded-lg"
          textClassName="!font-black !text-xs md:!text-sm"
        />
      </div>

      {/* Sections */}
      <div className="space-y-10 mt-10 h-auto">
        <div
          ref={refs["Newly Listed properties"]}
          className="flex flex-col gap-4 h-full"
        >
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Newly Listed Properties"
          />
          {renderSlider(newList, isLoadingNew, true, "newly-listed")}
        </div>
        <div
          ref={refs["Recent Priced Properties"]}
          className="flex flex-col gap-4 h-full"
        >
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Recent Price Properties"
          />
          {renderSlider(
            priceUpdateList,
            isLoadingPriceUpdate,
            true,
            "price-update",
          )}
        </div>

        <div
          ref={refs["Previously Listed Properties"]}
          className="flex flex-col gap-4 "
        >
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Previously Listed Properties"
          />
          {renderSlider(expiredList, isLoadingExpired, isLoggedIn, "expired")}
        </div>

        <div ref={refs["Sold properties"]} className="flex flex-col gap-4">
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Sold Properties"
          />
          {renderSlider(soldList, isLoadingSold, isLoggedIn, "sold")}
        </div>
      </div>

      {/* Property Information Tab Dialog */}
      <Dialog
        fullScreen={isFullScreen}
        maxWidth="xl"
        fullWidth
        open={Boolean(selectedPropertyId)}
        onClose={() => setSelectedPropertyId(null)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--background, #ffffff)",
              borderRadius: isFullScreen ? 0 : { xs: 0, md: "16px" },
              margin: isFullScreen ? 0 : { xs: 0, md: "24px auto" },
              maxHeight: isFullScreen
                ? "100vh"
                : { xs: "100vh", md: "calc(100vh - 48px)" },
              height: "100%",
              width: "100%",
              maxWidth: isFullScreen ? "100vw" : "1400px",
              overflow: "hidden",
              transition: "all 0.3s ease-in-out",
            },
          },
        }}
      >
        <div className="flex flex-col h-full w-full bg-background overflow-hidden">
          {/* Top Header */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm shrink-0">
            <button
              onClick={() => setSelectedPropertyId(null)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition cursor-pointer text-sm md:text-base"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
              <span>Back</span>
            </button>

            <span className="text-lg font-bold ">Property Details</span>

            {/* Actions: Full Screen Toggle & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition cursor-pointer text-sm font-medium border border-gray-200"
                title={
                  isFullScreen
                    ? "Exit Full Screen (Decrease Width)"
                    : "Full Screen (Increase Width)"
                }
                aria-label="Toggle Width"
              >
                {isFullScreen ? (
                  <FiMinimize2 className="w-4 h-4 text-gray-700" />
                ) : (
                  <FiMaximize2 className="w-4 h-4 text-gray-700" />
                )}
                <span className="hidden md:inline-block">
                  {isFullScreen ? "Collapse" : "Fullscreen"}
                </span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="w-full flex-1 overflow-y-auto">
            {selectedPropertyId && (
              <PropertyInfo paramsId={selectedPropertyId} isDialog={true} />
            )}
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default OurProperty;
