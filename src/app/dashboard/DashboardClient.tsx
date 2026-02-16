"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { Activity } from "@/lib/activity-utils";
import {
  filterByType,
  getWeeklySummaries,
  getFitnessTrendData,
  getRidesWithPowerOrHR,
  GOALS,
} from "@/lib/activity-utils";

type Tab = "cycling" | "swimming" | "running";

function formatDistance(m: number) {
  return `${(m / 1609.34).toFixed(1)} mi`;
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatWeekLabel(weekKey: string) {
  const [year, w] = weekKey.split("-W");
  return `W${parseInt(w, 10)} '${year.slice(2)}`;
}

function DisciplineTab({
  activities,
  type,
  isLoading,
}: {
  activities: Activity[];
  type: Tab;
  isLoading: boolean;
}) {
  const filtered = filterByType(activities, type);
  const summaries = getWeeklySummaries(activities, type);
  const goal = GOALS[type];

  const chartData = summaries.slice(0, 16).reverse().map((s) => ({
    week: formatWeekLabel(s.weekKey),
    count: s.count,
    goal: goal.count,
    avg:
      type === "cycling"
        ? Math.round(s.avgPerActivity)
        : type === "swimming"
          ? (s.avgPerActivity / 1609.34).toFixed(1)
          : s.avgPerActivity.toFixed(1),
    goalMet: s.goalMet ? 1 : 0,
  }));

  const recentWeeks = summaries.slice(0, 4);
  const weeksHit = recentWeeks.filter((w) => w.goalMet).length;

  // Fitness progress (cycling only)
  const fitnessData = type === "cycling" ? getFitnessTrendData(activities) : [];
  const ridesWithPowerHR = type === "cycling" ? getRidesWithPowerOrHR(activities) : [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
        Loading {type} data…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Goal progress */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">
          Weekly goal: {goal.targetLabel}
        </h3>
        <p className="mt-2 text-2xl font-bold text-white">
          Last 4 weeks: {weeksHit}/4 on track
        </p>
        <div className="mt-4 flex gap-2">
          {recentWeeks.map((w) => (
            <div
              key={w.weekKey}
              className={`flex-1 rounded-lg px-3 py-2 text-center text-sm ${
                w.goalMet
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/60"
              }`}
            >
              {formatWeekLabel(w.weekKey)}: {w.count}/{goal.count}
            </div>
          ))}
        </div>
      </div>

      {/* Fitness progress - cycling only */}
      {type === "cycling" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-white/60">
            Fitness progress
          </h3>
          {fitnessData.length > 0 ? (
            <>
              <p className="mb-4 text-xs text-white/50">
                Efficiency factor (watts per bpm) — higher = fitter. Dec 2024 onwards. Based on {fitnessData.reduce((s, p) => s + p.rideCount, 0)} rides with power + HR.
              </p>
              <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={fitnessData}
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(23,23,23)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  content={({ active, payload }) =>
                    active && payload?.[0]?.payload ? (
                      <div className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2">
                        <p className="font-medium text-white">
                          {payload[0].payload.weekLabel}
                        </p>
                        <p className="text-sm text-emerald-400">
                          Efficiency: {payload[0].payload.efficiencyFactor} W/bpm
                        </p>
                        <p className="text-sm text-white/60">
                          Avg power: {payload[0].payload.avgPower}W · Avg HR: {payload[0].payload.avgHR} bpm
                        </p>
                        <p className="text-xs text-white/40">
                          {payload[0].payload.rideCount} rides
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="efficiencyFactor"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ fill: "#34d399", r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Efficiency (W/bpm)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="trendline"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                  name="Trend"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPower"
                  stroke="rgba(251,146,60,0.7)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ fill: "rgba(251,146,60,0.5)", r: 2 }}
                  name="Avg power (W)"
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-white/70">{value}</span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-white/50">
              No power + heart rate data yet. Record rides with a power meter and HR monitor to see your fitness trend.
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/60">
          Sessions per week
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="week"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                domain={[0, "auto"]}
              />
              <ReferenceLine
                y={goal.count}
                stroke="rgba(34,197,94,0.5)"
                strokeDasharray="4 4"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(23,23,23)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2">
                      <p className="font-medium text-white">
                        {payload[0].value} sessions
                      </p>
                      <p className="text-sm text-white/60">
                        Avg: {String(payload[0].payload.avg)}
                        {type === "cycling" ? " min" : " mi"}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="count"
                fill="rgba(251,146,60,0.8)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity list */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/60">
          5 most recent ({filtered.length} total)
        </h3>
        <div className="space-y-2">
          {filtered.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{a.name}</p>
                <p className="text-sm text-white/50">
                  {new Date(a.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-white">
                  {formatDistance(a.distance)}
                </p>
                <p className="text-white/50">
                  {formatDuration(a.moving_time / 60)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("cycling");

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "cycling", label: "Cycling", icon: "🚴" },
    { id: "swimming", label: "Swimming", icon: "🏊" },
    { id: "running", label: "Running", icon: "🏃" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            70.3 Training Dashboard
          </h1>
          <p className="text-white/60">
            Track consistency · Hit your weekly goals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/are-we-there-yet"
            className="text-sm text-white/60 hover:text-white"
          >
            Are we there yet?
          </Link>
          <Link
            href="/schedule"
            className="text-sm text-white/60 hover:text-white"
          >
            Schedule
          </Link>
          <Link
            href="/"
            className="text-sm text-white/60 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-orange-500 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      ) : (
        <DisciplineTab
          activities={activities}
          type={tab}
          isLoading={loading}
        />
      )}
    </div>
  );
}
