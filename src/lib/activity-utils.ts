export type Activity = {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain?: number;
  start_date: string;
  average_watts?: number;
  weighted_average_watts?: number;
  max_watts?: number;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
};

export const GOALS = {
  cycling: { count: 4, targetLabel: "4 rides, ~1hr each" },
  swimming: { count: 3, targetLabel: "3 swims, ~1000m each" },
  running: { count: 3, targetLabel: "3 runs, ~3mi each" },
} as const;

/** Distance from Earth to Moon in meters */
export const MOON_DISTANCE_M = 384_400_000;

function isCycling(a: Activity) {
  const t = (a.sport_type || a.type || "").toLowerCase();
  return t.includes("ride") || t.includes("bike") || t.includes("velomobile");
}

function isSwimming(a: Activity) {
  const t = (a.sport_type || a.type || "").toLowerCase();
  return t.includes("swim");
}

function isRunning(a: Activity) {
  const t = (a.sport_type || a.type || "").toLowerCase();
  return t.includes("run") || t === "walk" || t === "hike";
}

export function filterByType(
  activities: Activity[],
  type: "cycling" | "swimming" | "running"
): Activity[] {
  if (type === "cycling") return activities.filter(isCycling);
  if (type === "swimming") return activities.filter(isSwimming);
  if (type === "running") return activities.filter(isRunning);
  return [];
}

/** Aggregate total distance (meters) by discipline from all activities */
export function getTotalDistances(activities: Activity[]): {
  cycling: number;
  swimming: number;
  running: number;
  total: number;
} {
  const cycling = filterByType(activities, "cycling").reduce(
    (s, a) => s + a.distance,
    0
  );
  const swimming = filterByType(activities, "swimming").reduce(
    (s, a) => s + a.distance,
    0
  );
  const running = filterByType(activities, "running").reduce(
    (s, a) => s + a.distance,
    0
  );
  return {
    cycling,
    swimming,
    running,
    total: cycling + swimming + running,
  };
}

/** Get ISO week key (e.g. "2024-W42") for grouping */
export function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export type WeekSummary = {
  weekKey: string;
  weekStart: Date;
  count: number;
  totalDistance: number;
  totalMinutes: number;
  avgPerActivity: number;
  goalCount: number;
  goalMet: boolean;
  distanceUnit: "km" | "m" | "miles";
};

export function getWeeklySummaries(
  activities: Activity[],
  type: "cycling" | "swimming" | "running"
): WeekSummary[] {
  const filtered = filterByType(activities, type);
  const goal = GOALS[type];

  const byWeek = new Map<
    string,
    { activities: Activity[]; weekStart: Date }
  >();

  for (const a of filtered) {
    const date = new Date(a.start_date);
    const key = getWeekKey(date);
    if (!byWeek.has(key)) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      byWeek.set(key, { activities: [], weekStart });
    }
    byWeek.get(key)!.activities.push(a);
  }

  const summaries: WeekSummary[] = [];
  for (const [key, { activities: weekActivities, weekStart }] of byWeek.entries()) {
    const count = weekActivities.length;
    const totalDistance = weekActivities.reduce((s, a) => s + a.distance, 0);
    const totalMinutes = weekActivities.reduce(
      (s, a) => s + a.moving_time / 60,
      0
    );
    const avgPerActivity =
      count > 0
        ? type === "swimming"
          ? totalDistance / count
          : type === "running"
            ? totalDistance / 1609.34 / count
            : totalMinutes / count
        : 0;

    const goalCount = goal.count;

    const goalMet =
      type === "cycling"
        ? count >= goalCount && avgPerActivity >= 50
        : type === "swimming"
          ? count >= goalCount && avgPerActivity >= 800
          : count >= goalCount && avgPerActivity >= 2.5;

    summaries.push({
      weekKey: key,
      weekStart,
      count,
      totalDistance,
      totalMinutes,
      avgPerActivity,
      goalCount,
      goalMet,
      distanceUnit: type === "running" ? "miles" : type === "swimming" ? "m" : "km",
    });
  }

  return summaries.sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
  );
}

