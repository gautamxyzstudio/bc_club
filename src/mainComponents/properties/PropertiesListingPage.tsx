/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef} from "react";
import {
  FiSearch,
  FiX,
  FiArrowLeft,
  FiMaximize2,
  FiMinimize2,
  FiShare2,
  FiCopy,
  FiCheck,
  FiMail,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import FiltersPopup from "@/src/components/common/propertiesCard/FiltersPopup";
import { Chip, Dialog, Pagination } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import PropertiesCard, {
  PropertyCardProps,
} from "@/src/components/common/propertiesCard/PropertiesCard";
import PropertyCardSkeleton from "@/src/components/common/propertiesCard/PropertyCardSkeleton";
import FilterPillSelect from "@/src/components/filterPillSelect/FilterPillSelect";
import PropertyInfo from "@/src/mainComponents/propertyInfo/PropertyInfo";

import { useListingStore } from "@/src/store/useListingStore";
import { useGetMe } from "@/src/hooks/listing/useListingQueries";
import { getOfficeName } from "@/src/utilities/utilities";
import { useSearchParams } from "next/navigation";
import { useGetForecloserProperties, useGetRealEstateListings } from "@/src/hooks/listing/useRealEstateListingQueries";
import { toast } from "react-toastify";

export default function PropertiesListingPage() {
  const { data: me } = useGetMe();
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { getInstanceFilters, updateInstanceFilter, clearInstanceFilters } =
    useListingStore();

  const searchParams = useSearchParams();

  useEffect(() => {
    const urlLocation = searchParams.get("location");
    const urlSearch = searchParams.get("search");
    const urlPriceChange = searchParams.get("priceChange");
    const urlSort = searchParams.get("sort");
    const urlStatus = searchParams.get("status");
    const urlBeds = searchParams.get("beds");
    const urlBaths = searchParams.get("baths");
    const urlPropertyType =
      searchParams.get("propertyType") || searchParams.get("type");
    const urlStructureType = searchParams.get("structureType");
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");
    const urlMinSqft = searchParams.get("minSqft");
    const urlMaxSqft = searchParams.get("maxSqft");
    const urlMinLotSize = searchParams.get("minLotSizeArea");
    const urlMaxLotSize = searchParams.get("maxLotSizeArea");
    const urlNeighborhood = searchParams.get("neighborhood");
    const urlWhenListed = searchParams.get("whenListed");
    const urlFeatures = searchParams.get("features");

    let hasUrlParams = false;

    if (urlLocation) {
      updateInstanceFilter("list", "location", urlLocation);
      hasUrlParams = true;
    }

    if (urlSearch) {
      updateInstanceFilter("list", "search", urlSearch);
      hasUrlParams = true;
    }

    if (urlPriceChange) {
      updateInstanceFilter("list", "activePriceChange", urlPriceChange);
      hasUrlParams = true;
    }

    if (urlSort) {
      updateInstanceFilter("list", "activePrice", urlSort);
      hasUrlParams = true;
    }

    if (urlStatus) {
      updateInstanceFilter("list", "status", urlStatus);
      hasUrlParams = true;
    }

    if (urlBeds) {
      updateInstanceFilter("list", "activeBedRoom", urlBeds);
      hasUrlParams = true;
    }

    if (urlBaths) {
      updateInstanceFilter("list", "activeBathRoom", urlBaths);
      hasUrlParams = true;
    }

    if (urlPropertyType) {
      updateInstanceFilter("list", "activeProperty", urlPropertyType);
      hasUrlParams = true;
    }

    if (urlStructureType) {
      updateInstanceFilter("list", "structureType", urlStructureType);
      hasUrlParams = true;
    }

    if (urlMinPrice) {
      updateInstanceFilter("list", "minPrice", Number(urlMinPrice));
      updateInstanceFilter("list", "minPriceInput", urlMinPrice);
      hasUrlParams = true;
    }

    if (urlMaxPrice) {
      updateInstanceFilter("list", "maxPrice", Number(urlMaxPrice));
      updateInstanceFilter("list", "maxPriceInput", urlMaxPrice);
      hasUrlParams = true;
    }

    if (urlMinSqft) {
      updateInstanceFilter("list", "minSqft", Number(urlMinSqft));
      updateInstanceFilter("list", "minSqftInput", urlMinSqft);
      hasUrlParams = true;
    }

    if (urlMaxSqft) {
      updateInstanceFilter("list", "maxSqft", Number(urlMaxSqft));
      updateInstanceFilter("list", "maxSqftInput", urlMaxSqft);
      hasUrlParams = true;
    }

    if (urlMinLotSize) {
      updateInstanceFilter("list", "minLotSizeArea", Number(urlMinLotSize));
      updateInstanceFilter("list", "minLotSqftInput", urlMinLotSize);
      hasUrlParams = true;
    }

    if (urlMaxLotSize) {
      updateInstanceFilter("list", "maxLotSizeArea", Number(urlMaxLotSize));
      updateInstanceFilter("list", "maxLotSqftInput", urlMaxLotSize);
      hasUrlParams = true;
    }

    if (urlNeighborhood) {
      updateInstanceFilter("list", "neighborhood", urlNeighborhood);
      hasUrlParams = true;
    }

    if (urlWhenListed) {
      updateInstanceFilter("list", "whenListed", urlWhenListed);
      hasUrlParams = true;
    }

    if (urlFeatures) {
      updateInstanceFilter("list", "features", urlFeatures);
      hasUrlParams = true;
    }

    if (hasUrlParams) {
      window.scrollTo({
        top: 120,
        behavior: "smooth",
      });
    }
  }, [searchParams, updateInstanceFilter]);

  const filters = getInstanceFilters("list");

  const search = filters.search || "";
  // const isChip = filters.isChip || false;
  const activePrice = filters.activePrice || "newest";
  const activeBathRoom = filters.activeBathRoom || "any";
  const activeBedRoom = filters.activeBedRoom || "any";
  const activePriceChange = filters.activePriceChange || "any";
  const activeProperty = filters.activeProperty || "any";
  const page = filters.page || 1;
  const pageSize = 30;

  const minPrice = filters.minPrice;
  const maxPrice = filters.maxPrice;
  const minSqft = filters.minSqft;
  const maxSqft = filters.maxSqft;
  const minLotSizeArea = filters.minLotSizeArea;
  const maxLotSizeArea = filters.maxLotSizeArea;
  const minTax = filters.minTax;
  const maxTax = filters.maxTax;
  const minPricePerSft = filters.minPricePerSft;
  const maxPricePerSft = filters.maxPricePerSft;
  const minAssociationFee = filters.minAssociationFee;
  const maxAssociationFee = filters.maxAssociationFee;
  const status = filters.status;
  const location = filters.location;
  const whenListed = filters.whenListed;
  const features = filters.features;
  const structureType = filters.structureType;
  const neighborhood = filters.neighborhood;

  const setSearch = (val: string) =>
    updateInstanceFilter("list", "search", val);
  const setActivePrice = (val: string) => {
    updateInstanceFilter("list", "activePrice", val);
  };
  const setActiveBathRoom = (val: string) =>
    updateInstanceFilter("list", "activeBathRoom", val);
  const setActiveBedRoom = (val: string) =>
    updateInstanceFilter("list", "activeBedRoom", val);
  const setActivePriceChange = (val: string) =>
    updateInstanceFilter("list", "activePriceChange", val);
  const setPage = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      updateInstanceFilter("list", "page", val(page));
    } else {
      updateInstanceFilter("list", "page", val);
    }
  };

  const pillBase =
    "pl-4 pr-2 py-3 bg-white rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.12)] appearance-none font-medium cursor-pointer border transition w-full";

  const pillActive = "border-primary text-primary ring-1 ring-blue-200";

  const pillInactive = "border-[#30548733] text-gray-800";

  const isForSale = !status || status === "forSale";

  const params: any = {
    page: page,
    pageSize: pageSize,
  };

  if (!isForSale) {
    if (status === "sold") {
      params.status = "sold";
    } else if (status === "expired") {
      params.status = "expired";
    }
  }

  // sorting
  if (activePrice && activePrice !== "any") {
    if (isForSale) {
      if (activePrice === "newest") params.sort = "newest";
      else if (activePrice === "oldest") params.sort = "oldest";
      else if (activePrice === "asc") params.sort = "price:asc";
      else if (activePrice === "desc") params.sort = "price:desc";
      else if (activePrice === "tax-asc") params.sort = "tax:asc";
      else if (activePrice === "tax-desc") params.sort = "tax:desc";
      else if (activePrice === "popular") params.sort = "popular";
    } else {
      if (activePrice === "newest") params.sort = "createdAt:desc";
      else if (activePrice === "oldest") params.sort = "createdAt:asc";
      else params.sort = `price:${activePrice}`;
    }
  }

  // bedroom filter
  if (activeBedRoom && activeBedRoom !== "any") {
    params.beds = activeBedRoom;
  }

  // bathroom filter
  if (activeBathRoom && activeBathRoom !== "any") {
    params.baths = activeBathRoom;
  }

  if (activePriceChange && activePriceChange !== "any") {
    params.priceChange = activePriceChange;
  }

  // property type filter
  if (activeProperty && activeProperty !== "any") {
    if (activeProperty.includes(",")) {
      activeProperty.split(",").forEach((type, index) => {
        params[`filters[type][$in][${index}]`] = type;
      });
    } else {
      params.type = activeProperty;
    }
  }

  // search
  if (search) {
    params.search = search;
  }

  // popup filters
  if (minPrice !== undefined && minPrice > 1000) params.minPrice = minPrice;
  if (maxPrice !== undefined && maxPrice < 100000000)
    params.maxPrice = maxPrice;
  if (minSqft !== undefined && minSqft > 100) params.minSqft = minSqft;
  if (maxSqft !== undefined && maxSqft < 15000) params.maxSqft = maxSqft;
  if (minLotSizeArea !== undefined && minLotSizeArea > 100) {
    params.minLotSizeArea = minLotSizeArea;
  }
  if (maxLotSizeArea !== undefined && maxLotSizeArea < 100000) {
    params.maxLotSizeArea = maxLotSizeArea;
  }
  if (minTax !== undefined && minTax > 0) params.minTax = minTax;
  if (maxTax !== undefined && maxTax < 50000) params.maxTax = maxTax;

  if (minPricePerSft !== undefined && minPricePerSft > 100) {
    params.minPricePerSft = minPricePerSft;
  }
  if (maxPricePerSft !== undefined && maxPricePerSft < 25000) {
    params.maxPricePerSft = maxPricePerSft;
  }
  if (minAssociationFee !== undefined && minAssociationFee > 100) {
    params.minAssociationFee = minAssociationFee;
  }
  if (maxAssociationFee !== undefined && maxAssociationFee < 3000) {
    params.maxAssociationFee = maxAssociationFee;
  }

  if (location && location !== "") {
    params.location = location;
  }

  if (whenListed && whenListed !== "any") {
    params.whenListed = whenListed;
  }

  if (features && features !== "") {
    params.features = features;
  }

  if (structureType && structureType !== "") {
    params.structureType = structureType;
  }

  if (neighborhood && neighborhood !== "") {
    params.neighborhood = neighborhood;
  }

  const select = (res: any) => {
    const listings = res?.data || [];
    const total =
      res?.meta?.pagination?.total ??
      res?.count ??
      res?.total ??
      (Array.isArray(res?.data) ? res.data.length : 0);
    const pageCount =
      res?.meta?.pagination?.pageCount ??
      (res?.count
        ? Math.ceil(res.count / pageSize)
        : total
          ? Math.ceil(total / pageSize)
          : 1);
    const pagination = {
      page: res?.meta?.pagination?.page ?? page,
      pageSize: res?.meta?.pagination?.pageSize ?? pageSize,
      pageCount,
      total,
    };

    let properties: PropertyCardProps[] = listings
      .map((listing: any) => ({
        id: listing?.documentId,
        image:
          typeof listing?.media_url === "string"
            ? listing.media_url
            : listing?.media?.[0]?.MediaURL,
        title: listing?.property_sub_type,
        price: listing?.price,
        oldPrice: Number(listing?.old_price) || 0,
        daysAgo:
          Number(listing?.old_price) > 0
            ? listing?.ModificationTimestamp
            : (listing?.OriginalEntryTimestamp ??
              listing?.raw_data?.BridgeModificationTimestamp ??
              0),
        address: listing?.address !== null && listing?.address !== "," ? listing?.address : "Unknown Address",
        neighborhood: listing?.neighborhood,
        sqft: listing?.Living_area ?? listing?.area ?? 0,
        beds: listing?.bedrooms ?? 0,
        baths: listing?.bathrooms ?? 0,
        likesCount: listing?.likesCount ?? 0,
        lotSize: listing?.lot_size_area ?? "",
        lotSizeUnits: listing?.lot_size_units ?? "",
        structureType: listing?.structure_type ?? "",
        assessedDiff: listing.price
          ? Number(
            (
              (listing.price - (listing.annual_tax ?? 0)) /
              listing.price
            ).toFixed(1),
          )
          : 0,
        mls:
          listing?.mls_number ??
          listing?.listing_id ??
          listing?.raw_data?.ListingID ??
          listing?.raw_data?.MLS ??
          listing?.MlsNumber ??
          listing?.raw_data?.MlsNumber ??
          "N/A",
        realtor: listing?.office_name ?? getOfficeName(listing),
        isFavourite: listing?.users?.some(
          (user: any) => user?.documentId === me?.documentId,
        ),
        isDdf: isForSale,
      }))
      .filter(
        (p: any) =>
          Number(p.price) > 0
      );

    // Explicit client-side sort to guarantee order regardless of API behavior
    if (activePrice === "asc") {
      properties.sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      );
    } else if (activePrice === "desc") {
      properties.sort(
        (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      );
    } else if (activePrice === "newest") {
      properties.sort((a, b) => {
        const dateA = a.daysAgo ? new Date(a.daysAgo).getTime() : 0;
        const dateB = b.daysAgo ? new Date(b.daysAgo).getTime() : 0;
        return dateB - dateA;
      });
    } else if (activePrice === "oldest") {
      properties.sort((a, b) => {
        const dateA = a.daysAgo ? new Date(a.daysAgo).getTime() : 0;
        const dateB = b.daysAgo ? new Date(b.daysAgo).getTime() : 0;
        return dateA - dateB;
      });
    } else if (activePrice === "popular") {
      properties.sort(
        (a, b) => (Number(b.likesCount) || 0) - (Number(a.likesCount) || 0),
      );
    }

    return { properties, listings, pagination };
  };

  const { data: queryDataNormal, isLoading: isLoadingNormal } =
    useGetRealEstateListings(params, {
      select,
      enabled: isForSale && !(status === "forecloser" || status === "forecloserSold"),
    });

  const forecloserParams = { ...params, standard_status: status === "forecloserSold" ? "Closed" : "Active" };
  const { data: queryDataForeClose, isLoading: isLoadingForeClose } =
    useGetForecloserProperties(forecloserParams, {
      select,
      enabled: status === "forecloser" || status === "forecloserSold",
    });

  const queryData = isForSale
    ? queryDataNormal
    : status === "forecloser" || status === "forecloserSold"
      ? queryDataForeClose
      : queryDataNormal;
  const loading =
    isForSale
      ? isLoadingNormal
      : status === "forecloser" || status === "forecloserSold"
        ? isLoadingForeClose
        : isLoadingNormal;

  const data = queryData?.properties || [];

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
    };
    if (isShareOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShareOpen]);

  useEffect(() => {
    if (!selectedPropertyId) {
      setIsShareOpen(false);
      setCopied(false);
    }
  }, [selectedPropertyId]);

  const selectedProperty = data.find(
    (item: any) => item.id === selectedPropertyId,
  );

  const isSelectedSold =
    status === "sold" ||
    selectedProperty?.status === "Closed" ||
    selectedProperty?.status?.toLowerCase() === "sold";

  const isSelectedForeclosure =
    status === "forecloser" ||
    status === "forcecloser" ||
    selectedProperty?.status?.toLowerCase() === "forecloser" ||
    selectedProperty?.status?.toLowerCase() === "foreclosure";

  const sharePath = isSelectedForeclosure
    ? `/forecloser-property-info/${selectedPropertyId}`
    : isSelectedSold
      ? `/sold-property-info/${selectedPropertyId}`
      : `/property-info/${selectedPropertyId}`;

  const currentShareUrl =
    typeof window !== "undefined" && selectedPropertyId
      ? `${window.location.origin}${sharePath}`
      : "";

  const shareTitle =
    selectedProperty?.title ||
    selectedProperty?.address ||
    "BC Real Estate Property";
  const shareText = `Check out this property on BC Real Estate: ${shareTitle}`;

  const handleCopyLink = async () => {
    if (!currentShareUrl) return;
    try {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = currentShareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsapp = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText} - ${currentShareUrl}`,
        )}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentShareUrl,
        )}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          currentShareUrl,
        )}&text=${encodeURIComponent(shareText)}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareLinkedIn = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          currentShareUrl,
        )}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareEmail = () => {
    if (typeof window !== "undefined") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        shareTitle,
      )}&body=${encodeURIComponent(`${shareText}\n\n${currentShareUrl}`)}`;
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentShareUrl,
        });
      } catch {
        // user dismissed
      }
    }
  };

  const pageCount = queryData?.pagination?.pageCount || 1;
  const totalResults = queryData?.pagination?.total ?? data.length;

  const [isFilterShareOpen, setIsFilterShareOpen] = useState(false);
  const [filterCopied, setFilterCopied] = useState(false);
  const filterShareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterShareRef.current &&
        !filterShareRef.current.contains(e.target as Node)
      ) {
        setIsFilterShareOpen(false);
      }
    };
    if (isFilterShareOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterShareOpen]);

  const generateFilterShareUrl = () => {
    if (typeof window === "undefined") return "";
    const url = new URL(`${window.location.origin}/properties`);
    const p = url.searchParams;

    if (filters.location) p.set("location", filters.location);
    if (filters.search) p.set("search", filters.search);
    if (filters.status && filters.status !== "forSale") p.set("status", filters.status);
    if (filters.activePriceChange && filters.activePriceChange !== "any") p.set("priceChange", filters.activePriceChange);
    if (filters.activePrice && filters.activePrice !== "newest" && filters.activePrice !== "popular") p.set("sort", filters.activePrice);
    if (filters.activeBedRoom && filters.activeBedRoom !== "any") p.set("beds", filters.activeBedRoom);
    if (filters.activeBathRoom && filters.activeBathRoom !== "any") p.set("baths", filters.activeBathRoom);
    if (filters.activeProperty && filters.activeProperty !== "any") p.set("propertyType", filters.activeProperty);
    if (filters.structureType) p.set("structureType", filters.structureType);
    if (filters.minPrice && Number(filters.minPrice) > 1000) p.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice && Number(filters.maxPrice) < 100000000) p.set("maxPrice", String(filters.maxPrice));
    if (filters.minSqft && Number(filters.minSqft) > 100) p.set("minSqft", String(filters.minSqft));
    if (filters.maxSqft && Number(filters.maxSqft) < 15000) p.set("maxSqft", String(filters.maxSqft));
    if (filters.minLotSizeArea && Number(filters.minLotSizeArea) > 100) p.set("minLotSizeArea", String(filters.minLotSizeArea));
    if (filters.maxLotSizeArea && Number(filters.maxLotSizeArea) < 100000) p.set("maxLotSizeArea", String(filters.maxLotSizeArea));
    if (filters.neighborhood) p.set("neighborhood", filters.neighborhood);
    if (filters.whenListed && filters.whenListed !== "any") p.set("whenListed", filters.whenListed);
    if (filters.features) p.set("features", filters.features);

    return url.toString();
  };

  const currentFilterShareUrl = generateFilterShareUrl();

  const getHeadingTitle = () => {
    let action = "Homes for Sale";
    if (filters.status === "sold") {
      action = "Sold Homes";
    } else if (filters.status === "expired") {
      action = "Off-Market & Expired Listings";
    } else if (
      filters.status === "forecloser" ||
      filters.status === "forecloserSold"
    ) {
      action = filters.status === "forecloserSold" ? "Foreclosure Properties Sold" : "Foreclosure Properties";
    } else if (filters.activePriceChange === "drop") {
      action = "Homes with Price Drops";
    }

    const loc = (filters.location || "").trim();
    if (!loc) {
      return `${action} in BC`;
    }

    const cleanLoc = loc.replace(/,\s*BC$/i, "").trim();
    return `${action} in ${cleanLoc}, BC`;
  };

  const filterShareTitle = `${getHeadingTitle()} | BC Real Estate`;
  const filterShareText = `Explore filtered real estate listings: ${getHeadingTitle()} on BC Real Estate`;

  const handleCopyFilterLink = async () => {
    if (!currentFilterShareUrl) return;
    try {
      await navigator.clipboard.writeText(currentFilterShareUrl);
      setFilterCopied(true);
      toast.success("Filter link copied to clipboard!");
      setTimeout(() => setFilterCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = currentFilterShareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setFilterCopied(true);
      toast.success("Filter link copied to clipboard!");
      setTimeout(() => setFilterCopied(false), 2500);
    }
  };

  const handleShareFilterWhatsapp = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${filterShareText} - ${currentFilterShareUrl}`,
        )}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleShareFilterFacebook = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentFilterShareUrl,
        )}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareFilterTwitter = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          currentFilterShareUrl,
        )}&text=${encodeURIComponent(filterShareText)}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareFilterLinkedIn = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          currentFilterShareUrl,
        )}`,
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  const handleShareFilterEmail = () => {
    if (typeof window !== "undefined") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        filterShareTitle,
      )}&body=${encodeURIComponent(
        `${filterShareText}\n\n${currentFilterShareUrl}`,
      )}`;
    }
  };

  const handleNativeFilterShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: filterShareTitle,
          text: filterShareText,
          url: currentFilterShareUrl,
        });
      } catch {
        // user dismissed
      }
    }
  };

  const isLoading = loading;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🚀 Scroll to top of the container on filter change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    search,
    activePrice,
    activeBathRoom,
    activeBedRoom,
    activeProperty,
    minPrice,
    maxPrice,
    minSqft,
    maxSqft,
    minLotSizeArea,
    maxLotSizeArea,
    minTax,
    maxTax,
    minPricePerSft,
    maxPricePerSft,
    minAssociationFee,
    maxAssociationFee,
    status,
    location,
    whenListed,
    features,
    structureType,
    page,
  ]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const hasActiveFilters = Boolean(
    (activePrice !== "newest" && activePrice !== "any") ||
    (search && search.trim() !== "") ||
    (filters.status && filters.status !== "forSale") ||
    (activeBedRoom && activeBedRoom !== "any") ||
    (activeBathRoom && activeBathRoom !== "any") ||
    (activeProperty && activeProperty !== "any") ||
    (activePriceChange && activePriceChange !== "any") ||
    (Number(filters.minPrice) > 1000) ||
    (filters.maxPrice !== undefined && Number(filters.maxPrice) < 100000000) ||
    (Number(filters.minSqft) > 100) ||
    (filters.maxSqft !== undefined && Number(filters.maxSqft) < 15000) ||
    (Number(filters.minLotSizeArea) > 100) ||
    (filters.maxLotSizeArea !== undefined && Number(filters.maxLotSizeArea) < 100000) ||
    (Number(filters.minTax) > 0) ||
    (filters.maxTax !== undefined && Number(filters.maxTax) < 50000) ||
    (Number(filters.minPricePerSft) > 100) ||
    (filters.maxPricePerSft !== undefined && Number(filters.maxPricePerSft) < 25000) ||
    (Number(filters.minAssociationFee) > 100) ||
    (filters.maxAssociationFee !== undefined && Number(filters.maxAssociationFee) < 3000) ||
    (filters.whenListed && filters.whenListed !== "any") ||
    (filters.location && filters.location.trim() !== "") ||
    (filters.neighborhood && filters.neighborhood.trim() !== "") ||
    (filters.features && filters.features.trim() !== "") ||
    (filters.structureType && filters.structureType.trim() !== "")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-9 px-6 pt-5 w-full h-full"
    >
      <div className="h-full mt-24">
        {/* Top Filters Row */}
        <div className="flex items-center gap-4 flex-wrap mb-6 justify-between">
          {/* 🔍 CHIP SEARCH BAR (DESIGN SAME) */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-[0_0_20px_0_rgba(0,0,0,0.12)] border border-gray-200 w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, neighbourhood, address or MLS® number"
              className="flex-1 text-sm outline-none bg-transparent"
            />

            <button
              className="ml-auto bg-[#E6A500] p-2.5 rounded-lg flex items-center justify-center"
              onClick={() => {
                // Search is live, but we can keep the button for UX
              }}
            >
              <FiSearch size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}

        <div className="flex flex-wrap justify-between items-center gap-4 lg:flex-nowrap mb-6 h-auto w-full">
          <div className="flex flex-row justify-between items-center gap-4 w-full xl:w-auto">
            <button
              type="button"
              onClick={() => {
                setOpenFilters(true);
              }}
              className="px-6 py-3 bg-background rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.12)] flex items-center justify-center gap-3 border-[#30548733] cursor-pointer w-full xl:w-fit"
            >
              <FilterListIcon sx={{ color: "#305487" }} />
              <span className="font-medium">Filters</span>
            </button>
            <button
              onClick={() => {
                clearInstanceFilters("list");
                scrollRef.current?.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className={`px-4 py-3 text-sm rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.12)] lg:hidden flex flex-nowrap flex-row items-center gap-2 border border-[#30548733] cursor-pointer w-full justify-center text-nowrap ${hasActiveFilters
                  ? "bg-primary text-white"
                  : "bg-white text-gray-800"
                }`}
            >
              <FiX size={16} />
              <span className="font-medium">Reset Filters</span>
            </button>
          </div>

          {/* Price */}
          <div className="w-full flex flex-row md:flex-nowrap flex-wrap justify-between items-center gap-4">
            <FilterPillSelect
              label="Sort By"
              value={activePrice}
              onChange={setActivePrice}
              pillBase={pillBase}
              pillActive={pillActive}
              pillInactive={pillInactive}
              options={[
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Low to High", value: "asc" },
                { label: "High to Low", value: "desc" },
                { label: "Popular First", value: "popular" },
                { label: "Tax Asc", value: "tax-asc" },
                { label: "Tax Desc", value: "tax-desc" },
              ]}
            />

            {/* BedRoom */}
            <FilterPillSelect
              label="BedRoom"
              value={activeBedRoom}
              onChange={setActiveBedRoom}
              pillBase={pillBase}
              pillActive={pillActive}
              pillInactive={pillInactive}
              options={[
                { label: "All", value: "any" },
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4+", value: "4" },
              ]}
            />

            {/* BathRoom */}
            <FilterPillSelect
              label="BathRoom"
              value={activeBathRoom}
              onChange={setActiveBathRoom}
              pillBase={pillBase}
              pillActive={pillActive}
              pillInactive={pillInactive}
              options={[
                { label: "All", value: "any" },
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4+", value: "4" },
              ]}
            />

            <FilterPillSelect
              label="Price"
              value={activePriceChange}
              onChange={setActivePriceChange}
              pillBase={pillBase}
              pillActive={pillActive}
              pillInactive={pillInactive}
              options={[
                { label: "Any", value: "any" },
                { label: "Drop", value: "drop" },
                { label: "Increase", value: "increase" },
              ]}
            />
          </div>
          <button
            onClick={() => {
              clearInstanceFilters("list");
              scrollRef.current?.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className={`px-4 py-3 text-sm rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.12)] hidden lg:flex flex-nowrap flex-row items-center gap-2 border border-[#30548733] cursor-pointer w-auto text-nowrap ${hasActiveFilters
                ? "bg-primary text-white"
                : "bg-white text-gray-800"
              }`}
          >
            <FiX size={16} />
            <span className="font-medium">Reset Filters</span>
          </button>
        </div>

        {(filters.status !== "forSale" ||
          (filters.minPrice !== undefined && filters.minPrice > 1000) ||
          (filters.maxPrice !== undefined && filters.maxPrice < 100000000) ||
          (filters.minSqft !== undefined && filters.minSqft > 100) ||
          (filters.maxSqft !== undefined && filters.maxSqft < 15000) ||
          (filters.minLotSizeArea !== undefined &&
            filters.minLotSizeArea > 100) ||
          (filters.maxLotSizeArea !== undefined &&
            filters.maxLotSizeArea < 100000) ||
          (filters.minTax !== undefined && filters.minTax > 0) ||
          (filters.maxTax !== undefined && filters.maxTax < 50000) ||
          (filters.minPricePerSft !== undefined &&
            filters.minPricePerSft > 100) ||
          (filters.maxPricePerSft !== undefined &&
            filters.maxPricePerSft < 25000) ||
          (filters.minAssociationFee !== undefined &&
            filters.minAssociationFee > 100) ||
          (filters.maxAssociationFee !== undefined &&
            filters.maxAssociationFee < 3000) ||
          (filters.whenListed && filters.whenListed !== "any") ||
          filters.features ||
          filters.neighborhood ||
          (filters.location &&
            filters.location.split(",").filter(Boolean).length > 1) ||
          filters.structureType ||
          (filters.activeProperty && filters.activeProperty !== "any")) && (
            <div className="w-full flex flex-row justify-between items-center mb-4">
              <span className="font-medium text-sm">Selected Filters:</span>
              <div className="flex flex-row gap-2">
                {(filters.minPrice !== undefined && filters.minPrice > 1000) ||
                  (filters.maxPrice !== undefined &&
                    filters.maxPrice < 100000000) ? (
                  <Chip
                    label={`Price: $${Number(filters.minPrice).toLocaleString()} to ${filters.maxPrice === 100000000 ? "Max" : `$${Number(filters.maxPrice).toLocaleString()}`}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minPrice", 0);
                      updateInstanceFilter("list", "maxPrice", 100000000);
                      updateInstanceFilter("list", "minPriceInput", "");
                      updateInstanceFilter("list", "maxPriceInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {(filters.minSqft !== undefined && filters.minSqft > 100) ||
                  (filters.maxSqft !== undefined && filters.maxSqft < 15000) ? (
                  <Chip
                    label={`Area: ${filters.minSqft}sqft to ${filters.maxSqft === 15000 ? "Max" : `${filters.maxSqft}sqft`}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minSqft", 0);
                      updateInstanceFilter("list", "maxSqft", 15000);
                      updateInstanceFilter("list", "minSqftInput", "");
                      updateInstanceFilter("list", "maxSqftInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {(filters.minLotSizeArea !== undefined &&
                  filters.minLotSizeArea > 100) ||
                  (filters.maxLotSizeArea !== undefined &&
                    filters.maxLotSizeArea < 100000) ? (
                  <Chip
                    label={`${filters.minLotSizeArea}sqft to ${filters.maxLotSizeArea === 100000 ? "Max" : `${filters.maxLotSizeArea}sqft`} (Lot)`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minLotSizeArea", 0);
                      updateInstanceFilter("list", "maxLotSizeArea", 100000);
                      updateInstanceFilter("list", "minLotSqftInput", "");
                      updateInstanceFilter("list", "maxLotSqftInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {(filters.minTax !== undefined && filters.minTax > 0) ||
                  (filters.maxTax !== undefined && filters.maxTax < 50000) ? (
                  <Chip
                    label={`$${filters.minTax} to ${filters.maxTax === 50000 ? "Max" : `$${filters.maxTax}`} (Tax)`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minTax", 0);
                      updateInstanceFilter("list", "maxTax", 50000);
                      updateInstanceFilter("list", "minTaxInput", "");
                      updateInstanceFilter("list", "maxTaxInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {(filters.minPricePerSft !== undefined &&
                  filters.minPricePerSft > 100) ||
                  (filters.maxPricePerSft !== undefined &&
                    filters.maxPricePerSft < 25000) ? (
                  <Chip
                    label={`$${filters.minPricePerSft} to ${filters.maxPricePerSft === 25000 ? "Max" : `$${filters.maxPricePerSft}`} (Price Per Sft)`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minPricePerSft", 0);
                      updateInstanceFilter("list", "maxPricePerSft", 25000);
                      updateInstanceFilter("list", "minPriceInput", "");
                      updateInstanceFilter("list", "maxPriceInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {(filters.minAssociationFee !== undefined &&
                  filters.minAssociationFee > 100) ||
                  (filters.maxAssociationFee !== undefined &&
                    filters.maxAssociationFee < 3000) ? (
                  <Chip
                    label={`$${filters.minAssociationFee} to ${filters.maxAssociationFee === 3000 ? "Max" : `$${filters.maxAssociationFee}`} (Maintenance Fee)`}
                    onDelete={() => {
                      updateInstanceFilter("list", "minAssociationFee", 0);
                      updateInstanceFilter("list", "maxAssociationFee", 3000);
                      updateInstanceFilter("list", "minAssociationFeeInput", "");
                      updateInstanceFilter("list", "maxAssociationFeeInput", "");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                ) : null}
                {filters.whenListed && filters.whenListed !== "any" && (
                  <Chip
                    label={`Listed: ${filters.whenListed}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "whenListed", "any");
                    }}
                    className="bg-gray-100 text-sm capitalize"
                  />
                )}
                {filters.status && filters.status !== "forSale" && (
                  <Chip
                    label={`Status: ${filters.status}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "status", "forSale");
                    }}
                    className="bg-gray-100 text-sm capitalize"
                  />
                )}
                {filters.activeBedRoom && filters.activeBedRoom !== "any" && (
                  <Chip
                    label={`Beds: ${filters.activeBedRoom}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "activeBedRoom", "any");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                )}
                {filters.activeBathRoom && filters.activeBathRoom !== "any" && (
                  <Chip
                    label={`Baths: ${filters.activeBathRoom}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "activeBathRoom", "any");
                    }}
                    className="bg-gray-100 text-sm"
                  />
                )}
                {((filters.activeProperty && filters.activeProperty !== "any") ||
                  Boolean(filters.structureType)) && (
                    <Chip
                      label={`Property Type: ${[
                        ...(filters.structureType
                          ? filters.structureType.split(",").filter(Boolean)
                          : []),
                        ...(filters.activeProperty &&
                          filters.activeProperty !== "any"
                          ? filters.activeProperty.split(",").filter(Boolean)
                          : []),
                      ]
                        .map((t: string) =>
                          t.replace(/([A-Z])/g, " $1").replace(/\s+/g, " ").trim(),
                        )
                        .join(", ")}`}
                      onDelete={() => {
                        updateInstanceFilter("list", "activeProperty", "any");
                        updateInstanceFilter("list", "structureType", "");
                      }}
                      className="bg-gray-100 text-sm capitalize"
                    />
                  )}
                {filters.features && (
                  <Chip
                    label={`Feature: ${filters.features
                      .split(",")
                      .map((feat: string) =>
                        feat.replace(/([A-Z])/g, " $1").trim(),
                      )
                      .join(", ")}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "features", "");
                    }}
                    className="bg-gray-100 text-sm capitalize"
                  />
                )}
                {filters.neighborhood && (
                  <Chip

                    label={`Neighborhood: ${(() => {
                      const list = filters.neighborhood
                        .split(",")
                        .filter(Boolean);
                      return list.length > 4
                        ? `${list.slice(0, 4).join(", ")}, more.....`
                        : list.join(", ");
                    })()}`}
                    onDelete={() => {
                      updateInstanceFilter("list", "neighborhood", "");
                    }}
                    className="bg-gray-100 text-sm capitalize"
                  />
                )}
                {filters.location &&
                  filters.location.split(",").filter(Boolean).length > 1 && (
                    <Chip
                      label={`Location: ${(() => {
                        const list = filters.location
                          .split(",")
                          .filter(Boolean);
                        return list.length > 4
                          ? `${list.slice(0, 4).join(", ")}, more.....`
                          : list.join(", ");
                      })()}`}
                      onDelete={() => {
                        updateInstanceFilter("list", "location", "");
                        updateInstanceFilter("list", "neighborhood", "");
                      }}
                      className="bg-gray-100 text-sm capitalize"
                    />
                  )}
              </div>
            </div>
          )}

        {/* Header: Title, Count & Share Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-baseline flex-wrap gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {getHeadingTitle()}
            </h1>
            <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {isLoading ? (
                "Searching..."
              ) : (
                `${totalResults.toLocaleString()} ${totalResults === 1 ? "home" : "homes"} found`
              )}
            </span>
          </div>

          {/* Share Search Button & Dropdown */}
          <div className="relative shrink-0" ref={filterShareRef}>
            <button
              type="button"
              onClick={() => setIsFilterShareOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${isFilterShareOpen
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs hover:border-gray-300"
                }`}
              title="Share this search with filters"
              aria-label="Share this search with filters"
            >
              <FiShare2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {isFilterShareOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FiShare2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Share Search
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Share this exact search with active filters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFilterShareOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                {/* Filter tags preview */}
                <div className="my-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Included Filters:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200">
                      Location: {filters.location || "All BC"}
                    </span>
                    {filters.status && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200 capitalize">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.activeBedRoom && filters.activeBedRoom !== "any" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200">
                        Beds: {filters.activeBedRoom}
                      </span>
                    )}
                    {filters.activeBathRoom && filters.activeBathRoom !== "any" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200">
                        Baths: {filters.activeBathRoom}
                      </span>
                    )}
                    {filters.minPrice !== 0 && Number(filters.minPrice) > 10000 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200">
                        Min: ${Number(filters.minPrice).toLocaleString()}
                      </span>
                    )}
                    {filters.maxPrice && Number(filters.maxPrice) < 100000000 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200">
                        Max: ${Number(filters.maxPrice).toLocaleString()}
                      </span>
                    )}
                    {filters.activeProperty && filters.activeProperty !== "any" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200 capitalize">
                        Type: {filters.activeProperty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Share Options */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 my-3">
                  <button
                    onClick={handleShareFilterWhatsapp}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                      <FaWhatsapp size={17} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareFilterFacebook}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                      <FaFacebookF size={15} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">Facebook</span>
                  </button>

                  <button
                    onClick={handleShareFilterTwitter}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                      <FaXTwitter size={15} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">X</span>
                  </button>

                  <button
                    onClick={handleShareFilterLinkedIn}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-sky-50 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0077b5] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                      <FaLinkedinIn size={15} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">LinkedIn</span>
                  </button>

                  <button
                    onClick={handleShareFilterEmail}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-amber-50 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                      <FiMail size={16} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">Email</span>
                  </button>
                </div>

                {/* Native Share on supported devices */}
                {canNativeShare && (
                  <button
                    onClick={handleNativeFilterShare}
                    className="w-full mb-3 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FiShare2 size={14} />
                    <span>More share options...</span>
                  </button>
                )}

                {/* Copy Link field */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:border-primary transition">
                    <input
                      type="text"
                      readOnly
                      value={currentFilterShareUrl}
                      className="bg-transparent text-xs text-gray-600 px-2 w-full outline-hidden truncate select-all"
                    />
                    <button
                      onClick={handleCopyFilterLink}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${filterCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-white hover:bg-primary/90"
                        }`}
                    >
                      {filterCopied ? (
                        <>
                          <FiCheck size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Property Grid */}
        {isLoading ? (
          <div className="flex justify-between items-start mb-10 w-full">
            <div className="w-full flex flex-col h-full">
              <div
                ref={scrollRef}
                className="gap-7 grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 justify-between overflow-y-scroll xl:h-[65svh] no-scrollbar w-full xl:p-3"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full xl:h-[65svh] h-full flex justify-center items-center">
            <h3 className="text-2xl font-medium">No Properties Found</h3>
          </div>
        ) : (
          <div className="flex justify-between items-start mb-10 w-full">
            <div className="w-full flex flex-col h-full">
              <div
                ref={scrollRef}
                className="gap-7 grid grid-cols-1 xl:grid-cols-3  2xl:grid-cols-4 md:grid-cols-2 items-stretch justify-between overflow-y-scroll xl:min-h-[50svh] xl:max-h-[80svh] no-scrollbar w-full xl:p-3"
              >
                {data.map((property: any) => (
                  <PropertiesCard
                    key={property.id}
                    {...property}
                    isLogin
                    isSold={status === "sold" || status === "forecloserSold"}
                    isExpired={status === "expired"}
                    isDdf={property.isDdf}
                    onCardClick={(id) => setSelectedPropertyId(id)}
                  />
                ))}
              </div>
              {data?.length !== 0 && pageCount !== 0 && (
                <>
                  <div className="md:hidden flex justify-center mt-6">
                    <Pagination
                      count={pageCount}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="small"
                    />
                  </div>
                  <div className="md:flex hidden justify-center mt-10">
                    <Pagination
                      count={pageCount}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <FiltersPopup
        id="list"
        open={openFilters}
        onClose={() => setOpenFilters(false)}
      />

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

            <span className="text-base font-bold ">Property Details</span>

            {/* Actions: Full Screen Toggle & Close */}
            <div className="flex items-center gap-2">
              {/* Share button with popup */}
              <div className="relative" ref={shareRef}>
                <button
                  type="button"
                  onClick={() => setIsShareOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer text-sm font-medium border ${isShareOpen
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
                    }`}
                  title="Share Property"
                  aria-label="Share Property"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span className="hidden md:inline-block">Share</span>
                </button>

                {isShareOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FiShare2 size={15} />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          Share Property
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsShareOpen(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        title="Close share popup"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    {/* Social sharing options */}
                    <div className="py-3.5">
                      <p className="text-xs text-gray-500 mb-2.5 font-medium">
                        Share link via:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {/* WhatsApp */}
                        <button
                          type="button"
                          onClick={handleShareWhatsapp}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-50 transition group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white flex items-center justify-center transition shadow-xs">
                            <FaWhatsapp size={20} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-700">
                            WhatsApp
                          </span>
                        </button>

                        {/* Facebook */}
                        <button
                          type="button"
                          onClick={handleShareFacebook}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-blue-50 transition group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center transition shadow-xs">
                            <FaFacebookF size={18} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-700">
                            Facebook
                          </span>
                        </button>

                        {/* X / Twitter */}
                        <button
                          type="button"
                          onClick={handleShareTwitter}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 transition group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-black/10 text-black group-hover:bg-black group-hover:text-white flex items-center justify-center transition shadow-xs">
                            <FaXTwitter size={17} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-700">
                            X (Twitter)
                          </span>
                        </button>

                        {/* LinkedIn */}
                        <button
                          type="button"
                          onClick={handleShareLinkedIn}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-sky-50 transition group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white flex items-center justify-center transition shadow-xs">
                            <FaLinkedinIn size={18} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-700">
                            LinkedIn
                          </span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Email */}
                        <button
                          type="button"
                          onClick={handleShareEmail}
                          className="flex items-center justify-center gap-2 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer text-xs font-medium border border-gray-200"
                        >
                          <FiMail size={15} className="text-gray-500" />
                          <span>Send Email</span>
                        </button>

                        {/* Native Device Share */}
                        {canNativeShare && (
                          <button
                            type="button"
                            onClick={handleNativeShare}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer text-xs font-medium border border-gray-200"
                          >
                            <FiShare2 size={15} className="text-gray-500" />
                            <span>More apps...</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Copy Link Input Bar */}
                    <div className="pt-2.5 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">
                        Or copy link
                      </p>
                      <div className="flex items-center gap-2 p-1 pl-2.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-primary transition">
                        <input
                          type="text"
                          readOnly
                          value={currentShareUrl}
                          className="w-full text-xs text-gray-600 bg-transparent outline-none truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${copied
                            ? "bg-emerald-600 text-white"
                            : "bg-primary text-white hover:bg-primary/90"
                            }`}
                        >
                          {copied ? (
                            <>
                              <FiCheck size={14} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
    </motion.div>
  );
}
