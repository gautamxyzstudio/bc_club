import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import Link from "next/link";
import React from "react";
import { GetInTouchLinkListProps, realEstateBC, saleBC, soldBC } from ".";
import GetInTouchForm from "./GetInTouchForm";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import { Icons } from "@/src/app/exports";

const GetInTouchLink: React.FC<GetInTouchLinkListProps> = ({
  title,
  linkList,
}) => {
  return (
    <div className="flex flex-col gap-y-5 text-nowrap">
      <span className="font-bold text-base">{title}</span>
      <ul className="list-none flex flex-col text-sm text-lightWhite space-y-4">
        {linkList.map((item, idx) => (
          <Link key={idx} href={item.href} title={item.label}>
            <li>{item.label}</li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

const GetInTouch = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full flex flex-col xl:px-16 md:px-13 px-6 xl:py-20 md:py-20.5 pt-13 pb-8 bg-gray">
      <div className="w-full flex flex-col xl:flex-row items-start justify-between gap-y-5">
        <div className="w-full xl:w-[43%] flex flex-col">
          <Heading
            tagType="h2"
            type={IHeadingTypes.heading48}
            content={`Love To Hear From You,\nGet In Touch`}
            customClasses="whitespace-break-spaces md:text-start text-center"
          />
          <Description
            type={IDescriptionTypes.dec16}
            customClasses="text-black70 md:text-start text-center md:mt-5 mt-4"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc placerat odio enim, eu pellentesque libero tempus ac. Praesent tempor, tellus sed ullamcorper interdum, orci metus luctus enim, in laoreet ipsum ipsum ac eros. Pellentesque a risus sapien. Morbi nisi justo, semper auctor auctor eu, pharetra non velit. Quisque eu tincidunt dolor. Phasellus tempor, lorem ut pharetra porttitor, est augue convallis tortor, a pellentesque sem leo aliquam tellus. In at sapien id dolor iaculis scelerisque nec nec felis."
          />
          <div className="flex flex-row items-center-safe gap-x-3 md:mt-6 mt-4">
            <div className="bg-secondary cursor-pointer md:p-1.5 p-1 rounded-lg md:w-12.5 md:h-12.5 w-10 h-10">
              <Image
                src={Icons.emailIcon}
                alt={"mail"}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Mail</span>
              <Link
                href={"mailto:Unreal@bcclub.com"}
                className="text-lg font-semibold"
              >
                Unreal@bcclub.com
              </Link>
            </div>
          </div>
        </div>
        <GetInTouchForm />
      </div>
      <LineGradient customClasses="md:my-13 my-8" />
      <div className="flex flex-row w-full flex-nowrap whitespace-break-spaces justify-between gap-x-15 items-start overflow-x-scroll scrollBar overflow-hidden">
        <GetInTouchLink title={saleBC.title} linkList={saleBC.linkList} />
        <GetInTouchLink title={soldBC.title} linkList={soldBC.linkList} />
        <GetInTouchLink
          title={realEstateBC.title}
          linkList={realEstateBC.linkList}
        />
      </div>
    </section>
  );
};

export default GetInTouch;
