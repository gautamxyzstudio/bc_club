"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Plus,
  Minus,
} from "lucide-react";

interface CustomDateTimePickerModalProps {
  open: boolean;
  onClose: () => void;
  value: string; // Format: YYYY-MM-DDTHH:mm
  onApply: (newValue: string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper to parse "YYYY-MM-DDTHH:mm"
const parseDateTime = (str: string) => {
  if (!str) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour12: now.getHours() % 12 || 12,
      minute: now.getMinutes(),
      period: now.getHours() >= 12 ? ("PM" as const) : ("AM" as const),
    };
  }

  try {
    const [datePart, timePart] = str.split("T");
    const [yStr, mStr, dStr] = (datePart || "").split("-");
    const [hStr, minStr] = (timePart || "").split(":");

    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const day = parseInt(dStr, 10);
    const hour24 = parseInt(hStr, 10);
    const minute = parseInt(minStr, 10);

    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour24) ||
      isNaN(minute)
    ) {
      throw new Error("Invalid date");
    }

    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? ("PM" as const) : ("AM" as const);

    return { year, month, day, hour12, minute, period };
  } catch {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour12: now.getHours() % 12 || 12,
      minute: now.getMinutes(),
      period: now.getHours() >= 12 ? ("PM" as const) : ("AM" as const),
    };
  }
};

const formatDateTimeLocal = (
  year: number,
  month: number,
  day: number,
  hour12: number,
  minute: number,
  period: "AM" | "PM",
): string => {
  let hour24 = hour12 % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour24)}:${pad(minute)}`;
};

export default function CustomDateTimePickerModal({
  open,
  onClose,
  value,
  onApply,
}: CustomDateTimePickerModalProps) {
  // Active tab: 'date' or 'time'
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  // Temporary picker state
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedHour12, setSelectedHour12] = useState(1);
  const [selectedMinute, setSelectedMinute] = useState(30);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  // Calendar month navigation view
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(9);

  // Initialize state when popup opens
  useEffect(() => {
    if (open) {
      const p = parseDateTime(value);
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedDay(p.day);
      setSelectedHour12(p.hour12);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);

      setViewYear(p.year);
      setViewMonth(p.month);
      setActiveTab("date");
    }
  }, [open, value]);

  // Calendar days grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth();
    const todayD = now.getDate();

    // Previous month trailing
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected:
          d === selectedDay && m === selectedMonth && y === selectedYear,
        isToday: d === todayD && m === todayM && y === todayY,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isSelected:
          d === selectedDay &&
          viewMonth === selectedMonth &&
          viewYear === selectedYear,
        isToday: d === todayD && viewMonth === todayM && viewYear === todayY,
      });
    }

    // Next month trailing
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected:
          d === selectedDay && m === selectedMonth && y === selectedYear,
        isToday: d === todayD && m === todayM && y === todayY,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDay, selectedMonth, selectedYear]);

  if (!open) return null;

  // Month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSetToday = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setSelectedDay(now.getDate());
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const handleSetNow = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setSelectedDay(now.getDate());
    setSelectedHour12(now.getHours() % 12 || 12);
    setSelectedMinute(now.getMinutes());
    setSelectedPeriod(now.getHours() >= 12 ? "PM" : "AM");
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const handleApply = () => {
    const formatted = formatDateTimeLocal(
      selectedYear,
      selectedMonth,
      selectedDay,
      selectedHour12,
      selectedMinute,
      selectedPeriod,
    );
    onApply(formatted);
    onClose();
  };

  const shortDateStr = (() => {
    try {
      const d = new Date(selectedYear, selectedMonth, selectedDay);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return `${MONTH_NAMES[selectedMonth].slice(0, 3)} ${selectedDay}`;
    }
  })();

  const selectedTimeStr = `${String(selectedHour12).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")} ${selectedPeriod}`;

  return (
    <div
      className="fixed inset-0 z-[10002] bg-slate-900/25 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      {/* Small, compact popover card (330px wide, fits comfortably over the parent modal) */}
      <div
        className="relative w-full max-w-[330px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col select-text animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Set Date & Time
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tabs (Date vs Time) */}
        <div className="p-2 bg-slate-50/70 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("date")}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "date"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{shortDateStr}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("time")}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "time"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedTimeStr}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Date View (Calendar) */}
        {activeTab === "date" && (
          <div className="p-3.5 space-y-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center">
              {WEEKDAY_NAMES.map((w) => (
                <span
                  key={w}
                  className="text-[10px] font-bold uppercase text-slate-400 py-0.5"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedYear(d.year);
                      setSelectedMonth(d.month);
                      setSelectedDay(d.day);
                      if (!d.isCurrentMonth) {
                        setViewYear(d.year);
                        setViewMonth(d.month);
                      }
                    }}
                    className={`h-7 w-full rounded-lg text-xs flex items-center justify-center transition cursor-pointer ${
                      d.isSelected
                        ? "bg-emerald-600 text-white font-bold shadow-xs scale-105"
                        : d.isToday
                          ? "border border-emerald-500 text-emerald-700 font-bold bg-emerald-50/60"
                          : d.isCurrentMonth
                            ? "text-slate-800 font-semibold hover:bg-slate-100"
                            : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>

            {/* Date Tab Footer Shortcuts */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 px-2 py-0.5 rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("time")}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Set Time →</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Time View */}
        {activeTab === "time" && (
          <div className="p-3.5 space-y-3">
            {/* AM / PM Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setSelectedPeriod("AM")}
                className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === "AM"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("PM")}
                className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === "PM"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                PM
              </button>
            </div>

            {/* Hour Grid (01 to 12) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Hour
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                  const isSelected = selectedHour12 === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour12(h)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs scale-105"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Section: Stepper + Input + Quick Chips */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Minute
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMinute((m) => (m === 0 ? 59 : m - 1))
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="-1 minute"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={String(selectedMinute).padStart(2, "0")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setSelectedMinute(Math.min(59, Math.max(0, val)));
                      }
                    }}
                    className="w-10 h-6 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMinute((m) => (m === 59 ? 0 : m + 1))
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="+1 minute"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Quick minute intervals */}
              <div className="grid grid-cols-4 gap-1">
                {[0, 15, 30, 45].map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80"
                      }`}
                    >
                      :{String(m).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Tab Footer Shortcuts */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleSetNow}
                className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 px-2 py-0.5 rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Current Time</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("date")}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>← Change Date</span>
              </button>
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200/60 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
