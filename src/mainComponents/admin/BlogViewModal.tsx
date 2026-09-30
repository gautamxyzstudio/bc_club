"use client";

import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Calendar,
  ExternalLink,
  Edit,
  Globe,
  Loader2,
} from "lucide-react";
import { getBlogImageUrl, decodeHtmlEntities } from "@/src/api/blogs/blogsApi";
import { useGetBlogBySlug } from "@/src/hooks/blogs/useBlogQueries";

interface BlogViewModalProps {
  open: boolean;
  onClose: () => void;
  blog: any;
  onEdit?: (blog: any) => void;
}

export default function BlogViewModal({
  open,
  onClose,
  blog,
  onEdit,
}: BlogViewModalProps) {
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

  const initialItem = useMemo(() => {
    if (!blog) return null;
    return blog.attributes
      ? { ...blog.attributes, id: blog.id, documentId: blog.documentId }
      : blog;
  }, [blog]);

  const slug = initialItem?.slug || "";

  // Fetch full details if needed to ensure rich content is available
  const { data: fullBlogResponse, isLoading: isLoadingDetails, isFetching } = useGetBlogBySlug(
    slug,
    {
      enabled: open && !!slug,
    }
  );

  const item = useMemo(() => {
    if (!initialItem) return null;
    if (fullBlogResponse) {
      const d = fullBlogResponse.data || fullBlogResponse;
      if (d) {
        const full = d.attributes
          ? { ...d.attributes, id: d.id, documentId: d.documentId || d.id }
          : d;
        return { ...initialItem, ...full };
      }
    }
    return initialItem;
  }, [initialItem, fullBlogResponse]);

  if (!open || !item) return null;

  const imageUrl = getBlogImageUrl(item.blogImage);
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  // Decode any HTML entities so tags are executed as real DOM elements (Visual Preview)
  const renderedContent = decodeHtmlEntities(item.blogContent || "");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-bold text-gray-900 shrink-0">
                Blog Preview
              </h2>
              <span
                className="px-2 py-0.5 rounded-md bg-blue-50 text-primary text-[11px] font-mono font-medium border border-blue-100/60 truncate max-w-[130px] sm:max-w-[200px] md:max-w-[280px]"
                title={`/${item.slug}`}
              >
                /{item.slug}
              </span>
              {isFetching && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                  <Loader2 className="w-3 h-3 animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              Inspect formatted content and metadata preview
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Edit className="w-3.5 h-3.5 text-blue-600" />
                Edit Blog
              </button>
            )}

            <Link
              href={`/blogs/${item.slug}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary2 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Post
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Cover Hero Banner */}
          {imageUrl && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100/80 flex items-center justify-center p-2">
              <Image
                src={imageUrl}
                alt={item.blogTitle || "Blog hero"}
                fill
                className="object-contain drop-shadow-2xs"
                unoptimized
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-800 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {formattedDate}
                </span>
              </div>
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {item.blogTitle}
            </h1>

            {item.blogDescription && (
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic border-l-4 border-primary pl-4 py-1.5 bg-blue-50/40 rounded-r-xl">
                {item.blogDescription}
              </p>
            )}
          </div>

          {/* Formatted Visual Rich Text Content */}
          <div className="border-t border-gray-100 pt-6">
            {isLoadingDetails && !renderedContent ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs">Loading formatted blog content...</p>
              </div>
            ) : (
              <div
                className="prose prose-zinc max-w-none text-gray-800 text-sm leading-relaxed 
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-gray-900 
                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-gray-900 
                  [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-900 
                  [&_p]:mb-4 [&_p]:leading-relaxed 
                  [&_div]:mb-3
                  [&_span]:leading-relaxed
                  [&_b]:font-bold [&_strong]:font-bold
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
                  [&_li]:leading-relaxed
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-blue-50/50 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:my-4 
                  [&_pre]:bg-gray-900 [&_pre]:text-emerald-400 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto 
                  [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary2 
                  [&_img]:rounded-xl [&_img]:max-h-96 [&_img]:my-4 [&_img]:shadow-md"
                dangerouslySetInnerHTML={{
                  __html:
                    renderedContent ||
                    "<p class='text-gray-400 italic'>No content written for this blog post.</p>",
                }}
              />
            )}
          </div>

          {/* SEO Metadata Card */}
          {(item.metaTitle || item.metaDescription) && (
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/80 space-y-2 text-xs">
              <p className="font-bold text-gray-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Meta / SEO Tag Data
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                <div>
                  <span className="font-semibold text-gray-800">
                    Meta Title:
                  </span>{" "}
                  {item.metaTitle || item.blogTitle}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">
                    Meta Description:
                  </span>{" "}
                  {item.metaDescription || item.blogDescription || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-gray-50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
