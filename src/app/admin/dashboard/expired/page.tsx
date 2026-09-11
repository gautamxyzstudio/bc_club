import React from "react";
import AdminPropertiesDashboard from "@/src/mainComponents/admin/AdminPropertiesDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expired Properties | Admin Dashboard | BC Real Estate",
  description: "Track, inspect, and update expired property listings, view and edit field data, and rearrange photos.",
};

export default function ExpiredPropertiesPage() {
  return <AdminPropertiesDashboard currentStatus="expired" />;
}
