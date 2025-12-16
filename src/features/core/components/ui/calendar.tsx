"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/features/core/lib/utils"; // atau ganti dengan util className milikmu

interface MiniCalendarProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

export function Calendar({ value, onChange }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date());

  const monthLabel = format(viewDate, "MMMM yyyy");
  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const startWeekDay = startOfMonth.getDay(); // 0 = Sun
  const daysInMonth = endOfMonth.getDate();

  const days: (Date | null)[] = [];

  // padding sebelum tanggal 1
  for (let i = 0; i < startWeekDay; i++) {
    days.push(null);
  }
  // tanggal di bulan
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSameDay = (a?: Date, b?: Date) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="w-72 rounded-md bg-zinc-900 text-zinc-100 p-4 shadow-md">
      {/* Header bulan & nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="px-3 py-1 rounded bg-zinc-800 text-sm font-medium">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Nama hari */}
      <div className="grid grid-cols-7 text-xs mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className={cn(
              "h-7 flex items-center justify-center",
              d === "Sun" ? "text-red-400" : "text-zinc-400"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-y-1 text-sm">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="h-8" />;
          }

          const selected = isSameDay(day, value);
          const isToday = isSameDay(day, new Date());
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onChange(day)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-full transition-colors",
                selected && "bg-cyan-500 text-white shadow ring-2 ring-cyan-300",
                !selected && isToday && "border border-cyan-500 text-cyan-300",
                !selected && !isToday && "hover:bg-zinc-800",
                isWeekend && !selected && "text-red-400"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-3 px-3 py-1 rounded border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
        onClick={() => onChange(undefined)}
      >
        Clear
      </button>
    </div>
  );
}
