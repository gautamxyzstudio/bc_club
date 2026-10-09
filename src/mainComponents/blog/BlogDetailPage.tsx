/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/src/components/common/blogCard/BlogCard";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import { useGetBlogBySlug, useGetBlogs } from "@/src/hooks/blogs/useBlogQueries";
import { getBlogImageUrl, decodeHtmlEntities } from "@/src/api/blogs/blogsApi";
import { Images, Icons } from "@/src/app/exports";

const BlogDetailPage = ({ slug }: { slug: string }) => {

  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch blog by slug with loading state
  const { data: blogResponse, isLoading } = useGetBlogBySlug(slug, {
    enabled: !!slug,
  });

  // Fetch all blogs for "Recently Blogs"
  const { data: allBlogsResponse } = useGetBlogs();

  const blog = useMemo(() => {
    if (!blogResponse) return null;
    const data = blogResponse.data || blogResponse;
    if (data?.attributes) {
      return {
        id: data.id,
        documentId: data.documentId || data.id,
        ...data.attributes,
      };
    }
    return data;
  }, [blogResponse]);

  const recentBlogs = useMemo(() => {
    if (!allBlogsResponse) return [];
    const data = allBlogsResponse.data || allBlogsResponse;
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
      .filter((item: any) => item.slug !== slug)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [allBlogsResponse, slug]);

  // Process content to inject IDs into h2/h3 headings and extract TOC items
  const { renderedContent, tocItems } = useMemo(() => {
    if (!blog?.blogContent) return { renderedContent: null, tocItems: [] };
    const rawContent = decodeHtmlEntities(blog.blogContent);

    // Convert any h1 tags in blog content to h2 tags
    const normalizedContent = rawContent
      .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
      .replace(/<\/h1>/gi, "</h2>");

    const items: { label: string; id: string }[] = [];
    let count = 0;

    const processedContent = normalizedContent.replace(
      /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
      (match, level, attrs, innerText) => {
        const plainText = innerText
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!plainText) return match;

        count++;
        const id = `heading-${count}`;
        items.push({
          label: plainText,
          id,
        });

        const cleanAttrs = attrs.replace(/\s+id=(['"]).*?\1/gi, "").trim();
        const attrsString = cleanAttrs ? ` ${cleanAttrs}` : "";
        return `<h${level} id="${id}"${attrsString}>${innerText}</h${level}>`;
      }
    );

    return { renderedContent: processedContent, tocItems: items };
  }, [blog?.blogContent]);

  const isClickScrolling = useRef(false);
  const clickScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (id: string, index: number, label?: string) => {
    setActiveIndex(index);
    isClickScrolling.current = true;
    if (clickScrollTimeoutRef.current) {
      clearTimeout(clickScrollTimeoutRef.current);
    }
    clickScrollTimeoutRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);

    if (typeof document !== "undefined") {
      let target = document.getElementById(id);
      if (!target && label) {
        const headings = Array.from(document.querySelectorAll("h2, h3"));
        target = (headings.find((h) => h.textContent?.trim() === label) as HTMLElement) || null;
      }

      if (target) {
        const headerOffset = 110;
        const elementPosition = target.getBoundingClientRect().top;
        const currentScroll = window.scrollY || document.documentElement.scrollTop;
        const offsetPosition = elementPosition + currentScroll - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  // Scroll spy to highlight active TOC heading on scroll
  useEffect(() => {
    if (tocItems.length === 0) return;

    let rafId: number | null = null;

    const handleScrollSpy = () => {
      if (isClickScrolling.current) return;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;

        // If user reached near bottom of page, highlight the last TOC item
        if (scrollTop + clientHeight >= scrollHeight - 80) {
          setActiveIndex(tocItems.length - 1);
          return;
        }

        const offset = 140; // Top offset threshold
        let currentActiveIndex = 0;

        for (let i = 0; i < tocItems.length; i++) {
          const item = tocItems[i];
          let el = document.getElementById(item.id);
          if (!el && item.label) {
            const headings = Array.from(document.querySelectorAll("h2, h3"));
            el = (headings.find((h) => h.textContent?.trim() === item.label) as HTMLElement) || null;
          }

          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= offset) {
              currentActiveIndex = i;
            } else {
              break;
            }
          }
        }

        setActiveIndex(currentActiveIndex);
      });
    };

    const handleUserInteraction = () => {
      isClickScrolling.current = false;
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });

    handleScrollSpy();
    const timer = setTimeout(handleScrollSpy, 250);

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      clearTimeout(timer);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (clickScrollTimeoutRef.current) {
        clearTimeout(clickScrollTimeoutRef.current);
      }
    };
  }, [tocItems]);

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          window.location.href
        )}`,
        "_blank"
      );
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          window.location.href
        )}&text=${encodeURIComponent(blog?.blogTitle || "BC Real Estate Blog")}`,
        "_blank"
      );
    }
  };

  const handleShareLinkedIn = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          window.location.href
        )}`,
        "_blank"
      );
    }
  };

  // ================= LOADING SKELETON STATE =================
  if (isLoading) {
    return (
      <>
        <section className="pt-24 sm:pt-28 pb-12 sm:pb-16">
          <div className="xl:max-w-screen-2xl mx-auto px-6 xl:px-16 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="mt-2 mb-6">
              <div className="h-8 w-60 bg-gray-200 rounded-xl"></div>
            </div>

            {/* Title Skeleton */}
            <div className="h-10 bg-gray-200 rounded-xl w-3/4 max-w-3xl mb-6"></div>

            <div className="flex flex-row items-start flex-nowrap gap-5">
              {/* Left column */}
              <div className="flex flex-col xl:w-[70%] w-full">
                {/* Image Skeleton */}
                <div className="relative w-full aspect-[16/9] rounded-2xl bg-gray-200 mb-8 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-[#F4A51C] rounded-full animate-spin"></div>
                </div>

                {/* Content Skeletons */}
                <div className="space-y-4">
                  <div className="h-7 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>

                  <div className="h-7 bg-gray-200 rounded-lg w-1/4 mt-8 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>

              {/* Right sidebar Skeleton */}
              <aside className="bg-white rounded-2xl p-4 xl:w-[30%] w-full xl:block hidden border border-gray-100 shadow-xs">
                <div className="bg-amber-100/60 rounded-xl p-4 mb-6 space-y-3">
                  <div className="h-4 bg-amber-200 rounded w-2/3"></div>
                  <div className="flex gap-3">
                    <div className="w-9 h-8 rounded-lg bg-amber-200"></div>
                    <div className="w-9 h-8 rounded-lg bg-amber-200"></div>
                    <div className="w-9 h-8 rounded-lg bg-amber-200"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </aside>
            </div>
          </div>
        </section>
        <GetInTouch />
      </>
    );
  }

  // ================= NOT FOUND STATE =================
  if (!isLoading && !blog && slug !== "blog-detail") {
    return (
      <>
        <section className="pt-32 pb-24 text-center min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-amber-50 text-[#F4A51C] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
            <p className="text-gray-500 mb-6">
              The article you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              ← Back to All Blogs
            </Link>
          </div>
        </section>
        <GetInTouch />
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .btn{
            display: flex !important
          }
            .cta .agent .btn.line, .cta h2{
            color: white !important;
            }
          section, .wrap{
            padding: 0 !important;
          }
            .hero #heading-1{
            font-size: clamp(40px, 7vw, 78px);
            font-weight: 600;
            max-width: 13ch;
            color: white !important;
            }
            .hero .wrap{
            padding: 0 22px !important;
            }
             .wrap section{
              padding-top: 50px !important;
              padding-bottom: 0px !important;
            }
             @media (max-width: 768px) {
              .wrap section{
              padding-top: 20px !important;
              padding-bottom: 0px !important;
            }
        }
       
        
        `}
      </style>
      <section className="mt-20 sm:mt-24 mb-12 sm:mb-16">
        <div className="xl:max-w-screen-2xl mx-auto px-6 xl:px-16">
          {/* ===== BREADCRUMB ===== */}
          <div className="mb-6 mt-6">
            <nav
              aria-label="Breadcrumb"
              className="inline-flex items-center flex-wrap gap-2 bg-[#F2F2F2] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-gray-200/60 shadow-xs"
            >
              <Link
                href="/"
                className="text-gray-600 hover:text-[#F4A51C] transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              <span className="text-gray-400">/</span>

              <Link
                href="/blogs"
                className="text-gray-600 hover:text-[#F4A51C] transition-colors"
              >
                Blogs
              </Link>
              <span className="text-gray-400">/</span>

              <span className="text-[#F4A51C] font-semibold truncate max-w-[200px] sm:max-w-md md:max-w-xl">
                {blog?.blogTitle || "Article"}
              </span>
            </nav>
          </div>

          <div className="flex flex-col">
            {/* ================= LEFT CONTENT ================= */}
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6">
              {blog?.blogTitle || "Smart Property Investment In 2025"}
            </h1>

            <div className="flex flex-row items-start flex-nowrap gap-5">
              <div className="flex flex-col xl:w-[70%] w-full">
                {/* Featured Image */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-slate-50 flex items-center justify-center border border-gray-100 shadow-xs">
                  <Image
                    title={blog?.blogTitle || "Blog image"}
                    src={
                      blog
                        ? getBlogImageUrl(blog.blogImage)
                        : Images.blogimg
                    }
                    alt={blog?.blogTitle || "Blog image"}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 70vw"
                    className="object-contain"
                  />
                </div>

                {/* Content */}
                {renderedContent ? (
                  <div
                    className="space-y-6 text-gray-600 text-sm sm:text-base leading-relaxed [&_h2]:text-2xl [&_h2]:text-black [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:scroll-mt-28 [&_h3]:text-xl [&_h3]:text-black [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:scroll-mt-28 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:rounded-xl [&_img]:my-4 [&_a]:text-[#22558B] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                ) : (
                  <div className="text-gray-500 py-8 italic">
                    No content available for this blog post.
                  </div>
                )}
              </div>

              {/* ================= RIGHT SIDEBAR ================= */}
              <aside className="bg-white rounded-2xl p-4 h-fit sticky top-28 self-start xl:w-[30%] w-full xl:block hidden border border-gray-100 shadow-xs">
                {/* Share box */}
                <div className="bg-[#EEA500] rounded-xl p-4 mb-6">
                  <p className="text-white text-sm mb-3 font-medium">
                    Share with your community!
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      className="cursor-pointer transition hover:opacity-80"
                      title="Share on Facebook"
                    >
                      <Image
                        title="Facebook"
                        src={Icons.facebookicon}
                        alt="Facebook"
                        width={35}
                        height={30}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareTwitter}
                      className="cursor-pointer transition hover:opacity-80"
                      title="Share on Twitter"
                    >
                      <Image
                        title="Twitter"
                        src={Icons.twittericon}
                        alt="Twitter"
                        width={35}
                        height={30}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareLinkedIn}
                      className="cursor-pointer transition hover:opacity-80"
                      title="Share on LinkedIn"
                    >
                      <Image
                        title="LinkedIn"
                        src={Icons.linkedin}
                        alt="LinkedIn"
                        width={35}
                        height={30}
                      />
                    </button>
                  </div>
                </div>

                {/* In this article */}
                {tocItems.length > 0 && (
                  <>
                    <h3 className="text-[20px] font-bold text-[#2E2E2E] mb-4">
                      In this article
                    </h3>

                    <ul className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                      {tocItems.map((item, index) => (
                        <li
                          key={item.id || index}
                          onClick={() => handleScroll(item.id, index, item.label)}
                          className="cursor-pointer relative pl-4 select-none"
                        >
                          <span
                            className={`absolute left-0 top-0 h-full w-[3px] rounded-full transition-all duration-200 ${
                              activeIndex === index
                                ? "bg-[#22558B] opacity-100"
                                : "bg-transparent opacity-0"
                            }`}
                          />

                          <span
                            className={`text-sm leading-6 block transition-colors duration-200 ${
                              activeIndex === index
                                ? "text-[#22558B] font-semibold"
                                : "text-gray-600 hover:text-gray-900 font-normal"
                            }`}
                          >
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT BLOGS ================= */}
      <div className="xl:max-w-screen-2xl mx-auto px-6 xl:px-16 mt-8 md:mt-24 mb-16 md:mb-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-[#2E2E2E]">
          Recent Blogs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {recentBlogs.length > 0 ? (
            recentBlogs.map((item: any) => (
              <div key={item.id || item.slug} className="w-full">
                <BlogCard
                  title={item.blogTitle}
                  image={getBlogImageUrl(item.blogImage)}
                  description={item.blogDescription || ""}
                  href={`/blogs/${item.slug}`}
                />
              </div>
            ))
          ) : (
            <>
              <div className="w-full">
                <BlogCard
                  title="Bill Walsh leadership lessons"
                  image={Images.leadership}
                  description="Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning Dynasty?"
                />
              </div>

              <div className="w-full">
                <BlogCard
                  title="Bill Walsh leadership lessons"
                  image={Images.billwalsh}
                  description="Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning Dynasty?"
                />
              </div>

              <div className="w-full">
                <BlogCard
                  title="Bill Walsh leadership lessons"
                  image={Images.saleimg}
                  description="Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning Dynasty?"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <GetInTouch />
    </>
  );
}

export default BlogDetailPage