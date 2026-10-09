"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X, Home } from "lucide-react";
import { useDeleteHomeEvaluationRequest } from "@/src/hooks/homeEvaluation/useHomeEvaluationQueries";
import { HomeEvaluationRequestItem } from "@/src/api/homeEvaluation/homeEvaluationApi";

interface EvaluationRequestDeleteModalProps {
  open: boolean;
  onClose: () => void;
  request: HomeEvaluationRequestItem | null;
  onSuccess?: () => void;
}

export default function EvaluationRequestDeleteModal({
  open,
  onClose,
  request,
  onSuccess,
}: EvaluationRequestDeleteModalProps) {
  const deleteMutation = useDeleteHomeEvaluationRequest();

  // Prevent background and dashboard scrolling when modal is open
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

  const targetIdentifier = request.documentId || request.id;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(targetIdentifier);
      onSuccess?.();
      onClose();
    } catch {
      // Handled in mutation onError toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overscroll-contain select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Delete Evaluation Request
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete the evaluation request from{" "}
            <strong className="text-slate-900">{request.fullName}</strong> for property:
          </p>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
            <Home className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-slate-800 truncate">{request.address}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {request.email} &bull; {request.phoneNumber}
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              This action cannot be undone. The client inquiry record will be removed from your database.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
