"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import React from "react";
import LineGradient from "../lineGradient/LineGradient";
import { Images } from "@/src/app/exports";
import CustomButton from "../../button/CustomButton";
import Link from "next/link";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import dayjs from "dayjs";
import {
  calculateAge,
  getDaysAgoTime,
  getTime,
  sqftToAcresFormatted,
} from "@/src/utilities/utilities";
import {
  useAddRealEstateFavorite,
  useRemoveRealEstateFavorite,
} from "@/src/hooks/listing/useRealEstateListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

export interface SimilarPropertiesCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  daysAgo: number;
  address: string;
  sqft: string | number;
  beds: number;
  baths: number;
  lotSize?: number;
  lotSizeUnits?: string;
  priceDrop?: number;
  assessedDiff: number;
  mls: string;
  realtor: string;
  isLogin?: boolean;
  isExpired?: boolean;
  isSold?: boolean;
  isFavourite?: boolean;
  isDdf?: boolean;
  status?: string;
  likesCount?: number;
  structureType?: string;
  oldPrice?: number;
  age?: string;
  listingDate?: string;
  distance?: string;
  targetPrice?: number;
  targetBeds?: number;
  targetBaths?: number;
  targetLotSize?: number;
  targetLivingArea?: number;
}

const ComparisonIcon = ({
  value,
  targetValue,
  isLogin,
}: {
  value?: number;
  targetValue?: number;
  isLogin?: boolean;
}) => {
  if (!isLogin) return null;
  if (
    value === undefined ||
    targetValue === undefined ||
    isNaN(value) ||
    isNaN(targetValue) ||
    value === 0 ||
    targetValue === 0
  )
    return null;

  if (value > targetValue) {
    return (
      <span className="ml-1.5 shrink-0" title="Greater than target property">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#14B514"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="16 12 12 8 8 12" />
          <line x1="12" y1="16" x2="12" y2="8" />
        </svg>
      </span>
    );
  } else if (value < targetValue) {
    return (
      <span className="ml-1.5 shrink-0" title="Less than target property">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF0000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 12 16 16 12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      </span>
    );
  } else {
    return (
      <span className="ml-1.5 shrink-0" title="Equal to target property">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      </span>
    );
  }
};

const isImageFileUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.trim().toLowerCase();

  if (
    !cleanUrl.startsWith("http://") &&
    !cleanUrl.startsWith("https://") &&
    !cleanUrl.startsWith("/")
  ) {
    return false;
  }

  const invalidPatterns = [
    "yelp.ca",
    "yelp.com",
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    ".pdf",
    ".mp4",
    ".mov",
    ".avi",
    ".webm",
    ".doc",
    ".docx",
    "utm_campaign",
  ];

  if (invalidPatterns.some((pattern) => cleanUrl.includes(pattern))) {
    const pathname = cleanUrl.split("?")[0];
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".avif",
      ".gif",
      ".svg",
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      pathname.endsWith(ext),
    );
    if (!hasValidExtension) {
      return false;
    }
  }

  return true;
};

