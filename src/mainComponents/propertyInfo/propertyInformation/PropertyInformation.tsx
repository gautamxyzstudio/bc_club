/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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
  propertyDetailsHeaders,
  propertyDetailsRows,
  roomHeaders,
  roomRows,
} from "../../dummyData";

const PropertyInformation = ({ property }: { property: any }) => {
  const featureslist = [
    {
      icon: Icons.bedroom,
      label: "Bedrooms",
      value: property?.beds,
    },
    {
      icon: Icons.bathtub,
      label: "Bathrooms",
      value: property?.baths,
    },
    {
      icon: Icons.garage,
      label: "Garage",
      value: 2,
    },
    {
      icon: Icons.calendar,
      label: "Year Built",
      value: 2,
    },
    {
      icon: Icons.scale,
      label: "Area Size",
      value: property?.sqft,
    },
  ];
  return (
    <div className="flex flex-row items-start flex-nowrap gap-5 w-full mt-6 md:mt-8 xl:mt-13">
      <div className="flex flex-col xl:w-[70%] w-full h-full ">
        {/* Property Tabs */}
        <PropertyTabs />
        <div className="xl:space-y-13 md:space-y-8 space-y-6">
          {/* Description */}
          <div
            id="overview"
            className="scroll-mt-20 p-6 rounded-2xl bg-gray flex flex-col gap-y-3"
          >
            <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
              Description
            </h2>
            <Description
              type={IDescriptionTypes.dec1614}
              customClasses="text-black70/50"
              content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel euismod lectus. Integer at arcu sollicitudin, fermentum ipsum congue, volutpat nibh. Curabitur at iaculis odio. Curabitur congue augue quis elit cursus faucibus. Aenean quis varius diam, ut mattis arcu. Integer porta ligula quis lorem imperdiet convallis. Mauris et neque non turpis viverra tincidunt. Donec lobortis purus sed lacinia varius. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur condimentum semper est id condimentum.

Nulla sodales justo erat, vel ultrices elit lacinia vel. Suspendisse vehicula, tellus vitae efficitur placerat, nisi metus pharetra turpis, sed bibendum eros est ac diam. Vivamus dapibus elit id orci ultrices, sit amet ullamcorper magna lobortis. In hac habitasse platea dictumst. Integer vehicula sapien augue, et ullamcorper quam egestas ut. Ut sit amet eros eros. Nullam ligula diam, egestas at nisl sed, laoreet accumsan nibh. Mauris justo justo, hendrerit eget elementum sed, sodales non nisi. Aliquam eget leo in metus condimentum placerat quis at dui. Suspendisse nec ullamcorper dui. Nulla porta scelerisque ipsum congue malesuada. Sed sodales, nisl in tristique vestibulum, metus mauris ultricies odio, et sodales nulla ligula at tortor."
            />
          </div>

          {/* Features */}
          <div
            id="features"
            className="scroll-mt-20 p-6 rounded-2xl border border-borderColor flex flex-col gap-y-3"
          >
            <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
              Features
            </h2>
            <LineGradient />
            <div className="flex flex-row flex-wrap justify-between gap-y-3">
              {featureslist.map((features, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-y-2 md:w-26.75 xl:w-36.25 h-auto px-2"
                >
                  <div className="flex flex-row items-center gap-x-2">
                    <Image
                      src={features.icon}
                      alt={features.label}
                      width={40}
                      height={40}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-lg font-medium">
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
                href={"https://maps.app.goo.gl/TAF4QMnBxnFqkMFq9"}
                target="_blank"
                className="px-5 py-3 bg-primary text-background text-base font-bold rounded-2xl"
              >
                Open Map
              </Link>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2819.838394129106!2d-123.09553402328041!3d49.27776627139203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486716efeab78a3%3A0x369263f055846d81!2s519%20Union%20St%2C%20Vancouver%2C%20BC%20V6A%202B7%2C%20Canada!5e1!3m2!1sen!2sin!4v1766147459784!5m2!1sen!2sin"
              width="100%"
              height="100%"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full rounded-xl h-98.75"
            ></iframe>
          </div>
          {/* Property Details */}
          <DynamicTable
            title="Property Details"
            headers={propertyDetailsHeaders}
            rows={propertyDetailsRows}
          />
          {/* Room Information */}
          <DynamicTable
            title="Room Information"
            headers={roomHeaders}
            rows={roomRows}
          />
          <div
            id="estimate"
            className="scroll-mt-20 p-5 rounded-xl bg-gray flex flex-col gap-y-4"
          >
            <h2 className="xl:text-2xl text-lg xl:font-bold font-semibold">
              Pricing Estimate
            </h2>
            <LineGradient customClasses="" />
            {/* Pricing content can be added here */}
            <div className="flex flex-row md:flex-nowrap flex-wrap justify-between w-full xl:gap-x-6 gap-x-5 gap-y-4">
              <div className="bg-background px-4 py-5 flex items-center justify-between rounded-xl w-full">
                <span className="text-sm">Offer Value Estimate</span>
                <span className="text-primary font-bold text-xl xl:text-2xl">
                  $605,000
                </span>
              </div>
              <div className="bg-background px-4 py-5 flex items-center justify-between rounded-xl w-full">
                <span className="text-sm">Offer Rent Estimate</span>
                <span className="text-primary font-bold text-xl xl:text-2xl">
                  $2,390
                </span>
              </div>
            </div>
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
