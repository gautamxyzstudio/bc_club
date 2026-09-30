"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  Activity,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ArrowUpDown,
  Mail,
  Calendar,
} from "lucide-react";
import { useGetUsers } from "@/src/hooks/users/useUserQueries";
import { StrapiUser } from "@/src/api/users/usersApi";
import UserActivityLogsModal from "./UserActivityLogsModal";
import UserDeleteModal from "./UserDeleteModal";

export default function AdminUsersDashboard() {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "oldest">("name");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const sortOptions: { label: string; value: "name" | "newest" | "oldest" }[] = [
    { label: "Sort by: Name (A-Z)", value: "name" },
    { label: "Sort by: Newest First", value: "newest" },
    { label: "Sort by: Oldest First", value: "oldest" },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] =
    useState<StrapiUser | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<StrapiUser | null>(null);

  // Query users from API
  const { data: users = [], isLoading, isFetching, refetch } = useGetUsers();

  // Filter & Sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const fullName = (user.fullName || "").toLowerCase();
        const search = searchTerm.toLowerCase().trim();

        return (
          !search ||
          username.includes(search) ||
          email.includes(search) ||
          fullName.includes(search)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          const nameA = (a.fullName || a.username || "").toLowerCase();
          const nameB = (b.fullName || b.username || "").toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "oldest") {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        }
        // Default newest
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [users, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const getInitials = (name?: string, username?: string) => {
    const text = name || username || "U";
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Users Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Total <strong>{users.length}</strong> registered user accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50 cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by full name, username, email..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Custom Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort by: Name (A-Z)"}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-full min-w-[200px] z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setPage(1);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filter results counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setPage(1);
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset Search
            </button>
          )}
        </div>
      </div>

      {/* ================= USERS TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">
              Loading user accounts...
            </p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Users Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "No users match your active search term."
                : "No registered user accounts found in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User / Profile</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedUsers.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(user.fullName, user.username)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {user.fullName || user.username}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 font-medium truncate flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForActivity(user);
                              setActivityModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition cursor-pointer"
                            title="View Activity Logs"
                          >
                            <Activity className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForDelete(user);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      <UserActivityLogsModal
        open={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setSelectedUserForActivity(null);
        }}
        user={selectedUserForActivity}
      />

      <UserDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        user={selectedUserForDelete}
      />
    </div>
  );
}
