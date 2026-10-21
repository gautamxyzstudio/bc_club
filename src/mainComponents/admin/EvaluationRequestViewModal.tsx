"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Calendar,
  ExternalLink,
  Calculator,
  Compass,
  Trash2,
  RefreshCw,
  Building2,
  Bed,
  Bath,
  Navigation,
  Layers,
} from "lucide-react";
import { HomeEvaluationRequestItem, CallHistoryItem } from "@/src/api/homeEvaluation/homeEvaluationApi";
import { useDeleteCallHistory } from "@/src/hooks/homeEvaluation/useHomeEvaluationQueries";
import DeleteCallLogModal from "./DeleteCallLogModal";

interface EvaluationRequestViewModalProps {
  open: boolean;
  onClose: () => void;
  request: HomeEvaluationRequestItem | null;
  onOpenLogCall?: (request: HomeEvaluationRequestItem) => void;
}

export default function EvaluationRequestViewModal({
  open,
  onClose,
  request,
}: EvaluationRequestViewModalProps) {
  const deleteCallMutation = useDeleteCallHistory();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CallHistoryItem | null>(null);

  const confirmDeleteCall = () => {
    if (!itemToDelete) return;
    const id = itemToDelete.documentId || itemToDelete.id;
    setDeletingId(id);
    setItemToDelete(null);
    deleteCallMutation.mutate(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector("main");
      const originalMainOverflow = mainEl ? mainEl.style.overflow : "";

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (mainEl) {
        mainEl.style.overflow = "hidden";
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        if (mainEl) {
          mainEl.style.overflow = originalMainOverflow;
        }
      };
    }
  }, [open]);

  if (!open || !request) return null;

  // Helper to resolve city (either stored directly or extracted from address if legacy)
  let displayCity = (request.city || "").trim();
  if (!displayCity && request.address) {
    const parts = request.address.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      const cityPart = parts[1]
        .replace(/\b(BC|AB|ON|QC|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b.*$/i, "")
        .trim();
      if (cityPart) displayCity = cityPart;
    }
  }

  // Helper to resolve postal code (either stored directly or extracted from address if legacy)
  let displayPostalCode = (request.postal_code || "").trim().toUpperCase();
  if (!displayPostalCode && request.address) {
    const match = request.address.match(
      /\b([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)\b/,
    );
    if (match) displayPostalCode = match[1].toUpperCase();
  }

  const getInitials = (name?: string) => {
    if (!name) return "E";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-9999 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Evaluation Request Details
              </h2>
              <p className="text-[11px] text-slate-500">
                ID: <span className="font-mono text-slate-700">{request.documentId || request.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Client Profile Header */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-linear-to-br from-blue-50/60 via-slate-50/80 to-white border border-blue-100/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary2 text-white flex items-center justify-center font-bold text-base shadow-md shadow-primary/20 shrink-0">
                {getInitials(request.fullName)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {request.fullName || "Anonymous Client"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Home Valuation Lead
                  </span>
                  {request.consent ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60"
                      title="User gave express consent for follow-up communications under Canada Anti-Spam Legislation (CASL)"
                    >
                      ✓ CASL Consent Granted
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200"
                      title="User did not check the express follow-up consent box"
                    >
                      No Express Follow-up Consent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email Address
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 break-all">
                {request.email || "No email provided"}
              </p>
            </div>

            {/* Phone Number */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Phone Number
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 font-mono">
                {request.phoneNumber || "No phone provided"}
              </p>
            </div>
          </div>

          {/* Property Assessment Request Details */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            {/* Property Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Property Address</span>
              </div>
              <p className="text-sm font-bold text-slate-900 bg-white p-3 rounded-xl border border-slate-200">
                {request.address || "Address not specified"}
              </p>
              {request.address && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      request.address,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-primary text-xs font-semibold transition"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={`/properties?search=${encodeURIComponent(request.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Search MLS Listings
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Property Specs Grid: Size, Bedrooms, Bathrooms, City, Postal Code */}
            <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
              {/* Row 1: Area Size, Bedrooms, Bathrooms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Area Size */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    Area Size
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {request.propertySizeInSquareFeet
                      ? `${request.propertySizeInSquareFeet} sq ft`
                      : "Not specified"}
                  </p>
                </div>

                {/* Bedrooms */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Bedrooms
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {request.bedrooms
                      ? `${request.bedrooms} ${request.bedrooms === "1" ? "Bed" : "Beds"}`
                      : "Not specified"}
                  </p>
                </div>

                {/* Bathrooms */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    Bathrooms
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {request.bathrooms
                      ? `${request.bathrooms} ${request.bathrooms === "1" ? "Bath" : "Baths"}`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Row 2: City, Postal Code (full width columns for no text truncation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* City */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    City
                  </span>
                  <p className="text-sm font-bold text-slate-800 wrap-break-word">
                    {displayCity || "Not specified"}
                  </p>
                </div>

                {/* Postal Code */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Postal Code
                  </span>
                  <p className="text-sm font-bold text-slate-800 uppercase font-mono wrap-break-word">
                    {displayPostalCode || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Row 3: Lot Size Area & Year Built (if provided) */}
              {(request.lotSize || request.yearBuilt) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {request.lotSize && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        Lot Size Area
                      </span>
                      <p className="text-sm font-bold text-slate-800 wrap-break-word">
                        {request.lotSize}
                      </p>
                    </div>
                  )}

                  {request.yearBuilt && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        Year Built
                      </span>
                      <p className="text-sm font-bold text-slate-800 wrap-break-word">
                        {request.yearBuilt}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Call History Section (Replaces old Submitted Date section) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Call History
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {(request.call_histories || []).length}{" "}
                  {(request.call_histories || []).length === 1 ? "call" : "calls"}
                </span>
              </div>
            </div>

            {/* List of Calls */}
            {(!request.call_histories || request.call_histories.length === 0) ? (
              <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  No calls have been recorded with this client yet.
                </p>
              
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {request.call_histories.map((call, index) => {
                  const callDate = call.callAt || call.createdAt;
                  let formattedCallDate = "N/A";
                  try {
                    formattedCallDate = callDate
                      ? new Date(callDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";
                  } catch {
                    formattedCallDate = callDate || "N/A";
                  }

                  const callId = call.documentId || call.id;

                  return (
                    <div
                      key={call.documentId || call.id || index}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {formattedCallDate}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Recorded interaction #{request.call_histories!.length - index}
                          </p>
                        </div>
                      </div>

                      {callId && (
                        <button
                          type="button"
                          onClick={() => setItemToDelete(call)}
                          disabled={deletingId === callId}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-60 hover:opacity-100 cursor-pointer disabled:opacity-50"
                          title="Remove Call Record"
                        >
                          {deletingId === callId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Custom Confirmation Popup for Deleting Call Record */}
      <DeleteCallLogModal
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteCall}
        isDeleting={!!deletingId}
        callDate={itemToDelete?.callAt || itemToDelete?.createdAt}
      />
    </div>
  );
}
