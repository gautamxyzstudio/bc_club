"use client";

import React, { useEffect } from "react";
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
} from "lucide-react";
import { HomeEvaluationRequestItem } from "@/src/api/homeEvaluation/homeEvaluationApi";

interface EvaluationRequestViewModalProps {
  open: boolean;
  onClose: () => void;
  request: HomeEvaluationRequestItem | null;
}

export default function EvaluationRequestViewModal({
  open,
  onClose,
  request,
}: EvaluationRequestViewModalProps) {
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

  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

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
      className="fixed inset-0 z-[9999] overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
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
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Client Profile Header */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50/80 to-white border border-blue-100/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary2 text-white flex items-center justify-center font-bold text-base shadow-md shadow-primary/20 shrink-0">
                {getInitials(request.fullName)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {request.fullName || "Anonymous Client"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Home Valuation Lead
                </span>
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
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Property & Valuation Details
            </h4>

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

            {/* Property Size */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  Estimated Size / Area
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-sm">
                  {request.propertySizeInSquareFeet
                    ? `${request.propertySizeInSquareFeet} sq ft`
                    : "Not Specified"}
                </span>
                <span className="text-xs text-slate-400">
                  (Estimated interior living area submitted by owner)
                </span>
              </div>
            </div>
          </div>

          {/* Submission Info Bar */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100/60 border border-slate-200/60 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Received on: <strong>{formattedDate}</strong>
              </span>
            </div>
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
    </div>
  );
}
