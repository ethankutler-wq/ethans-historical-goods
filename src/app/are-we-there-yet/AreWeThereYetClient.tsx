"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Activity } from "@/lib/activity-utils";
import {
  getTotalDistances,
  MOON_DISTANCE_M,
} from "@/lib/activity-utils";

const MOON_DISTANCE_MI = MOON_DISTANCE_M / 1609.34;

export function AreWeThereYetClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/strava/activities/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setActivities)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { cycling, swimming, running, total } = getTotalDistances(activities);
  const totalMi = total / 1609.34;
  const progress = Math.min(1, total / MOON_DISTANCE_M);
  const progressPct = (progress * 100).toFixed(2);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-white/60">Calculating your journey…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            Are we there yet?
          </h1>
          <p className="mt-1 text-white/60">
            Your Strava journey to the Moon
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-white/60 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/schedule"
            className="text-sm text-white/60 hover:text-white"
          >
            Schedule
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← Home
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Cycling
          </p>
          <p className="mt-1 text-xl font-bold text-orange-400">
            {(cycling / 1609.34).toFixed(1)} mi
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Swimming
          </p>
          <p className="mt-1 text-xl font-bold text-cyan-400">
            {(swimming / 1609.34).toFixed(1)} mi
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Running
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-400">
            {(running / 1609.34).toFixed(1)} mi
          </p>
        </div>
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-orange-400">
            Total
          </p>
          <p className="mt-1 text-xl font-bold text-orange-400">
            {totalMi.toFixed(1)} mi
          </p>
        </div>
      </div>

      {/* Progress to moon */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="mb-2 text-center text-sm text-white/60">
          {totalMi.toFixed(1)} mi of {MOON_DISTANCE_MI.toLocaleString()} mi to the Moon
        </p>
        <p className="mb-6 text-center text-3xl font-black text-white">
          {progressPct}% there
        </p>

        {/* Earth ——— [astronaut] ——— Moon */}
        <div className="relative mx-auto max-w-2xl">
          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                }}
              />
            ))}
          </div>

          {/* Progress track */}
          <div className="relative flex items-center justify-between gap-2 px-2 py-16 sm:px-6">
            {/* Earth */}
            <div className="relative z-10 flex shrink-0 flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-emerald-800 shadow-lg shadow-blue-500/30 sm:h-16 sm:w-16" />
              <p className="mt-2 text-xs font-medium text-white/70">Earth</p>
            </div>

            {/* Path with astronaut */}
            <div className="relative z-10 flex-1" style={{ minWidth: 0 }}>
              <div className="relative h-3 rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500/60 to-orange-400 transition-all duration-1000"
                  style={{ width: `${Math.max(2, progress * 100)}%` }}
                />
              </div>
              {/* Astronaut positioned along the path */}
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                style={{ left: `${progress * 100}%` }}
              >
                <AstronautIcon />
              </div>
            </div>

            {/* Moon */}
            <div className="relative z-10 flex shrink-0 flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 shadow-lg shadow-slate-500/30 sm:h-16 sm:w-16" />
              <p className="mt-2 text-xs font-medium text-white/70">Moon</p>
            </div>
          </div>
        </div>

        {(progress >= 1 && (
          <p className="mt-6 text-center text-lg font-bold text-emerald-400">
            🎉 You made it! You’ve traveled the distance to the Moon!
          </p>
        )) || (
          <p className="mt-6 text-center text-sm text-white/50">
            Keep training — {((MOON_DISTANCE_M - total) / 1609.34).toFixed(0)} mi to go!
          </p>
        )}
      </div>
    </div>
  );
}

function AstronautIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className="drop-shadow-lg"
    >
      {/* Helmet */}
      <circle
        cx="20"
        cy="14"
        r="10"
        fill="white"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      <circle cx="18" cy="13" r="1.5" fill="#1e293b" />
      <circle cx="22" cy="13" r="1.5" fill="#1e293b" />
      {/* Body */}
      <ellipse cx="20" cy="28" rx="8" ry="6" fill="white" />
      {/* Arms */}
      <path
        d="M12 22 Q8 24 10 28"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28 22 Q32 24 30 28"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Legs */}
      <path
        d="M16 33 L16 38 M24 33 L24 38"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
