"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  RefreshCw,
  LayoutGrid,
  List,
  Calendar,
  BookOpen,
  FileText,
  Copy,
  Check,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetBlogs } from "@/src/hooks/blogs/useBlogQueries";
import { getBlogImageUrl } from "@/src/api/blogs/blogsApi";
import BlogFormModal from "./BlogFormModal";
import BlogViewModal from "./BlogViewModal";
import BlogDeleteModal from "./BlogDeleteModal";

export default function AdminBlogsDashboard() {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedBlogForEdit, setSelectedBlogForEdit] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBlogForView, setSelectedBlogForView] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlogForDelete, setSelectedBlogForDelete] = useState<any>(null);

  // Copied slug state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Query blogs from API
  const { data: blogsResponse, isLoading, isFetching, refetch } = useGetBlogs();

  // Normalize Strapi data
  const rawBlogs: any[] = useMemo(() => {
    if (!blogsResponse) return [];
    const data = blogsResponse.data || blogsResponse;
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      if (item.attributes) {
        return {
          id: item.id,
          documentId: item.documentId || item.id,
          ...item.attributes,
        };
      }
      return item;
    });
  }, [blogsResponse]);

  // Filter & Sort blogs
  const filteredBlogs = useMemo(() => {
    return rawBlogs
      .filter((blog) => {
        const title = (blog.blogTitle || "").toLowerCase();
        const desc = (blog.blogDescription || "").toLowerCase();
        const slug = (blog.slug || "").toLowerCase();
        const search = searchTerm.toLowerCase().trim();

        return (
          !search ||
          title.includes(search) ||
          desc.includes(search) ||
          slug.includes(search)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return (a.blogTitle || "").localeCompare(b.blogTitle || "");
        }
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [rawBlogs, searchTerm, sortBy]);

  // Paginated slice
  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
  const totalCount = rawBlogs.length;

  const latestPublishDate = useMemo(() => {
    if (rawBlogs.length === 0) return "None";
    const sorted = [...rawBlogs].sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0).getTime() -
        new Date(a.date || a.createdAt || 0).getTime()
    );
    const d = sorted[0]?.date || sorted[0]?.createdAt;
    return d
      ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Recently";
  }, [rawBlogs]);

  const handleCopySlug = (slugText: string) => {
    navigator.clipboard.writeText(slugText);
    setCopiedSlug(slugText);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleOpenCreate = () => {
    setSelectedBlogForEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setSelectedBlogForEdit(blog);
    setFormModalOpen(true);
  };

  const handleOpenView = (blog: any) => {
    setSelectedBlogForView(blog);
    setViewModalOpen(true);
  };

  const handleOpenDelete = (blog: any) => {
    setSelectedBlogForDelete(blog);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              ADMIN PORTAL
            </span>
            <span className="text-xs text-gray-400 font-medium">•</span>
            <span className="text-xs text-gray-500 font-medium">
              Blog Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-2">
            Blog Management
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Manage blogs on market, create new blogs with rich text editor, update content, and view or delete posts.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary2 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Blog</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Blogs */}
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              TOTAL IN BLOGS
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {isLoading ? "..." : totalCount.toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
              Real-time sync
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Latest Post */}
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              LATEST PUBLISH
            </p>
            <h3 className="text-lg font-bold text-purple-700 mt-1 truncate max-w-[140px]">
              {latestPublishDate}
            </h3>
            <span className="text-xs text-purple-600 font-medium mt-1 inline-block">
              Publication Date
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Public Website */}
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              PUBLIC WEBSITE
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              View Blogs
            </h3>
            <Link
              href="/blogs"
              target="_blank"
              className="text-xs text-amber-600 font-medium hover:underline mt-1 inline-block"
            >
              Switch to /blogs →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, slug, excerpt..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Layout Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-primary shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-primary shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition cursor-pointer disabled:opacity-50"
            title="Refresh Blogs"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Blog Listing Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-xs text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-700">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 sm:p-16 border border-gray-100 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">No blog posts found</h3>
            <p className="text-xs text-gray-500">
              {searchTerm
                ? "No blogs match your current search. Try clearing your filters."
                : "You have not created any blog posts yet. Start by creating your first blog!"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary2 text-white text-xs font-bold transition shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Blog</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 select-none">
                  <th className="py-3 px-6">TITLE</th>
                  <th className="py-3 px-4 text-center">SLUG</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedBlogs.map((blog) => {
                  const imageUrl = getBlogImageUrl(blog.blogImage);
                  const formattedDate = blog.date
                    ? new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recently";

                  return (
                    <tr
                      key={blog.slug || blog.id}
                      className="hover:bg-slate-50/70 transition group"
                    >
                      {/* Title + Thumbnail */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3.5 min-w-[280px] max-w-md">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={blog.blogTitle || "Blog thumbnail"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4
                              onClick={() => handleOpenView(blog)}
                              className="font-bold text-gray-900 hover:text-primary cursor-pointer truncate text-sm transition"
                              title={blog.blogTitle}
                            >
                              {blog.blogTitle}
                            </h4>
                            <p className="text-[11px] text-gray-500 line-clamp-1">
                              {blog.blogDescription || "No excerpt provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-600 bg-gray-100/80 px-2.5 py-1 rounded-lg max-w-[220px]">
                          <span className="truncate">/{blog.slug}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySlug(`/blogs/${blog.slug}`)}
                            className="text-gray-400 hover:text-primary transition cursor-pointer shrink-0"
                            title="Copy relative URL"
                          >
                            {copiedSlug === `/blogs/${blog.slug}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-600">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(blog)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Preview Blog"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(blog)}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-gray-100 rounded-lg transition"
                            title="View on public site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(blog)}
                            className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Blog"
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
        </div>
      ) : (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedBlogs.map((blog) => {
            const imageUrl = getBlogImageUrl(blog.blogImage);
            const formattedDate = blog.date
              ? new Date(blog.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            return (
              <div
                key={blog.slug || blog.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition group"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={blog.blogTitle || "Cover"}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FileText className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3
                      onClick={() => handleOpenView(blog)}
                      className="font-bold text-base text-gray-900 line-clamp-2 hover:text-primary cursor-pointer transition leading-snug"
                    >
                      {blog.blogTitle}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {blog.blogDescription || "No excerpt specified."}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                      /{blog.slug}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenView(blog)}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(blog)}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-gray-100 rounded-lg transition"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(blog)}
                        className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            Showing Page <span className="font-bold text-gray-800">{page}</span>{" "}
            of <span className="font-bold text-gray-800">{totalPages}</span> (
            {filteredBlogs.length.toLocaleString()} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Current page indicator */}
            <span className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg">
              {page}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BlogFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        blog={selectedBlogForEdit}
        onSuccess={() => refetch()}
      />

      <BlogViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        blog={selectedBlogForView}
        onEdit={(b) => handleOpenEdit(b)}
      />

      <BlogDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        blog={selectedBlogForDelete}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
