import { getValidAccessToken } from "@/lib/strava-token";
import { stravaFetch } from "@/lib/strava";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not connected to Strava" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "30";
  const before = searchParams.get("before");
  const after = searchParams.get("after");

  const params = new URLSearchParams({ page, per_page: perPage });
  if (before) params.set("before", before);
  if (after) params.set("after", after);

  try {
    const activities = await stravaFetch<unknown[]>(
      `/athlete/activities?${params.toString()}`,
      accessToken
    );
    return NextResponse.json(activities);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    throw err;
  }
}
