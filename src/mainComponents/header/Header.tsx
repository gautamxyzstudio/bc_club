import { Icons } from "@/app/exports";
import Image from "next/image";
import Link from "next/link";

const menulist = [
  {
    title: "About Us",
    href: "/about-us",
  },
  {
    title: "Market Trends",
    href: "/market-trends",
  },
  {
    title: "Properties",
    href: "/properties",
  },

  {
    title: "Contact Us",
    href: "/contact-us",
  },
];

const Header = () => {
  return (
    <header className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 xl:py-6 md:py-4 py-3 flex items-center justify-between w-full fixed top-0 left-0 right-0 z-9999">
      {/* Logo */}
      <Link href={"/"}>
        <Image
          alt="logo"
          src={Icons.bcClub}
          width={119}
          height={42}
          className="md:w-[119px] md:h-10.5 w-22.5 h-9 object-contain"
        />
      </Link>
      <nav className="hidden xl:flex justify-end-safe items-center-safe gap-x-5">
        <div className="flex items-center gap-x-5">
          {menulist.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="text-foreground text-base uppercase hover:font-semibold transition-all duration-300"
            >
              {item.title}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-x-3">
          <button className="w-[132px] h-auto py-2.5 px-4 text-center bg-primary rounded-md text-white font-medium">
            Login
          </button>
          <button className="w-[132px] h-auto py-2.5 px-4 text-center border rounded-md text-secondary font-medium">
            Sign up
          </button>
        </div>
      </nav>
      <Image
        alt="menu"
        src={Icons.openMenu}
        width={100}
        height={100}
        className="xl:hidden flex w-8 h-8 object-contain"
      />
    </header>
  );
};

export default Header;
