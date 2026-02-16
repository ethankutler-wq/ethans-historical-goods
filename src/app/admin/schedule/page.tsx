import Link from "next/link";
import { AdminScheduleClient } from "./AdminScheduleClient";

export default function AdminSchedulePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
          Admin
        </span>
        <span className="text-white/40">|</span>
        <span className="text-sm text-white/60">Manage workouts</span>
      </div>
      <AdminScheduleClient />
    </div>
  );
}
