import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/src/app/exports";

interface BlogCardProps {
  image: string;
  title: string;
  description: string;
  href?: string;
  date?: string;
  category?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  href = "/blogs",
}) => {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer border border-gray-100"
    >
      {/* Image Container - object-contain ensures full image is visible without getting cut */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-slate-50 flex items-center justify-center">
        <Image
          title="image title"
          src={image || "/blogimg.webp"}
          alt={title || "Blog Image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain rounded-xl group-hover:scale-103 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {title}
            </h3>

            <div className="shrink-0 pt-0.5">
              <Image
                title="image title"
                alt="Arrow"
                width={28}
                height={28}
                src={Icons.arrowup}
                className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
