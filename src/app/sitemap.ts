import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_MAIN_URL;

  // Static pages
  const routes = [
    "",
    "/home-estimation",
    "/market-trends",
    "/market-trends/monthly-sale-cart",
    "/market-trends/monthly-sale-reports",
    "/market-trends/stats-map",
    "/blogs",
    "/properties",
    "/map-search",
    "/contact-us",
    "/our-story",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticPages];
}
