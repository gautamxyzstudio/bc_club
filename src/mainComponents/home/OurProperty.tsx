"use client";
import CustomButton from "@/src/components/button/CustomButton";
import PropertiesCard from "@/src/components/common/propertiesCard/PropertiesCard";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { propertyData } from "../dummyData";

const tabList = [
  "Newly Listed properties",
  "Court ordered sales",
  "Sold properties",
];

const OurProperty = () => {
  const [tab, setTab] = useState<string>("Newly Listed properties");

  // refs for each section
  const newlyListedRef = useRef<HTMLDivElement | null>(null);
  const courtOrderedRef = useRef<HTMLDivElement | null>(null);
  const soldRef = useRef<HTMLDivElement | null>(null);

  // HEIGHT of fixed header or desired space from top
  const OFFSET = 120;

  const handleClick = (tabName: string) => {
    setTab(tabName);

    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      "Newly Listed properties": newlyListedRef,
      "Court ordered sales": courtOrderedRef,
      "Sold properties": soldRef,
    };

    const target = refMap[tabName].current;

    if (target) {
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };
  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:pl-16 md:pl-13 pl-6 w-full xl:pt-26.5 md:pt-31 pt-13 xl:pb-36 md:pb-33 pb-19.5 relative">
      <Heading
        tagType="h2"
        type={IHeadingTypes.heading32}
        content="Explore Our Property"
        customClasses="w-full text-center xl:pr-16 md:pr-13 pr-6"
      />
      {/* Tab  */}
      <div className="xl:mt-13 md:mt-6 mt-4 w-full flex items-center-safe justify-between flex-col gap-y-2 md:flex-row xl:pr-16 md:pr-13 pr-6 ">
        <div className="w-full md:w-[70%] xl:w-[60%] flex flex-nowrap flex-row h-auto shadow-[0_0_20px_0_rgba(0,0,0,0.12)] gap-x-2 rounded-xl p-2">
          {tabList.map((item, idx) => (
            <CustomButton
              buttonType={tab === item ? "primary" : "disabled"}
              key={idx}
              label={item}
              onClick={() => handleClick(item)}
              customClasses="w-full"
            />
          ))}
        </div>
        <Link
          href={"/property"}
          className="flex flex-row items-center bg-secondary text-background font-black md:text-base text-sm md:py-4.5 xl:px-13.5 py-2.5 px-7 rounded-lg"
        >
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M8.7842 17.7042C8.87716 17.7979 8.98777 17.8723 9.10962 17.9231C9.23148 17.9739 9.36219 18 9.4942 18C9.62621 18 9.75692 17.9739 9.87878 17.9231C10.0006 17.8723 10.1112 17.7979 10.2042 17.7042L15.2042 12.7042C15.2979 12.6112 15.3723 12.5006 15.4231 12.3788C15.4739 12.2569 15.5 12.1262 15.5 11.9942C15.5 11.8622 15.4739 11.7315 15.4231 11.6096C15.3723 11.4878 15.2979 11.3772 15.2042 11.2842L10.2042 6.2842C10.1112 6.19047 10.0006 6.11608 9.87878 6.06531C9.75692 6.01454 9.62621 5.9884 9.4942 5.9884C9.36219 5.9884 9.23148 6.01454 9.10962 6.06531C8.98777 6.11608 8.87716 6.19047 8.7842 6.2842C8.69047 6.37717 8.61608 6.48777 8.56531 6.60962C8.51454 6.73148 8.4884 6.86219 8.4884 6.9942C8.4884 7.12621 8.51454 7.25692 8.56531 7.37878C8.61608 7.50064 8.69047 7.61124 8.7842 7.7042L13.0842 11.9942L8.7842 16.2842C8.69047 16.3772 8.61608 16.4878 8.56531 16.6096C8.51454 16.7315 8.4884 16.8622 8.4884 16.9942C8.4884 17.1262 8.51454 17.2569 8.56531 17.3788C8.61608 17.5006 8.69047 17.6112 8.7842 17.7042Z"
              fill="white"
            />
          </svg>
        </Link>
      </div>

      {/* Tab Content */}
      <div className="w-full flex flex-col xl:space-y-13 space-y-7 xl:mt-6 md:mt-7 mt-8">
        {/* Newly Listed properties */}
        <div ref={newlyListedRef} className="flex flex-col">
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Newly Listed Properties"
          />
          <div className="flex flex-row gap-x-5 w-full">
            <Swiper
              speed={2500}
              spaceBetween={12}
              slidesPerView={1.1}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              modules={[Autoplay, Pagination]}
              loop
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1.8, spaceBetween: 20, speed: 2500 },
                1024: { slidesPerView: 3, spaceBetween: 32, speed: 2500 },
              }}
              className="mySwiper w-full pt-5! pb-9!"
            >
              {propertyData.map((item, index) => (
                <SwiperSlide key={index}>
                  <PropertiesCard {...item} isLogin />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Court ordered sales */}
        <div ref={courtOrderedRef} className="flex flex-col">
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Court Ordered Sales"
          />
          <div className="flex flex-row gap-x-5 w-full">
            <Swiper
              speed={1500}
              spaceBetween={12}
              slidesPerView={1.1}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              modules={[Autoplay, Pagination]}
              loop
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1.8, spaceBetween: 20, speed: 2500 },
                1024: { slidesPerView: 3, spaceBetween: 32, speed: 2500 },
              }}
              className="mySwiper w-full pt-5! pb-9!"
            >
              {propertyData.map((item, index) => (
                <SwiperSlide key={index}>
                  <PropertiesCard {...item} isLogin={false} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Sold properties */}
        <div ref={soldRef} className="flex flex-col">
          <Heading
            tagType="h3"
            type={IHeadingTypes.heading20}
            content="Sold Properties"
          />
          <div className="flex flex-row gap-x-5 w-full">
            <Swiper
              speed={1500}
              spaceBetween={12}
              slidesPerView={1.1}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              modules={[Autoplay, Pagination]}
              loop
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1.8, spaceBetween: 20, speed: 2500 },
                1024: { slidesPerView: 3, spaceBetween: 32, speed: 2500 },
              }}
              className="mySwiper w-full pt-5! pb-9!"
            >
              {propertyData.map((item, index) => (
                <SwiperSlide key={index}>
                  <PropertiesCard {...item} isLogin={false} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProperty;
