/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { propertyData } from "../dummyData";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import {
  ArrowCircleDownFilled,
  LocationRippleFilled,
} from "@fluentui/react-icons";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";

const PropertyTopAddressSection = ({ data }: { data: any }) => {
  const address = propertyData.find((list) => list.id === data);
  return (
    <div className="xl:mb-8 mb-4 w-full flex md:flex-row flex-col md:items-center md:justify-between gap-y-3">
      <div className="flex flex-col md:w-[75%] xl:gap-y-4 gap-y-3">
        <div className="flex xl:flex-row flex-col flex-wrap gap-x-2 xl:items-center">
          <Heading
            tagType="h1"
            type={IHeadingTypes.heading32}
            content={address?.address}
          />
          <span className="text-red flex items-center-safe xl:text-base text-xs gap-x-1">
            <ArrowCircleDownFilled /> $96,000 on Sep 8, 2025
          </span>
        </div>
        <div className="flex md:flex-row flex-col text-wrap md:items-center xl:text-base text-sm gap-y-1.5 text-black70">
          <span className="flex items-center gap-x-0.5">
            <LocationRippleFilled className="text-secondary md:w-8 md:h-8 w-6 h-6" />
            Southwestern Ontario, Ontario, Canada
          </span>
          <LineGradient vr customClasses="mx-2 md:block hidden" />
          <span>MLS® {address?.mls}</span>
        </div>
      </div>
      <div className="flex md:flex-col items-center md:items-end-safe gap-x-1.5 gap-y-3">
        <Heading
          tagType="h5"
          type={IHeadingTypes.heading48}
          content={`$${address?.price.toLocaleString()}`}
          customClasses="text-primary"
        />
        <Description
          type={IDescriptionTypes.dec1614}
          content={`${address?.sqft}sqft`}
          customClasses="text-black70"
        />
      </div>
    </div>
  );
};

export default PropertyTopAddressSection;
