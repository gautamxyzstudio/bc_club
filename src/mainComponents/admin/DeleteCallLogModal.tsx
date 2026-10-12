"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X, Clock } from "lucide-react";

interface DeleteCallLogModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  callDate?: string;
}

export default function DeleteCallLogModal({
  open,
  onClose,
  onConfirm,
  isDeleting = false,
  callDate,
}: DeleteCallLogModalProps) {
  // Prevent background scrolling while open
  useEffect(() => {
    if (open) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [open]);

  if (!open) return null;

  const formattedDate = callDate
    ? (() => {
        try {
          return new Date(callDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return callDate;
        }
      })()
    : null;

  return (
    <div
      className="fixed inset-0 z-[10001] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4 select-text animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Remove Call Record?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently remove this call entry from the history?
          </p>

          {formattedDate && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 mt-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-slate-800 truncate">{formattedDate}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Recorded Call Timestamp</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              This action cannot be undone. The call record will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
