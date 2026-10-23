import Image from "next/image";
import { Icons } from "./exports";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Link from "next/link";

const notFound = () => {
  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full h-auto flex flex-col items-center-safe relative md:pt-13.5 pt-10 xl:px-16 md:px-9 px-6 ">
      <Image
        title="image title"
        src={Icons.notFound}
        alt="Not Found"
        width={100}
        height={100}
        loading="eager"
        className=" w-[72%] md:h-auto h-50 object-contain"
      />
      <Heading
        tagType="h5"
        type={IHeadingTypes.heading60}
        content="Page Not Found"
        customClasses="mt-4"
      />
      <Description
        type={IDescriptionTypes.dec16}
        content="We can’t find the page that you’relooking for. Probably the link is broken"
        customClasses="mt-4 text-center"
      />
      <Link
        href="/"
        className="text-base mt-6 mb-10 md:mb-15 md:py-5 md:px-19 px-8 py-3 bg-secondary text-background rounded-md z-10"
      >
        Back to Home
      </Link>
      <Image
        title="image title"
        src={Icons.bgWaveLine}
        alt="Wave line"
        className="w-full h-auto absolute object-cover xl:-bottom-8.5 md:-bottom-3 -bottom-1.5"
        width={100}
        height={100}
        loading="eager"
      />
    </section>
  );
};

export default notFound;
