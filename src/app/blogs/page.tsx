"use client";

import React from "react";
import { Icons, Images } from "../exports";
import Image from "next/image";

const Page = () => {
  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-background overflow-hidden">
        <div className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 pt-28 pb-40 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2E2E2E]">
            Our <span className="text-[#F4A51C]">Blog</span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            Get the latest updates and deeper coffee experience from IMAJI
            Coffee
          </p>
        </div>

        {/* Wave */}
        <div className="absolute -bottom-10 left-0 w-full h-70">
          <Image
            src={Icons.bgWaveLine}
            alt="Wave line"
            fill
            className=""
            priority
          />
        </div>
      </section>

      {/* ================= BLOG CARDS SECTION ================= */}
      <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 py-24 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== LEFT BIG CARD ===== */}
          <div className="lg:w-2/4 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-95 w-full">
              <Image
                src={Images.blogimg}
                alt="Smart Property Investment"
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-blue-500 font-medium">Investment</span>
                <span className="text-gray-400">20 Jan 2025</span>
              </div>

              <h3 className="text-xl font-semibold text-[#2E2E2E]">
                Smart Property Investment in 2025
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Discover why 2025 is one of the best years to invest in real
                estate. With rising demand, smart homes, and urban expansion.
              </p>
            </div>
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div className="xl:w-1/2 flex flex-col gap-6">
            {/* CARD 1 */}
            <div className="bg-white rounded-2xl p-4 flex items-center-safe gap-4 w-full ">
              <Image
                src={Images.firsttown}
                alt="First-Time Home Buyer"
                className="object-cover relative w-[320px] h-full rounded-xl overflow-hidden shrink-0 "
                width={1200}
                height={890}
              />
              {/* </div> */}

              <div className="flex flex-col gap-y-2">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-blue-500 font-medium">Townhouse</span>
                  <span className="text-gray-400">20 Jan 2025</span>
                </div>

                <h4 className="text-sm font-semibold text-[#2E2E2E] leading-snug">
                  First-Time Home Buyer’s Complete Guide
                </h4>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-2xl  p-4 flex gap-4 items-center">
              <Image
                src={Images.secondtown}
                alt="Home Investment"
                className="object-cover relative w-[320px] h-full rounded-xl overflow-hidden shrink-0 "
                width={1200}
                height={890}
              />
              {/* </div> */}

              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-blue-500 font-medium">Townhouse</span>
                  <span className="text-gray-400">20 Jan 2025</span>
                </div>

                <h4 className="text-sm font-semibold text-[#2E2E2E] leading-snug">
                  First-Time Home Buyer’s Complete Guide
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
