"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight, Building2 } from "lucide-react";
import { useGetAssessmentPropertiesList } from "@/src/hooks/listing/useListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";

const HomeAssessmentSearchSection = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch assessment properties based on address query
  const {
    data: assessmentListRes,
    isLoading,
    isFetching,
  } = useGetAssessmentPropertiesList(
    { address: debouncedQuery },
    { enabled: debouncedQuery.length > 1 }
  );

  const results: any[] = Array.isArray(assessmentListRes?.data)
    ? assessmentListRes.data
    : Array.isArray(assessmentListRes)
    ? assessmentListRes
    : [];

  useEffect(() => {
    if (debouncedQuery.length > 1 && results.length > 0) {
      setShowDropdown(true);
    } else if (debouncedQuery.length <= 1) {
      setShowDropdown(false);
    }
  }, [debouncedQuery, results]);

  const handleSelectProperty = (documentId: string, address?: string) => {
    setShowDropdown(false);
    setNavigating(true);
    logPropertySearchActivity({
      propertySearchType: "property_evaluation",
      searchTerm: query || address || "",
      propertyId: documentId,
    });
    router.push(`/property-assessment/${documentId}`);
  };

  const handleSearchSubmit = () => {
    if (results.length > 0) {
      handleSelectProperty(
        results[0].documentId || results[0].id,
        results[0].address
      );
    } else if (query.trim()) {
      logPropertySearchActivity({
        propertySearchType: "property_evaluation",
        searchTerm: query.trim(),
      });
    }
  };

  const isSearching = isLoading || isFetching;

  return (
    <>
      {/* Loading Overlay */}
      {navigating && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full"
            style={{
              border: "3px solid #e5e7eb",
              borderTopColor: "var(--primary)",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <p className="text-sm font-semibold text-primary">
            Loading property assessment…
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .assessment-search-dropdown { animation: dropdownSlide 0.18s ease-out both; }
        .assessment-search-item { transition: background 0.15s ease, padding-left 0.15s ease; }
        .assessment-search-item:hover { background: rgba(34,85,139,0.07); padding-left: 20px; }
      `}</style>

      <section
        id="bc-assessment-search-section"
        className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-13 px-6 xl:py-12 md:py-10 py-8 relative overflow-visible"
      >
        <div className="w-full bg-gray rounded-3xl p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col items-center text-center relative overflow-visible shadow-xs z-10">
          {/* Heading */}
          <h2 className="xl:text-4xl md:text-3xl text-2xl font-bold text-foreground tracking-tight">
            Search <span className="text-primary">BC Assessment</span> Properties
          </h2>

          {/* Description */}
          <Description
            type={IDescriptionTypes.dec16}
            content="Enter any BC property address to instantly look up official assessment records, building specs, and comparative valuations."
            customClasses="mt-3 text-center max-w-2xl text-lightWhite"
          />

          {/* Search Box Container */}
          <div className="w-full max-w-2xl mt-8 relative z-30">
            <div
              className={`bg-background border flex items-center shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] transition-all duration-200 ${
                showDropdown && results.length > 0
                  ? "rounded-t-2xl border-primary/50 shadow-xl"
                  : "rounded-2xl border-borderColor/80 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
              } p-1.5 md:p-2`}
            >
              <div className="flex items-center w-full pl-2 md:pl-3 pr-2">
                <input
                  id="bc-assessment-search-input"
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    } else if (e.key === "Escape") {
                      setShowDropdown(false);
                    }
                  }}
                  onFocus={() => {
                    if (results.length > 0) setShowDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 220);
                  }}
                  placeholder="Enter property address (e.g. 122 Main St, Vancouver)"
                  className="w-full h-11 md:h-12 text-sm md:text-base outline-none bg-transparent text-foreground placeholder:text-lightWhite/70 font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="h-11 md:h-12 px-5 md:px-7 bg-primary hover:bg-primary2 text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                {isSearching && debouncedQuery.length > 1 ? (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
                    style={{ animation: "spin 0.75s linear infinite" }}
                  />
                ) : (
                  <>
                    <span className="hidden sm:inline">Search</span>
                    <Search size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && results.length > 0 && (
              <div
                className="assessment-search-dropdown absolute left-0 w-full bg-background z-50 max-h-80 overflow-y-auto scrollbar-hide text-left"
                style={{
                  top: "100%",
                  border: "1px solid var(--borderColor)",
                  borderTop: "none",
                  borderBottomLeftRadius: "16px",
                  borderBottomRightRadius: "16px",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center justify-between bg-gray/30"
                  style={{ borderBottom: "1px solid var(--borderColor)" }}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-lightWhite flex items-center gap-1.5">
                    <Building2 size={13} />
                    Matching Properties
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {results.length} found
                  </span>
                </div>

                {results.map((item: any, index: number) => (
                  <div
                    key={item.documentId || item.id || index}
                    onMouseDown={() =>
                      handleSelectProperty(
                        item.documentId || item.id,
                        item.address
                      )
                    }
                    className="assessment-search-item cursor-pointer px-4 py-3.5 flex items-start gap-3 hover:bg-primary/5"
                    style={{
                      borderBottom:
                        index + 1 < results.length
                          ? "1px solid var(--borderColor)"
                          : "none",
                    }}
                  >
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.address || item.title || item.name}
                      </span>
                      {(item.city ||
                        item.neighbourhood ||
                        item.floorArea ||
                        item.sqft) && (
                        <span className="text-xs text-lightWhite mt-0.5 flex items-center gap-1.5">
                          {item.city || item.neighbourhood}
                          {(item.floorArea || item.sqft) && (
                            <span className="font-medium text-foreground/70">
                              • {item.floorArea || item.sqft} sq ft
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-lightWhite/50 shrink-0 self-center ml-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Highlights Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:gap-4 text-xs font-semibold text-foreground/80">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-borderColor/60 shadow-xs">
              <span className="text-primary font-bold">✓</span>
              <span>Official BC Assessment Values</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-borderColor/60 shadow-xs">
              <span className="text-primary font-bold">✓</span>
              <span>Building & Lot Specifications</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-borderColor/60 shadow-xs">
              <span className="text-primary font-bold">✓</span>
              <span>Historical Assessment Trends</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeAssessmentSearchSection;
