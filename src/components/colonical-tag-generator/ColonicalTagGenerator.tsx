"use client";
import { usePathname } from "next/navigation";

export const CanonicalURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_BASE_MAIN_URL;
  const pathName = usePathname();

  return <link rel="canonical" href={baseURL + pathName} />;
};
