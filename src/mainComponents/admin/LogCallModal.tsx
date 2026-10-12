"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  History,
  Edit3,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  HomeEvaluationRequestItem,
  CallHistoryItem,
} from "@/src/api/homeEvaluation/homeEvaluationApi";
import {
  useCreateCallHistory,
  useDeleteCallHistory,
} from "@/src/hooks/homeEvaluation/useHomeEvaluationQueries";
import { toast } from "react-toastify";
import DeleteCallLogModal from "./DeleteCallLogModal";
import CustomDateTimePickerModal from "./CustomDateTimePickerModal";

interface LogCallModalProps {
  open: boolean;
  onClose: () => void;
  request: HomeEvaluationRequestItem | null;
}

// Helper to format Date into "YYYY-MM-DDTHH:mm" for internal state
const toDateTimeLocalString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = date.getDate();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function LogCallModal({
  open,
  onClose,
  request,
}: LogCallModalProps) {
  // By default, timestamp is current date & time
  const [selectedDateTime, setSelectedDateTime] = useState<string>(() =>
    toDateTimeLocalString(new Date()),
  );
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const [callHistories, setCallHistories] = useState<CallHistoryItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CallHistoryItem | null>(null);

  const createCallMutation = useCreateCallHistory();
  const deleteCallMutation = useDeleteCallHistory();

  // Synchronize local call histories whenever request or open prop updates
  useEffect(() => {
    if (request?.call_histories) {
      setCallHistories(request.call_histories);
    } else {
      setCallHistories([]);
    }
  }, [request?.call_histories, open]);

  // Reset state when opening modal
  useEffect(() => {
    if (open) {
      setIsCustom(false);
      setSelectedDateTime(toDateTimeLocalString(new Date()));
      setIsPickerOpen(false);
      setItemToDelete(null);
    }
  }, [open]);

  // If in default mode (not custom), tick forward every 10 seconds to keep current time fresh
  useEffect(() => {
    if (!open || isCustom) return;
    const interval = setInterval(() => {
      setSelectedDateTime(toDateTimeLocalString(new Date()));
    }, 10000);
    return () => clearInterval(interval);
  }, [open, isCustom]);

  // Prevent background scrolling
  useEffect(() => {
    if (open) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [open]);

  if (!open || !request) return null;

  const targetIdentifier = request.documentId || request.id;

  // Handlers
  const handleSetNow = () => {
    setIsCustom(false);
    setSelectedDateTime(toDateTimeLocalString(new Date()));
  };

  const handleApplyPreset = (minutesAgo: number) => {
    setIsCustom(true);
    const d = new Date(Date.now() - minutesAgo * 60 * 1000);
    setSelectedDateTime(toDateTimeLocalString(d));
  };

  const handleSaveCall = async () => {
    if (!targetIdentifier) {
      toast.error("Invalid evaluation request identifier.");
      return;
    }

    let isoString: string;
    if (!isCustom) {
      // Current instant
      isoString = new Date().toISOString();
    } else {
      const parsedDate = new Date(selectedDateTime);
      if (isNaN(parsedDate.getTime())) {
        toast.error("Invalid date selected.");
        return;
      }
      isoString = parsedDate.toISOString();
    }

    createCallMutation.mutate(
      {
        callAt: isoString,
        home_evaluation_request: targetIdentifier,
      },
      {
        onSuccess: (newCall) => {
          if (newCall) {
            setCallHistories((prev) => [newCall, ...prev]);
          }
          onClose();
        },
      },
    );
  };

  const confirmDeleteCall = () => {
    if (!itemToDelete) return;
    const id = itemToDelete.documentId || itemToDelete.id;
    setDeletingId(id);

    // Optimistically remove from local state immediately so it disappears with 0ms latency
    setCallHistories((prev) =>
      prev.filter(
        (item) =>
          item.id !== id &&
          item.documentId !== id &&
          String(item.id) !== String(id) &&
          String(item.documentId) !== String(id),
      ),
    );

    setItemToDelete(null);

    deleteCallMutation.mutate(id, {
      onSettled: () => {
        setDeletingId(null);
      },
      onError: () => {
        // Revert back if backend fails
        if (request?.call_histories) {
          setCallHistories(request.call_histories);
        }
      },
    });
  };

  const formatCallDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  // Human-readable formatted string for display
  const displayInfo = (() => {
    try {
      const d = isCustom ? new Date(selectedDateTime) : new Date();
      const dateStr = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { dateStr, timeStr };
    } catch {
      return { dateStr: selectedDateTime, timeStr: "" };
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] select-text animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Call Timing
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span>{request.fullName || "Client"}</span>
                {request.phoneNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {request.phoneNumber}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Call Timestamp Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Call Timestamp
              </span>

              {isCustom ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Custom Time
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Current Time (Default)
                </span>
              )}
            </div>

            {/* Clickable Date & Time Card -> Opens Popup */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsPickerOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsPickerOpen(true);
                }
              }}
              className="group relative p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-slate-50/40 to-white border-2 border-emerald-200/70 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-950 transition">
                      {displayInfo.dateStr}
                    </div>
                    <div className="text-xs sm:text-sm font-bold font-mono text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{displayInfo.timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition shrink-0">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-emerald-100/70 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-500 group-hover:text-emerald-800 transition">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Click to choose a custom date & time
                </span>
                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetNow();
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Reset to Now
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5">
                Quick adjust:
              </span>
              <button
                type="button"
                onClick={handleSetNow}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  !isCustom
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(15)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                15m ago
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(60)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                1h ago
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1440)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="button"
            disabled={createCallMutation.isPending}
            onClick={handleSaveCall}
            className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 active:scale-98"
          >
            {createCallMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Call Record...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Call Record ({displayInfo.timeStr})</span>
              </>
            )}
          </button>

          {/* Call History Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Previous Call History
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                {callHistories.length}{" "}
                {callHistories.length === 1 ? "call" : "calls"}
              </span>
            </div>

            {callHistories.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-400">
                  No previous call records logged for this client yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {callHistories.map((item, index) => {
                  const itemId = item.documentId || item.id;
                  return (
                    <div
                      key={itemId || index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {formatCallDate(
                              item.callAt || item.createdAt || "",
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Call #{callHistories.length - index}
                          </p>
                        </div>
                      </div>

                      {itemId && (
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          disabled={deletingId === itemId}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-60 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                          title="Remove Call Record"
                        >
                          {deletingId === itemId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Standalone Custom Date & Time Picker Popup */}
      <CustomDateTimePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        value={selectedDateTime}
        onApply={(newVal) => {
          setSelectedDateTime(newVal);
          setIsCustom(true);
        }}
      />

      {/* Custom Confirmation Popup for Deleting Call Record */}
      <DeleteCallLogModal
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteCall}
        isDeleting={!!deletingId}
        callDate={itemToDelete?.callAt || itemToDelete?.createdAt}
      />
    </div>
  );
}
