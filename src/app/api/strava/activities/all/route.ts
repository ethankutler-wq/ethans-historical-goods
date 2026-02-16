import { getValidAccessToken } from "@/lib/strava-token";
import { stravaFetch } from "@/lib/strava";
import { NextResponse } from "next/server";

const PER_PAGE = 200;
const MAX_PAGES = 10; // 2000 activities max to avoid rate limits

export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not connected to Strava" }, { status: 401 });
  }

  const allActivities: unknown[] = [];
  let page = 1;

  try {
    while (page <= MAX_PAGES) {
      const activities = await stravaFetch<unknown[]>(
        `/athlete/activities?page=${page}&per_page=${PER_PAGE}`,
        accessToken
      );

      if (!Array.isArray(activities) || activities.length === 0) break;

      allActivities.push(...activities);
      if (activities.length < PER_PAGE) break;
      page++;
    }

    return NextResponse.json(allActivities);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    throw err;
  }
}
