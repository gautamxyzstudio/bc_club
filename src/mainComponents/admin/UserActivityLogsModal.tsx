"use client";

import React, { useEffect, useMemo } from "react";
import {
  X,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  KeyRound,
  FileCheck2,
  Sparkles,
  Globe,
  Mail,
} from "lucide-react";
import { StrapiUser } from "@/src/api/users/usersApi";

interface UserActivityLogsModalProps {
  open: boolean;
  onClose: () => void;
  user: StrapiUser | null;
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  date: string | null | undefined;
  type: "success" | "info" | "warning" | "purple" | "default";
  icon: React.ReactNode;
  badge?: string;
}

export default function UserActivityLogsModal({
  open,
  onClose,
  user,
}: UserActivityLogsModalProps) {
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
      if (diffDays < 0) return "In the future";
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

  const getInitials = (name?: string, username?: string) => {
    const text = name || username || "U";
    return text.slice(0, 2).toUpperCase();
  };

  // Compile timeline of activities from available user audit data
  const activityEvents: ActivityEvent[] = useMemo(() => {
    if (!user) return [];
    const events: ActivityEvent[] = [];

    // 1. Account Created
    if (user.createdAt) {
      events.push({
        id: "created",
        title: "Account Registered",
        description: `Account created with authentication provider: ${user.provider || "local"}`,
        date: user.createdAt,
        type: "success",
        icon: <UserPlus className="w-4 h-4 text-emerald-600" />,
        badge: "Initial Signup",
      });
    }

    // 2. Email Confirmation
    if (user.confirmed !== undefined) {
      events.push({
        id: "email_status",
        title: user.confirmed ? "Email Verified" : "Email Verification Pending",
        description: user.confirmed
          ? `Email address (${user.email}) successfully confirmed.`
          : `Email address (${user.email}) has not been verified yet.`,
        date: user.createdAt, // synced with creation / verification
        type: user.confirmed ? "success" : "warning",
        icon: user.confirmed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600" />
        ),
        badge: user.confirmed ? "Confirmed" : "Pending",
      });
    }

    // 3. Vow Terms & Agreements
    if (user.acceptedVowAt || user.acceptedVowTerms) {
      events.push({
        id: "vow_terms",
        title: "Terms & Conditions Accepted",
        description: user.acceptedVowVersion
          ? `User accepted VOW terms (Version ${user.acceptedVowVersion}).`
          : "User formally accepted the membership vow terms.",
        date: user.acceptedVowAt || user.createdAt,
        type: "purple",
        icon: <FileCheck2 className="w-4 h-4 text-purple-600" />,
        badge: user.acceptedVowVersion ? `v${user.acceptedVowVersion}` : "Accepted",
      });
    }

    // 4. Vow Membership Activation
    if (user.vowActivatedAt || user.isVowActive) {
      events.push({
        id: "vow_activation",
        title: "VOW Membership Activated",
        description: user.vowExpiresAt
          ? `Membership active. Expiration scheduled for ${formatDateTime(user.vowExpiresAt)}.`
          : "VOW membership active and in good standing.",
        date: user.vowActivatedAt || user.createdAt,
        type: "info",
        icon: <Sparkles className="w-4 h-4 text-blue-600" />,
        badge: user.isVowActive ? "Active Member" : "Membership",
      });
    }

    // 5. Password Reset Activity
    if (user.lastVowPasswordResetAt) {
      events.push({
        id: "password_reset",
        title: "Password Reset Event",
        description: "User successfully reset their account password.",
        date: user.lastVowPasswordResetAt,
        type: "warning",
        icon: <KeyRound className="w-4 h-4 text-amber-600" />,
        badge: "Security",
      });
    }

    // 6. Last Account / Profile Update
    if (user.updatedAt && user.updatedAt !== user.createdAt) {
      events.push({
        id: "updated",
        title: "Profile / Record Modified",
        description: "User profile data, preferences, or role permissions were updated in the system.",
        date: user.updatedAt,
        type: "info",
        icon: <Clock className="w-4 h-4 text-sky-600" />,
        badge: "System Update",
      });
    }

    // Sort newest first
    return events.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });
  }, [user]);

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] overscroll-contain select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">User Activity Logs</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Audit trail and system events for #{user.id}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto overscroll-contain">
          {/* User Info Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary2 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {getInitials(user.fullName, user.username)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {user.fullName || user.username}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  @{user.username} • {user.email}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {user.blocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                  <ShieldAlert className="w-3 h-3" />
                  Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email Status
              </span>
              <p className="font-bold text-slate-800">
                {user.confirmed ? (
                  <span className="text-emerald-600">Verified</span>
                ) : (
                  <span className="text-amber-600">Unverified</span>
                )}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                Auth Provider
              </span>
              <p className="font-bold text-slate-800 capitalize">
                {user.provider || "Local"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Joined Since
              </span>
              <p className="font-bold text-slate-800 truncate">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Activity Timeline ({activityEvents.length})
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                Newest to oldest
              </span>
            </div>

            {activityEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500">No activity logs recorded for this user.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activityEvents.map((evt) => {
                  return (
                    <div key={evt.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary flex items-center justify-center shadow-xs transition">
                        <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-primary transition"></div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 transition space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-white shadow-2xs border border-slate-100">
                              {evt.icon}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900">
                              {evt.title}
                            </h5>
                          </div>

                          {evt.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200/80 text-slate-700">
                              {evt.badge}
                            </span>
                          )}
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

          {/* System Metadata Snapshot */}
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px]">System Identifiers</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-primary border border-blue-100/60 text-[10px] font-bold">Strapi v5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                <span className="text-slate-400 text-[11px] block">Document ID</span>
                <span className="text-slate-800 font-mono text-[11px] font-semibold">{user.documentId || "N/A"}</span>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                <span className="text-slate-400 text-[11px] block">User ID</span>
                <span className="text-slate-800 font-mono text-[11px] font-semibold">#{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
}
