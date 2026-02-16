/** Get Monday of the week containing the given date */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get array of 14 days starting from Monday (biweekly: Mon week1 -> Sun week2) */
export function getBiweeklyDays(startMonday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startMonday);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });
}
