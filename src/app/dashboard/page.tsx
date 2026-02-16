import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const token = await prisma.stravaToken.findFirst();
  if (!token) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
          70.3
        </span>
        <span className="text-white/40">|</span>
        <span className="text-sm text-white/60">ethanshistoricalgoods</span>
      </div>
      <DashboardClient />
    </div>
  );
}
