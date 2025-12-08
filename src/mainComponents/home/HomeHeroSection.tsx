'use client'
import { Icons } from "@/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import React from "react";
import SearchPropertyTab from "./SearchPropertyTab";
import CustomButton from "@/src/components/button/CustomButton";

const HomeHeroSection = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-0 md:px-13 px-6 flex flex-col gap-y-8 xl:flex-row xl:flex-nowrap justify-between relative h-auto overflow-clip">
      <div className="flex flex-col h-auto xl:w-[39%] xl:pl-16 w-full pt-[126px]">
        <h1 className="xl:text-6xl xl:leading-[68px] md:text-5xl md:leading-14 text-[40px] leading-12 whitespace-break-spaces md:text-start text-center font-bold self-stretch">
          {`Your Data-Driven\nGuide to BC\n`}
          <span className="text-primary">Real</span>{" "}
          <span className="text-secondary">Estate</span>
        </h1>
        <Description
          type={IDescriptionTypes.dec16}
          customClasses="md:text-start text-center md:mt-5 mt-2.5 w-full md:whitespace-break-spaces"
          content={`See market trends, neighbored prices, and find tour perfect\nproperty.`}
        />
        <CustomButton
          label={"Screee"}
          onClick={()=> console.log("first")}
          buttonType={"secondary-outlined"}
          customClasses="w-40"
        />
        <div className="w-full xl:mt-8 md:mt-6 mt-5 relative">
          <SearchPropertyTab />
        </div>
      </div>
      <div className="xl:w-[59.5%] bg-gray xl:h-[810px] md:h-[630px] h-[265px] xl:rounded-bl-[124px] md:rounded-bl-[108px] rounded-bl-3xl z-10 xl:p-[141px_48px_64px_65px] md:px-12 md:py-13 p-5 flex">
        <Image
          src={Icons.heroMapVector}
          alt="Map Vector"
          width={400}
          height={400}
          className="w-full h-auto object-scale-down"
        />
      </div>
      <Image
        src={Icons.bgWaveLine}
        alt="Wave line"
        className="w-full h-auto absolute object-cover bottom-0 z-0 xl:block hidden"
        width={100}
        height={100}
      />
    </section>
  );
};

export default HomeHeroSection;
