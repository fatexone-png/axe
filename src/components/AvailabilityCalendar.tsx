"use client";

import { useMemo, useState } from "react";
import { AvailabilityPeriod, Booking, DayOfWeek } from "@/lib/types";

interface Props {
  availabilityPeriods: AvailabilityPeriod[];
  bookings: Booking[];
}

const DOW_MAP: Record<number, DayOfWeek> = {
  0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
  4: "thursday", 5: "friday", 6: "saturday",
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function isAvailable(date: Date, periods: AvailabilityPeriod[]): boolean {
  const iso = date.toISOString().split("T")[0];
  const dow = DOW_MAP[date.getDay()];
  return periods.some((p) => iso >= p.startDate && iso <= p.endDate && p.days.includes(dow));
}

function isBooked(date: Date, bookings: Booking[]): boolean {
  const iso = date.toISOString().split("T")[0];
  return bookings.some((b) => b.sessionDate === iso && b.status !== "cancelled");
}

export default function AvailabilityCalendar({ availabilityPeriods, bookings }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Start from Monday
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
    const result: (Date | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      result.push(new Date(year, month, d));
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  }

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(year, month, 1));

  return (
    <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-axe-muted hover:text-axe-white transition-colors">‹</button>
        <p className="text-axe-white font-semibold capitalize">{monthLabel}</p>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-axe-muted hover:text-axe-white transition-colors">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[10px] font-semibold text-axe-muted py-1">{l}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d.toISOString().split("T")[0] === today.toISOString().split("T")[0];
          const booked = isBooked(d, bookings);
          const avail = isAvailable(d, availabilityPeriods);
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                ${isToday ? "ring-1 ring-axe-accent" : ""}
                ${booked ? "bg-axe-amber/20 text-axe-amber" : avail ? "bg-green-500/15 text-green-400" : "text-axe-muted hover:bg-white/5"}`}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-axe-muted">
          <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5 text-xs text-axe-muted">
          <span className="w-3 h-3 rounded bg-axe-amber/20 border border-axe-amber/30" />
          Réservé
        </div>
        <div className="flex items-center gap-1.5 text-xs text-axe-muted">
          <span className="w-3 h-3 rounded ring-1 ring-axe-accent" />
          Aujourd&apos;hui
        </div>
      </div>
    </div>
  );
}
