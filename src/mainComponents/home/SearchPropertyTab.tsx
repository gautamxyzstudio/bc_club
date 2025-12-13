"use client";
import { Icons } from "@/src/app/exports";
import Image from "next/image";
import React, { useState } from "react";

const SearchPropertyTab = () => {
  const [search, setSearch] = useState<string>("");
  const tabList = ["Find Home", "Home Assessment", "Market Trends"];
  return (
    <div className="xl:w-[735px] w-full xl:absolute p-2.5 flex flex-row gap-y-4 justify-between shadow-[0_0_16px_0_rgba(0,0,0,0.12)] rounded-xl bg-background z-99 tabs tabs-box">
      {tabList.map((item, idx) => (
        <React.Fragment key={idx}>
          <input
            type="radio"
            name="my_tabs"
            className="tab checked:bg-primary bg-gray checked:text-background font-semibold text-lightWhite min-w-[30%] w-[32%]!  md:py-2.5 py-1.5 rounded-md h-auto"
            aria-label={item}
            defaultChecked={idx === 0}
          />
          <div key={idx - 3} className="tab-content">
            <div className="border border-borderColor p-[5px_5px_5px_16px] flex justify-between items-center-safe rounded-2xl">
              <input
                placeholder={`Enter an address, neighborhood, city, or ZIP code for ${item}`}
                type="text"
                className="w-10/12 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => {
                  console.log("Search", search);
                  setSearch("");
                }}
                className="md:w-15.5 md:h-15.5 w-13 h-13 bg-secondary p-3.5 text-center flex items-center justify-center-safe rounded-xl cursor-pointer"
              >
                <Image
                  src={Icons.searchLine}
                  alt="Search"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              </button>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default SearchPropertyTab;
