/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Images } from "@/src/app/exports";

type Props = {
  images: any[];
};

const isImageFileUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.trim().toLowerCase();

  if (
    !cleanUrl.startsWith("http://") &&
    !cleanUrl.startsWith("https://") &&
    !cleanUrl.startsWith("/")
  ) {
    return false;
  }

  const invalidPatterns = [
    "yelp.ca",
    "yelp.com",
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    ".pdf",
    ".mp4",
    ".mov",
    ".avi",
    ".webm",
    ".doc",
    ".docx",
    "utm_campaign",
  ];

  if (invalidPatterns.some((pattern) => cleanUrl.includes(pattern))) {
    const pathname = cleanUrl.split("?")[0];
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".avif",
      ".gif",
      ".svg",
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      pathname.endsWith(ext),
    );
    if (!hasValidExtension) {
      return false;
    }
  }

  return true;
};

const extractImageUrl = (img: any): string => {
  if (!img) return "";
  if (typeof img === "string") {
    return isImageFileUrl(img) ? img : "";
  }

  if (img?.MediaCategory) {
    const category = String(img.MediaCategory).toLowerCase();
    if (
      [
        "video",
        "virtual tour",
        "audio",
        "document",
        "link",
        "brochure",
      ].includes(category)
    ) {
      return "";
    }
  }

  const candidateUrl = img?.MediaURL || img?.url || img?.src || "";
  if (typeof candidateUrl === "string" && isImageFileUrl(candidateUrl)) {
    return candidateUrl;
  }

  return "";
};

export default function PropertyGallery({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (url: string) => {
    if (url) {
      setFailedImages((prev) => ({ ...prev, [url]: true }));
    }
  };

  // Filter valid image URLs from images prop
  const validImageUrls = (images || [])
    .map(extractImageUrl)
    .filter((url) => url.length > 0);

  // If no valid image URLs are found, use default fallback image
  const displayImages =
    validImageUrls.length > 0 ? validImageUrls : [Images.apartment];

  const visibleImages = displayImages.slice(0, 5);

  const getSrc = (url: string) => {
    return failedImages[url] ? Images.apartment : url;
  };

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={`${displayImages.length === 1 ? "flex justify-center" : "flex flex-col md:flex-row flex-nowrap xl:gap-x-5 md:gap-x-3 gap-y-3"} w-full h-full overflow-hidden`}
      >
        {/* Main Image */}
        <div
          className={`${
            displayImages.length === 1 ? "w-1/2" : "md:w-1/2 w-full"
          } xl:h-134 md:h-76.5 h-56.5 relative cursor-pointer md:rounded-2xl rounded-xl`}
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          <Image
            title="Property image"
            src={getSrc(displayImages[0])}
            alt="Property image"
            width={1000}
            height={500}
            loading="eager"
            onError={() => handleImageError(displayImages[0])}
            className="object-cover md:rounded-2xl rounded-xl w-full h-full"
          />
        </div>

        {/* Thumbnails */}
        {visibleImages.length > 1 && (
          <div className="flex flex-row flex-wrap justify-between md:w-1/2 w-full h-auto gap-y-2.5">
            {visibleImages.slice(1).map((imgUrl, i) => {
              const isLast = i === 3 && displayImages.length > 5;

              return (
                <div
                  key={i}
                  className="relative w-[49%] xl:h-65.75 h-37 md:rounded-2xl rounded cursor-pointer overflow-hidden"
                  onClick={() => {
                    setIndex(i + 1);
                    setOpen(true);
                  }}
                >
                  <Image
                    title="Property image"
                    src={getSrc(imgUrl)}
                    alt={`Thumbnail ${i + 1}`}
                    width={450}
                    height={300}
                    loading="eager"
                    onError={() => handleImageError(imgUrl)}
                    className="object-cover md:rounded-2xl rounded w-full h-full"
                  />

                  {/* +N Overlay */}
                  {isLast && (
                    <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center w-full h-full">
                      <span className="text-background text-xl font-bold bg-[#305487bf] rounded-lg p-5">
                        +{displayImages.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={displayImages.map((url) => ({ src: getSrc(url) }))}
      />
    </>
  );
}
