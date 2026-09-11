import React from "react";
import AdminPropertiesDashboard from "@/src/mainComponents/admin/AdminPropertiesDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sold Properties | Admin Dashboard | BC Real Estate",
  description: "Manage and inspect sold property archives, view and edit field data, and rearrange photos.",
};

export default function SoldPropertiesPage() {
  return <AdminPropertiesDashboard currentStatus="sold" />;
}
