import type { LucideIcon } from "lucide-react";
import { TrendingUp, Clock, ShieldCheck } from "lucide-react";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Image from "next/image";
import React from "react";

interface ValueCardProps {
  icon: LucideIcon | string;
  label: string;
  description: string;
}

const valueCard: ValueCardProps[] = [
  {
    icon: TrendingUp,
    label: "Based on real sales",
    description:
      "Uses recent sales near you, current listings and your home's details.",
  },
  {
    icon: Clock,
    label: "Quick",
    description:
      "Your estimate arrives by email within 24 hours.",
  },
  {
    icon: ShieldCheck,
    label: "Free, no obligation",
    description:
      "No cost, and no pressure to list.",
  },
];

const DiscoverHomeValue = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-9 px-6 bg-gray xl:pt-16 xl:pb-23 py-13">
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
        {valueCard.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-[20px] xl:w-[32%] md:w-[48%] w-full border border-[#00000033] xl:hover:shadow-[0_0_32px_0_rgba(0,0,0,0.12)] hover:border-none transition-shadow duration-300 flex flex-col items-start h-auto"
            >
              <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center p-2.5 shrink-0">
                {typeof Icon === "string" ? (
                  <Image
                    title={card.label}
                    src={Icon}
                    alt={card.label}
                    width={40}
                    height={40}
                    loading="eager"
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <Icon className="w-8 h-8 text-white stroke-[2.2]" />
                )}
              </div>
              <h6 className="font-bold xl:text-xl text-lg mt-3">{card.label}</h6>

              <Description
                content={card.description}
                type={IDescriptionTypes.dec16}
                customClasses="mt-2"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DiscoverHomeValue;
