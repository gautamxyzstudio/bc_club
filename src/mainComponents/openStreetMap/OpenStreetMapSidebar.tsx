"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import PropertiesCard from "@/src/components/common/propertiesCard/PropertiesCard";

interface OpenStreetMapSidebarProps {
  isLoading: boolean;
  visibleProperties: any[];
  properties: any;
  isLoggedIn: boolean;
  status: string;
  setHoveredPropertyId?: (id: string | null) => void;
  assessmentDrawerOpen?: boolean;
  selectedAssessmentProperty?: any;
  setAssessmentDrawerOpen?: (value: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OpenStreetMapSidebar({
  isLoading,
  visibleProperties,
  properties,
  isLoggedIn,
  status,
  setHoveredPropertyId,
  assessmentDrawerOpen,
  selectedAssessmentProperty,
  setAssessmentDrawerOpen,
  currentPage,
  totalPages,
  onPageChange,
}: OpenStreetMapSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  if (assessmentDrawerOpen && selectedAssessmentProperty) {
    return (
      <div className="hidden md:w-110 xl:flex flex-col bg-white md:border-r border-gray-200 z-10 h-full">
        <div className="h-full w-full bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-5 pt-0">
            <button
              onClick={() => setAssessmentDrawerOpen?.(false)}
              className="mb-3 text-sm font-semibold text-gray-500 hover:text-[#305487]"
            >
              ← Back to Properties
            </button>

            <h2 className="text-2xl font-bold text-[#305487]">
              ${Number(selectedAssessmentProperty.price || 0).toLocaleString()}
            </h2>

            <p className="mt-2 text-sm font-semibold text-gray-800 leading-5">
              {selectedAssessmentProperty.address}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {selectedAssessmentProperty.roll}
            </p>
          </div>

          <div className="p-5 space-y-5">
            {/* Value Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Total Assessed Value</p>
                <p className="mt-1 text-xl font-bold text-[#305487]">
                  $
                  {Number(
                    selectedAssessmentProperty.price || 0,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Land Value</p>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    $
                    {Number(
                      selectedAssessmentProperty.landValue || 0,
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Building Value</p>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    $
                    {Number(
                      selectedAssessmentProperty.buildingValue || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Info */}
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Legal Information
              </h3>

              {selectedAssessmentProperty.legal?.length > 0 ? (
                <div className="space-y-2">
                  {selectedAssessmentProperty.legal?.map(
                    (item: any, index: number) => (
                      <div
                        key={`${item.pid}-${index}`}
                        className="rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        <p className="text-gray-700">
                          <span className="font-semibold">PID:</span>{" "}
                          {item.pid || "-"}
                        </p>
                        <p className="text-gray-700 mt-1">
                          <span className="font-semibold">Plan:</span>{" "}
                          {item.plan || "-"}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No legal information available.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Assessment History
              </h3>

              {selectedAssessmentProperty.chartComparison?.length > 0 ? (
                <div className="space-y-2">
                  {selectedAssessmentProperty.chartComparison.map(
                    (item: any) => (
                      <div
                        key={item.year}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {item.year}
                          </p>
                          <p className="text-xs text-gray-500">
                            Change:{" "}
                            {item.propertyChangePercent !== null &&
                              item.propertyChangePercent !== undefined
                              ? `${item.propertyChangePercent}%`
                              : "-"}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-[#305487]">
                          {item.assessedValueFormatted ||
                            `$${Number(item.assessedValue || 0).toLocaleString()}`}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No assessment history available.
                </p>
              )}
            </div>

            {/* Action */}
            <button
              onClick={() =>
                window.open(
                  `/property-assessment/${selectedAssessmentProperty.documentId}`,
                  `_blank`,
                )
              }
              className="w-full rounded-lg bg-[#305487] px-4 py-3 text-sm font-bold text-white hover:bg-[#24446f]"
            >
              View Full Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }
  console.log(visibleProperties[0])
  return (
    <div className="hidden md:w-95 xl:flex flex-col bg-white md:border-r border-gray-200 z-10 h-full">
      <div className="p-4 pb-0 flex justify-between items-center text-sm font-semibold border-b border-gray-50">

        {isLoading ? <div className="w-full  bg-[#305487] animate-pulse rounded" />
          : properties?.meta?.total > 10 ? (
            <div className="text-xs text-gray-500">
              Showing {visibleProperties.length} of {properties.meta?.total}
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Showing {visibleProperties.length} properties found
            </div>
          )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar bg-[#f8f9fa]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <FiLoader className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-500 text-sm font-medium">
              Fetching properties...
            </p>
          </div>
        ) : visibleProperties.length > 0 ? (
          <>
            {visibleProperties.map((p, idx) => (

              <div
                key={idx}
                onMouseEnter={() => setHoveredPropertyId?.(p.id)}
                onMouseLeave={() => setHoveredPropertyId?.(null)}
              >
                <PropertiesCard
                  {...p}
                  forMap={true}
                  isLogin={isLoggedIn || p.status === "Active"}
                  isSold={
                    status === "closed" ||
                    status === "sold" ||
                    status === "forecloserSold" ||
                    status === "forcecloserSold"
                  }
                  isExpired={status === "expired"}
                  isDdf={p.isDdf}
                />
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-1.5 pt-4 pb-6 mt-4 border-t border-gray-100 w-full overflow-x-auto no-scrollbar">
                <button
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-50 transition disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200 cursor-pointer shrink-0"
                >
                  Prev
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      pages.push(
                        1,
                        "...",
                        totalPages - 3,
                        totalPages - 2,
                        totalPages - 1,
                        totalPages,
                      );
                    } else {
                      pages.push(
                        1,
                        "...",
                        currentPage - 1,
                        currentPage,
                        currentPage + 1,
                        "...",
                        totalPages,
                      );
                    }
                  }
                  return pages;
                })().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ell-${idx}`}
                      className="px-1 text-xs text-gray-400 font-semibold select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      onClick={() => onPageChange(p as number)}
                      disabled={isLoading}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center shrink-0 ${currentPage === p
                        ? "bg-[#305487] text-white shadow-xs"
                        : "border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-black hover:bg-gray-50"
                        }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-50 transition disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200 cursor-pointer shrink-0"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            No properties found in this area.
          </div>
        )}
      </div>
    </div>
  );
}
