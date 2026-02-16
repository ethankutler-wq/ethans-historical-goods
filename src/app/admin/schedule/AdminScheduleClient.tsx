"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMonday,
  getBiweeklyDays,
  formatDateKey,
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

const TYPES: WorkoutType[] = ["cycling", "swimming", "running"];

export function AdminScheduleClient() {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [startMonday, setStartMonday] = useState<Date>(() => {
    const today = new Date();
    return getMonday(today);
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<WorkoutType>("cycling");
  const [formName, setFormName] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formDistance, setFormDistance] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = getBiweeklyDays(startMonday);
  const startStr = formatDateKey(days[0]);
  const endStr = formatDateKey(days[13]);

  const fetchWorkouts = () => {
    setLoading(true);
    fetch(`/api/workouts?start=${startStr}&end=${endStr}`)
      .then((res) => res.json())
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkouts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startStr, endStr]);

  const resetForm = () => {
    setFormDate("");
    setFormType("cycling");
    setFormName("");
    setFormDuration("");
    setFormDistance("");
    setFormNotes("");
    setShowAddForm(false);
    setEditingId(null);
    setError(null);
  };

  const openAddForm = (date?: string) => {
    resetForm();
    setFormDate(date || formatDateKey(days[0]));
    setShowAddForm(true);
  };

  const openEditForm = (w: ScheduledWorkout) => {
    setEditingId(w.id);
    setFormDate(w.date.slice(0, 10));
    setFormType(w.type);
    setFormName(w.name || "");
    setFormDuration(w.plannedDurationMinutes?.toString() || "");
    setFormDistance(w.plannedDistanceMeters?.toString() || "");
    setFormNotes(w.notes || "");
    setShowAddForm(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      date: formDate,
      type: formType,
      name: formName || null,
      plannedDurationMinutes: formDuration ? parseInt(formDuration, 10) : null,
      plannedDistanceMeters: formDistance ? parseInt(formDistance, 10) : null,
      notes: formNotes || null,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/workouts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
      }
      resetForm();
      fetchWorkouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workout?")) return;
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchWorkouts();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Manage Workouts
          </h1>
          <p className="text-white/60">
            Add, edit, or delete scheduled workouts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/schedule"
            className="text-sm text-white/60 hover:text-white"
          >
            ← View Schedule
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            Home
          </Link>
        </div>
      </div>

      {/* Period nav */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
        <button
          onClick={goPrev}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          ← Previous
        </button>
        <span className="text-lg font-semibold text-white">
          {formatDateShort(days[0])} – {formatDateShort(days[13])}
        </span>
        <button
          onClick={goNext}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          Next →
        </button>
      </div>

      {/* Add workout */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Add workout
          </h2>
          <button
            onClick={() => openAddForm()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            + Add workout
          </button>
        </div>

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-white/60">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/60">
                  Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as WorkoutType)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">
                Name (optional)
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Morning ride, Long run"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-white/60">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="60"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/60">
                  Distance (meters)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formDistance}
                  onChange={(e) => setFormDistance(e.target.value)}
                  placeholder="1000 for swim, 4828 for 3mi run"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">
                Notes (optional)
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                placeholder="Zone 2, intervals, etc."
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : editingId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Quick-add by day */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Workouts this period
        </h2>
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const key = formatDateKey(d);
              const dayWorkouts = workoutsByDate[key] ?? [];
              return (
                <div
                  key={key}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs font-medium text-white/60">
                    {d.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <button
                    onClick={() => openAddForm(key)}
                    className="mt-2 w-full rounded border border-dashed border-white/20 py-1.5 text-xs text-white/50 hover:border-orange-500/50 hover:text-orange-400"
                  >
                    + Add
                  </button>
                  <div className="mt-2 space-y-1">
                    {dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-xs"
                      >
                        <span className="truncate text-white">
                          {w.name || w.type}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditForm(w)}
                            className="text-orange-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(w.id)}
                            className="text-red-400 hover:underline"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
