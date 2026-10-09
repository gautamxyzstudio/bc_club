import React from "react";
import AdminEvaluationRequestsDashboard from "@/src/mainComponents/admin/AdminEvaluationRequestsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Evaluation Requests | Admin Dashboard | BC Real Estate",
  description:
    "Manage and review client home evaluation inquiries and property valuation requests.",
};

export default function AdminEvaluationsPage() {
  return <AdminEvaluationRequestsDashboard />;
}
