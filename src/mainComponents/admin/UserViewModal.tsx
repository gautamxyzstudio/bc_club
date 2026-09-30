"use client";

import React, { useEffect } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Globe,
  Edit,
} from "lucide-react";
import { StrapiUser } from "@/src/api/users/usersApi";

interface UserViewModalProps {
  open: boolean;
  onClose: () => void;
  user: StrapiUser | null;
  onEdit?: (user: StrapiUser) => void;
}

export default function UserViewModal({
  open,
  onClose,
  user,
  onEdit,
}: UserViewModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open || !user) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string, username?: string) => {
    const text = name || username || "U";
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">User Profile Details</h2>
              <p className="text-[11px] text-slate-300">
                ID: #{user.id} • {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* User Card Top */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center text-lg font-extrabold shadow-sm">
              {getInitials(user.fullName, user.username)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.fullName || user.username}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-3 bg-white border border-slate-200/80 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Contact & System Info
            </h4>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Username
              </span>
              <span className="font-semibold text-slate-800">
                @{user.username}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <span className="font-semibold text-slate-800 select-all">
                {user.email || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Auth Provider
              </span>
              <span className="font-semibold text-slate-800 capitalize">
                {user.provider || "local"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Registered On
              </span>
              <span className="font-medium text-slate-700">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-2">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Modified
              </span>
              <span className="font-medium text-slate-700">
                {formatDate(user.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
