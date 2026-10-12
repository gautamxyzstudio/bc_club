import { getOfficeName } from "@/src/utilities/utilities";

export const hasValidCoordinates = (item: any) => {
  const lat = Number(item?.latitude);
  const lng = Number(item?.longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    lat !== 0 &&
    lng !== 0
  );
};

export const getGeoKey = (property: any) =>
  String(property?.address || property?.id || "");

export const normalizeAddress = (property: any) => {
  const parts = [
    property?.address,
    property?.city,
    property?.province || "BC",
    "Canada",
  ].filter(Boolean);

  return parts.join(", ");
};

export const getSafeLatLng = (listing: any) => {
  const lat = Number(listing?.latitude);
  const lng = Number(listing?.longitude);

  const latitude = lat >= -90 && lat <= 90 ? lat : lng;
  const longitude = lng >= -180 && lng <= 180 ? lng : lat;

  return { latitude, longitude };
};

export const transformNormalListing = (listing: any, me: any) => {
  const { latitude, longitude } = getSafeLatLng(listing);

  return {
    id: listing.documentId || listing.id || Math.random().toString(),
    image:
      typeof listing?.media?.[0] === "string"
        ? listing.media[0]
        : listing?.media?.[0]?.MediaURL,
    title: listing?.property_sub_type || "Property",
    price: Number(listing?.price) || 0,
    daysAgo:
      Number(listing?.old_price) > 0
        ? listing?.ModificationTimestamp
        : (listing?.OriginalEntryTimestamp ??
          listing?.raw_data?.BridgeModificationTimestamp ??
          0),
    address: listing?.address
      ? `${listing?.address}, ${listing?.city || ""}`
      : listing?.city || "",
    city: listing?.city || "",
    province: listing?.province || "BC",
    sqft: listing?.area ?? listing?.lot_size_area ?? 0,
    beds: listing?.bedrooms ?? 0,
    baths: listing?.bathrooms ?? 0,
    longitude,
    latitude,
    oldPrice: Number(listing?.old_price) || 0,
    mls: listing?.listing_id,
    realtor: getOfficeName(listing),
    isLogin: false,
    likesCount: listing?.likesCount,
    isFavourite: listing?.users?.some(
      (user: any) => user.documentId === me?.documentId,
    ),
    assessedDiff: listing.price
      ? Number(
          ((listing.price - (listing.annual_tax ?? 0)) / listing.price).toFixed(
            1,
          ),
        )
      : 0,
  };
};

export const transformActiveListing = (listing: any, me: any) => {
  const { latitude, longitude } = getSafeLatLng(listing);

  return {
    id: listing.documentId || listing.id || listing.listing_id,
    image:
      typeof listing?.media_url === "string"
        ? listing.media_url
        : Array.isArray(listing?.media_url)
          ? listing.media_url[0]
          : listing?.media?.[0]?.MediaURL,
    title: listing?.property_sub_type || "Property",
    price: Number(listing?.price) || 0,
    daysAgo:
      Number(listing?.old_price) > 0
        ? listing?.ModificationTimestamp
        : (listing?.OriginalEntryTimestamp ??
          listing?.raw_data?.BridgeModificationTimestamp ??
          0),
    address: listing?.address,
    neighborhood: listing?.neighborhood,
    sqft: listing?.Living_area ?? listing?.area ?? 0,
    beds: listing?.bedrooms ?? 0,
    baths: listing?.bathrooms ?? 0,
    longitude,
    latitude,
    lotSize: listing?.lot_size_area ?? "",
    lotSizeUnits: listing?.lot_size_units,
    structureType: listing?.structure_type ?? "",
    mls: listing?.mls_number ?? listing?.listing_id,
    realtor: listing?.office_name ?? getOfficeName(listing),
    isFavourite: listing?.users?.some(
      (user: any) => user.documentId === me?.documentId,
    ),
    status: listing?.status,
    likesCount: listing?.likesCount,
    priceDrop:
      listing.PreviousListPrice && listing.PreviousListPrice > listing.ListPrice
        ? Number(
            (
              (listing.PreviousListPrice - listing.ListPrice) /
              listing.ListPrice
            ).toFixed(1),
          )
        : undefined,
    assessedDiff: listing.price
      ? Number(
          ((listing.price - (listing.annual_tax ?? 0)) / listing.price).toFixed(
            1,
          ),
        )
      : 0,
  };
};
