"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Waves,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useListingStore } from "@/src/store/useListingStore";

interface FeatureCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}

const HomeKnowMoreSection = () => {
  const router = useRouter();
  const { isLoggedIn, setOpenLogin } = useAuthContext();
  const { updateInstanceFilter, selectedCity } = useListingStore();

  const handleSoldClick = () => {
    updateInstanceFilter("map", "status", "closed");
    if (!isLoggedIn) {
      setOpenLogin(true);
    } else {
      router.push("/map-search?status=closed");
    }
  };

  const handlePriceDropsClick = () => {
    updateInstanceFilter("list", "status", "forSale");
    updateInstanceFilter("list", "activePriceChange", "drop");
    updateInstanceFilter("list", "activePrice", "newest");
    router.push("/properties?priceChange=drop&sort=newest");
  };

  const handleLotLinesClick = () => {
    router.push("/map-search?propertyLines=true");
  };

  const handleFloodClick = () => {
    router.push("/map-search?flood=true");
  };

  const handleSchoolsClick = () => {
    router.push("/map-search?schools=true");
  };

  const handleMarketReportsClick = () => {
    const city = selectedCity || "Vancouver";
    router.push(`/market-trends?city=${encodeURIComponent(city)}`);
  };

  const cards: FeatureCard[] = [
    {
      id: "sold-prices",
      icon: TrendingUp,
      title: "What did it sell for?",
      description: "Real sold prices. Free account.",
      onClick: handleSoldClick,
    },
    {
      id: "price-drops",
      icon: TrendingDown,
      title: "Price drops",
      description: "Homes that just cut their price.",
      onClick: handlePriceDropsClick,
    },
    {
      id: "lot-line",
      icon: LayoutGrid,
      title: "Where’s the lot line?",
      description: "Exact lines on the map.",
      onClick: handleLotLinesClick,
    },
    {
      id: "flood-risk",
      icon: Waves,
      title: "Flood risk check",
      description: "Check before you offer.",
      onClick: handleFloodClick,
    },
    {
      id: "schools",
      icon: GraduationCap,
      title: "Which schools are nearby?",
      description: "Ratings for nearby schools.",
      onClick: handleSchoolsClick,
    },
    {
      id: "market-reports",
      icon: FileText,
      title: "Monthly market reports",
      description: "Your city, in plain English.",
      badge: selectedCity && selectedCity !== "Vancouver" ? selectedCity : undefined,
      onClick: handleMarketReportsClick,
    },
  ];

  return (
    <section
      aria-label="Know more before you book a showing"
      className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-9 px-6 pt-10 md:pt-14 pb-4 md:pb-8"
    >
      {/* Section Header */}
      <div className="w-full text-left">
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#102A43] tracking-tight leading-tight">
          Know more before you book a showing
        </h2>
        <p className="text-sm sm:text-base text-[#627D98] mt-1.5 md:mt-2 font-normal">
          Free, in one place.
        </p>
      </div>

      {/* 6 Feature Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-4.5 mt-6 md:mt-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={card.onClick}
              className="group relative bg-white rounded-2xl border border-[#E7ECF3] p-5 sm:p-5.5 flex flex-col justify-between hover:shadow-[0_12px_28px_rgba(34,85,139,0.08)] hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left min-h-43.75 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <div>
                <div className="w-10.5 h-10.5 sm:w-11 sm:h-11 rounded-xl bg-[#E6F4EE] text-[#0D7A68] flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-105 group-hover:bg-[#DCF0E8] transition-all duration-200">
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm md:text-base text-[#102A43] leading-snug group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#627D98] mt-2 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {card.badge && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {card.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default HomeKnowMoreSection;
