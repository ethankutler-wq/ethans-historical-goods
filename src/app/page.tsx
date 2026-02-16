import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const hasToken = await prisma.stravaToken.findFirst().then(Boolean);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
          Ironman 70.3
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
          TRAIN.
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            TRACK.
          </span>
          <br />
          FINISH.
        </h1>
        <p className="mt-6 text-lg text-white/70">
          Your personal 70.3 training dashboard. Connect Strava to visualize
          consistency and crush your weekly goals.
        </p>
      </div>

      {hasToken ? (
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
          >
            Open Dashboard →
          </Link>
          <Link
            href="/are-we-there-yet"
            className="inline-flex items-center gap-2 rounded-lg border border-orange-500/50 bg-orange-500/10 px-8 py-4 font-bold text-orange-400 transition hover:bg-orange-500/20"
          >
            Are we there yet? 🌙
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-bold text-white/80 transition hover:bg-white/10"
          >
            Training Schedule →
          </Link>
        </div>
      ) : (
        <a
          href="/api/auth/strava"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
        >
          <StravaIcon />
          Connect Strava to Start
        </a>
      )}

      <div className="mt-12 flex gap-8 text-center text-sm text-white/50">
        <div>
          <p className="font-semibold text-white/70">4 rides/week</p>
          <p>~1hr each</p>
        </div>
        <div>
          <p className="font-semibold text-white/70">3 swims/week</p>
          <p>~0.6 mi each</p>
        </div>
        <div>
          <p className="font-semibold text-white/70">3 runs/week</p>
          <p>~3 miles each</p>
        </div>
      </div>
    </div>
  );
}

function StravaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0H6.992L0 17.944h3.065" />
    </svg>
  );
}
