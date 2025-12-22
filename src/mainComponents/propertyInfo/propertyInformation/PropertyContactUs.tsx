/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Images } from "@/src/app/exports";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import { CallRegular, StarFilled } from "@fluentui/react-icons";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PropertyContactUs = ({ property }: { property: any }) => {
  return (
    <div className="w-full flex flex-col gap-y-4 p-6 border border-borderColor rounded-2xl ">
      <div className="flex items-center gap-x-1.5">
        <StarFilled className="text-primary w-6 h-6" />
        <span className="text-xl font-bold">High-rise Townhouse</span>
      </div>
      <div className="flex items-center gap-x-1.5 text-[#636366]">
        <MapPin className="w-6 h-6" />
        <span className="text-base">Southwestern Ontario, Ontario, Canada</span>
      </div>
      <div className="flex items-end gap-x-1.5">
        <span className="text-4xl text-primary font-bold">
          ${property?.price.toLocaleString()}
        </span>
        <span className="text-base text-black70">{property?.sqft} sqft</span>
      </div>
      <LineGradient />
      <span className="text-2xl font-bold">Contact with us now !</span>
      <div className="p-4 flex flex-col gap-y-4 bg-gray rounded-[10px]">
        <div className="flex gap-x-3 items-center">
          <Image
            src={Images.employee}
            alt="Employee"
            width={100}
            height={100}
            className="rounded-full w-15 h-15 "
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-base font-medium">Dan Roy</span>
            <Link
              href={"tel:+1 485 526 258"}
              className="text-base text-primary flex gap-x-1"
            >
              <CallRegular className="w-6 h-6" />
              0485.526.258
            </Link>
          </div>
        </div>
        <button className="px-4 py-2.5 border border-primary rounded-md text-primary text-base font-bold">
          Check Eligibility
        </button>
        <button className="px-4 py-2.5 text-base font-bold bg-primary text-background rounded-md">
          Call Now
        </button>
      </div>
    </div>
  );
};

export default PropertyContactUs;
