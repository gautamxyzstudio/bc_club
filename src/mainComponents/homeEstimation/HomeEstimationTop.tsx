/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Icons } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { useGetAssessmentPropertiesList } from "@/src/hooks/listing/useListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

const HomeEstimationTop = () => {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: assessmentPropertiesList,
    isLoading,
    isFetching,
  } = useGetAssessmentPropertiesList(
    {
      address: debouncedQuery,
    },
    {
      enabled: debouncedQuery.length > 1,
    },
  );

  useEffect(() => {
    if (debouncedQuery.length <= 1) {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    const list = assessmentPropertiesList?.data || [];
    setFilteredResults(list);
    setShowDropdown(list.length > 0);
  }, [assessmentPropertiesList, debouncedQuery]);

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

  const loadingSearch = isLoading || isFetching;

  return (
    <>
      {navigating && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
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
          <p className="text-sm font-medium text-primary">Loading property…</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .estimation-dropdown { animation: dropdownSlide 0.18s ease-out both; }
        .estimation-item { transition: background 0.15s ease, padding-left 0.15s ease; }
        .estimation-item:hover { background: rgba(34,85,139,0.07); padding-left: 20px; }
      `}</style>

      <section className="xl:max-w-screen-2xl mx-auto w-full relative xl:pt-53.5 xl:pb-31 md:pt-38.75 md:pb-29 pt-26.5 pb-17 px-6 flex flex-col items-center-safe">
        <h1 className="xl:text-5xl xl:leading-17 md:text-5xl md:leading-14 text-[40px] leading-12 font-bold text-center">
          Get Your Free <span className="text-primary">Home Evaluation</span>
        </h1>

        <Description
          type={IDescriptionTypes.dec16}
          content="Fill out form below to receive your personalized property valuation report."
          customClasses="xl:mt-5 mt-4 text-center mx-6"
        />

        <div className="xl:mt-8 mt-5 md:w-[80%] w-full md:p-6 p-4 shadow-[0_0_15px_0_rgba(0,0,0,0.12)] rounded-2xl flex flex-col gap-y-6 bg-background z-10">
          <p className="xl:text-xl font-bold">What’s my home worth?</p>

          <div className="relative">
            <div
              className={`border border-borderColor md:p-1.5 py-2 flex items-center ${
                showDropdown && filteredResults.length > 0
                  ? "rounded-t-xl"
                  : "rounded-xl"
              }`}
            >
              <Search
                className="ml-3 shrink-0"
                size={18}
                style={{ color: "var(--lightWhite)" }}
              />

              <input
                className="outline-0 px-3 w-full h-12 md:h-14 md:text-sm bg-transparent"
                placeholder="Search Property Address"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (filteredResults.length > 0) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              />

              {loadingSearch && query.length > 1 && (
                <div
                  className="mr-3 shrink-0 w-4 h-4 rounded-full"
                  style={{
                    border: "2px solid #e5e7eb",
                    borderTopColor: "var(--primary)",
                    animation: "spin 0.75s linear infinite",
                  }}
                />
              )}
            </div>

            {showDropdown && filteredResults.length > 0 && (
              <div
                className="estimation-dropdown absolute left-0 w-full bg-background z-20 max-h-72 overflow-y-auto scrollbar-hide"
                style={{
                  top: "100%",
                  border: "1px solid var(--borderColor)",
                  borderTop: "none",
                  borderBottomLeftRadius: "12px",
                  borderBottomRightRadius: "12px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--borderColor)" }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--lightWhite)" }}
                  >
                    Properties
                  </span>

                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(34,85,139,0.10)",
                      color: "var(--primary)",
                    }}
                  >
                    {filteredResults.length}
                  </span>
                </div>

                {filteredResults.map((item, index) => (
                  <div
                    key={item.documentId || item.id}
                    onMouseDown={() => handleSelectProperty(item.documentId, item.address)}
                    className="estimation-item cursor-pointer px-4 py-3 flex items-start gap-3"
                    style={{
                      borderBottom:
                        index + 1 < filteredResults.length
                          ? "1px solid var(--borderColor)"
                          : "none",
                    }}
                  >
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--primary)" }}
                    />

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.address}
                      </span>

                      {item.city && (
                        <span
                          className="text-xs mt-0.5"
                          style={{ color: "var(--lightWhite)" }}
                        >
                          {item.city}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Image
          title="image title"
          src={Icons.bgWaveLine}
          alt="Wave line"
          className="w-full md:h-65.5 h-29.5 absolute object-contain bottom-0 z-0 left-0"
          width={100}
          height={100}
        />
      </section>
    </>
  );
};

export default HomeEstimationTop;
