import { Icons } from "@/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import Link from "next/link";
import QuickLink from "./QuickLink";
import { getCurrentYear } from "@/src/utilities/utilities";
import NewsLetter from "./NewsLetter";

const Footer = () => {
  const currentYear = getCurrentYear();
  const socialMediaLink = [
    {
      icon: Icons.facebook,
      link: "https://www.facebook.com",
      label: "Facebook",
    },
    {
      icon: Icons.instagram,
      link: "https://www.instagram.com",
      label: "Instagram",
    },
    {
      icon: Icons.twitter,
      link: "https://www.x.com",
      label: "Twitter",
    },
  ];
  return (
    <footer className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-13 p-6 md:pt-13 md:pb-8 bg-foreground text-background flex flex-col md:gap-y-6 gap-y-5">
      <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center-safe gap-y-4">
        <div className="flex flex-col gap-y-4 md:w-[60%]">
          <Link href={"/"} title="BC Club">
            <span className="text-2xl font-bold md:text-5xl">BCClub</span>
          </Link>
          <Description
            content="We ara a lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat..."
            type={IDescriptionTypes.dec16}
            customClasses="opacity-80"
          />
        </div>
        <div className="flex items-center-safe gap-x-2">
          {socialMediaLink.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              target="__blank"
              title={item.label}
              className="bg-secondary cursor-pointer md:p-2.5 p-2 rounded-lg md:w-12.5 md:h-12.5 w-10 h-10"
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
      {/* NewsLetter */}
      <NewsLetter />
      {/* Quick Link */}
      <QuickLink />
      {/* CopyRight */}
      <div className="w-full h-auto flex flex-col gap-y-1.5 md:flex-row justify-center md:justify-between items-center md:py-6 py-4 border-t border-white text-sm text-lightWhite">
        <span>&copy; {currentYear}, All Rights Reserved</span>
        <Link href={"https://www.xyz.studio/"}>
          Design & Develop By <b>XYZ Studio</b>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
