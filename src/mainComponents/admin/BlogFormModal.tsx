"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Save,
  Loader2,
  FileText,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Calendar,
  Globe,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import AdminDatePicker from "./AdminDatePicker";
import {
  useCreateBlog,
  useUpdateBlog,
  useUploadBlogMedia,
  useGetBlogBySlug,
} from "@/src/hooks/blogs/useBlogQueries";
import { getBlogImageUrl, decodeHtmlEntities } from "@/src/api/blogs/blogsApi";

interface BlogFormModalProps {
  open: boolean;
  onClose: () => void;
  blog?: any;
  onSuccess?: () => void;
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function BlogFormModal({
  open,
  onClose,
  blog,
  onSuccess,
}: BlogFormModalProps) {
  const isEditMode = !!blog;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const uploadMediaMutation = useUploadBlogMedia();

  const targetSlug = useMemo(() => {
    if (!blog) return "";
    return blog.slug || blog.attributes?.slug || "";
  }, [blog]);

  // Fetch full details if in edit mode to ensure complete content is retrieved
  const { data: fullBlogResponse, isFetching: isFetchingFullBlog } = useGetBlogBySlug(
    targetSlug,
    {
      enabled: open && isEditMode && !!targetSlug,
    }
  );

  // Form states
  const [blogTitle, setBlogTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [blogDescription, setBlogDescription] = useState("");
  const [blogContent, setBlogContent] = useState("");

  // Media state
  const [imageType, setImageType] = useState<"url" | "upload">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<
    number | string | null
  >(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // SEO states
  const [seoOpen, setSeoOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

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

  useEffect(() => {
    if (open) {
      if (blog) {
        const item = blog.attributes
          ? { ...blog.attributes, id: blog.id }
          : blog;
        setBlogTitle(item.blogTitle || "");
        setSlug(item.slug || "");
        setAutoSlug(false);
        setDate(
          item.date
            ? item.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
        );
        setBlogDescription(item.blogDescription || "");
        setBlogContent(decodeHtmlEntities(item.blogContent || ""));
        setMetaTitle(item.metaTitle || item.blogTitle || "");
        setMetaDescription(item.metaDescription || item.blogDescription || "");

        // Media
        setSelectedFile(null);
        if (item.blogImage) {
          const imgUrl = getBlogImageUrl(item.blogImage);
          setImagePreview(imgUrl);
          if (typeof item.blogImage === "string") {
            setImageUrl(item.blogImage);
          } else if (item.blogImage.id) {
            setUploadedMediaId(item.blogImage.id);
          }
        } else {
          setImagePreview(null);
          setImageUrl("");
          setUploadedMediaId(null);
        }
      } else {
        // Reset form for fresh create
        setBlogTitle("");
        setSlug("");
        setAutoSlug(true);
        setDate(new Date().toISOString().split("T")[0]);
        setBlogDescription("");
        setBlogContent("");
        setImageType("upload");
        setImageUrl("");
        setSelectedFile(null);
        setUploadedMediaId(null);
        setImagePreview(null);
        setMetaTitle("");
        setMetaDescription("");
        setSeoOpen(false);
      }
    }
  }, [open, blog]);

  // When full blog details arrive from API, populate rich text content and full metadata
  useEffect(() => {
    if (open && isEditMode && fullBlogResponse) {
      const d = fullBlogResponse.data || fullBlogResponse;
      if (d) {
        const full = d.attributes ? { ...d.attributes, id: d.id } : d;
        if (full.blogTitle) setBlogTitle(full.blogTitle);
        if (full.blogDescription) setBlogDescription(full.blogDescription);
        if (full.date) setDate(full.date.split("T")[0]);
        if (full.blogContent !== undefined && full.blogContent !== null) {
          setBlogContent(decodeHtmlEntities(full.blogContent));
        }
        if (full.metaTitle) setMetaTitle(full.metaTitle);
        if (full.metaDescription) setMetaDescription(full.metaDescription);
        if (full.blogImage && !selectedFile) {
          const imgUrl = getBlogImageUrl(full.blogImage);
          setImagePreview(imgUrl);
          if (typeof full.blogImage === "string") {
            setImageUrl(full.blogImage);
          } else if (full.blogImage.id) {
            setUploadedMediaId(full.blogImage.id);
          }
        }
      }
    }
  }, [open, isEditMode, fullBlogResponse, selectedFile]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBlogTitle(val);
    if (autoSlug) {
      setSlug(generateSlug(val));
    }
    if (!metaTitle || metaTitle === blogTitle) {
      setMetaTitle(val);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    setBlogDescription(val);
    if (!metaDescription || metaDescription === blogDescription) {
      setMetaDescription(val);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only set file for local preview; upload will occur on save
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageUrl("");
    setUploadedMediaId(null);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url || null);
    setSelectedFile(null);
    setUploadedMediaId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blogTitle.trim()) {
      alert("Please enter a blog title.");
      return;
    }

    const finalSlug = slug.trim() || generateSlug(blogTitle);
    if (!finalSlug) {
      alert("Please specify a valid URL slug.");
      return;
    }

    setIsUploadingImage(true);

    try {
      let finalBlogImage: any = undefined;

      // Upload file to Strapi ONLY now upon save
      if (selectedFile) {
        const res = await uploadMediaMutation.mutateAsync(selectedFile);
        const uploadedFile = Array.isArray(res) ? res[0] : res?.data?.[0] || res;
        if (uploadedFile?.id) {
          finalBlogImage = uploadedFile.id;
        }
      } else if (uploadedMediaId) {
        finalBlogImage = uploadedMediaId;
      } else if (imageUrl.trim()) {
        finalBlogImage = imageUrl.trim();
      } else if (imagePreview === null) {
        // User explicitly deleted image
        finalBlogImage = null;
      } else if (blog?.blogImage?.id) {
        finalBlogImage = blog.blogImage.id;
      } else if (typeof blog?.blogImage === "string") {
        finalBlogImage = blog.blogImage;
      }

      const payload: any = {
        blogTitle: blogTitle.trim(),
        slug: finalSlug,
        date: date || new Date().toISOString().split("T")[0],
        blogDescription: blogDescription.trim(),
        blogContent: blogContent || "",
        metaTitle: metaTitle.trim() || blogTitle.trim(),
        metaDescription: metaDescription.trim() || blogDescription.trim(),
      };

      if (finalBlogImage !== undefined) {
        payload.blogImage = finalBlogImage;
      }

      if (isEditMode) {
        const targetSlug = blog.slug || blog.attributes?.slug || slug;
        await updateMutation.mutateAsync({
          slug: targetSlug,
          blogData: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess?.();
      onClose();
    } catch {
      // Handled in react-query mutation toast
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMediaMutation.isPending ||
    isUploadingImage;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gray-50/70 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {isEditMode ? "Edit Blog" : "Create New Blog"}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditMode
                  ? `Editing: ${blog?.blogTitle || blog?.attributes?.blogTitle || slug}`
                  : "Draft, customize, and publish your property & real estate blog"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-5 sm:p-7 space-y-6"
        >
          {/* Main Info Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              General Blog Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Blog Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={blogTitle}
                onChange={handleTitleChange}
                placeholder="e.g. 10 Essential Tips for Buying Your Dream Property in 2026"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                required
              />
            </div>

            {/* Slug & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Slug */}
              <div className="sm:col-span-8">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlug(false);
                      setSlug(generateSlug(blogTitle));
                    }}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">
                    /blogs/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="property-guide-slug"
                    className="w-full pl-17 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    required
                  />
                </div>
              </div>

              {/* Publish Date */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Publish Date
                </label>
                <AdminDatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Select publish date"
                  disableFuture={true}
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Summary / Excerpt
              </label>
              <textarea
                value={blogDescription}
                onChange={handleDescriptionChange}
                rows={2}
                placeholder="A brief snippet or summary about this property guide displayed in blog listings, cards, and social previews..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-y"
              />
            </div>
          </div>

          {/* Featured Cover Image Section */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-primary" />
                Featured Hero Image
              </h3>

              {/* Toggle upload vs URL (when no image is currently selected) */}
              {!imagePreview && (
                <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setImageType("upload")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      imageType === "upload"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-600"
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageType("url")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      imageType === "url"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-600"
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input available for initial upload or replace */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {imagePreview ? (
              /* When Image is Present: Show ONLY the image with Replace & Delete buttons */
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100/70 shadow-xs group">
                <div className="relative w-full h-52 sm:h-64 md:h-72 flex items-center justify-center p-2">
                  <Image
                    src={imagePreview}
                    alt="Featured hero banner"
                    fill
                    className="object-contain drop-shadow-2xs"
                    unoptimized
                  />
                </div>

                {/* Floating Top-Right Action Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (imageType === "url") {
                        setImageType("upload");
                      }
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-md border border-slate-200/90 flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95"
                    title="Replace with a new image"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-primary" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      setImageUrl("");
                      setUploadedMediaId(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Uploading indicator overlay */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-semibold z-20">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Uploading new image...</span>
                  </div>
                )}
              </div>
            ) : (
              /* When No Image is Uploaded: Show Upload Dropzone or URL input across full width */
              <div>
                {imageType === "upload" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 hover:border-primary bg-white hover:bg-blue-50/30 rounded-2xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group w-full"
                  >
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2 text-primary text-xs font-semibold py-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading image to media library...
                      </div>
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-full bg-zinc-100 group-hover:bg-blue-100 group-hover:text-primary text-zinc-500 flex items-center justify-center transition">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-700">
                          Click to upload banner photo or drag & drop
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          PNG, JPG, WEBP, or SVG (Recommended: 1200x630)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 bg-white p-4 rounded-2xl border border-zinc-200">
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/images/blog-banner.jpg"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50/50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Paste a direct HTTPS URL to an external photo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rich Content Editor Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#199250]" />
                Blog Content{" "}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-medium">
                Supports headings, formatting, quotes, links & media
              </span>
            </div>

            {/* Custom Rich Text Editor */}
            <RichTextEditor
              value={blogContent}
              onChange={(content) => setBlogContent(content)}
              placeholder="Write or paste your comprehensive blog content here..."
              minHeight="320px"
            />
          </div>

          {/* SEO & Meta Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-primary" />
                <span>SEO & Meta Tag Configuration</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>
                  {seoOpen
                    ? "Hide SEO fields"
                    : "Customize Search Engine Snippet"}
                </span>
                {seoOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {seoOpen && (
              <div className="p-5 border-t border-slate-200/80 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta Title (Google / Social)
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Title shown in search engine results"
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    placeholder="Description snippet displayed below the link on Google results"
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/70 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !blogTitle.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary2 text-white text-xs font-bold shadow-md shadow-blue-700/10 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {selectedFile && isUploadingImage
                      ? "Uploading & Saving..."
                      : isEditMode
                        ? "Updating Blog..."
                        : "Publishing Blog..."}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {isEditMode ? "Save Changes" : "Publish Blog Post"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