const SimilarPropertiesCard: React.FC<SimilarPropertiesCardProps> = ({
  id,
  image,
  title,
  price,
  daysAgo,
  address,
  sqft,
  beds,
  baths,
  lotSize,
  lotSizeUnits,
  mls,
  realtor,
  isExpired,
  isSold,
  isFavourite: isFavouriteProp,
  isLogin: isLoginProp,
  likesCount,
  distance,
  age,
  listingDate,
  targetPrice,
  targetBeds,
  targetBaths,
  targetLotSize,
  targetLivingArea,
}) => {
  const { data: me } = useGetMe();
  const toggleWishlist = useAddRealEstateFavorite();
  const removeFromWishlist = useRemoveRealEstateFavorite();

  const [localIsFavourite, setLocalIsFavourite] = React.useState(false);
  const [localLikesCount, setLocalLikesCount] = React.useState(likesCount || 0);

  const initialImg = image && isImageFileUrl(image) ? image : Images.apartment;
  const [imgSrc, setImgSrc] = React.useState(initialImg);

  const getLotSizeDisplay = () => {
    const units = lotSizeUnits;
    const normalizedUnits = units?.trim()?.toLowerCase();
    if (normalizedUnits === "square feet") {
      const numericArea = Number(String(lotSize).replace(/,/g, ""));
      const unitLabel = units === "square feet" ? "acres" : "Acres";
      return `${sqftToAcresFormatted(numericArea)} ${unitLabel}`;
    }
    return `${lotSize} ${units || "sft"}`;
  };

  React.useEffect(() => {
    setImgSrc(image && isImageFileUrl(image) ? image : Images.apartment);
  }, [image]);

  const isFavourite =
    me?.favorites?.some(
      (item: any) =>
        item.documentId === id ||
        String(item.id) === String(id) ||
        String(item) === String(id),
    ) ||
    isFavouriteProp ||
    false;

  // Sync local state with global/prop state
  React.useEffect(() => {
    setLocalIsFavourite(isFavourite);
  }, [isFavourite]);

  React.useEffect(() => {
    setLocalLikesCount(likesCount || 0);
  }, [likesCount, id]);

  const { setOpenLogin, isLoggedIn } = useAuthContext();
  const isLogin = isLoginProp ?? isLoggedIn;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggleWishlist.isPending) return;

    if (!isLoggedIn) {
      setOpenLogin(true);
      return;
    }

    setLocalIsFavourite(true);
    setLocalLikesCount((prev) => prev + 1);
    toggleWishlist.mutate(id);
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (removeFromWishlist.isPending) return;

    if (!isLoggedIn) {
      setOpenLogin(true);
      return;
    }

    setLocalIsFavourite(false);
    setLocalLikesCount((prev) => Math.max(0, prev - 1));
    removeFromWishlist.mutate(id);
  };

  const displayPrice = isLogin
    ? `$${Number(price || 0).toLocaleString()}`
    : "$*,***,***";
  const displayAddress = isLogin ? address : "Sign in to view address";
  const displaySqft = isLogin ? `${sqft} sft` : "---- sft";
  const displayBeds = isLogin ? beds : "---";
  const displayBaths = isLogin ? baths : "---";
  const displayLotSize = isLogin ? getLotSizeDisplay() : "--- acres";

  const isLinkDisabled = isExpired;
  const getHref = isLinkDisabled
    ? "#"
    : isSold
      ? `/sold-property-info/${id}`
      : `/property-info/${id}`;

  return (
    <Link
      href={`${!isLogin ? "#" : getHref}`}
      className="w-full h-full flex"
      onClick={(e) => {
        if (isLinkDisabled) {
          e.preventDefault(); // Stop link from navigating
          return;
        }
        if (isLogin) {
          logPropertySearchActivity({
            propertySearchType: "find_home",
            searchTerm: address || title || "",
            propertyId: id,
          });
        }
      }}
    >
      <div
        className={`relative rounded-[20px] flex overflow-hidden shadow-[0_0_5px_0_rgba(21,21,21,0.19)] transition h-auto w-full ${
          isLogin ? "group" : ""
        }`}
      >
        <div className="flex flex-col justify-between w-full h-full">
          <div className="relative flex items-center">
            <div className="w-full h-56 overflow-clip rounded-t-2xl">
              {imgSrc ? (
                <Image
                  title="image title"
                  src={imgSrc}
                  alt={title}
                  className={`w-full h-full object-cover rounded-t-2xl transition duration-300 ease-in-out ${
                    isLogin ? "group-hover:scale-125" : "blur-sm"
                  }`}
                  width={700}
                  height={403}
                  loading="eager"
                  onError={() => setImgSrc(Images.apartment)}
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 rounded-lg animate-pulse" />
              )}
            </div>

            {/* Favorite Icon */}
            {!isExpired && !isSold && (
              <button
                onClick={
                  localIsFavourite
                    ? handleRemoveFromWishlist
                    : handleToggleWishlist
                }
                className="flex items-center absolute top-3 left-3 bg-background p-2 rounded-[18px] shadow z-20 cursor-pointer gap-0.5"
              >
                <Heart
                  className="w-5 h-5"
                  color={localIsFavourite ? "var(--red)" : "var(--primary)"}
                  fill={localIsFavourite ? "var(--red)" : "none"}
                />
                {localLikesCount > 0 && (
                  <span className="text-xs font-bold ml-1 text-black">
                    {localLikesCount}
                  </span>
                )}
              </button>
            )}

            {/* Days Ago */}
            {daysAgo !== 0 && (
              <span className="absolute top-3 right-3 bg-background text-primary px-3 py-1.5 text-sm rounded-full">
                {getTime(daysAgo)}
              </span>
            )}

            {isSold && (
              <span
                className="absolute bottom-3 left-0 bg-red text-background pl-3 pr-7 pt-2 pb-2 text-xs h-auto font-medium"
                style={{
                  clipPath: "polygon(100% 0, 76% 49%, 100% 100%, 0 98%, 0 0)",
                }}
              >
                Sold
              </span>
            )}

            {isExpired && (
              <span
                className="absolute bottom-3 left-0 bg-gray text-black70 pl-3 pr-7 pt-2 pb-2 text-xs h-auto font-medium"
                style={{
                  clipPath: "polygon(100% 0, 76% 49%, 100% 100%, 0 98%, 0 0)",
                }}
              >
                Expired
              </span>
            )}
          </div>

          <div className="space-y-2.5 mt-2.5 px-3 pb-3 lg:px-5 lg:pb-5">
            <p
              className="text-lightWhite text-sm line-clamp-1"
              title={displayAddress}
            >
              {displayAddress}
            </p>

            {/* Specs */}
            <LineGradient />
            <div className="w-full flex flex-col flex-wrap items-center justify-between text-sm space-y-1">
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Asking Price:</span>
                <span className="flex items-center">
                  {displayPrice}
                  <ComparisonIcon
                    value={price}
                    targetValue={targetPrice}
                    isLogin={isLogin}
                  />
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Listed On Website:</span>
                <span className="">
                  {!isLoggedIn
                    ? "****"
                    : dayjs(listingDate)
                        .tz("America/Vancouver")
                        .format("DD MMM, YYYY")}
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Living Area:</span>
                <span className="flex items-center">
                  {displaySqft}
                  <ComparisonIcon
                    value={Number(sqft)}
                    targetValue={targetLivingArea}
                    isLogin={isLogin}
                  />
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Bedrooms:</span>
                <span className="flex items-center">
                  {displayBeds}
                  <ComparisonIcon
                    value={beds}
                    targetValue={targetBeds}
                    isLogin={isLogin}
                  />
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Bathrooms:</span>
                <span className="flex items-center">
                  {displayBaths}
                  <ComparisonIcon
                    value={baths}
                    targetValue={targetBaths}
                    isLogin={isLogin}
                  />
                </span>
              </div>
              <LineGradient />
              {lotSize !== 0 && (
                <>
                  <div className="flex w-full justify-between flex-nowrap items-center">
                    <span className=" opacity-40">Lot Size:</span>
                    <span className="flex items-center">
                      {displayLotSize}
                      <ComparisonIcon
                        value={Number(lotSize)}
                        targetValue={targetLotSize}
                        isLogin={isLogin}
                      />
                    </span>
                  </div>
                  <LineGradient />
                </>
              )}
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Age:</span>
                <span className="">
                  {age ? `${calculateAge(age)} Years` : "N/A"}
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">Days on Market:</span>
                <span className="">
                  {!isLoggedIn
                    ? "****"
                    : listingDate && getDaysAgoTime(listingDate)}
                </span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className=" opacity-40">MLS® Number:</span>
                <span className="">{mls}</span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center">
                <span className="opacity-40">Distance:</span>
                <span className="">{distance} km</span>
              </div>
              <LineGradient />
              <div className="flex w-full justify-between flex-nowrap items-center text-end">
                <span className="opacity-40 text-nowrap">Courtesy of:</span>
                <span className=" line-clamp-1">{realtor}</span>
              </div>
            </div>
          </div>
        </div>

        {!isLogin && (
          <div className="bg-[#FFFFFF1f] backdrop-blur-md w-full h-full absolute z-30 rounded-xl justify-center items-center-safe flex flex-col">
            <CustomButton
              label="Login Required"
              buttonType="primary"
              customClasses="font-bold py-4 px-18.5"
              onClick={() => {
                setOpenLogin(true);
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default SimilarPropertiesCard;
