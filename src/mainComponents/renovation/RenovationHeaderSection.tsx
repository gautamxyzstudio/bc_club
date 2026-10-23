import { Icons } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Image from "next/image";
import React from "react";

const RenovationHeaderSection = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full relative xl:pt-53.5 xl:pb-31 md:pt-38.75 md:pb-29 pt-26.5 pb-17 px-6 flex flex-col items-center-safe">
      <Heading
        tagType="h1"
        content="Smart Renovation Cost Estimates for Smarter Property Decisions"
        type={IHeadingTypes.heading60}
        customClasses="text-center w-[80%]"
      />
      <Description
        type={IDescriptionTypes.dec16}
        content="Smart Renovation Cost Estimates for Smarter Property Decisions"
        customClasses="xl:mt-5 mt-4 text-center mx-6"
      />

      <Image
        title="image title"
        src={Icons.bgWaveLine}
        alt="Wave line"
        className="w-full md:h-65.5 h-29.5 absolute object-contain bottom-0 z-0 left-0"
        width={100}
        height={100}
        loading="eager"
      />
    </section>
  );
};

export default RenovationHeaderSection;
