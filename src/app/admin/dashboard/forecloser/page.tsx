import React from "react";
import AdminPropertiesDashboard from "@/src/mainComponents/admin/AdminPropertiesDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forecloser Properties | Admin Dashboard | BC Real Estate",
  description:
    "Manage distressed and foreclosed properties copied from the real estate board. View and edit all field data and rearrange media photos.",
};

export default function ForecloserPropertiesPage() {
  return <AdminPropertiesDashboard currentStatus="foreclosure" />;
}
