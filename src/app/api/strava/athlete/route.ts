import { getValidAccessToken } from "@/lib/strava-token";
import { stravaFetch } from "@/lib/strava";
import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not connected to Strava" }, { status: 401 });
  }

  try {
    const athlete = await stravaFetch<unknown>("/athlete", accessToken);
    return NextResponse.json(athlete);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    throw err;
  }
}
