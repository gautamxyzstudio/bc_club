"use client";

import React, { useMemo } from "react";
import { Icons } from "../exports";
import Image from "next/image";
import BlogCard from "@/src/components/common/blogCard/BlogCard";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import Link from "next/link";
import { useGetBlogs } from "@/src/hooks/blogs/useBlogQueries";
import { getBlogImageUrl } from "@/src/api/blogs/blogsApi";

const Page = () => {
  // Query live blogs from API with loading state
  const { data: blogsResponse, isLoading } = useGetBlogs();

  // Normalize & sort Strapi blogs data descending (newest date first)
  const blogs: any[] = useMemo(() => {
    if (!blogsResponse) return [];
    const data = blogsResponse.data || blogsResponse;
    if (!Array.isArray(data)) return [];

    return data
      .map((item: any) => {
        if (item.attributes) {
          return {
            id: item.id,
            documentId: item.documentId || item.id,
            ...item.attributes,
          };
        }
        return item;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [blogsResponse]);

  // Featured main blog (1st)
  const firstBlog = blogs.length > 0 ? blogs[0] : null;

  // Latest 2 blogs for the right side (2nd, 3rd)
  const rightBlogs = blogs.slice(1, 3);

  // Remaining blogs for Recent Blogs section (from 4th onwards, or remaining)
  const remainingBlogs = useMemo(() => {
    if (blogs.length > 3) return blogs.slice(3);
    if (blogs.length > 1) return blogs.slice(1);
    return [];
  }, [blogs]);

  const formatDate = (d: any) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-background overflow-hidden">
        <div className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 mt-7 pt-28 pb-40 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E2E2E]">
            Our <span className="text-[#F4A51C]">Blogs</span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            Stay informed with the latest BC real estate market trends, expert property insights, and home buying & selling guides.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute -bottom-10 left-0 w-full h-70">
          <Image
            title="image title"
            src={Icons.bgWaveLine}
            alt="Wave line"
            fill
            priority
          />
        </div>
      </section>

      {/* ================= LOADING SKELETON STATE ================= */}
      {isLoading ? (
        <>
          <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 mt-8 pt-2 pb-12 sm:pb-16 md:pt-4 md:pb-20 relative z-20">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch animate-pulse">
              {/* Left Big Card Skeleton */}
              <div className="lg:w-1/2 bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between border border-gray-100">
                <div className="relative w-full aspect-[16/9] bg-gray-200 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-[#F4A51C] rounded-full animate-spin"></div>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>

              {/* Right 2 Cards Skeleton */}
              <div className="lg:w-1/2 flex flex-col gap-5 justify-between">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-center border border-gray-100"
                  >
                    <div className="w-full sm:w-56 md:w-60 lg:w-64 aspect-[16/9] rounded-2xl bg-gray-200 shrink-0"></div>
                    <div className="flex-1 w-full space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Blogs Skeleton */}
          <div className="bg-[#F0F0F0] xl:max-w-screen-2xl mx-auto p-5 sm:p-7 lg:p-8 rounded-3xl mb-16 md:mb-24 animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg w-44 mb-5"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden p-4 space-y-3 border border-gray-100">
                  <div className="w-full aspect-[16/9] bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : blogs.length === 0 ? (
        /* Empty State */
        <section className="xl:max-w-screen-2xl mx-auto px-6 py-20 text-center relative z-20">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-[#F4A51C] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Blogs Published Yet</h3>
            <p className="text-gray-500 text-sm">Check back soon for latest real estate updates and articles.</p>
          </div>
        </section>
      ) : (
        /* ================= BLOG CARDS SECTION ================= */
        <>
          <section className="xl:max-w-screen-2xl mx-auto xl:px-16 md:px-13 px-6 mt-8 pt-2 pb-12 sm:pb-16 md:pt-4 md:pb-20 relative z-20">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* ===== LEFT BIG CARD ===== */}
              {firstBlog && (
                <div className="lg:w-1/2 bg-white rounded-2xl overflow-hidden group shadow-xs flex flex-col justify-between border border-gray-100">
                  <Link
                    href={`/blogs/${firstBlog.slug}`}
                    className="block flex-1 flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-50 overflow-hidden flex items-center justify-center">
                      <Image
                        title={firstBlog.blogTitle}
                        src={getBlogImageUrl(firstBlog.blogImage)}
                        alt={firstBlog.blogTitle || "Smart Property Investment"}
                        fill
                        className="object-contain rounded-t-2xl group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col gap-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#22558B] font-medium">
                          {firstBlog.category || "Real Estate"}
                        </span>
                        {firstBlog.date && (
                          <span className="text-[#22558B]">
                            {formatDate(firstBlog.date || firstBlog.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg sm:text-xl font-bold text-[#2E2E2E] group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {firstBlog.blogTitle}
                        </h3>
                        <div className="shrink-0 pt-0.5">
                          <Image
                            title="image title"
                            alt="Arrow"
                            width={32}
                            height={32}
                            src={Icons.arrowup}
                            className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5"
                          />
                        </div>
                      </div>

                      {firstBlog.blogDescription && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {firstBlog.blogDescription}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* ===== RIGHT SIDE (LATEST 2 BLOGS) ===== */}
              {rightBlogs.length > 0 && (
                <div className="lg:w-1/2 flex flex-col gap-5 justify-start">
                  {rightBlogs.map((blog) => (
                    <div
                      key={blog.id || blog.slug}
                      className="group bg-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-center border border-gray-100"
                    >
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="flex flex-col sm:flex-row gap-5 w-full items-center"
                      >
                        {/* Fixed Image Container with aspect-16/9 */}
                        <div className="relative w-full sm:w-56 md:w-60 lg:w-64 aspect-[16/9] rounded-2xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                          <Image
                            title={blog.blogTitle}
                            src={getBlogImageUrl(blog.blogImage)}
                            alt={blog.blogTitle || "Blog thumbnail"}
                            className="object-contain rounded-2xl group-hover:scale-103 transition-transform duration-500"
                            fill
                            sizes="(max-width: 640px) 100vw, 280px"
                          />
                        </div>

                        {/* Blog Info & Animated Golden Arrow */}
                        <div className="flex flex-col gap-y-2.5 justify-between flex-1 w-full py-1">
                          <div>
                            {blog.date && (
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-[#22558B] font-semibold">
                                  {formatDate(blog.date || blog.createdAt)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-base sm:text-lg font-bold text-[#2E2E2E] group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                {blog.blogTitle}
                              </h4>
                              <div className="shrink-0 pt-0.5">
                                <Image
                                  title="image title"
                                  alt="Arrow"
                                  width={32}
                                  height={32}
                                  src={Icons.arrowup}
                                  className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5"
                                />
                              </div>
                            </div>
                          </div>

                          {blog.blogDescription && (
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                              {blog.blogDescription}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ================= RECENT BLOGS ================= */}
          {remainingBlogs.length > 0 && (
            <div className="bg-[#F0F0F0] xl:max-w-screen-2xl mx-auto p-5 sm:p-7 lg:p-8 rounded-3xl mb-16 md:mb-24">
              <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-[#2E2E2E]">
                Recent Blogs
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {remainingBlogs.map((blog, idx) => (
                  <div
                    key={blog.id || blog.slug || idx}
                    className="w-full"
                  >
                    <BlogCard
                      title={blog.blogTitle}
                      image={getBlogImageUrl(blog.blogImage)}
                      description={blog.blogDescription || ""}
                      href={`/blogs/${blog.slug}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <GetInTouch />
    </>
  );
};

export default Page;
