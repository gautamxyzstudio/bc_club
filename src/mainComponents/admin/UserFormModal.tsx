"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  User,
  Mail,
  Lock,
} from "lucide-react";
import {
  useCreateUser,
  useUpdateUser,
} from "@/src/hooks/users/useUserQueries";
import { StrapiUser } from "@/src/api/users/usersApi";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: StrapiUser | null;
  onSuccess?: () => void;
}

export default function UserFormModal({
  open,
  onClose,
  user,
  onSuccess,
}: UserFormModalProps) {
  const isEditMode = !!user;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

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

  useEffect(() => {
    if (open) {
      if (user) {
        setUsername(user.username || "");
        setEmail(user.email || "");
        setFullName(user.fullName || "");
        setPassword("");
      } else {
        // Reset form for create
        setUsername("");
        setEmail("");
        setFullName("");
        setPassword("");
      }
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!isEditMode && !password.trim()) {
      alert("Please specify a password for the new user.");
      return;
    }

    const payload: any = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || undefined,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      if (isEditMode && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // Error handled by react-query mutation toast
    }
  };

  if (!open) return null;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[#F4A51C]" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isEditMode ? "Edit User Account" : "Add New User"}
              </h2>
              <p className="text-[11px] text-slate-300">
                {isEditMode
                  ? `Modifying details for @${user?.username}`
                  : "Create a new user account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Username & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Password {isEditMode ? "(Leave blank to keep unchanged)" : <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "••••••••••••" : "Minimum 6 characters"}
                minLength={6}
                required={!isEditMode}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {isEditMode ? "Save Changes" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
