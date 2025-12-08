/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Icons } from "@/app/exports";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import NavBarDrawer from "./NavBarDrawer";
import CustomButton from "@/src/components/button/CustomButton";

export const menulist = [
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isLaptop = useMediaQuery("(min-width: 1024px)");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isLaptop) {
      setIsVisible(true);
      return;
    }

    setLastScrollY(window.scrollY);
    setIsScrolled(window.scrollY > 300);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isLaptop]);

  const navVariants = {
    hidden: {
      opacity: 0,
      y: -100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
      },
    },
    exit: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const onPressMenuButton = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);
  return (
    <AnimatePresence>
      <motion.header
        initial="hidden"
        animate={isVisible ? "visible" : "exit"}
        variants={navVariants as any}
        className={`xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 xl:py-6 md:py-4 py-3 flex items-center justify-between w-full fixed top-0 left-0 right-0 z-9999 ${
          isLaptop
            ? isScrolled
              ? "bg-lightWhite"
              : "bg-transparent"
            : "shadow bg-[#f2f2f2]"
        }
        `}
      >
        {/* Logo */}
        <Link
          href={"/"}
          onClick={onPressMenuButton}
          className="xl:hidden block"
        >
          <Image
            alt="logo"
            src={Icons.bcClub}
            width={119}
            height={42}
            className="w-22.5 h-9 object-contain"
          />
        </Link>
        <Link href={"/"} className="xl:block hidden">
          <Image
            alt="logo"
            src={Icons.bcClub}
            width={119}
            height={42}
            className="w-[119px] h-10.5 object-contain"
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
            <CustomButton
              label="Login"
              buttonType="primary"
              onClick={() => console.log("Login ")}
              customClasses="w-[132px]"
            />
            <CustomButton
              label="Sign up"
              buttonType="secondary-outlined"
              onClick={() => console.log("Sign up")}
              customClasses="w-[132px]"
            />
          </div>
        </nav>
        <div onClick={onPressMenuButton} className="block lg:hidden">
          <button
            className="group inline-flex w-12 h-12 text-primary text-center items-center justify-center rounded shadow-[0_1px_0_--theme(--color-slate-950/.04),0_1px_2px_--theme(--color-slate-950/.12),inset_0_-2px_0_--theme(--color-slate-950/.04)] hover:shadow-[0_1px_0_--theme(--color-slate-950/.04),0_4px_8px_--theme(--color-slate-950/.12),inset_0_-2px_0_--theme(--color-slate-950/.04)] transition"
            aria-pressed={showMenu}
            type="button"
          >
            <span className="sr-only">Menu</span>
            <svg
              className="w-6 h-6 fill-current pointer-events-none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                className="origin-center -translate-y-[5px] translate-x-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-pressed:translate-x-0 group-aria-pressed:translate-y-0 group-aria-pressed:rotate-315"
                y="7"
                width="9"
                height="2"
                rx="1"
              />
              <rect
                className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-pressed:rotate-45"
                y="7"
                width="16"
                height="2"
                rx="1"
              />
              <rect
                className="origin-center translate-y-[5px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-pressed:translate-y-0 group-aria-pressed:rotate-135"
                y="7"
                width="9"
                height="2"
                rx="1"
              />
            </svg>
          </button>
        </div>
        <NavBarDrawer open={showMenu} onClose={onPressMenuButton} />
      </motion.header>
    </AnimatePresence>
  );
};

export default Header;
