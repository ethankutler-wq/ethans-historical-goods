"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMonday,
  getBiweeklyDays,
  formatDateKey,
  formatDateLabel,
  formatDateShort,
} from "@/lib/schedule-utils";

type WorkoutType = "cycling" | "swimming" | "running";

interface ScheduledWorkout {
  id: string;
  date: string;
  type: WorkoutType;
  name: string | null;
  plannedDurationMinutes: number | null;
  plannedDistanceMeters: number | null;
  notes: string | null;
  order: number;
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDistance(m: number) {
  return `${(m / 1609.34).toFixed(1)} mi`;
}

const TYPE_COLORS: Record<WorkoutType, string> = {
  cycling: "border-l-orange-500 bg-orange-500/10",
  swimming: "border-l-cyan-500 bg-cyan-500/10",
  running: "border-l-emerald-500 bg-emerald-500/10",
};

const TYPE_ICONS: Record<WorkoutType, string> = {
  cycling: "🚴",
  swimming: "🏊",
  running: "🏃",
};

export function ScheduleClient() {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [startMonday, setStartMonday] = useState<Date>(() => {
    const today = new Date();
    const m = getMonday(today);
    return m;
  });

  const days = getBiweeklyDays(startMonday);
  const startStr = formatDateKey(days[0]);
  const endStr = formatDateKey(days[13]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/workouts?start=${startStr}&end=${endStr}`)
      .then((res) => res.json())
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false));
  }, [startStr, endStr]);

  const workoutsByDate = days.reduce<Record<string, ScheduledWorkout[]>>(
    (acc, d) => {
      acc[formatDateKey(d)] = [];
      return acc;
    },
    {}
  );
  for (const w of workouts) {
    const key = w.date.slice(0, 10);
    if (workoutsByDate[key]) workoutsByDate[key].push(w);
  }

  const goPrev = () => {
    const d = new Date(startMonday);
    d.setDate(d.getDate() - 14);
    setStartMonday(d);
  };

  const goNext = () => {
    const d = new Date(startMonday);
    d.setDate(d.getDate() + 14);
    setStartMonday(d);
  };

  const goToToday = () => {
    const today = new Date();
    setStartMonday(getMonday(today));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Training Schedule
          </h1>
          <p className="text-white/60">
            Biweekly view · Plan your workouts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-white/60 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/are-we-there-yet"
            className="text-sm text-white/60 hover:text-white"
          >
            Are we there yet?
          </Link>
          <Link
            href="/admin/schedule"
            className="rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/20"
          >
            Manage Schedule
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← Home
          </Link>
        </div>
      </div>

      {/* Period nav */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
        <button
          onClick={goPrev}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          ← Previous 2 weeks
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={goToToday}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20"
          >
            Today
          </button>
          <span className="text-lg font-semibold text-white">
            {formatDateShort(days[0])} – {formatDateShort(days[13])}
          </span>
        </div>
        <button
          onClick={goNext}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          Next 2 weeks →
        </button>
      </div>

      {/* Grid: 7 columns (Mon–Sun) × 2 rows (2 weeks) */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const key = formatDateKey(d);
          const dayWorkouts = workoutsByDate[key] ?? [];
          const isToday =
            formatDateKey(new Date()) === key;

          return (
            <div
              key={key}
              className={`rounded-xl border p-3 ${
                isToday
                  ? "border-orange-500/50 bg-orange-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-xs font-medium text-white/60">
                {formatDateLabel(d)}
              </p>
              <div className="mt-2 space-y-2">
                {loading ? (
                  <p className="text-xs text-white/40">Loading…</p>
                ) : dayWorkouts.length === 0 ? (
                  <p className="text-xs text-white/30">Rest / —</p>
                ) : (
                  dayWorkouts.map((w) => (
                    <div
                      key={w.id}
                      className={`rounded-lg border-l-4 px-2 py-1.5 text-xs ${TYPE_COLORS[w.type]}`}
                    >
                      <span className="mr-1">{TYPE_ICONS[w.type]}</span>
                      <span className="font-medium text-white">
                        {w.name || w.type}
                      </span>
                      {(w.plannedDurationMinutes || w.plannedDistanceMeters) && (
                        <p className="mt-0.5 text-white/60">
                          {w.plannedDurationMinutes
                            ? formatDuration(w.plannedDurationMinutes)
                            : w.plannedDistanceMeters
                              ? formatDistance(w.plannedDistanceMeters)
                              : null}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
