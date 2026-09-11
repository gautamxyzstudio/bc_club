import React from "react";
import AdminPropertiesDashboard from "@/src/mainComponents/admin/AdminPropertiesDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active Properties | Admin Dashboard | BC Real Estate",
  description: "Manage active properties, view and edit field data, and rearrange media photos.",
};

export default function ActivePropertiesPage() {
  return <AdminPropertiesDashboard currentStatus="active" />;
}
