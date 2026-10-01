"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Activity,
  Clock,
  Home,
  ExternalLink,
  Search,
  Building2,
  Heart,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Tag,
} from "lucide-react";
import { StrapiUser } from "@/src/api/users/usersApi";
import { useGetUserActivityLogs } from "@/src/hooks/activityLog/useActivityLogQueries";
import { useGetUserFavorites } from "@/src/hooks/listing/useRealEstateListingQueries";
import Link from "next/link";

interface UserActivityLogsModalProps {
  open: boolean;
  onClose: () => void;
  user: StrapiUser | null;
  initialTab?: "activity" | "favorites";
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  date: string | null | undefined;
  type: "success" | "info" | "warning" | "purple" | "default";
  icon: React.ReactNode;
  badge?: string;
  link?: string;
}

export default function UserActivityLogsModal({
  open,
  onClose,
  user,
  initialTab = "activity",
}: UserActivityLogsModalProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "favorites">(initialTab);

  // Sync initial tab when opening modal
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Prevent background and dashboard scrolling when modal is open
  useEffect(() => {
    if (open) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector("main");
      const originalMainOverflow = mainEl ? mainEl.style.overflow : "";

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (mainEl) {
        mainEl.style.overflow = "hidden";
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        if (mainEl) {
          mainEl.style.overflow = originalMainOverflow;
        }
      };
    }
  }, [open]);

  // Fetch real activity logs for this user from backend
  const { data: serverLogs = [], isLoading: isLoadingLogs } =
    useGetUserActivityLogs(user?.documentId || user?.id, open);

  // Fetch favorite properties for this user from backend
  const { data: serverFavorites = [], isLoading: isLoadingFavorites } =
    useGetUserFavorites(user?.documentId || user?.id, undefined, {
      enabled: open,
    });

  // Format date helper
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatRelativeTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return "Just now";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return `${diffMonths} mo ago`;
      return `${Math.floor(diffMonths / 12)} yr ago`;
    } catch {
      return "";
    }
  };

  // Compile timeline from real server activity logs only
  const activityEvents: ActivityEvent[] = useMemo(() => {
    if (!user) return [];
    const events: ActivityEvent[] = [];

    const rawLogs =
      Array.isArray(serverLogs) && serverLogs.length > 0
        ? serverLogs
        : Array.isArray(user.activity_logs)
        ? user.activity_logs
        : [];

    if (Array.isArray(rawLogs)) {
      rawLogs.forEach((log: any) => {
        if (!log) return;
        const searchType =
          log.propertySearchType ||
          (log.real_estate_board ? "find_home" : "property_evaluation");

        if (searchType === "find_home" || log.real_estate_board) {
          const board =
            log.real_estate_board ||
            (Array.isArray(log.real_estate_boards)
              ? log.real_estate_boards[0]
              : null);
          const address = board?.address || log.searchTerm || "Property";
          const details: string[] = [];
          if (board?.city) details.push(board.city);
          if (board?.price)
            details.push(`$${Number(board.price).toLocaleString()}`);
          if (board?.bedrooms) details.push(`${board.bedrooms} beds`);
          if (board?.bathrooms) details.push(`${board.bathrooms} baths`);

          const desc =
            details.length > 0
              ? `Searched & viewed listing: ${address} (${details.join(" • ")})`
              : `Searched & viewed listing: ${address}`;

          events.push({
            id: `log-${log.documentId || log.id || Math.random()}`,
            title: `Find Home: ${address}`,
            description: desc,
            date: log.createdAt || log.created_at,
            type: "info",
            icon: <Home className="w-4 h-4 text-blue-600" />,
            badge: "Find Home",
            link: board?.documentId
              ? `/property-info/${board.documentId}`
              : undefined,
          });
        } else if (
          searchType === "property_evaluation" ||
          searchType === "home_assessment" ||
          searchType === "evaluation" ||
          log.property_assignment_list
        ) {
          const assignment =
            log.property_assignment_list ||
            (Array.isArray(log.property_assignment_lists)
              ? log.property_assignment_lists[0]
              : null);
          const address =
            assignment?.address || log.searchTerm || "Assessment Property";
          const details: string[] = [];
          if (assignment?.totalValue)
            details.push(`Value: $${assignment.totalValue}`);
          if (assignment?.roll) details.push(`Roll: ${assignment.roll}`);

          const desc =
            details.length > 0
              ? `Searched & viewed home evaluation: ${address} (${details.join(
                  " • ",
                )})`
              : `Searched & viewed home evaluation: ${address}`;

          events.push({
            id: `log-${log.documentId || log.id || Math.random()}`,
            title: `Evaluation: ${address}`,
            description: desc,
            date: log.createdAt || log.created_at,
            type: "purple",
            icon: <Building2 className="w-4 h-4 text-purple-600" />,
            badge: "Home Assessment",
            link: assignment?.documentId
              ? `/property-assessment/${assignment.documentId}`
              : undefined,
          });
        } else if (log.searchTerm) {
          events.push({
            id: `log-${log.documentId || log.id || Math.random()}`,
            title: `Property Search: ${log.searchTerm}`,
            description: `User performed search query for "${log.searchTerm}"`,
            date: log.createdAt || log.created_at,
            type: "default",
            icon: <Search className="w-4 h-4 text-slate-600" />,
            badge: "Search Query",
          });
        }
      });
    }

    // Sort newest first
    return events.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });
  }, [user, serverLogs]);

  // Compile user's favorite properties list
  const userFavorites = useMemo(() => {
    if (!user) return [];

    const rawFavorites =
      Array.isArray(serverFavorites?.data)
        ? serverFavorites.data
        : Array.isArray(serverFavorites) && serverFavorites.length > 0
        ? serverFavorites
        : Array.isArray(user.real_estate_boards) && user.real_estate_boards.length > 0
        ? user.real_estate_boards
        : Array.isArray(user.favorites) && user.favorites.length > 0
        ? user.favorites
        : [];

    return rawFavorites.filter(Boolean);
  }, [user, serverFavorites]);

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh] overscroll-contain select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col border-b border-gray-100 bg-gray-50/80 shrink-0">
          <div className="flex items-center justify-between px-6 pt-4 pb-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                {activeTab === "activity" ? (
                  <Activity className="w-5 h-5" />
                ) : (
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {user.fullName || user.username}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  @{user.username} • #{user.id} • {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pb-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "activity"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity Logs</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === "activity"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isLoadingLogs ? "..." : activityEvents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("favorites")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  activeTab === "favorites" ? "fill-white" : "text-rose-500"
                }`}
              />
              <span>Saved Favorites</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === "favorites"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isLoadingFavorites ? "..." : userFavorites.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto overscroll-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* TAB 1: ACTIVITY LOGS */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {isLoadingLogs && activityEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium">
                    Fetching user activity logs...
                  </p>
                </div>
              ) : activityEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    No activity logs recorded
                  </p>
                  <p className="text-[11px] text-slate-500">
                    This user has not performed any property searches or home assessments yet.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activityEvents.map((evt) => {
                    return (
                      <div key={evt.id} className="relative group">
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary flex items-center justify-center shadow-xs transition">
                          <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-primary transition"></div>
                        </div>

                        {/* Event Card */}
                        <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 transition space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="p-1 rounded-lg bg-white shadow-2xs border border-slate-100 shrink-0">
                                {evt.icon}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {evt.title}
                              </h5>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {evt.link && (
                                <Link
                                  href={evt.link}
                                  target="_blank"
                                  className="p-1 text-slate-400 hover:text-primary transition rounded hover:bg-white"
                                  title="View Property Details"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              {evt.badge && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200/80 text-slate-700">
                                  {evt.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {evt.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-200/40">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(evt.date)}
                            </span>
                            <span>{formatRelativeTime(evt.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED FAVORITES */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              {isLoadingFavorites && userFavorites.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium">
                    Fetching saved favorite properties...
                  </p>
                </div>
              ) : userFavorites.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                    <Heart className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    No favorite properties saved
                  </p>
                  <p className="text-[11px] text-slate-500">
                    This user has not added any listings to their favorites list yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {userFavorites.map((prop: any, idx: number) => {
                    const docId = prop.documentId || prop.id;
                    const address = prop.address || "Listing Address";
                    const city = prop.city || prop.state || "";
                    const price = prop.price
                      ? `$${Number(prop.price).toLocaleString()}`
                      : "Price on request";
                    const beds = prop.bedrooms || prop.beds;
                    const baths = prop.bathrooms || prop.baths;
                    const area = prop.Living_area || prop.lot_size_area;
                    const imgUrl = prop.media_url || prop.image || "/placeholder.jpg";
                    const subType =
                      prop.property_sub_type ||
                      prop.property_type ||
                      "Residential";

                    return (
                      <div
                        key={docId || idx}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col group"
                      >
                        {/* Property Image & Badges */}
                        <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={address}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              // Fallback placeholder image
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=60";
                            }}
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-xs text-white">
                              {subType}
                            </span>
                            {prop.standard_status && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
                                {prop.standard_status}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2">
                            <span className="w-7 h-7 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow-xs">
                              <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-primary/95 text-white shadow-xs">
                              {price}
                            </span>
                          </div>
                        </div>

                        {/* Property Info Content */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                          <div>
                            <h4
                              className="text-xs font-bold text-slate-900 truncate"
                              title={address}
                            >
                              {address}
                            </h4>
                            {city && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{city}</span>
                              </p>
                            )}
                          </div>

                          {/* Property specs */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            {beds !== undefined && (
                              <span className="flex items-center gap-1 font-medium">
                                <Bed className="w-3.5 h-3.5 text-slate-400" />
                                {beds} beds
                              </span>
                            )}
                            {baths !== undefined && (
                              <span className="flex items-center gap-1 font-medium">
                                <Bath className="w-3.5 h-3.5 text-slate-400" />
                                {baths} baths
                              </span>
                            )}
                            {area && (
                              <span className="flex items-center gap-1 font-medium">
                                <Maximize className="w-3.5 h-3.5 text-slate-400" />
                                {area} sqft
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-1">
                            <Link
                              href={`/property-info/${docId}`}
                              target="_blank"
                              className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                            >
                              <span>View Property</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-t border-gray-100 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {activeTab === "activity" ? (
              <span>
                Total <strong>{activityEvents.length}</strong> activity logs recorded
              </span>
            ) : (
              <span>
                Total <strong>{userFavorites.length}</strong> properties in favorites
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
