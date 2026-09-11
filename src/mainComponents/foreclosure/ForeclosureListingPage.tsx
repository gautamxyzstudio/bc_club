"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Building,
  Bed,
  Bath,
  Maximize,
  Gavel,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Home,
  ShieldAlert,
} from "lucide-react";
import { useGetForecloserProperties } from "@/src/hooks/listing/useRealEstateListingQueries";
import PropertyViewModal from "@/src/mainComponents/admin/PropertyViewModal";

export default function ForeclosureListingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Selected property for modal view
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useGetForecloserProperties();

  const allProperties: any[] = useMemo(() => {
    const raw = data?.data || data || [];
    if (!Array.isArray(raw)) return [];
    let list = raw.map((item: any) => {
      return item.real_estate_board ? { ...item.real_estate_board, ...item } : item;
    });

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p: any) =>
          p.address?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.listing_id?.toLowerCase().includes(q)
      );
    }

    if (selectedType !== "all") {
      list = list.filter(
        (p: any) =>
          p.property_sub_type?.toLowerCase() === selectedType.toLowerCase() ||
          p.structure_type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a: any, b: any) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a: any, b: any) => Number(b.price || 0) - Number(a.price || 0));
    }

    return list;
  }, [data, searchTerm, selectedType, sortBy]);

  const total = allProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allProperties.slice(start, start + pageSize);
  }, [allProperties, page, pageSize]);

  const getPrimaryImage = (item: any) => {
    if (Array.isArray(item?.media_url) && item.media_url[0]) return item.media_url[0];
    if (typeof item?.media_url === "string") return item.media_url;
    if (Array.isArray(item?.media) && item.media[0]) {
      return item.media[0]?.MediaURL || item.media[0]?.url || "/apartment.webp";
    }
    return "/apartment.webp";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-28">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Gavel className="w-4 h-4 text-amber-400" />
            Distressed & Foreclosure Opportunities
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            BC Foreclosure Properties List
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Explore verified foreclosed homes, judicial sales, and distressed properties across British Columbia.
          </p>

          {/* Quick Search Toolbar */}
          <div className="pt-4 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search city, address, or listing ID..."
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="py-3 px-3.5 bg-white text-gray-800 rounded-xl text-sm font-semibold focus:outline-none shadow-md cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="all">All Types</option>
                <option value="Apartment/Condo">Condos</option>
                <option value="House/Single Family">Houses</option>
                <option value="Townhouse">Townhouses</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-3 px-3.5 bg-white text-gray-800 rounded-xl text-sm font-semibold focus:outline-none shadow-md cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Results Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <span className="text-sm font-bold text-gray-900">
              {isLoading ? "Loading..." : `${total} Foreclosure Properties Available`}
            </span>
            <span className="text-xs text-gray-500 block sm:inline sm:ml-2">
              Showing page {page} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse p-4 space-y-3"
              >
                <div className="aspect-16/10 bg-gray-200 rounded-xl"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-rose-100 p-12 text-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-rose-500" />
            <h3 className="text-lg font-bold">Failed to load foreclosure properties</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Please try refreshing the page or check your connection.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary2 transition"
            >
              Try Again
            </button>
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
            <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No foreclosure properties found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              There are currently no active foreclosure properties matching your filter criteria.
            </p>
          </div>
        ) : (
          /* Properties Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedList.map((item: any) => {
              const cover = getPrimaryImage(item);
              return (
                <div
                  key={item.documentId || item.id || item.listing_id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => {
                    setSelectedProperty(item);
                    setViewModalOpen(true);
                  }}
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-16/10 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={cover}
                      alt={item.address || "Foreclosure Property"}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs flex items-center gap-1">
                        <Gavel className="w-3 h-3" />
                        Foreclosure
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-primary">
                        ${Number(item.price || 0).toLocaleString()}
                      </h3>
                      <p className="font-bold text-gray-800 text-sm truncate mt-0.5">
                        {item.address || "Address not provided"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.city || "BC"} • {item.property_sub_type || "Residential"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-primary" /> {item.bedrooms ?? 0}b
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-primary" /> {item.bathrooms ?? 0}ba
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Maximize className="w-3.5 h-3.5 text-primary" /> {item.Living_area || "-"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(item);
                        setViewModalOpen(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-primary hover:bg-primary2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Property Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Property Details View Modal */}
      {selectedProperty && (
        <PropertyViewModal
          property={selectedProperty}
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
}
