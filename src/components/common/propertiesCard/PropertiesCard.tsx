/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import React from "react";
import LineGradient from "../lineGradient/LineGradient";
import Description, { IDescriptionTypes } from "../../description/Description";
import { Icons, Images } from "@/src/app/exports";
import CustomButton from "../../button/CustomButton";
import Link from "next/link";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import { getTime, sqftToAcresFormatted } from "@/src/utilities/utilities";
import { IoArrowUpOutline, IoArrowDownOutline } from "react-icons/io5";
import {
  useAddRealEstateFavorite,
  useRemoveRealEstateFavorite,
} from "@/src/hooks/listing/useRealEstateListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

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
  onCardClick?: (id: string, isSold?: boolean) => void;
  [key: string]: any;
}

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
  lotSize,
  lotSizeUnits,
  mls,
  realtor,
  isExpired,
  isSold,
  isFavourite: isFavouriteProp,
  isLogin: isLoginProp,
  likesCount,
  structureType,
  oldPrice = 0,
  neighborhood,
  onCardClick,
}) => {
  const { data: me } = useGetMe();
  const toggleWishlist = useAddRealEstateFavorite();
  const removeFromWishlist = useRemoveRealEstateFavorite();
  const [localIsFavourite, setLocalIsFavourite] = React.useState(false);
  const [localLikesCount, setLocalLikesCount] = React.useState(likesCount || 0);

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
  const displayTitle = isLogin
    ? title === "Single Family"
      ? structureType
      : title
    : "Property Details Restricted";
  const displaySqft = isLogin ? `${sqft} sft` : "---- sft";
  const displayBeds = isLogin ? beds : "---";
  const displayBaths = isLogin ? baths : "---";
  const displayLotSize = isLogin ? getLotSizeDisplay() : "---- acres";
  const displayMls = isLogin ? `MLS® ${mls}` : "MLS® *******";
  const displayRealtor = isLogin ? realtor : "Courtesy of: **********";

  const initialImg = image && isImageFileUrl(image) ? image : Images.apartment;
  const [imgSrc, setImgSrc] = React.useState(initialImg);

  React.useEffect(() => {
    setImgSrc(image && isImageFileUrl(image) ? image : Images.apartment);
  }, [image]);

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
      target={onCardClick ? "_self" : "_blank"}
      onClick={(e) => {
        if (isLinkDisabled) {
          e.preventDefault();
          return;
        }

        if (isLogin) {
          logPropertySearchActivity({
            propertySearchType: "find_home",
            searchTerm: address || title || "",
            propertyId: id,
          });
        }

        if (onCardClick && isLogin) {
          e.preventDefault();
          onCardClick(id, isSold);
        }
      }}
    >
      <article className="relative flex flex-col w-full h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
        {/* Image */}
        <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title || "Property Image"}
              title={title || "Property Image"}
              width={700}
              height={525}
              loading="eager"
              onError={() => setImgSrc(Images.apartment)}
              className={`w-full h-full object-cover transition-transform duration-500 ${isLogin ? "group-hover:scale-105" : "blur-sm"
                }`}
            />
          ) : (
            <div className="w-full h-full animate-pulse bg-slate-200" />
          )}

          {/* Image overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-slate-950/10 pointer-events-none" />

          {/* Status and favorite */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            <span
              className={`inline-flex max-w-[75%] items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-md ${isSold
                  ? "bg-red-600/90 text-white"
                  : isExpired
                    ? "bg-slate-800/90 text-white"
                    : "bg-white/95 text-slate-800"
                }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isSold
                    ? "bg-white"
                    : isExpired
                      ? "bg-slate-400"
                      : "bg-emerald-500"
                  }`}
              />
              <span className="truncate">
                {isSold ? "Sold" : isExpired ? "Expired" : "Active"}
                {daysAgo !== 0 ? ` · ${getTime(daysAgo)}` : ""}
              </span>
            </span>

            {!isExpired && !isSold && (
              <button
                type="button"
                aria-label={
                  localIsFavourite
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
                onClick={
                  localIsFavourite
                    ? handleRemoveFromWishlist
                    : handleToggleWishlist
                }
                className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition-colors hover:bg-white hover:text-rose-500"
              >
                <Heart
                  className="h-4 w-4"
                  color={
                    localIsFavourite ? "var(--red)" : "currentColor"
                  }
                  fill={localIsFavourite ? "var(--red)" : "none"}
                />

                {localLikesCount > 0 && (
                  <span className="ml-1 text-[10px] font-bold">
                    {localLikesCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Price change badge */}
          {!isSold && !isExpired && oldPrice !== 0 && oldPrice && (
            <span
              className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-md ${price < oldPrice ? "bg-rose-600/95" : "bg-emerald-600/95"
                }`}
            >
              {price < oldPrice ? (
                <IoArrowDownOutline className="h-3.5 w-3.5" />
              ) : (
                <IoArrowUpOutline className="h-3.5 w-3.5" />
              )}
              {price < oldPrice ? "Price Drop" : "Price Increase"}
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Location and property type */}
            <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
              <span
                className="inline-flex min-w-0 max-w-[65%] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800"
                title={displayAddress}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span className="truncate">{neighborhood}</span>
              </span>

              <span
                className="min-w-0 truncate text-right text-[11px] font-medium text-slate-500"
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </div>

            {/* Price */}
            <div className="mb-2 flex justify-between items-center">
              <div className="flex items-baseline gap-x-2 gap-y-1 "><p className="text-2xl font-black tracking-tight text-slate-900 sm:text-[26px]">
                {displayPrice}
              </p>

              {oldPrice !== 0 && oldPrice && (
                <p className="text-sm text-slate-400 line-through">
                  ${Number(oldPrice).toLocaleString()}
                </p>
              )}</div>
              {lotSize && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Image
                    src={Icons.lotSize}
                    alt="Lot size"
                    title="Lot size"
                    width={100}
                    height={100}
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                  {/* Lot Size */}
                </span>

                <span className="truncate rounded-lg text-right text-[11px] font-semibold text-slate-800">
                  {displayLotSize} | {lotSize} sft
                </span>
              </div>
            )}
            </div>

            {/* Title and address */}
            <div className="mb-4 min-w-0">
              {/* <h3
                className="line-clamp-1 text-sm font-bold leading-snug text-slate-800 sm:text-base"
                title={displayTitle}
              >
                {displayTitle}
              </h3> */}

              <p
                className="mt-1 line-clamp-2 text-base leading-relaxed text-slate-500 truncate"
                title={displayAddress}
              >
                {displayAddress}
              </p>
            </div>

            {/* Lot size */}
            {/* {lotSize && (
              <div className="mb-3.5 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Image
                    src={Icons.lotSize}
                    alt="Lot size"
                    title="Lot size"
                    width={100}
                    height={100}
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                  Lot Size
                </span>

                <span className="truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-[11px] font-semibold text-slate-800">
                  {displayLotSize} | {lotSize} sft
                </span>
              </div>
            )} */}

            {/* Property stats */}
            <div className="mb-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200/80 bg-white/90 py-3 shadow-sm">
              {/* Living area */}
              <div className="flex min-w-0 items-center-safe justify-center gap-1 px-1">
                <Image
                  src={Icons.square}
                  alt="Living area"
                  title="Living area"
                  width={100}
                  height={100}
                  className="h-4 w-4 object-contain"
                />
                <span className="max-w-full truncate text-xs font-extrabold text-slate-900">
                  {displaySqft}
                </span>
                <span className="text-[10px] text-slate-500 text-end">Area</span>
              </div>

              {/* Bedrooms */}
              <div className="flex min-w-0 items-center justify-center gap-1 px-1">
                <Image
                  src={Icons.bed}
                  alt="Bedrooms"
                  title="Bedrooms"
                  width={100}
                  height={100}
                  className="h-4 w-4 object-contain"
                />
                <span className="max-w-full truncate text-xs font-extrabold text-slate-900">
                  {displayBeds}
                </span>
                <span className="text-[10px] text-slate-500">Beds</span>
              </div>

              {/* Bathrooms */}
              <div className="flex min-w-0 items-center justify-center gap-1 px-1">
                <Image
                  src={Icons.bath}
                  alt="Bathrooms"
                  title="Bathrooms"
                  width={100}
                  height={100}
                  className="h-4 w-4 object-contain"
                />
                <span className="max-w-full truncate text-xs font-extrabold text-slate-900">
                  {displayBaths}
                </span>
                <span className="text-[10px] text-slate-500">Baths</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex min-w-0 items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
            <div
              className="min-w-0 flex-1 truncate text-[10px] text-slate-500 sm:text-[11px]"
              title={displayRealtor}
            >
              <Description
                content={displayRealtor}
                type={IDescriptionTypes.dec12}
                customClasses="text-slate-500"
              />
            </div>

            <div
              className="min-w-0 shrink-0 text-right text-[10px] text-slate-500 sm:text-[11px]"
              title={displayMls}
            >
              <Description
                content={displayMls}
                type={IDescriptionTypes.dec12}
                customClasses="text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Login overlay */}
        {!isLogin && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-white/30 p-4 backdrop-blur-md">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-5 text-center shadow-xl">
              <p className="mb-1 text-base font-bold text-slate-900">
                Discover this property
              </p>
              <p className="mb-4 text-xs text-slate-500">
                Log in to view listing details and save favourites.
              </p>

              <CustomButton
                label="Login Required"
                buttonType="primary"
                customClasses="rounded-xl px-6 py-3 font-bold"
                onClick={() => {
                  setOpenLogin(true);
                }}
              />
            </div>
          </div>
        )}
      </article>
    </Link>
  );
};

export default PropertiesCard;

//  <Link
//       href={`${!isLogin ? "#" : getHref}`}
//       className="w-full h-full flex"
//       target={onCardClick ? "_self" : "_blank"}
//       onClick={(e) => {
//         if (isLinkDisabled) {
//           e.preventDefault(); // Stop link from navigating
//           return;
//         }
//         if (isLogin) {
//           logPropertySearchActivity({
//             propertySearchType: "find_home",
//             searchTerm: address || title || "",
//             propertyId: id,
//           });
//         }
//         if (onCardClick && isLogin) {
//           e.preventDefault();
//           onCardClick(id, isSold);
//         }
//       }}
//     >
//       <div
//         className={`relative rounded-2xl flex overflow-hidden shadow-[0_0_5px_0_rgba(21,21,21,0.19)] transition h-auto w-full ${
//           isLogin ? "group" : ""
//         }`}
//       >
//         <div className="flex flex-col justify-between w-full h-full">
//           <div className="relative flex items-center">
//             <div className="w-full h-67 overflow-clip rounded-t-2xl">
//               {imgSrc ? (
//                 <Image
//                   src={imgSrc}
//                   alt={title || "Property Image"}
//                   title={title || "Property Image"}
//                   className={`w-full h-full object-cover rounded-t-2xl transition duration-300 ease-in-out ${
//                     isLogin ? "group-hover:scale-125" : "blur-sm"
//                   }`}
//                   width={700}
//                   height={403}
//                   loading="eager"
//                   onError={() => setImgSrc(Images.apartment)}
//                 />
//               ) : (
//                 <div className="w-full h-56 bg-gray-200 rounded-lg animate-pulse" />
//               )}
//             </div>

//             {/* Favorite Icon */}
//             {!isExpired && !isSold && (
//               <button
//                 onClick={
//                   localIsFavourite
//                     ? handleRemoveFromWishlist
//                     : handleToggleWishlist
//                 }
//                 className="flex items-center absolute top-3 left-3 bg-background p-2 rounded-[18px] shadow z-20 cursor-pointer gap-0.5"
//               >
//                 <Heart
//                   className="w-5 h-5"
//                   color={localIsFavourite ? "var(--red)" : "var(--primary)"}
//                   fill={localIsFavourite ? "var(--red)" : "none"}
//                 />
//                 {localLikesCount > 0 && (
//                   <span className="text-xs font-bold ml-1 text-black">
//                     {localLikesCount}
//                   </span>
//                 )}
//               </button>
//             )}

//             {/* Days Ago */}
//             {daysAgo !== 0 && (
//               <span className="absolute top-3 right-3 bg-background text-primary px-3 py-1.5 text-sm rounded-full">
//                 {getTime(daysAgo)}
//               </span>
//             )}

//             {/* Price Drop Banner */}
//             {!isSold && !isExpired && oldPrice !== 0 && oldPrice && (
//               <span
//                 className={`absolute bottom-5 right-0 p-1.5 text-xs inline-flex text-background h-auto items-center gap-0.5 uppercase  rounded-l-sm ${
//                   price < oldPrice ? "bg-red/90" : "bg-green/90"
//                 }`}
//               >
//                 {price < oldPrice ? (
//                   <IoArrowDownOutline className="w-4 h-4 text-background" />
//                 ) : (
//                   <IoArrowUpOutline className="w-4 h-4 text-background" />
//                 )}
//                 {price < oldPrice ? "Price Drop" : "Price Increase "}
//               </span>
//             )}

//             {isSold && (
//               <span
//                 className="absolute bottom-3 left-0 bg-red text-background pl-3 pr-7 pt-2 pb-2 text-xs h-auto font-medium"
//                 style={{
//                   clipPath: "polygon(100% 0, 76% 49%, 100% 100%, 0 98%, 0 0)",
//                 }}
//               >
//                 Sold
//               </span>
//             )}

//             {isExpired && (
//               <span
//                 className="absolute bottom-3 left-0 bg-gray text-black70 pl-3 pr-7 pt-2 pb-2 text-xs h-auto font-medium"
//                 style={{
//                   clipPath: "polygon(100% 0, 76% 49%, 100% 100%, 0 98%, 0 0)",
//                 }}
//               >
//                 Expired
//               </span>
//             )}
//           </div>

//           <div className="space-y-2.5 mt-2.5 px-3 pb-3 lg:px-5 lg:pb-5">
//             <div className={`flex space-x-1.5 items-center`}>
//               <p className="text-[32px] leading-10 font-bold text-primary">
//                 {displayPrice}
//               </p>
//               {oldPrice !== 0 && (
//                 <div className="flex justify-between items-center">
//                   <p className="text-base text-lightWhite line-through">
//                     ${Number(oldPrice).toLocaleString()}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-between items-center">
//               <h3 className="font-bold text-foreground text-sm">
//                 {displayTitle}
//               </h3>
//             </div>

//             <p
//               className="text-lightWhite text-sm line-clamp-1"
//               title={displayAddress}
//             >
//               {displayAddress}
//             </p>

//             {/* Specs */}
//             <div className="flex items-center justify-between w-full">
//               <div className="flex flex-row items-center gap-x-1 text-primary2 text-sm w-auto">
//                 <Image
//                   src={Icons.square}
//                   alt="square"
//                   title="Square"
//                   width={100}
//                   height={100}
//                   className="w-5 h-5 object-contain"
//                 />
//                 <span>{displaySqft}</span>
//               </div>
//               <LineGradient vr />
//               <div className="flex flex-row items-center gap-x-1 text-primary2 text-sm w-auto">
//                 <Image
//                   src={Icons.bed}
//                   alt="bed"
//                   title="Bed"
//                   width={100}
//                   height={100}
//                   className="w-5 h-5 object-contain"
//                 />
//                 <span>{displayBeds}</span>
//               </div>
//               <LineGradient vr={true} />
//               <div className="flex flex-row items-center gap-x-1 text-primary2 text-sm w-auto">
//                 <Image
//                   src={Icons.bath}
//                   alt="bath"
//                   title="Bath"
//                   width={100}
//                   height={100}
//                   className="w-5 h-5 object-contain"
//                 />
//                 <span>{displayBaths}</span>
//               </div>
//               {lotSize && (
//                 <>
//                   <LineGradient vr={true} />
//                   <div className="flex flex-row items-center gap-x-1 text-primary2 text-sm w-auto">
//                     <Image
//                       src={Icons.lotSize}
//                       alt="lotSize"
//                       title="Lot Size"
//                       width={100}
//                       height={100}
//                       className="w-5 h-5 object-contain"
//                     />
//                     <span>{displayLotSize}</span>
//                   </div>
//                 </>
//               )}
//             </div>
//             <LineGradient />
//             <div className="w-full flex flex-row flex-wrap items-center justify-between gap-2">
//               <div className="min-w-0 flex-1" title={displayRealtor}>
//                 <Description
//                   content={displayRealtor}
//                   type={IDescriptionTypes.dec12}
//                   customClasses="text-lightWhite"
//                 />
//               </div>

//               <div className="min-w-0 shrink-0">
//                 <Description
//                   content={displayMls}
//                   type={IDescriptionTypes.dec12}
//                   customClasses="text-lightWhite"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {!isLogin && (
//           <div className="bg-[#FFFFFF1f] backdrop-blur-md w-full h-full absolute z-30 rounded-xl justify-center items-center-safe flex flex-col">
//             <CustomButton
//               label="Login Required"
//               buttonType="primary"
//               customClasses="font-bold py-4 px-18.5"
//               onClick={() => {
//                 setOpenLogin(true);
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </Link>