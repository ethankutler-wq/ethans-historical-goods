import Link from "next/link";
import { ScheduleClient } from "./ScheduleClient";

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
          70.3
        </span>
        <span className="text-white/40">|</span>
        <span className="text-sm text-white/60">ethanshistoricalgoods</span>
      </div>
      <ScheduleClient />
    </div>
  );
}
