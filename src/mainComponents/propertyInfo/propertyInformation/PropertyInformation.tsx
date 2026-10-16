/* eslint-disable @typescript-eslint/no-explicit-any */
import PropertyContactUs from "./PropertyContactUs";
import PropertyTabs from "./PropertyTabs";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import Image from "next/image";
import { Icons } from "@/src/app/exports";
import Link from "next/link";
import DynamicTable from "@/src/components/common/dynamicTable/DynamicTable";
import {
  getPropertyDetailsRows,
  getPropertyRoomRows,
  propertyDetailsHeaders,
  roomHeaders,
} from "..";
import NearbyPlaceCard, { NearbyPlaceSkeleton } from "./NearbyPlaceCard";
import { useAuthContext } from "../../auth/AuthContext";
import { useGetNearbyRealEstatePlaces } from "@/src/hooks/listing/useRealEstateListingQueries";
import { sqftToAcresFormatted } from "@/src/utilities/utilities";
import MortgageCalculator from "@/src/components/mortgageCalculator";

const PropertyInformation = ({ property }: { property: any }) => {
  const getLotSizeDisplay = () => {
    const units = property?.lot_size_units ?? property?.raw_data?.LotSizeUnits;
    const normalizedUnits = units?.trim()?.toLowerCase();
    if (normalizedUnits === "square feet") {
      const numericArea = Number(
        String(property?.lot_size_area).replace(/,/g, "")
      );
      const unitLabel = units === "square feet" ? "acres" : "Acres";
      return `${sqftToAcresFormatted(numericArea)} ${unitLabel}`;
    }
    return `${property?.lot_size_area} ${units || "sq ft"}`;
  };

  const featuresList = [
    {
      icon: Icons.bedroom,
      label: "Bedrooms",
      value: property?.bedrooms || "0",
    },

    {
      icon: Icons.bathtub,
      label: "Bathrooms",
      value: property?.bathrooms || "0",
    },

    ...(property?.property_sub_type !== "Business"
      ? [
        {
          icon: Icons.garage,
          label: "Garage",
          value: "0",
        },
      ]
      : []),
    {
      icon: Icons.calendar,
      label: "Year Built",
      value: property?.raw_data?.YearBuilt || "Na",
    },
    {
      icon: Icons.scale,
      label: "Living Area Size",
      value:
        property?.Living_area && property?.Living_area !== 0
          ? `${property?.Living_area} sq ft`
          : "Na",
    },
    ...(property?.lot_size_area != null && property?.lot_size_area !== ""
      ? [
        {
          icon: Icons.lot,
          label: "Lot Size",
          value: getLotSizeDisplay(),
        },
      ]
      : []),
  ];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;

  const { data: nearbyPlaces, isLoading: nearbyPlacesLoading } =
    useGetNearbyRealEstatePlaces(property.documentId);

  const { isLoggedIn } = useAuthContext();

  return (
    <div className="flex flex-row items-start flex-nowrap gap-5 w-full mt-6 md:mt-8 xl:mt-13">
      <div className="flex flex-col xl:w-[70%] w-full h-full  relative">
        {/* Property Tabs */}
        <PropertyTabs />
        <div className="xl:space-y-13 md:space-y-8 space-y-6">
          {/* Description */}
          <div
            id="overview"
            className="scroll-mt-40 p-6 rounded-2xl bg-gray flex flex-col gap-y-3"
          >
            <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
              Description
            </h2>
            <Description
              type={IDescriptionTypes.dec1614}
              customClasses="text-black70/50"
              content={
                property?.public_remarks ||
                property?.raw_data?.PublicRemarks ||
                "No Description"
              }
            />
          </div>

          {/* Features */}
          <div
            id="features"
            className="scroll-mt-30 p-6 rounded-2xl border border-borderColor flex flex-col gap-y-3"
          >
            <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
              Features
            </h2>
            <LineGradient />
            <div className="flex flex-row flex-wrap justify-between gap-y-3">
              {featuresList.map((features, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-y-2 w-auto h-auto px-2"
                >
                  <div className="flex flex-row items-center gap-x-2">
                    <Image
                      title="image title"
                      src={features.icon}
                      alt={features.label}
                      width={40}
                      height={40}
                      className="w-5 md:w-7 h-5 md:h-7 lg:w-8 lg:h-8 object-contain"
                    />
                    <span className="text-base md:text-lg font-medium">
                      {features.value}
                    </span>
                  </div>
                  <Description
                    type={IDescriptionTypes.dec1614}
                    content={features.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* map */}
          <div className="flex flex-col gap-y-6 w-full">
            <div className="w-full flex flex-row items-center justify-between">
              <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
                Map location
              </h2>
              <Link
                href={googleMapsUrl}
                target="_blank"
                className="px-5 py-3 bg-primary text-background text-base font-bold rounded-2xl"
              >
                Open Map
              </Link>
            </div>
            {property.latitude && property.longitude && (
              <iframe
                className="w-full top-0 left-0 md:rounded-[30px] xl:mb-14 mb-10 rounded-none h-64 xl:h-106"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.latitude},${property.longitude}&maptype=satellite`}
                width=" 100%"
                height="424"
                allowFullScreen={false}
                style={{ borderRadius: "12px" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          {/* Property Details */}
          <DynamicTable
            title="Property Details"
            headers={propertyDetailsHeaders}
            rows={getPropertyDetailsRows(property, isLoggedIn)}
          />
          {/* Room Information */}
          {property?.rooms && property?.rooms?.length > 0 && (
            <DynamicTable
              title="Room Information"
              headers={roomHeaders}
              rows={getPropertyRoomRows(property)}
            />
          )}

          {/* Nearby Schools */}
          {nearbyPlaces?.data?.schools &&
            nearbyPlaces?.data?.schools?.length > 0 && (
              <div id="neighborhoods" className="scroll-mt-40">
                <h2 className="mb-6 xl:text-2xl text-lg xl:font-bold font-semibold">
                  Nearby Schools
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {nearbyPlacesLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                      <NearbyPlaceSkeleton key={index} />
                    ))
                    : nearbyPlaces?.data?.schools?.sort((a: any, b: any) => Number(b.rating) - Number(a.rating)).map(
                      (school: any, idx: number) => (
                        <NearbyPlaceCard
                          key={idx}
                          place={school}
                          type="school"
                        />
                      ),
                    )}
                </div>
              </div>
            )}

          <MortgageCalculator
            initialHomePrice={Number(property?.price) || 400000}
            propertyAddress={property?.address || undefined}
          />

          {/* Building Complex Information */}
          {/* {property?.structure_type !== "Detached Home" && (
            <DynamicTable
              title={"Building Complex Information (Dummy Data)"}
              headers={buildingComplexHeaders}
              rows={buildingComplexRows}
            />
          )} */}
          {/* Market Statistics */}
          <div id="stats" className="scroll-mt-40">
            {/* <DynamicTable
              title="Market Statistics  (Dummy Data)"
              headers={marketStatsHeaders}
              rows={marketStatsRows}
            /> */}
            {/* Sentinel (DO NOT REMOVE) */}
            <div id="stats-end" className="h-px" />
          </div>
        </div>
      </div>
      {/* ================= RIGHT SIDEBAR ================= */}
      <aside className="h-fit sticky top-14 self-start md:w-[30%] xl:block hidden  ">
        <PropertyContactUs property={property} />
      </aside>
    </div>
  );
};

export default PropertyInformation;
