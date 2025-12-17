/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Icons } from "@/src/app/exports";
import CustomButton from "@/src/components/button/CustomButton";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { dummyListings } from "../dummyData";

const HomeEstimationTop = () => {
  const [search, setSearch] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<typeof dummyListings>(
    []
  );
  useEffect(() => {
    if (query.length > 1) {
      const filtered = dummyListings.filter((item) =>
        item.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [query]);
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full relative xl:pt-53.5 xl:pb-31 md:pt-38.75 md:pb-29 pt-26.5 pb-17 px-6 flex flex-col items-center-safe">
      <h1 className="xl:text-6xl xl:leading-17 md:text-5xl md:leading-14 text-[40px] leading-12 font-bold text-center">
        Get Your Free <span className="text-primary">Home Evaluation</span>
      </h1>
      <Description
        type={IDescriptionTypes.dec16}
        content="Fill out form below to below to receive your personalized property valuation report."
        customClasses="xl:mt-5 mt-4 text-center mx-6"
      />
      <div className="xl:mt-8 mt-5 md:w-[80%] w-full md:p-6 p-4 shadow-[0_0_15px_0_rgba(0,0,0,0.12)] rounded-2xl flex flex-col gap-y-6 bg-background z-10">
        <p className="xl:text-xl font-bold">What’s my home worth?</p>
        <div
          className={`border border-borderColor md:p-1.5 py-5 flex flex-row items-center justify-between relative  ${
            showDropdown && filteredResults.length > 0
              ? "rounded-t-xl rounded-b-0"
              : "rounded-xl"
          }`}
        >
          <input
            className="outline-0 px-3 cursor-pointer md:w-1/2 w-full"
            placeholder="Search Property Address"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          <CustomButton
            label="Get Evaluation"
            buttonType="secondary"
            customClasses="font-bold! py-5! px-8! md:flex hidden"
            onClick={() => {
              console.log(search, "Search");
              setSearch("");
            }}
          />
          {showDropdown && filteredResults.length > 0 && (
            <div className=" absolute top-full left-0 w-full bg-background rounded-b-xl shadow-lg z-10 border-t-0 border border-borderColor overflow-clip">
              <div className="p-2 text-foreground text-sm border-b">
                Properties ({filteredResults.length})
              </div>
              {filteredResults.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() =>
                    window.open(`/property-assessment/${item.id}`, "_self")
                  }
                  className={`cursor-pointer p-3 hover:bg-gray-100 border-gray ${
                    index + 1 === filteredResults.length ? "" : "border-b"
                  } `}
                >
                  <span className="text-black font-medium">{item.address}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <CustomButton
          label="Get Evaluation"
          buttonType="secondary"
          customClasses="font-bold! py-5! -mt-4 md:hidden"
          onClick={() => {
            console.log(search, "Search");
            setSearch("");
          }}
        />
      </div>
      <Image
        src={Icons.bgWaveLine}
        alt="Wave line"
        className="w-full md:h-65.5 h-29.5 absolute object-contain bottom-0 z-0 left-0"
        width={100}
        height={100}
      />
    </section>
  );
};

export default HomeEstimationTop;
