import React from "react";
import AdminBlogsDashboard from "@/src/mainComponents/admin/AdminBlogsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Management | Admin Dashboard | BC Real Estate",
  description: "Manage active real estate blog posts, view and edit field data, and create new articles.",
};

export default function AdminBlogsPage() {
  return <AdminBlogsDashboard />;
}
