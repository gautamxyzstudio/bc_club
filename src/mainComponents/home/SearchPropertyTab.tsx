/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Icons } from "@/src/app/exports";
import CustomButton from "@/src/components/button/CustomButton";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import {
  useGetAssessmentPropertiesList,
} from "@/src/hooks/listing/useListingQueries";
import { useGetRealEstatePropertiesListByAddress } from "@/src/hooks/listing/useRealEstateListingQueries";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

const SearchPropertyTab = () => {
  const tabList = ["Find Home", "Home Assessment", "Market Trends"];
  const [activeTab, setActiveTab] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Home Assessment State
  const [query, setQuery] = useState("");
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);

  // Find Home State
  const [ddfQuery, setDdfQuery] = useState("");
  const [ddfResults, setDdfResults] = useState<any[]>([]);

  const [navigating, setNavigating] = useState(false);

  const { data: assessmentPropertiesList, isLoading: isLoadingAssessment } =
    useGetAssessmentPropertiesList({
      address: query,
    });

  const { data: ddfList, isLoading: isLoadingDdfListing } =
    useGetRealEstatePropertiesListByAddress({
      address: ddfQuery,
    });

  useEffect(() => {
    if (query.length > 1) {
      setAssessmentResults(assessmentPropertiesList?.data || []);
      setShowDropdown((assessmentPropertiesList?.data || []).length > 0);
    } else {
      setAssessmentResults([]);
    }
  }, [assessmentPropertiesList, query]);

  useEffect(() => {
    if (ddfQuery.length > 1) {
      setDdfResults(ddfList?.data || []);
      setShowDropdown((ddfList?.data || []).length > 0);
    } else {
      setDdfResults([]);
    }
  }, [ddfList, ddfQuery]);

  const isFetchingAssessment = isLoadingAssessment;
  const isFetchingDdf = isLoadingDdfListing;

  const router = useRouter();

  const handleSelectAssessment = (documentId: string, address?: string) => {
    setShowDropdown(false);
    setNavigating(true);
    // Log activity: Home Assessment relation to property_assignment_list
    logPropertySearchActivity({
      propertySearchType: "property_evaluation",
      searchTerm: query || address || "",
      propertyId: documentId,
    });
    router.push(`/property-assessment/${documentId}`);
  };

  const handleSelectProperty = (documentId: string, address?: string) => {
    setShowDropdown(false);
    setNavigating(true);
    // Log activity: Find Home relation to real_estate_board
    logPropertySearchActivity({
      propertySearchType: "find_home",
      searchTerm: ddfQuery || address || "",
      propertyId: documentId,
    });
    router.push(`/property-info/${documentId}`);
  };

  const handleFindHomeSearchSubmit = () => {
    if (ddfResults.length > 0) {
      handleSelectProperty(ddfResults[0].documentId, ddfResults[0].address);
    } else if (ddfQuery.trim()) {
      logPropertySearchActivity({
        propertySearchType: "find_home",
        searchTerm: ddfQuery.trim(),
      });
      router.push(`/properties?search=${encodeURIComponent(ddfQuery.trim())}`);
    }
  };

  const handleAssessmentSearchSubmit = () => {
    if (assessmentResults.length > 0) {
      handleSelectAssessment(assessmentResults[0].documentId, assessmentResults[0].address);
    } else if (query.trim()) {
      logPropertySearchActivity({
        propertySearchType: "property_evaluation",
        searchTerm: query.trim(),
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .search-dropdown { animation: dropdownSlide 0.18s ease-out both; }
        .search-item { transition: background 0.15s ease, padding-left 0.15s ease; }
        .search-item:hover { background: rgba(34,85,139,0.07); padding-left: 20px; }
      `}</style>

      {/* Full-screen navigation loading overlay */}
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
          <p
            className="text-sm font-medium"
            style={{ color: "var(--lightWhite)" }}
          >
            Loading property…
          </p>
        </div>
      )}

      <div className="xl:w-183.75 w-full xl:absolute p-3 flex flex-col gap-y-4 justify-between shadow-[0_0_16px_0_rgba(0,0,0,0.12)] rounded-xl bg-background z-99">
        <div className="flex flex-nowrap gap-2.5 w-full">
          {tabList.map((item, idx) => (
            <CustomButton
              key={idx}
              label={item}
              buttonType={activeTab === idx ? "primary" : "disabled"}
              customClasses="w-full"
              onClick={() => {
                if (idx !== 2) {
                  setActiveTab(idx);
                  setQuery(""); // Clear query when switching tabs
                  setDdfQuery("");
                  setShowDropdown(false);
                } else {
                  router.push(`/market-trends`);
                }
              }}
            />
          ))}
        </div>
        {activeTab === 0 && (
          <div
            className={`border border-borderColor md:p-1.5 p-1 flex flex-row items-center justify-between relative  ${
              showDropdown && ddfResults.length > 0
                ? "rounded-t-xl rounded-b-0"
                : "rounded-xl"
            }`}
          >
            <input
              className="outline-0 px-3 cursor-pointer w-full h-12 bg-transparent"
              placeholder="Enter address for Find Home"
              required
              value={ddfQuery}
              onChange={(e) => setDdfQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFindHomeSearchSubmit();
                }
              }}
              onFocus={() => {
                if (ddfResults.length > 0) setShowDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
            />
            <button
              type="button"
              onClick={handleFindHomeSearchSubmit}
              className="md:w-13 md:h-13 w-10 h-10 bg-secondary md:p-3.5 p-2 text-center flex items-center justify-center-safe md:rounded-xl rounded-md cursor-pointer"
            >
              {isFetchingDdf ? (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.75s linear infinite",
                  }}
                />
              ) : (
                <Image
                  title="image title"
                  src={Icons.searchLine}
                  alt="Search"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              )}
            </button>
            {showDropdown && ddfResults.length > 0 && (
              <div
                className="search-dropdown absolute left-0 w-full bg-background z-20 max-h-72 overflow-y-auto scrollbar-hide"
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
                    {ddfResults.length}
                  </span>
                </div>
                {ddfResults.map((item, index) => (
                  <div
                    key={`${item.documentId}-${index}`}
                    onMouseDown={() => handleSelectProperty(item.documentId, item.address)}
                    className="search-item cursor-pointer px-4 py-3 flex items-start gap-3"
                    style={{
                      borderBottom:
                        index + 1 < ddfResults.length
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div
            className={`border border-borderColor md:p-1.5 p-1 flex flex-row items-center justify-between relative  ${
              showDropdown && assessmentResults.length > 0
                ? "rounded-t-xl rounded-b-0"
                : "rounded-xl"
            }`}
          >
            <div className="flex items-center w-full">
              <Search
                className="ml-3 shrink-0"
                size={18}
                style={{ color: "var(--lightWhite)" }}
              />
              <input
                className="outline-0 px-3 cursor-pointer w-full h-12 bg-transparent"
                placeholder={`Enter address for Home Assessment`}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAssessmentSearchSubmit();
                  }
                }}
                onFocus={() => {
                  if (assessmentResults.length > 0) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              />
            </div>

            <button
              type="button"
              onClick={handleAssessmentSearchSubmit}
              className="md:w-13 md:h-13 w-10 h-10 bg-secondary md:p-3.5 p-2 text-center flex items-center justify-center-safe md:rounded-xl rounded-md cursor-pointer"
            >
              {isFetchingAssessment ? (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.75s linear infinite",
                  }}
                />
              ) : (
                <Image
                  title="image title"
                  src={Icons.searchLine}
                  alt="Search"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              )}
            </button>

            {showDropdown && assessmentResults.length > 0 && (
              <div
                className="search-dropdown absolute left-0 w-full bg-background z-20 max-h-72 overflow-y-auto scrollbar-hide"
                style={{
                  top: "100%",
                  border: "1px solid var(--borderColor)",
                  borderTop: "none",
                  borderBottomLeftRadius: "12px",
                  borderBottomRightRadius: "12px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
                }}
              >
                {/* Header */}
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
                    {assessmentResults.length}
                  </span>
                </div>

                {/* Items */}
                {assessmentResults.map((item, index) => (
                  <div
                    key={item.id}
                    onMouseDown={() => handleSelectAssessment(item.documentId, item.address)}
                    className="search-item cursor-pointer px-4 py-3 flex items-start gap-3"
                    style={{
                      borderBottom:
                        index + 1 < assessmentResults.length
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPropertyTab;