/** Rides with power and/or HR data for fitness analysis */
export function getRidesWithPowerOrHR(activities: Activity[]): Activity[] {
  const rides = filterByType(activities, "cycling");
  return rides.filter(
    (a) =>
      (a.average_watts != null || a.weighted_average_watts != null) &&
      a.average_heartrate != null
  );
}

/** Efficiency factor = watts per bpm. Higher = fitter (more power at same HR) */
export function getEfficiencyFactor(a: Activity): number | null {
  const watts = a.weighted_average_watts ?? a.average_watts;
  const hr = a.average_heartrate;
  if (watts == null || hr == null || hr < 50) return null;
  return watts / hr;
}

export type FitnessDataPoint = {
  weekKey: string;
  weekLabel: string;
  weekStart: Date;
  weekEnd: Date;
  efficiencyFactor: number;
  avgPower: number;
  avgHR: number;
  rideCount: number;
  trendline?: number;
};

const FITNESS_DATA_START = new Date("2024-12-01T00:00:00Z");

/** Weekly fitness metrics for rides with power + HR (Dec 2024 onwards) */
export function getFitnessTrendData(activities: Activity[]): FitnessDataPoint[] {
  const rides = getRidesWithPowerOrHR(activities).filter(
    (r) => new Date(r.start_date) >= FITNESS_DATA_START
  );
  const byWeek = new Map<
    string,
    { rides: Activity[]; weekStart: Date }
  >();

  for (const r of rides) {
    const date = new Date(r.start_date);
    const key = getWeekKey(date);
    if (!byWeek.has(key)) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      byWeek.set(key, { rides: [], weekStart });
    }
    byWeek.get(key)!.rides.push(r);
  }

  const points: FitnessDataPoint[] = [];
  for (const [key, { rides: weekRides, weekStart }] of byWeek.entries()) {
    const effFactors = weekRides
      .map(getEfficiencyFactor)
      .filter((e): e is number => e != null);
    const avgEff =
      effFactors.length > 0
        ? effFactors.reduce((s, e) => s + e, 0) / effFactors.length
        : 0;

    const powers = weekRides
      .map((r) => r.weighted_average_watts ?? r.average_watts)
      .filter((p): p is number => p != null);
    const avgPower =
      powers.length > 0 ? powers.reduce((s, p) => s + p, 0) / powers.length : 0;

    const hrs = weekRides
      .map((r) => r.average_heartrate)
      .filter((h): h is number => h != null);
    const avgHR = hrs.length > 0 ? hrs.reduce((s, h) => s + h, 0) / hrs.length : 0;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const fmt = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    const weekLabel = `${fmt(weekStart)}–${fmt(weekEnd)}`;

    points.push({
      weekKey: key,
      weekLabel,
      weekStart,
      weekEnd,
      efficiencyFactor: Math.round(avgEff * 10) / 10,
      avgPower: Math.round(avgPower),
      avgHR: Math.round(avgHR),
      rideCount: weekRides.length,
    });
  }

  const sorted = points.sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
  );

  if (sorted.length >= 2) {
    const n = sorted.length;
    const xValues = sorted.map((_, i) => i);
    const yValues = sorted.map((p) => p.efficiencyFactor);
    const sumX = xValues.reduce((s, x) => s + x, 0);
    const sumY = yValues.reduce((s, y) => s + y, 0);
    const sumXY = xValues.reduce((s, x, i) => s + x * yValues[i], 0);
    const sumX2 = xValues.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return sorted.map((p, i) => ({
      ...p,
      trendline: Math.round((intercept + slope * i) * 10) / 10,
    }));
  }

  return sorted.map((p) => ({ ...p, trendline: p.efficiencyFactor }));
}
