/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import {
  ArrowCircleDownFilled,
  LocationRippleFilled,
} from "@fluentui/react-icons";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import { getOfficeName } from "@/src/utilities/utilities";

const PropertyTopAddressSection = ({ property }: { property: any }) => {
  return (
    <div className="xl:mb-8 mb-4 w-full flex md:flex-row flex-col md:items-center md:justify-between gap-y-3">
      <div className="flex flex-col md:w-[75%] xl:gap-y-4 gap-y-3">
        <div className="flex xl:flex-row flex-col flex-wrap gap-x-2 xl:items-center">
          <Heading
            tagType="h1"
            type={IHeadingTypes.heading32}
            content={
              property?.address ||
              "210 Stracke Pines Trail # 515, Wolfbury TX 79725-5531"
            }
          />
          <span className="text-red items-center-safe xl:text-base text-xs gap-x-1 hidden">
            <ArrowCircleDownFilled /> $96,000 on Sep 8, 2025
          </span>
        </div>
        <div className="flex md:flex-row flex-col text-wrap md:items-center xl:text-base text-sm gap-y-1.5 text-black70">
          <span className="flex items-center gap-x-0.5">
            <LocationRippleFilled className="text-secondary md:w-8 md:h-8 w-6 h-6" />
            {property?.city}
          </span>
          {property?.neighborhood && <><LineGradient vr customClasses="mx-2 md:block hidden" />
            <span>{property?.neighborhood}</span></>}
          <LineGradient vr customClasses="mx-2 md:block hidden" />
          <span>
            MLS® {property?.listing_id || property?.mls_number || "FPR345643E3"}
          </span>
          <LineGradient vr customClasses="mx-2 md:block hidden" />
          <span>Courtesy of: {getOfficeName(property)}</span>

        </div>
      </div>
      <div className="flex md:flex-col items-center md:items-end-safe gap-x-1.5 gap-y-3">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading48}
          content={`$${Number(property?.price || 0).toLocaleString()}`}
          customClasses="text-primary"
        />
        {(property?.Living_area ?? property?.lot_size_area) ? (
          <Description
            type={IDescriptionTypes.dec1614}
            content={`${property?.Living_area ?? property?.lot_size_area
              } ${property?.living_area_units ?? property?.lot_size_units}`}
            customClasses="text-black70"
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PropertyTopAddressSection;
