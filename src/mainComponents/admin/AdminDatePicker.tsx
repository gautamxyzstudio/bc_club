"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";

interface AdminDatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: "left" | "right";
  maxDate?: string; // Format: YYYY-MM-DD
  minDate?: string; // Format: YYYY-MM-DD
  disableFuture?: boolean;
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

// Format helper
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const monthName = MONTH_NAMES[month];
  return `${monthName ? monthName.slice(0, 3) : ""} ${String(day).padStart(2, "0")}, ${year}`;
};

export default function AdminDatePicker({
  value = "",
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  align = "right",
  maxDate,
  minDate,
  disableFuture = false,
}: AdminDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date
  const parsedValueDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
  }, [value]);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  const effectiveMaxDate = useMemo(() => {
    if (disableFuture) {
      if (maxDate) {
        return maxDate < todayStr ? maxDate : todayStr;
      }
      return todayStr;
    }
    return maxDate || "";
  }, [disableFuture, maxDate, todayStr]);

  // Calendar navigation view (current displayed year & month)
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedValueDate ? parsedValueDate.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedValueDate ? parsedValueDate.getMonth() : today.getMonth();
  });

  // Mode for quick jump: "calendar" | "month" | "year"
  const [viewMode, setViewMode] = useState<"calendar" | "month" | "year">("calendar");

  // Keep view in sync when value changes externally if opened
  useEffect(() => {
    if (parsedValueDate) {
      setViewYear(parsedValueDate.getFullYear());
      setViewMonth(parsedValueDate.getMonth());
    }
  }, [value, parsedValueDate]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setViewMode("calendar");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setViewMode("calendar");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Calendar math
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];

    // Helper to test if a date is disabled by max/min rules
    const checkDisabled = (dateStr: string) => {
      if (effectiveMaxDate && dateStr > effectiveMaxDate) return true;
      if (minDate && dateStr < minDate) return true;
      return false;
    };

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: checkDisabled(dateStr),
      });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: checkDisabled(dateStr),
      });
    }

    // Trailing days from next month to fill 42 or 35 slots (6 or 5 rows)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: checkDisabled(dateStr),
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, value, effectiveMaxDate, minDate]);

  // Max bounds for year / month
  const maxYearNumber = useMemo(() => {
    if (!effectiveMaxDate) return Infinity;
    return parseInt(effectiveMaxDate.split("-")[0], 10);
  }, [effectiveMaxDate]);

  const maxMonthNumber = useMemo(() => {
    if (!effectiveMaxDate) return Infinity;
    const parts = effectiveMaxDate.split("-");
    const maxY = parseInt(parts[0], 10);
    if (viewYear > maxY) return -1;
    if (viewYear === maxY) return parseInt(parts[1], 10) - 1;
    return Infinity;
  }, [effectiveMaxDate, viewYear]);

  // Next month disabled state
  const isNextMonthDisabled = useMemo(() => {
    if (!effectiveMaxDate) return false;
    const parts = effectiveMaxDate.split("-");
    const maxY = parseInt(parts[0], 10);
    const maxM = parseInt(parts[1], 10) - 1;
    if (viewYear > maxY) return true;
    if (viewYear === maxY && viewMonth >= maxM) return true;
    return false;
  }, [effectiveMaxDate, viewYear, viewMonth]);

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNextMonthDisabled) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Select a day
  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
    setViewMode("calendar");
  };

  // Quick action: Today
  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
    setViewMode("calendar");
  };

  // Quick action: Clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setViewMode("calendar");
  };

  // Year options for quick select (range from currentYear - 15 to currentYear + 15)
  const yearOptions = useMemo(() => {
    const currentY = today.getFullYear();
    const list: number[] = [];
    for (let y = currentY - 15; y <= (disableFuture ? currentY : currentY + 15); y++) {
      list.push(y);
    }
    return list;
  }, [today, disableFuture]);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer select-none ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50 border-gray-200"
            : isOpen
              ? "border-primary ring-2 ring-primary/20 shadow-xs text-gray-900"
              : "border-gray-300 text-gray-800 hover:border-gray-400"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <span className={value ? "text-gray-900 font-semibold truncate" : "text-gray-400 font-normal truncate"}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 p-2.5 select-none animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            {/* Month & Year Title with Mode Toggle */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() =>
                  setViewMode((prev) => (prev === "month" ? "calendar" : "month"))
                }
                className="px-1.5 py-0.5 text-[11px] font-bold text-slate-800 hover:text-primary hover:bg-slate-100 rounded-md transition flex items-center gap-0.5"
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode((prev) => (prev === "year" ? "calendar" : "year"))
                }
                className="px-1.5 py-0.5 text-[11px] font-bold text-slate-800 hover:text-primary hover:bg-slate-100 rounded-md transition flex items-center gap-0.5"
              >
                <span>{viewYear}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
            </div>

            {/* Prev / Next Month arrows */}
            {viewMode === "calendar" && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isNextMonthDisabled}
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className={`p-1 rounded-md transition ${
                    isNextMonthDisabled
                      ? "text-slate-200 opacity-30 cursor-not-allowed pointer-events-none"
                      : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Body: Month Picker View */}
          {viewMode === "month" && (
            <div className="grid grid-cols-3 gap-1 py-2">
              {MONTH_NAMES.map((mName, idx) => {
                const isSelected = idx === viewMonth;
                const isCurrentMonth =
                  idx === today.getMonth() && viewYear === today.getFullYear();
                const isMonthDisabled = idx > maxMonthNumber;

                return (
                  <button
                    key={mName}
                    type="button"
                    disabled={isMonthDisabled}
                    onClick={() => {
                      if (isMonthDisabled) return;
                      setViewMonth(idx);
                      setViewMode("calendar");
                    }}
                    className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg text-center transition ${
                      isMonthDisabled
                        ? "text-slate-300 opacity-30 cursor-not-allowed pointer-events-none"
                        : isSelected
                          ? "bg-primary text-white font-bold shadow-xs"
                          : isCurrentMonth
                            ? "border border-primary/40 text-primary font-bold bg-primary/5"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {mName.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Body: Year Picker View */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-1 py-2 max-h-40 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {yearOptions.map((y) => {
                const isSelected = y === viewYear;
                const isCurrentYear = y === today.getFullYear();
                const isYearDisabled = y > maxYearNumber;

                return (
                  <button
                    key={y}
                    type="button"
                    disabled={isYearDisabled}
                    onClick={() => {
                      if (isYearDisabled) return;
                      setViewYear(y);
                      setViewMode("calendar");
                    }}
                    className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg text-center transition ${
                      isYearDisabled
                        ? "text-slate-300 opacity-30 cursor-not-allowed pointer-events-none"
                        : isSelected
                          ? "bg-primary text-white font-bold shadow-xs"
                          : isCurrentYear
                            ? "border border-primary/40 text-primary font-bold bg-primary/5"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Body: Calendar Day Grid */}
          {viewMode === "calendar" && (
            <div className="pt-1.5">
              {/* Day names header */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {WEEKDAY_NAMES.map((dName) => (
                  <div
                    key={dName}
                    className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 py-0.5"
                  >
                    {dName}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((d, index) => {
                  return (
                    <button
                      key={`${d.dateStr}-${index}`}
                      type="button"
                      disabled={d.isDisabled}
                      onClick={() => !d.isDisabled && handleSelectDay(d.dateStr)}
                      className={`h-7 w-full flex items-center justify-center text-[11px] font-medium rounded-lg transition ${
                        d.isDisabled
                          ? "text-slate-300 opacity-30 cursor-not-allowed bg-transparent hover:bg-transparent pointer-events-none select-none"
                          : d.isSelected
                            ? "bg-primary text-white font-bold shadow-xs scale-105 z-10"
                            : d.isToday
                              ? "border border-primary text-primary font-bold bg-primary/5 hover:bg-primary/10"
                              : d.isCurrentMonth
                                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                : "text-slate-300 hover:bg-slate-50 hover:text-slate-400"
                      }`}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-0.5 text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium rounded-md transition"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-md transition flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
