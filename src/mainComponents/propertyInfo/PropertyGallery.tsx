"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Props = {
  images: string[];
};

export default function PropertyGallery({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const visibleImages = images.slice(0, 5);

  return (
    <>
      {/* Gallery Grid */}
      <div className="flex flex-col md:flex-row flex-nowrap xl:gap-x-5 md:gap-x-3 gap-y-3 w-full h-full overflow-hidden">
        {/* Main Image */}
        <div
          className="md:w-1/2 w-full xl:h-134 md:h-76.5 h-56.5 relative cursor-pointer md:rounded-2xl rounded-xl"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          <Image
            src={images[0]}
            alt="Property image"
            width={1020}
            height={450}
            className="object-cover md:rounded-2xl rounded-xl w-full h-full"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex flex-row flex-wrap justify-between md:w-1/2 w-full h-auto gap-y-2.5">
          {visibleImages.slice(1).map((img, i) => {
            const isLast = i === 3 && images.length > 5;

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
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  width={450}
                  height={300}
                  className="object-cover md:rounded-2xl rounded w-full h-full"
                />

                {/* +N Overlay */}
                {isLast && (
                  <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center w-full h-full">
                    <span className="text-background text-xl font-bold bg-[#305487bf] rounded-lg p-5">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
}
