"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { useDeleteBlog } from "@/src/hooks/blogs/useBlogQueries";

interface BlogDeleteModalProps {
  open: boolean;
  onClose: () => void;
  blog: any;
  onSuccess?: () => void;
}

export default function BlogDeleteModal({
  open,
  onClose,
  blog,
  onSuccess,
}: BlogDeleteModalProps) {
  const deleteMutation = useDeleteBlog();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open || !blog) return null;

  const item = blog.attributes ? { ...blog.attributes, id: blog.id } : blog;
  const slug = item.slug;
  const title = item.blogTitle || "Untitled Blog";

  const handleDelete = async () => {
    if (!slug) return;
    try {
      await deleteMutation.mutateAsync(slug);
      onSuccess?.();
      onClose();
    } catch {
      // Handled in mutation onError toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5">
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">Delete Blog?</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-gray-900 font-semibold">&ldquo;{title}&rdquo;</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 mt-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-snug">
              This action will remove the blog post from the public website and database. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Blog</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
