/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Icons, Images } from "@/src/app/exports";
import Image from "next/image";
import React from "react";
import SearchPropertyTab from "./SearchPropertyTab";
import PoweredBy from "@/src/components/common/poweredby/PoweredBy";
import CityStatsPopup from "./CityStatsPopup";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import DotButton from "./DotButton";

const HomeHeroSection = () => {
  const [hoveredCity, setHoveredCity] = React.useState<string | null>(null);
  const [popupPosition, setPopupPosition] = React.useState<{
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
  }>({});
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (city: string, position: any) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCity(city);
    setPopupPosition(position);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCity(null);
    }, 200); // Small delay to move to popup
  };

  const handlePopupEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <section className="xl:max-w-screen-2xl mx-auto xl:px-0 md:px-9 px-6 flex flex-col gap-y-8 xl:flex-row xl:flex-nowrap justify-between relative h-auto overflow-x-clip bg-background">
      <div className="flex flex-col h-auto xl:w-[48%] xl:pl-16 w-full xl:pt-49.5 pt-22">
        <h1 className="xl:text-6xl md:text-5xl text-4xl whitespace-break-spaces lg:text-start text-center font-bold self-stretch">
          BC homes for sale, with the{" "}
          <span className="text-primary underline-offset-8 underline decoration-secondary">
            sold prices other sites don&apos;t show
          </span>
        </h1>
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading16}
          customClasses="lg:text-start text-center md:mt-5 mt-2.5 w-full md:whitespace-break-spaces font-normal!"
          content={`Search MLS® listings in Greater Vancouver and the Fraser Valley`}
        />
        <div className="w-full xl:mt-8 md:mt-6 mt-5 relative">
          <React.Suspense fallback={null}>
            <SearchPropertyTab />
          </React.Suspense>
        </div>
      </div>
      <div className="xl:w-[52%] bg-gray h-auto xl:rounded-bl-[124px] md:rounded-bl-[108px] rounded-bl-3xl z-10 hidden xl:block">
        <div className="w-full xl:h-195 md:h-128.5 h-66.25 relative">
          <Image
            title="Map of British Columbia, Canada"
            src={Images.map}
            alt="Map of British Columbia, Canada"
            width={1400}
            height={1000}
            loading="eager"
            className="w-full xl:h-195 md:h-128.5 h-66.25 object-fill xl:rounded-bl-[124px] md:rounded-bl-[108px] rounded-bl-3xl"
          />
          <DotButton
            cityName="Whistler"
            isActive={hoveredCity === "Whistler"}
            customClasses="absolute top-[25.3%] left-[9.1%] z-20 w-11!"
            onMouseEnter={() =>
              handleMouseEnter("Whistler", { top: "100px", left: "90px" })
            }
            onClick={() =>
              handleMouseEnter("Whistler", { top: "100px", left: "90px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Squamish"
            isActive={hoveredCity === "Squamish"}
            customClasses="absolute top-[34.3%] left-[14.2%] z-20 w-12!"
            onMouseEnter={() =>
              handleMouseEnter("Squamish", { top: "190px", left: "125px" })
            }
            onClick={() =>
              handleMouseEnter("Squamish", { top: "190px", left: "125px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Vancouver"
            isActive={hoveredCity === "Vancouver"}
            customClasses="absolute top-[48.9%] left-[10.6%] z-20 w-12!"
            onMouseEnter={() =>
              handleMouseEnter("Vancouver", { top: "90px", left: "100px" })
            }
            onClick={() =>
              handleMouseEnter("Vancouver", { top: "90px", left: "100px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Burnaby"
            isActive={hoveredCity === "Burnaby"}
            customClasses="absolute top-[48.6%] left-[25.5%] z-20 w-10!"
            onMouseEnter={() =>
              handleMouseEnter("Burnaby", { top: "90px", left: "140px" })
            }
            onClick={() =>
              handleMouseEnter("Burnaby", { top: "90px", left: "140px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Coquitlam"
            isActive={hoveredCity === "Coquitlam"}
            customClasses="absolute top-[48.6%] left-[36.2%] z-20 w-11!"
            onMouseEnter={() =>
              handleMouseEnter("Coquitlam", { top: "80px", left: "140px" })
            }
            onClick={() =>
              handleMouseEnter("Coquitlam", { top: "80px", left: "140px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="New Westminster"
            isActive={hoveredCity === "New Westminster"}
            customClasses="absolute w-10! top-[54.1%] left-[30.2%] z-20 w-17!"
            onMouseEnter={() =>
              handleMouseEnter("New Westminster", {
                top: "100px",
                left: "140px",
              })
            }
            onClick={() =>
              handleMouseEnter("New Westminster", {
                top: "100px",
                left: "140px",
              })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Surrey"
            isActive={hoveredCity === "Surrey"}
            customClasses="absolute top-[58.2%] left-[37.8%] z-20 w-8!"
            onMouseEnter={() =>
              handleMouseEnter("Surrey", { top: "50px", left: "140px" })
            }
            onClick={() =>
              handleMouseEnter("Surrey", { top: "50px", left: "140px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Maple Ridge"
            isActive={hoveredCity === "Maple Ridge"}
            customClasses="absolute w-9! top-[54.1%] right-[40.4%] z-20 w-14!"
            onMouseEnter={() =>
              handleMouseEnter("Maple Ridge", { top: "80px", left: "140px" })
            }
            onClick={() =>
              handleMouseEnter("Maple Ridge", { top: "80px", left: "140px" })
            }
            onMouseLeave={handleMouseLeave}
          />

          <DotButton
            cityName="Langley"
            isActive={hoveredCity === "Langley"}
            customClasses="absolute bottom-[36.2%] right-[49%] z-20 w-9!"
            onMouseEnter={() =>
              handleMouseEnter("Langley", { top: "100px", left: "160px" })
            }
            onClick={() =>
              handleMouseEnter("Langley", { top: "100px", left: "160px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Abbotsford"
            isActive={hoveredCity === "Abbotsford"}
            customClasses="absolute bottom-[32.1%] right-[34.3%] z-20 w-12!"
            onMouseEnter={() =>
              handleMouseEnter("Abbotsford", { top: "170px", left: "140px" })
            }
            onClick={() =>
              handleMouseEnter("Abbotsford", { top: "170px", left: "140px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Mission"
            isActive={hoveredCity === "Mission"}
            customClasses="absolute bottom-[31.5%] right-[21.5%] z-20 w-9!"
            onMouseEnter={() =>
              handleMouseEnter("Mission", { bottom: "-10px", left: "200px" })
            }
            onClick={() =>
              handleMouseEnter("Mission", { bottom: "-10px", left: "200px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Chilliwack"
            isActive={hoveredCity === "Chilliwack"}
            customClasses="absolute bottom-[32.8%] right-[13.4%] z-20 w-11!"
            onMouseEnter={() =>
              handleMouseEnter("Chilliwack", {
                bottom: "-10px",
                right: "120px",
              })
            }
            onClick={() =>
              handleMouseEnter("Chilliwack", {
                bottom: "-10px",
                right: "120px",
              })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Hope"
            isActive={hoveredCity === "Hope"}
            customClasses="absolute bottom-[40.7%] right-5 z-20 w-7!"
            onMouseEnter={() =>
              handleMouseEnter("Hope", { bottom: "-10px", right: "50px" })
            }
            onClick={() =>
              handleMouseEnter("Hope", { bottom: "-10px", right: "50px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Richmond"
            isActive={hoveredCity === "Richmond"}
            customClasses="absolute bottom-[42.6%] left-[10.2%] z-20 w-12!"
            onMouseEnter={() =>
              handleMouseEnter("Richmond", { bottom: "-10px", left: "100px" })
            }
            onClick={() =>
              handleMouseEnter("Richmond", { bottom: "-10px", left: "100px" })
            }
            onMouseLeave={handleMouseLeave}
          />
          <DotButton
            cityName="Delta"
            isActive={hoveredCity === "Delta"}
            customClasses="absolute bottom-[37.5%] left-[21%] z-20 w-7!"
            onMouseEnter={() =>
              handleMouseEnter("Delta", { bottom: "-10px", left: "100px" })
            }
            onClick={() =>
              handleMouseEnter("Delta", { bottom: "-10px", left: "100px" })
            }
            onMouseLeave={handleMouseLeave}
          />

          <CityStatsPopup
            city={hoveredCity || ""}
            isVisible={!!hoveredCity}
            position={popupPosition}
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handleMouseLeave}
          />
        </div>
        <PoweredBy className="justify-end absolute xl:bottom-3 xl:right-2 md:bottom-2 md:right-15 bottom-1 right-8" />
      </div>
      <Image
        title="image title"
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
