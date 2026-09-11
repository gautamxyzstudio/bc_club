/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Icons } from "@/src/app/exports";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import NavBarDrawer from "./NavBarDrawer";

import { useAuthContext } from "../auth/AuthContext";
import { usePathname } from "next/navigation";
import { Heart, LogOut } from "lucide-react";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import RippleButton from "@/src/components/button/RippleButton";
import { isAdminUser } from "@/src/utilities/authUtils";

export const menulist = [
  { title: "Evaluation", href: "/home-estimation" },
  { title: "Market Trends", href: "/market-trends" },
  { title: "Map Search", href: "/map-search" },
  { title: "Properties", href: "/properties" },
  { title: "Contact Us", href: "/contact-us" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isLaptop = useMediaQuery("(min-width: 1200px)");
  const [showMenu, setShowMenu] = useState(false);

  const { setOpenLogin, setOpenSignup, isLoggedIn, username, logoutUser } =
    useAuthContext();

  useEffect(() => {
    if (!isLaptop) {
      setIsVisible(true);
      return;
    }

    setLastScrollY(window.scrollY);
    setIsScrolled(window.scrollY > 80);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      currentScrollY < lastScrollY || currentScrollY < 100
        ? setIsVisible(true)
        : setIsVisible(false);

      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isLaptop]);

  const navVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
    },
    exit: {
      y: -100,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const onPressMenuButton = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  // Get active pathname
  const pathname = usePathname();

  // When authenticated user or on admin routes, header is not visible
  if (pathname?.startsWith("/admin") || (isLoggedIn && isAdminUser(username))) {
    if (!pathname?.startsWith("/admin") && isLoggedIn && isAdminUser(username)) {
      return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Logged in as <strong>{username?.fullName || "Admin"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard/active"
              className="font-bold text-blue-400 hover:underline"
            >
              Go to Admin Dashboard →
            </Link>
            <button
              onClick={logoutUser}
              className="text-rose-400 hover:underline font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <AnimatePresence>
      <motion.header
        initial="hidden"
        animate={isVisible ? "visible" : "exit"}
        variants={navVariants as any}
        className={`xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 xl:py-4 md:py-4 py-3 flex items-center justify-between w-full fixed top-0 left-0 right-0 z-999   ${
          isLaptop
            ? isScrolled
              ? "bg-background shadow"
              : "bg-white"
            : "shadow bg-background"
        }`}
      >
        {/* Logo */}
        <Link
          href={"/"}
          onClick={() => !isLaptop && setShowMenu(false)}
          className="xl:hidden block"
        >
          <Image
            title="image title"
            alt="logo"
            src={Icons.bcClub}
            width={119}
            height={42}
            className="w-45 h-10 object-contain"
          />
        </Link>

        <Link href={"/"} className="xl:block hidden">
          <Image
            title="image title"
            alt="logo"
            src={Icons.bcClub}
            width={119}
            height={42}
            className="w-65 h-11 object-contain"
          />
        </Link>

        <nav className="hidden xl:flex justify-end-safe items-center-safe gap-x-5">
          <div className="flex items-center gap-x-5">
            {menulist.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`text-foreground text-base uppercase hover:font-medium transition-all duration-300 ${
                  pathname === item.href && "font-medium"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* LOGIN / SIGNUP BUTTONS */}
          {isLoggedIn ? (
            <div className="dropdown dropdown-hover dropdown-end">
              <div
                className="flex items-center gap-x-2 cursor-pointer"
                tabIndex={0}
                role="button"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="text-primary font-bold uppercase flex items-center gap-1.5">
                  {username && username?.fullName}
                  {isAdminUser(username) && (
                    <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-medium tracking-wide">
                      ADMIN
                    </span>
                  )}
                </span>
              </div>
              <div
                tabIndex={-1}
                className="dropdown-content menu bg-white rounded-box z-1 px-4 py-3 shadow-sm gap-y-2 w-fit text-nowrap"
              >
                {isAdminUser(username) && (
                  <>
                    <Link
                      href={"/admin/dashboard/active"}
                      className="flex items-center gap-2 w-full cursor-pointer group text-primary font-bold hover:bg-background rounded-lg p-1 transition-colors duration-300 ease-in-out"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Admin Dashboard
                    </Link>
                    <LineGradient />
                  </>
                )}
                <Link
                  href={"/wishlist"}
                  className="flex items-center gap-1 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium  rounded-lg transition-colors duration-300 ease-in-out"
                >
                  <Heart className="group-hover:text-primary" />
                  Wishlist
                </Link>
                <LineGradient />
                <span
                  onClick={logoutUser}
                  className="flex items-center gap-1 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium  rounded-lg transition-colors duration-300 ease-in-out"
                >
                  <LogOut className="group-hover:text-primary" />
                  Logout
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-x-3">
              <RippleButton
                title="Login"
                buttonType="primary"
                onClick={() => setOpenLogin(true)}
                customClassName="w-[132px]"
              />

              <RippleButton
                title="Sign up"
                buttonType="secondary"
                onClick={() => setOpenSignup(true)}
                customClassName="w-[132px]"
              />
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        <div onClick={onPressMenuButton} className="block xl:hidden">
          <button
            className="group inline-flex md:w-12 md:h-12 w-9 h-9 text-primary text-center items-center justify-center rounded shadow-[0_1px_0_--theme(--color-slate-950/.04),0_1px_2px_--theme(--color-slate-950/.12),inset_0_-2px_0_--theme(--color-slate-950/.04)] hover:shadow-[0_1px_0_--theme(--color-slate-950/.04),0_4px_8px_--theme(--color-slate-950/.12),inset_0_-2px_0_--theme(--color-slate-950/.04)] transition"
            aria-pressed={showMenu}
            type="button"
          >
            <span className="sr-only">Menu</span>
            <svg
              className="w-6 h-6 fill-current pointer-events-none"
              viewBox="0 0 16 16"
            >
              <rect
                className="origin-center -translate-y-1.25 translate-x-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-pressed:translate-x-0 group-aria-pressed:translate-y-0 group-aria-pressed:rotate-315"
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
                className="origin-center translate-y-1.25 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-pressed:translate-y-0 group-aria-pressed:rotate-135"
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
