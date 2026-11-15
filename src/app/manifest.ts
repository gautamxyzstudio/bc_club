import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BC Real Estate Market",
    short_name: "BC Real Estate",
    description: "See what the listing doesn't tell you.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1E4E8C",
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/app-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
