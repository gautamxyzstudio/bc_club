import React from "react";
import AdminUsersDashboard from "@/src/mainComponents/admin/AdminUsersDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users Management | Admin Dashboard | BC Real Estate",
  description: "Manage registered user accounts, authentication statuses, and role privileges.",
};

export default function AdminUsersPage() {
  return <AdminUsersDashboard />;
}
