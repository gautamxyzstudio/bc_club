"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Edit,
  ImageIcon,
  ArrowUpDown,
  Building,
  Bed,
  Bath,
  Maximize,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Gavel,
  Trash2,
} from "lucide-react";
import {
  useGetRealEstateListings,
  applyPropertyOverrides,
  useGetForecloserProperties,
  useCopyToForecloserList,
  useDeleteForecloserProperty,
} from "@/src/hooks/listing/useRealEstateListingQueries";
import PropertyViewModal from "./PropertyViewModal";
import PropertyEditModal from "./PropertyEditModal";
import MediaRearrangeModal from "./MediaRearrangeModal";

interface AdminPropertiesDashboardProps {
  currentStatus: "active" | "sold" | "expired" | "foreclosure";
}

export default function AdminPropertiesDashboard({
  currentStatus,
}: AdminPropertiesDashboardProps) {
  const isForeclosureTab = currentStatus === "foreclosure";

  // State for filters & pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selected property for modals
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rearrangeModalOpen, setRearrangeModalOpen] = useState(false);

  // Status mapping for API params
  const apiStatusParam = useMemo(() => {
    if (currentStatus === "sold") return "sold";
    if (currentStatus === "expired") return "expired";
    return "active";
  }, [currentStatus]);

  // Query parameters
  const queryParams: any = {
    page,
    pageSize,
    status: apiStatusParam,
  };

  if (searchTerm.trim()) {
    queryParams.search = searchTerm.trim();
  }

  if (propertyType !== "all") {
    queryParams.type = propertyType;
  }

  if (sortBy === "newest") queryParams.sort = "newest";
  else if (sortBy === "oldest") queryParams.sort = "oldest";
  else if (sortBy === "price_asc") queryParams.sort = "price:asc";
  else if (sortBy === "price_desc") queryParams.sort = "price:desc";

  // Fetch real estate listings for active/sold/expired tabs
  const {
    data: realEstateData,
    isLoading: isRealEstateLoading,
    isError: isRealEstateError,
    refetch: refetchRealEstate,
    isFetching: isRealEstateFetching,
  } = useGetRealEstateListings(queryParams, {
    enabled: !isForeclosureTab,
    staleTime: 30000,
  });

  // Fetch foreclosure properties list
  const {
    data: forecloserData,
    isLoading: isForecloserLoading,
    isError: isForecloserError,
    refetch: refetchForecloser,
    isFetching: isForecloserFetching,
  } = useGetForecloserProperties(undefined, {
    staleTime: 30000,
  });

  const isLoading = isForeclosureTab ? isForecloserLoading : isRealEstateLoading;
  const isError = isForeclosureTab ? isForecloserError : isRealEstateError;
  const refetch = isForeclosureTab ? refetchForecloser : refetchRealEstate;
  const isFetching = isForeclosureTab ? isForecloserFetching : isRealEstateFetching;

  // Foreclosure copy mutation & delete mutation
  const copyMutation = useCopyToForecloserList();
  const deleteMutation = useDeleteForecloserProperty();
  const [copyingDocId, setCopyingDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Normalize listings with any local overrides and nested structures
  const allListings: any[] = useMemo(() => {
    if (isForeclosureTab) {
      const rawList = forecloserData?.data || forecloserData || [];
      if (!Array.isArray(rawList)) return [];
      let result = rawList.map((item: any) => {
        const base = item.real_estate_board
          ? { ...item.real_estate_board, ...item, forecloserDocId: item.documentId || item.id }
          : { ...item, forecloserDocId: item.documentId || item.id };
        return applyPropertyOverrides(base);
      });

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        result = result.filter(
          (item: any) =>
            item.address?.toLowerCase().includes(q) ||
            item.city?.toLowerCase().includes(q) ||
            item.listing_id?.toLowerCase().includes(q)
        );
      }
      if (propertyType !== "all") {
        result = result.filter(
          (item: any) =>
            item.property_sub_type?.toLowerCase() === propertyType.toLowerCase() ||
            item.structure_type?.toLowerCase() === propertyType.toLowerCase()
        );
      }
      if (sortBy === "price_asc") {
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      } else if (sortBy === "price_desc") {
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      }
      return result;
    }

    const rawList = realEstateData?.data || [];
    return rawList.map((item: any) => applyPropertyOverrides(item));
  }, [isForeclosureTab, forecloserData, realEstateData, searchTerm, propertyType, sortBy]);

  // Paginated slice for foreclosure tab
  const listings = useMemo(() => {
    if (isForeclosureTab) {
      const start = (page - 1) * pageSize;
      return allListings.slice(start, start + pageSize);
    }
    return allListings;
  }, [isForeclosureTab, allListings, page, pageSize]);

  const totalListings = isForeclosureTab
    ? allListings.length
    : (realEstateData?.meta?.pagination?.total || realEstateData?.count || allListings.length);
  const totalPages = Math.max(1, Math.ceil(totalListings / pageSize));

  // Set of docIds/identifiers already in foreclosure
  const forecloserIdentifiers = useMemo(() => {
    const list = forecloserData?.data || forecloserData || [];
    const set = new Set<string>();
    if (Array.isArray(list)) {
      list.forEach((f: any) => {
        if (f?.documentId) set.add(String(f.documentId));
        if (f?.id) set.add(String(f.id));
        if (f?.attributes?.documentId) set.add(String(f.attributes.documentId));
        if (f?.real_estate_board?.documentId) set.add(String(f.real_estate_board.documentId));
        if (f?.real_estate_board?.id) set.add(String(f.real_estate_board.id));
        if (f?.realEstateDocumentId) set.add(String(f.realEstateDocumentId));
        if (f?.listing_id) set.add(String(f.listing_id));
        if (f?.attributes?.listing_id) set.add(String(f.attributes.listing_id));
      });
    }
    return set;
  }, [forecloserData]);

  const isItemInForeclosure = (item: any) => {
    if (!item) return false;
    if (item.documentId && forecloserIdentifiers.has(String(item.documentId))) return true;
    if (item.id && forecloserIdentifiers.has(String(item.id))) return true;
    if (item.listing_id && forecloserIdentifiers.has(String(item.listing_id))) return true;
    return false;
  };

  const handleCopyForecloser = async (item: any) => {
    const docId = item?.documentId || item?.id;
    if (!docId) return;
    try {
      setCopyingDocId(docId);
      await copyMutation.mutateAsync(docId);
      refetchForecloser();
    } catch {
      // Handled by mutation error toast
    } finally {
      setCopyingDocId(null);
    }
  };

  const handleDeleteForecloser = async (item: any) => {
    const idToDelete = item.forecloserDocId || item.documentId || item.id;
    if (!idToDelete) return;
    if (window.confirm("Are you sure you want to remove this property from the foreclosure list?")) {
      try {
        setDeletingDocId(idToDelete);
        await deleteMutation.mutateAsync(idToDelete);
        refetchForecloser();
      } catch {
        // Handled by mutation error toast
      } finally {
        setDeletingDocId(null);
      }
    }
  };


  // Handler to open modals
  const handleOpenView = (prop: any) => {
    setSelectedProperty(prop);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (prop: any) => {
    setSelectedProperty(prop);
    setEditModalOpen(true);
  };

  const handleOpenRearrange = (prop: any) => {
    setSelectedProperty(prop);
    setRearrangeModalOpen(true);
  };

  const getPrimaryImage = (listing: any) => {
    if (Array.isArray(listing?.media_url) && listing.media_url[0]) {
      return listing.media_url[0];
    }
    if (typeof listing?.media_url === "string") {
      return listing.media_url;
    }
    if (Array.isArray(listing?.media) && listing.media[0]) {
      return listing.media[0]?.MediaURL || listing.media[0]?.url || "/apartment.webp";
    }
    return "/apartment.webp";
  };

  const getImageCount = (listing: any) => {
    if (Array.isArray(listing?.media_url)) return listing.media_url.length;
    if (Array.isArray(listing?.media)) return listing.media.length;
    if (listing?.media_url) return 1;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Route Switcher Tabs Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
              Admin Portal
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">Property Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 capitalize">
            {currentStatus === "foreclosure" ? "Foreclosure" : currentStatus} Properties
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentStatus === "active" &&
              "Manage active properties on market, update details, and rearrange listing photos."}
            {currentStatus === "sold" &&
              "Inspect closed and sold properties, update transaction metadata, and review archives."}
            {currentStatus === "expired" &&
              "View expired listings, update details, or prepare reactivation with updated media."}
            {currentStatus === "foreclosure" &&
              "Manage distressed and foreclosed properties copied from the real estate board, update details, and manage media."}
          </p>
        </div>

        {/* Route Pills */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-xl self-start md:self-auto gap-1 overflow-x-auto max-w-full">
          <Link
            href="/admin/dashboard/active"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              currentStatus === "active"
                ? "bg-white text-primary shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Active
          </Link>
          <Link
            href="/admin/dashboard/sold"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              currentStatus === "sold"
                ? "bg-white text-primary shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-4 h-4 text-purple-500" />
            Sold
          </Link>
          <Link
            href="/admin/dashboard/expired"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              currentStatus === "expired"
                ? "bg-white text-primary shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Expired
          </Link>
          <Link
            href="/admin/dashboard/foreclosure"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              currentStatus === "foreclosure"
                ? "bg-white text-primary shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Gavel className="w-4 h-4 text-amber-500" />
            Foreclosure
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total in {currentStatus === "foreclosure" ? "Foreclosure" : currentStatus}
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {isLoading ? "..." : totalListings.toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Real-time sync</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {currentStatus === "foreclosure" ? <Gavel className="w-6 h-6 text-amber-600" /> : <Building className="w-6 h-6" />}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Listings</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {currentStatus === "active" ? totalListings.toLocaleString() : "View Route"}
            </h3>
            <Link href="/admin/dashboard/active" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
              Switch to Active →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sold Listings</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {currentStatus === "sold" ? totalListings.toLocaleString() : "View Route"}
            </h3>
            <Link href="/admin/dashboard/sold" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
              Switch to Sold →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foreclosure List</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {currentStatus === "foreclosure"
                ? totalListings.toLocaleString()
                : (forecloserData?.data?.length ?? (Array.isArray(forecloserData) ? forecloserData.length : "...")).toString()}
            </h3>
            <Link href="/admin/dashboard/foreclosure" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
              Switch to Foreclosure →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by address, city, listing ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Property Type Filter */}
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-700"
            >
              <option value="all">All Property Types</option>
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo / Apartment</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Commercial">Commercial</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-700"
            >
              <option value="newest">Newest Listed</option>
              <option value="oldest">Oldest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table" ? "bg-white text-primary shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-white text-primary shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition disabled:opacity-50"
              title="Refresh Listings"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-gray-700">Loading {currentStatus} listings...</p>
          <p className="text-xs text-gray-400 mt-1">Retrieving verified properties and media data.</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-10 text-center shadow-xs text-rose-600">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
          <p className="font-bold text-base">Failed to load listings</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">An error occurred while communicating with the server.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary2 transition"
          >
            Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
          <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No {currentStatus} properties found</h3>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search keywords, filters, or property category.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Listing ID</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Specs</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">{isForeclosureTab ? "Foreclosure Status" : "Foreclosure"}</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {listings.map((item: any) => {
                  const cover = getPrimaryImage(item);
                  const count = getImageCount(item);
                  return (
                    <tr
                      key={item.documentId || item.id || item.listing_id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Property Address & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                            <Image
                              src={cover}
                              alt="thumb"
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="max-w-xs">
                            <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">
                              {item.address || "Address not specified"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.city || "BC"} • {item.property_sub_type || item.structure_type || "Residential"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Listing ID */}
                      <td className="py-3.5 px-4 text-xs font-mono font-semibold text-gray-600">
                        {item.listing_id || item.documentId?.slice(0, 8) || "-"}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 text-sm">
                          ${Number(item.price || 0).toLocaleString()}
                        </span>
                        {item.old_price && Number(item.old_price) > 0 && (
                          <span className="block text-[11px] text-gray-400 line-through">
                            ${Number(item.old_price).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{item.bedrooms ?? 0}b</span> •
                          <span>{item.bathrooms ?? 0}ba</span> •
                          <span>{item.Living_area ? `${item.Living_area} sqft` : "-"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            isForeclosureTab
                              ? "bg-amber-100 text-amber-800"
                              : item.standard_status === "Active" || item.status === "forSale"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.standard_status === "Sold" || item.status === "sold"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isForeclosureTab ? "Foreclosure" : item.standard_status || item.status || "Active"}
                        </span>
                      </td>

                      {/* Foreclosure Column */}
                      <td className="py-3.5 px-4 text-xs font-medium whitespace-nowrap">
                        {isForeclosureTab ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-amber-800 bg-amber-50 border border-amber-200/80 font-semibold text-xs">
                              <Gavel className="w-3.5 h-3.5 text-amber-600" />
                              Foreclosure
                            </span>
                            <button
                              onClick={() => handleDeleteForecloser(item)}
                              disabled={deleteMutation.isPending && deletingDocId === (item.forecloserDocId || item.documentId || item.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remove from foreclosure list"
                            >
                              {deleteMutation.isPending && deletingDocId === (item.forecloserDocId || item.documentId || item.id) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : isItemInForeclosure(item) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-200/80 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            In Foreclosure
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCopyForecloser(item)}
                            disabled={copyMutation.isPending && copyingDocId === (item.documentId || item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-secondary hover:opacity-90 shadow-xs transition disabled:opacity-50 cursor-pointer"
                            title="Copy to forecloser list"
                          >
                            {copyMutation.isPending && copyingDocId === (item.documentId || item.id) ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Copying...
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy to forecloser list
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(item)}
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                            title="View All Fields"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                            title="Edit Property Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRearrange(item)}
                            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Rearrange Photos"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((item: any) => {
            const cover = getPrimaryImage(item);
            const count = getImageCount(item);
            return (
              <div
                key={item.documentId || item.id || item.listing_id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-16/10 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={cover}
                    alt={item.address || "Property image"}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-xs ${
                        isForeclosureTab
                          ? "bg-amber-500 text-white"
                          : item.standard_status === "Active" || item.status === "forSale"
                          ? "bg-emerald-500 text-white"
                          : item.standard_status === "Sold" || item.status === "sold"
                          ? "bg-purple-600 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {isForeclosureTab ? "Foreclosure" : item.standard_status || item.status || "Active"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenRearrange(item)}
                    className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-primary text-white text-xs px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 transition"
                    title="Rearrange Photos"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {count}
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-primary">
                      ${Number(item.price || 0).toLocaleString()}
                    </h3>
                    <p className="font-bold text-gray-800 text-sm truncate mt-0.5">
                      {item.address || "No address specified"}
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

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => handleOpenView(item)}
                      className="flex-1 py-1.5 px-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 py-1.5 px-2 text-xs font-semibold text-white bg-primary hover:bg-primary2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenRearrange(item)}
                      className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200/50"
                      title="Rearrange Photos"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Foreclosure Action */}
                  <div className="pt-0.5">
                    {isForeclosureTab ? (
                      <button
                        onClick={() => handleDeleteForecloser(item)}
                        disabled={deleteMutation.isPending && deletingDocId === (item.forecloserDocId || item.documentId || item.id)}
                        className="w-full py-1.5 px-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        title="Remove from foreclosure list"
                      >
                        {deleteMutation.isPending && deletingDocId === (item.forecloserDocId || item.documentId || item.id) ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            Remove from Foreclosure
                          </>
                        )}
                      </button>
                    ) : isItemInForeclosure(item) ? (
                      <div className="w-full py-1.5 px-2 rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-200/80 font-semibold text-xs flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        In Foreclosure
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCopyForecloser(item)}
                        disabled={copyMutation.isPending && copyingDocId === (item.documentId || item.id)}
                        className="w-full py-1.5 px-2 text-xs font-semibold text-white bg-secondary hover:opacity-90 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        title="Copy to forecloser list"
                      >
                        {copyMutation.isPending && copyingDocId === (item.documentId || item.id) ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Copying...
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy to forecloser list
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 font-medium">
            Showing Page <span className="font-bold text-gray-800">{page}</span> of{" "}
            <span className="font-bold text-gray-800">{totalPages}</span> ({totalListings.toLocaleString()} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Current page indicator */}
            <span className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedProperty && (
        <>
          <PropertyViewModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            property={selectedProperty}
            onOpenEdit={() => handleOpenEdit(selectedProperty)}
            onOpenRearrange={() => handleOpenRearrange(selectedProperty)}
          />

          <PropertyEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            property={selectedProperty}
            onSuccess={() => refetch()}
          />

          <MediaRearrangeModal
            open={rearrangeModalOpen}
            onClose={() => setRearrangeModalOpen(false)}
            property={selectedProperty}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </div>
  );
}
