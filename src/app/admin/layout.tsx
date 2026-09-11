"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LogIn,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ChevronRight,
  User,
  Menu,
  X,
  Sparkles,
  Gavel,
} from "lucide-react";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { isAdminUser } from "@/src/utilities/authUtils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoggedIn, username, authLoading, setOpenLogin, logoutUser } =
    useAuthContext();

  const [previewBypass, setPreviewBypass] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check if current user is admin
  const isAdmin = isAdminUser(username) || previewBypass;

  const navItems = [
    {
      label: "Active Listings",
      href: "/admin/dashboard/active",
      icon: CheckCircle2,
      badge: "Market",
      badgeColor: "bg-emerald-100 text-emerald-800",
      activeColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Sold Listings",
      href: "/admin/dashboard/sold",
      icon: Clock,
      badge: "History",
      badgeColor: "bg-purple-100 text-purple-800",
      activeColor: "text-purple-600 bg-purple-50",
    },
    {
      label: "Expired Listings",
      href: "/admin/dashboard/expired",
      icon: AlertCircle,
      badge: "Archive",
      badgeColor: "bg-rose-100 text-rose-800",
      activeColor: "text-rose-600 bg-rose-50",
    },
    {
      label: "Foreclosure List",
      href: "/admin/dashboard/foreclosure",
      icon: Gavel,
      badge: "Distressed",
      badgeColor: "bg-amber-100 text-amber-800",
      activeColor: "text-amber-700 bg-amber-50",
    },
  ];

  // Auth Loading Skeleton
  if (authLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-700">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not Logged In or Not Admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Admin Access Required</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This dashboard is restricted to users with the <strong>Admin</strong> role. Please log in with an administrator account to continue.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setOpenLogin(true)}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary2 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In as Admin
            </button>

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Public Website
            </Link>
          </div>

          {/* Dev/Demo bypass option for easy previewing */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setPreviewBypass(true)}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Preview Dashboard as Admin (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 pb-16">
      <div className="xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Mobile Sidebar Toggle */}
          <div className="w-full lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                BC
              </div>
              <span className="text-sm font-bold text-gray-900">Admin Control Panel</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* SIDEBAR NAVIGATION */}
          <aside
            className={`w-full lg:w-72 bg-white rounded-3xl p-5 shadow-xs border border-gray-100 shrink-0 space-y-6 lg:block ${
              mobileSidebarOpen ? "block" : "hidden"
            }`}
          >
            {/* Admin Profile Card */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-2xl border border-blue-100/60">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {username?.fullName?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {username?.fullName || "Administrator"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">
                    Admin Active
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="space-y-1.5">
              <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                Listing Routes
              </p>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group ${
                      isActive
                        ? `${item.activeColor} shadow-xs font-bold`
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white shadow-xs" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Links Section */}
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
              <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                Quick Actions
              </p>

              <Link
                href="/properties"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Public Properties
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" />
                  Main Website
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  logoutUser();
                  setPreviewBypass(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </aside>

          {/* MAIN DASHBOARD CONTENT */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
