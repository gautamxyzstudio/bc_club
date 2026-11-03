"use client";
import { Icons, Images, } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import Link from "next/link";
import QuickLink from "./QuickLink";
import { getCurrentYear } from "@/src/utilities/utilities";
import NewsLetter from "./NewsLetter";
import { usePathname } from "next/navigation";
import { useAuthContext } from "../auth/AuthContext";
import { isAdminUser } from "@/src/utilities/authUtils";

const Footer = () => {
  const pathName = usePathname();
  const { isLoggedIn, username } = useAuthContext();
  const currentYear = getCurrentYear();

  // When authenticated user or on admin routes, footer is not visible
  if (pathName?.startsWith("/admin") || (isLoggedIn && isAdminUser(username))) {
    return null;
  }
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
    <footer className="xl:max-w-screen-2xl mx-auto w-full xl:px-16! md:px-9! p-6! md:pt-13! md:pb-8! bg-foreground text-background! flex flex-col md:gap-y-6 gap-y-5">
      <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center-safe gap-y-4">
        <div className="flex flex-col gap-y-4 md:w-[60%]">
          <Link href={"/"} title="BC Real Estate Market" className="bg-background w-fit p-2 rounded-lg" >
            <Image alt="BC Real Estate Market logo" title="BC Real Estate Market" src={Images.bcClub} width={1200} height={1090} loading="eager" className="object-contain w-fit h-10 md:h-15" />
          </Link>
          <Description
            content="BC Real Estate Market helps you explore, buy, and sell properties across British Columbia with confidence and ease.
From market insights to home valuation, every step of your real estate journey"
            type={IDescriptionTypes.dec16}
            customClasses="text-lightWhite"
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
                title="image title"
                src={item.icon}
                alt={item.label}
                width={100}
                loading="eager"
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
      <div className="w-full h-auto flex flex-col gap-y-1.5 md:flex-row justify-center md:justify-between items-center md:py-6 py-4  text-sm text-lightWhite text-center border-t border-white">
        <span>
          &copy; {currentYear}, All Rights Reserved. Harjit Sidhu Personal Real Estate Corporation, {" "}
          <Link href={"https://thesidhuteam.ca"} className="underline">
            The Sidhu Team,
          </Link>{" "}
          Planet Group Realty Inc., Surrey, BC
        </span>
        {/* <Link href={"https://www.xyz.studio/"}>
          Designed and developed by <b>XYZ Studio</b>
        </Link> */}
      </div>
    </footer>
  );
};

export default Footer;
