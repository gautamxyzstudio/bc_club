"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X, User } from "lucide-react";
import { useDeleteUser } from "@/src/hooks/users/useUserQueries";
import { StrapiUser } from "@/src/api/users/usersApi";

interface UserDeleteModalProps {
  open: boolean;
  onClose: () => void;
  user: StrapiUser | null;
  onSuccess?: () => void;
}

export default function UserDeleteModal({
  open,
  onClose,
  user,
  onSuccess,
}: UserDeleteModalProps) {
  const deleteMutation = useDeleteUser();

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

  if (!open || !user) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
      onSuccess?.();
      onClose();
    } catch {
      // Handled in mutation onError toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overscroll-contain select-none"
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
          <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete the user account{" "}
            <strong className="text-slate-900">@{user.username}</strong> ({user.email})?
            This action cannot be undone.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 mt-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              Deleting this user will revoke all active sessions and access privileges.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Delete User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
