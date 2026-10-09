"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  Eye,
  RefreshCw,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  Maximize2,
  Download,
  ExternalLink,
  FileX,
} from "lucide-react";
import { useGetHomeEvaluationRequests } from "@/src/hooks/homeEvaluation/useHomeEvaluationQueries";
import { HomeEvaluationRequestItem } from "@/src/api/homeEvaluation/homeEvaluationApi";
import EvaluationRequestViewModal from "./EvaluationRequestViewModal";
import EvaluationRequestDeleteModal from "./EvaluationRequestDeleteModal";
import { toast } from "react-toastify";

export default function AdminEvaluationRequestsDashboard() {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">(
    "newest",
  );
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const sortOptions: {
    label: string;
    value: "newest" | "oldest" | "name" | "size";
  }[] = [
    { label: "Sort by: Newest First", value: "newest" },
    { label: "Sort by: Oldest First", value: "oldest" },
    { label: "Sort by: Client Name (A-Z)", value: "name" },
    { label: "Sort by: Property Size (High-Low)", value: "size" },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] =
    useState<HomeEvaluationRequestItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequestForDelete, setSelectedRequestForDelete] =
    useState<HomeEvaluationRequestItem | null>(null);

  // Query evaluation requests from API
  const {
    data: requests = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetHomeEvaluationRequests();

  // Show error toast notification whenever query fails
  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || "Forbidden");
    }
  }, [isError, error]);

  // Filter & Sort requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const name = (req.fullName || "").toLowerCase();
        const email = (req.email || "").toLowerCase();
        const phone = (req.phoneNumber || "").toLowerCase();
        const address = (req.address || "").toLowerCase();
        const size = (req.propertySizeInSquareFeet || "").toString().toLowerCase();
        const search = searchTerm.toLowerCase().trim();

        return (
          !search ||
          name.includes(search) ||
          email.includes(search) ||
          phone.includes(search) ||
          address.includes(search) ||
          size.includes(search)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          const nameA = (a.fullName || "").toLowerCase();
          const nameB = (b.fullName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "size") {
          const sizeA = parseFloat(a.propertySizeInSquareFeet?.toString().replace(/[^0-9.]/g, "") || "0");
          const sizeB = parseFloat(b.propertySizeInSquareFeet?.toString().replace(/[^0-9.]/g, "") || "0");
          return sizeB - sizeA;
        }
        if (sortBy === "oldest") {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        }
        // Default newest
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [requests, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "E";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredRequests.length === 0) {
      toast.info("No evaluation requests to export.");
      return;
    }

    try {
      const headers = [
        "ID",
        "Full Name",
        "Email",
        "Phone Number",
        "Address",
        "Property Size (Sq Ft)",
        "Submitted Date",
      ];

      const rows = filteredRequests.map((req) => [
        `"${req.documentId || req.id || ""}"`,
        `"${(req.fullName || "").replace(/"/g, '""')}"`,
        `"${(req.email || "").replace(/"/g, '""')}"`,
        `"${(req.phoneNumber || "").replace(/"/g, '""')}"`,
        `"${(req.address || "").replace(/"/g, '""')}"`,
        `"${(req.propertySizeInSquareFeet || "").toString().replace(/"/g, '""')}"`,
        `"${req.createdAt ? new Date(req.createdAt).toISOString() : ""}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `home_evaluation_requests_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Successfully exported ${filteredRequests.length} evaluation requests!`,
      );
    } catch {
      toast.error("Failed to export evaluation requests to CSV.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Evaluation Requests
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Total <strong>{requests.length}</strong> valuation inquiries from clients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export to CSV button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50 cursor-pointer"
            title="Refresh Requests"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by client name, email, phone, property address..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Custom Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                    "Sort by: Newest First"}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-full min-w-[220px] z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setPage(1);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filter results counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredRequests.length}</strong> of{" "}
            <strong>{requests.length}</strong> evaluation requests
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setPage(1);
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          )}
        </div>
      </div>

      {/* ================= REQUESTS TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">
              Loading evaluation requests...
            </p>
          </div>
        ) : isError ? (
          <div className="p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-2xs border border-slate-200/80">
              <FileX className="w-8 h-8 text-slate-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Failed to Load Evaluation Requests
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                An error occurred while communicating with the server. Please try again.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-5 py-2.5 bg-primary hover:bg-primary2 text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
                Retry
              </button>
            </div>
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto">
              <Calculator className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Evaluation Requests Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "No evaluation requests match your search criteria."
                : "No home evaluation requests submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Client / Contact</th>
                  <th className="py-3.5 px-4">Property Address</th>
                  <th className="py-3.5 px-4">Size (Sq Ft)</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRequests.map((req) => {
                  return (
                    <tr
                      key={req.documentId || req.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Client / Contact Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(req.fullName)}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                            <p className="font-bold text-slate-900 truncate">
                              {req.fullName || "Anonymous Client"}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              {req.email && (
                                <a
                                  href={`mailto:${req.email}`}
                                  className="text-[11px] text-slate-500 hover:text-primary transition flex items-center gap-1 truncate"
                                  title={req.email}
                                >
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{req.email}</span>
                                </a>
                              )}
                              {req.phoneNumber && (
                                <a
                                  href={`tel:${req.phoneNumber.replace(/[^0-9+]/g, "")}`}
                                  className="text-[11px] text-slate-500 hover:text-emerald-600 transition flex items-center gap-1 truncate"
                                  title={req.phoneNumber}
                                >
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{req.phoneNumber}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property Address */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p
                          className="text-slate-800 font-semibold line-clamp-2 leading-relaxed"
                          title={req.address}
                        >
                          {req.address || "Address not provided"}
                        </p>
                      </td>

                      {/* Property Size */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60">
                          <Maximize2 className="w-3 h-3 text-purple-500" />
                          {req.propertySizeInSquareFeet
                            ? `${req.propertySizeInSquareFeet} sq ft`
                            : "N/A"}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(req.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequestForView(req);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Phone */}
                          {req.phoneNumber && (
                            <a
                              href={`tel:${req.phoneNumber.replace(/[^0-9+]/g, "")}`}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center"
                              title="Call Client"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}

                          {/* Delete Request */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequestForDelete(req);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold px-2 text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      <EvaluationRequestViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRequestForView(null);
        }}
        request={selectedRequestForView}
      />

      <EvaluationRequestDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRequestForDelete(null);
        }}
        request={selectedRequestForDelete}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
