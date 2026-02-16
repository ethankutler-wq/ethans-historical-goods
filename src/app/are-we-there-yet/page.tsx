import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AreWeThereYetClient } from "./AreWeThereYetClient";

export const dynamic = "force-dynamic";

export default async function AreWeThereYetPage() {
  const token = await prisma.stravaToken.findFirst();
  if (!token) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
          70.3
        </span>
        <span className="text-white/40">|</span>
        <span className="text-sm text-white/60">ethanshistoricalgoods</span>
      </div>
      <AreWeThereYetClient />
    </div>
  );
}
