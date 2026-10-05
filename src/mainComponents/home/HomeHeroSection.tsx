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
    <section className="xl:max-w-screen-2xl mx-auto xl:px-0 md:px-13 px-6 flex flex-col gap-y-8 xl:flex-row xl:flex-nowrap justify-between relative h-auto overflow-x-clip bg-background">
      <div className="flex flex-col h-auto xl:w-[42%] xl:pl-16 w-full lg:pt-49.5 pt-31.5">
        <h1 className="xl:text-6xl xl:leading-17 md:text-5xl md:leading-14 text-[40px] leading-12 whitespace-break-spaces md:text-start text-center font-bold self-stretch">
          {`Search BC Real Estate Market\nwith Better`}
          <span className="text-primary"> Local</span>{" "}
          <span className="text-secondary">Insights</span>
        </h1>
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading16}
          customClasses="md:text-start text-center md:mt-5 mt-2.5 w-full md:whitespace-break-spaces font-normal!"
          content={`Don’t just browse listings. See price trends in each neighbourhood,\nexplore past sales, and find your perfect home with up-to-date \nMLS listings.`}
        />
        <div className="w-full xl:mt-8 md:mt-6 mt-5 relative">
          <SearchPropertyTab />
        </div>
      </div>
      <div className="xl:w-[58.5%] bg-gray h-auto xl:rounded-bl-[124px] md:rounded-bl-[108px] rounded-bl-3xl z-10">
        <div className="w-full xl:h-195 md:h-128.5 h-66.25 relative">
          <Image
            title="image title"
            src={Images.map}
            alt="Map Vector"
            width={1400}
            height={1000}
            loading="eager"
            className="w-full xl:h-195 md:h-128.5 h-66.25 relative object-fill xl:rounded-bl-[124px] md:rounded-bl-[108px] rounded-bl-3xl"
          />
          <DotButton
            cityName="Whistler"
            isActive={hoveredCity === "Whistler"}
            customClasses="absolute lg:top-[197px] lg:left-20 z-20 w-11!"
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
            customClasses="absolute lg:top-[268px] lg:left-[127px] z-20 w-12!"
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
            customClasses="absolute lg:top-[382px] lg:left-[95px] z-20 w-12!"
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
            customClasses="absolute lg:top-[380px] lg:left-[222px] z-20 w-10!"
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
            customClasses="absolute lg:top-[379px] lg:left-[313px] z-20 w-11!"
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
            customClasses="absolute w-10! lg:top-[422px] lg:left-[264px] z-20 w-17!"
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
            customClasses="absolute lg:top-[454px] lg:left-[328px] z-20 w-8!"
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
            customClasses="absolute w-9! lg:top-[422px] lg:right-87 z-20 w-14!"
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
            customClasses="absolute lg:bottom-[281px] lg:left-[398px] z-20 w-9!"
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
            customClasses="absolute lg:bottom-[250px] lg:right-74 z-20 w-12!"
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
            customClasses="absolute lg:bottom-[246px] lg:right-47 z-20 w-9!"
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
            customClasses="absolute lg:bottom-[257px] lg:right-29 z-20 w-11!"
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
            customClasses="absolute lg:bottom-[318px] lg:right-6 z-20 w-7!"
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
            customClasses="absolute lg:top-[435px] lg:left-[91px] z-20 w-12!"
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
            customClasses="absolute lg:bottom-[292px] lg:left-[183px] z-20 w-7!"
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
