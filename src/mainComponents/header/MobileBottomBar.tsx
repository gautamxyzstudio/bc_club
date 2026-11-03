"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Map,
  Home,
  TrendingUp,
  User,
  LogOut,
  Heart,
  Shield,
  X,
  BarChart3,
  FileText,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../auth/AuthContext";
import { isAdminUser } from "@/src/utilities/authUtils";

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: (pathname: string) => boolean;
  isAction?: boolean;
  onClick?: () => void;
}

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { isLoggedIn, username, setOpenLogin, logoutUser } = useAuthContext();
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showMarketSheet, setShowMarketSheet] = useState(false);

  // Do not render bottom bar on admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const marketSubPages = [
    {
      id: "monthly-sales-chart",
      title: "Monthly Sales Chart",
      description: "Interactive sales, median price & inventory charts",
      href: "/market-trends/monthly-sales-chart",
      icon: BarChart3,
      isActive: (path: string) => path === "/market-trends/monthly-sales-chart",
    },
    {
      id: "monthly-sales-reports",
      title: "Monthly Sales Reports",
      description: "Reports by neighbourhood, price range & beds",
      href: "/market-trends/monthly-sales-reports",
      icon: FileText,
      isActive: (path: string) => path === "/market-trends/monthly-sales-reports",
    },
    {
      id: "stats-map",
      title: "Stats Map",
      description: "Interactive map with regional benchmarks & prices",
      href: "/market-trends/stats-map",
      icon: MapPin,
      isActive: (path: string) => path === "/market-trends/stats-map",
    },
  ];

  const handleAccountClick = () => {
    setShowMarketSheet(false);
    if (isLoggedIn) {
      setShowAccountSheet((prev) => !prev);
    } else {
      setOpenLogin(true);
    }
  };

  const handleMarketClick = () => {
    setShowAccountSheet(false);
    setShowMarketSheet((prev) => !prev);
  };

  const navItems: NavItem[] = [
    {
      id: "homes",
      label: "Homes",
      href: "/properties",
      icon: Search,
      isActive: (path) =>
        path === "/properties" ||
        path === "/" ||
        path.startsWith("/property-info") ||
        path.startsWith("/sold-property-info"),
    },
    {
      id: "map",
      label: "Map",
      href: "/map-search",
      icon: Map,
      isActive: (path) => path === "/map-search" || path.startsWith("/map"),
    },
    {
      id: "home-value",
      label: "Home value",
      href: "/home-estimation",
      icon: Home,
      isActive: (path) => path === "/home-estimation" || path === "/property-assessment",
    },
    {
      id: "market",
      label: "Market",
      href: "/market-trends",
      icon: TrendingUp,
      isAction: true,
      onClick: handleMarketClick,
      isActive: (path) =>
        path === "/market-trends" ||
        path.startsWith("/market-trends/") ||
        showMarketSheet,
    },
    {
      id: "auth",
      label: isLoggedIn ? (username?.fullName?.split(" ")[0] || "Account") : "Sign in",
      icon: User,
      isAction: true,
      onClick: handleAccountClick,
      isActive: (path) => path === "/wishlist" || showAccountSheet,
    },
  ];

  return (
    <>
      {/* Spacer to prevent page content from being hidden behind fixed bar on mobile */}
      <div className="h-16 lg:hidden w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Mobile Account Bottom Sheet (when logged in) */}
      <AnimatePresence>
        {showAccountSheet && isLoggedIn && (
          <div className="fixed inset-0 z-999 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountSheet(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Menu */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 border-t border-slate-200"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22558b]/10 text-[#22558b] flex items-center justify-center font-bold text-base">
                    {username?.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {username?.fullName || "My Account"}
                    </h3>
                    <p className="text-xs text-slate-500">{username?.email || ""}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountSheet(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 space-y-1">
                {isAdminUser(username) && (
                  <Link
                    href="/admin/dashboard/active"
                    onClick={() => setShowAccountSheet(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50 font-medium text-sm transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  onClick={() => setShowAccountSheet(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  <Heart className="w-4 h-4 text-[#22558b]" />
                  <span>Saved Homes (Wishlist)</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    setShowAccountSheet(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-sm transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Market Trends Bottom Sheet */}
      <AnimatePresence>
        {showMarketSheet && (
          <div className="fixed inset-0 z-999 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMarketSheet(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Menu */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 border-t border-slate-200"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22558b]/10 text-[#22558b] flex items-center justify-center font-bold text-base">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      Market Trends
                    </h3>
                    <p className="text-xs text-slate-500">
                      Explore housing reports, charts & stats
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMarketSheet(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 space-y-2">
                {marketSubPages.map((sub) => {
                  const isCurrent = sub.isActive(pathname || "");
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      onClick={() => setShowMarketSheet(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-150 ${isCurrent
                          ? "bg-blue-50/80 border-[#22558b]/30 shadow-xs"
                          : "bg-white hover:bg-slate-50 border-slate-100"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isCurrent
                              ? "bg-[#22558b] text-white"
                              : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          <SubIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-semibold truncate ${isCurrent ? "text-[#22558b]" : "text-slate-900"
                                }`}
                            >
                              {sub.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#22558b] text-white px-2 py-0.5 rounded-full shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {sub.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ml-2 ${isCurrent ? "text-[#22558b]" : "text-slate-400"
                          }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Bottom Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-90 lg:hidden bg-white border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-5 h-14.5">
          {navItems.map((item) => {
            const active = item.isActive(pathname || "");
            const IconComponent = item.icon;

            const content = (
              <div
                className={`relative flex flex-col items-center justify-center h-full w-full select-none cursor-pointer transition-colors duration-150 ${active ? "text-slate-900" : "text-[#334155] hover:text-slate-900"
                  }`}
              >
                {/* Active Indicator Line on Top Edge (Golden/Amber) */}
                {active && (
                  <motion.div
                    layoutId="mobileBottomBarActiveIndicator"
                    className="absolute top-0 inset-x-0 h-0.75 bg-[#eea500]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <IconComponent
                  className="w-5 h-5 shrink-0"
                  strokeWidth={active ? 2.2 : 1.8}
                />

                {/* Label */}
                <span
                  className={`text-[11px] leading-tight mt-1 truncate max-w-[95%] text-center ${active ? "font-bold text-slate-900" : "font-medium text-[#334155]"
                    }`}
                >
                  {item.label}
                </span>
              </div>
            );

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="focus:outline-none h-full w-full p-0 bg-transparent border-0 cursor-pointer"
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                onClick={() => {
                  setShowAccountSheet(false);
                  setShowMarketSheet(false);
                }}
                className="h-full w-full block focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
