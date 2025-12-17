import { Icons } from "@/src/app/exports";
import CustomButton from "@/src/components/button/CustomButton";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Image from "next/image";
import React from "react";

interface CardProps {
  icon: string;
  content: string;
}

const cardsData: CardProps[] = [
  {
    icon: Icons.vectorMap,
    content: "Search properties on a map",
  },
  {
    icon: Icons.favorite,
    content: "Store and access favorite properties across devices",
  },
  {
    icon: Icons.compare,
    content: "Compare property information and assessment values",
  },
  {
    icon: Icons.property,
    content: "View recently viewed properties",
  },
];

const RegisterWithBC = () => {
  return (
    <div className="w-full md:rounded-4xl rounded-3xl bg-primary xl:p-13 md:py-8 md:px-17 px-5 py-6 text-background flex flex-col items-center md:gap-y-6 gap-y-5">
      <Heading
        tagType="h2"
        type={IHeadingTypes.heading48}
        content="Register with BC Assessment"
        customClasses="text-center md:p-0 px-4"
      />
      <div className="w-full flex flex-row flex-wrap items-stretch h-full justify-between gap-y-5">
        {cardsData.map((card, idx) => (
          <div
            key={idx}
            className="bg-background rounded-lg p-3 xl:w-[24%] md:w-[49%] w-full flex flex-col gap-y-3 text-foreground"
          >
            <Image
              width={80}
              height={80}
              alt={card.content}
              src={card.icon}
              className="w-9 h-9 object-contain"
            />
            <Description
              type={IDescriptionTypes.description16}
              content={card.content}
              customClasses="w-[80%]"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-y-3">
        <CustomButton
          buttonType="white-primary"
          label="Register now for free"
          customClasses="rounded-md! w-full text-base! md:w-fit md:px-11!"
        />
        <p className="cursor-pointer text-base">
          Already have an account? <span className="text-secondary">Login</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterWithBC;
