import { Icons } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Image from "next/image";
import React from "react";

interface ValueCardProps {
  icon: string;
  label: string;
  description: string;
}

const valueCard: ValueCardProps[] = [
  {
    icon: Icons.accurate,
    label: "Accurate Valuation",
    description:
      "Considers recent comparable sales, market trends, and property details.",
  },
  {
    icon: Icons.instantResult,
    label: "Instant Results",
    description:
      "Delivered instantly to your email inbox. No waiting required.",
  },
  {
    icon: Icons.free,
    label: "Completely Free",
    description:
      "Our home evaluation service is 100% free with no obligations.",
  },
];

const DiscoverHomeValue = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-13 px-6 bg-gray xl:pt-16 xl:pb-23 py-13">
      <div className="xl:w-[55%] md:w-10/12 w-full flex flex-col gap-y-4">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading48}
          content="Discover Your Home’s Value"
        />
        <Description
          type={IDescriptionTypes.dec16}
          content="Get a detailed evaluation of your home's market value based on recent sales, market trends, and local real estate data."
        />
      </div>
      <div className="xl:mt-17.75 md:mt-8 mt-6 flex flex-row flex-wrap items-center xl:justify-between gap-5 justify-center h-full">
        {valueCard.map((card, idx) => (
          <div
            key={idx}
            className="p-6 rounded-[20px] xl:w-[32%] md:w-[48%] w-full border border-[#00000033] xl:hover:shadow-[0_0_32px_0_rgba(0,0,0,0.12)] hover:border-none transition-shadow duration-300 flex flex-col items-start h-auto"
          >
            <Image
              src={card.icon}
              alt={card.label}
              width={80}
              height={80}
              className="w-16 h-16 object-contain p-2.5 rounded-md bg-secondary"
            />
            <h6 className="font-bold xl:text-xl text-lg mt-3">{card.label}</h6>

            <Description
              content={card.description}
              type={IDescriptionTypes.dec16}
              customClasses="mt-2"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscoverHomeValue;
