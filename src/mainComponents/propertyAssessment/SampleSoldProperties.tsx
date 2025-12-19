"use client";
import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PropertiesCard from "@/src/components/common/propertiesCard/PropertiesCard";
import { propertyData } from "../dummyData";

const SampleSoldProperties = () => {
  return (
    <Swiper
      speed={2500}
      spaceBetween={12}
      slidesPerView={1.1}
      autoplay={{
        delay: 100,
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
      className="mySwiper w-full xl:pt-5! pb-9!"
    >
      {propertyData.map((item, index) => (
        <SwiperSlide key={index}>
          <PropertiesCard {...item} isLogin />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SampleSoldProperties;
