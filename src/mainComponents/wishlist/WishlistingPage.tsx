"use client";
import React, { useEffect, useRef } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useListingStore } from "@/src/store/useListingStore";
import { getOfficeName } from "@/src/utilities/utilities";
import PropertiesCard, {
  PropertyCardProps,
} from "@/src/components/common/propertiesCard/PropertiesCard";
import PropertyCardSkeleton from "@/src/components/common/propertiesCard/PropertyCardSkeleton";
import { Box, Chip, Pagination } from "@mui/material";
import CustomButton from "@/src/components/button/CustomButton";
import { FiSearch } from "react-icons/fi";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Link from "next/link";
import { useGetMyRealEstateFavorites } from "@/src/hooks/listing/useRealEstateListingQueries";

const WishlistingPage = () => {
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const { getInstanceFilters, updateInstanceFilter, clearInstanceFilters } =
    useListingStore();
  const filters = getInstanceFilters("wishlist");
  const search = filters.search || "";
  const isChip = filters.isChip || false;
  const page = filters.page || 1;
  const pageSize = 30;

  const setSearch = (val: string) =>
    updateInstanceFilter("wishlist", "search", val);
  const setIsChip = (val: boolean) =>
    updateInstanceFilter("wishlist", "isChip", val);
  const setPage = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      updateInstanceFilter("wishlist", "page", val(page));
    } else {
      updateInstanceFilter("wishlist", "page", val);
    }
  };
  const params: any = {};

  if (search) {
    params.search = search;
  }

  const select = (res: any) => {
    const listings = res?.data;
    const pagination = res?.meta?.pagination || {
      pageCount: res?.count ? Math.ceil(res.count / pageSize) : 1,
    };

    let properties: PropertyCardProps[] =
      res?.data?.map((listing: any) => ({
        id: listing?.documentId || listing?.id || listing?.listing_id,
        image:
          typeof listing?.media_url === "string"
            ? listing.media_url
            : Array.isArray(listing?.media_url)
              ? listing.media_url[0]
              : (typeof listing?.media?.[0] === "string"
                ? listing.media[0]
                : listing?.media?.[0]?.MediaURL) || "",
        title: listing?.property_sub_type || "Property",
        price: Number(listing?.price) || 0,
        daysAgo:
          Number(listing?.old_price) > 0
            ? listing?.ModificationTimestamp
            : (listing?.OriginalEntryTimestamp ??
              listing?.raw_data?.BridgeModificationTimestamp ??
              0),
        address: listing?.address
          ? listing?.city
            ? `${listing.address}, ${listing.city}${listing?.state ? `, ${listing.state}` : ""}`
            : listing.address
          : "",
        sqft:
          listing?.Living_area ?? listing?.area ?? listing?.lot_size_area ?? 0,
        beds: listing?.bedrooms ?? 0,
        baths: listing?.bathrooms ?? 0,
        likesCount: listing?.likesCount ?? 0,
        oldPrice: Number(listing?.old_price) || 0,
        lotSize: listing?.lot_size_area ?? "",
        lotSizeUnits: listing?.lot_size_units,
        structureType: listing?.structure_type ?? "",
        standardStatus: listing?.standard_status ?? "",
        priceDrop:
          listing?.PreviousListPrice > listing?.ListPrice
            ? Number(
              (
                (listing.PreviousListPrice - listing.ListPrice) /
                listing.ListPrice
              ).toFixed(1),
            )
            : undefined,
        assessedDiff: listing?.price
          ? Number(
            (
              (Number(listing.price) -
                (listing?.annual_tax ?? listing?.TaxAssessedValue ?? 0)) /
              Number(listing.price)
            ).toFixed(1),
          )
          : 0,
        mls:
          listing?.listing_id ??
          listing?.mls_number ??
          listing?.raw_data?.ListingID ??
          listing?.raw_data?.MLS ??
          listing?.MlsNumber ??
          listing?.raw_data?.MlsNumber ??
          "N/A",
        realtor: listing?.office_name ?? getOfficeName(listing),
        isFavourite: listing?.isFavourite,
      })) || [];

    return { properties, listings, pagination };
  };

  const {
    data: ddfWishlistData,
    isLoading: ddfWishlistLoading,
    refetch: refetchDdfWishlist,
  } = useGetMyRealEstateFavorites(params, { select, enabled: isLoggedIn });

  useEffect(() => {
    if (isLoggedIn) {
      refetchDdfWishlist();
    }
  }, [isLoggedIn, refetchDdfWishlist]);

  const data = [...(ddfWishlistData?.properties || [])];

  const pageCount = ddfWishlistData?.pagination?.pageCount || 1;
  const isLoading = ddfWishlistLoading;

  // 🚀 Scroll to top of the container on filter change
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [search, page]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-9 px-6 pt-5 w-full h-full">
      <div className="h-full mt-24">
        {!isLoggedIn && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-3xl font-bold text-center capitalize">
              Wishlist Properties
            </h2>
            <p className="text-gray-600">
              Please login to view your wishlist properties
            </p>
            <CustomButton
              label="Login Now"
              buttonType="primary"
              onClick={() => setOpenLogin(true)}
              customClasses="px-10"
            />
          </div>
        )}

        {isLoggedIn && (
          <>
            {!isLoading && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                <h2 className="text-3xl font-bold">No Wishlist Yet</h2>
                <p className="text-gray-600 text-center max-w-md">
                  You haven't saved any properties yet. Explore our listings and
                  click the heart icon to save your wishlist!
                </p>
                <Link href="/properties">
                  <CustomButton
                    label="Explore Properties"
                    buttonType="primary"
                    customClasses="px-10"
                  />
                </Link>
              </div>
            ) : (
              <>
                {/* Top Filters Row */}
                <div className="flex items-center gap-4 flex-wrap mb-6 justify-between">
                  {/* 🔍 CHIP SEARCH BAR (DESIGN SAME) */}
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-[0_0_20px_0_rgba(0,0,0,0.12)] border border-gray-200 w-full max-w-md">
                    {isChip ? (
                      <Chip
                        label={search}
                        onDelete={() => {
                          setSearch("");
                          setIsChip(false);
                        }}
                        className="bg-gray-100 text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search city..."
                        className="flex-1 text-sm outline-none bg-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && search.trim()) {
                            setIsChip(true);
                          }
                        }}
                      />
                    )}

                    <button
                      className="ml-auto bg-[#E6A500] p-2.5 rounded-lg flex items-center justify-center"
                      onClick={() => {
                        if (search.trim()) setIsChip(true);
                      }}
                    >
                      <FiSearch size={18} className="text-white" />
                    </button>
                  </div>

                  <button className="px-4 py-4 bg-gray rounded-xl shadow items-center gap-2 hidden">
                    <BookmarkIcon sx={{ color: "#33333333" }} />
                    Save Search
                  </button>
                </div>

                {/* Property Grid */}
                {isLoading ? (
                  <div className="flex justify-between items-start mb-10 w-full">
                    <div className="w-full flex flex-col h-full">
                      <div
                        ref={scrollRef}
                        className="gap-7 grid grid-cols-1 md:grid-cols-3 justify-between overflow-y-scroll xl:h-[65svh] no-scrollbar w-full xl:p-3"
                      >
                        {Array.from({ length: 6 }).map((_, i) => (
                          <PropertyCardSkeleton key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : data.length === 0 ? (
                  <div className="w-full xl:h-[65svh] h-full flex justify-center items-center">
                    <h3 className="text-2xl font-medium">
                      No Properties Found
                    </h3>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-10 w-full">
                    <div className="w-full flex flex-col h-full">
                      <div
                        ref={scrollRef}
                        className="gap-7 grid grid-cols-1 md:grid-cols-3 justify-between overflow-y-scroll xl:max-h-[80svh] no-scrollbar w-full xl:p-3"
                      >
                        {data.map((property: any) => (
                          <PropertiesCard
                            key={property.id}
                            {...property}
                            isLogin
                            isDdf={property.isDdf}
                          />
                        ))}
                      </div>
                      {data?.length !== 0 && pageCount !== 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                          }}
                        >
                          <Pagination
                            count={pageCount}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                          />
                        </Box>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistingPage;
