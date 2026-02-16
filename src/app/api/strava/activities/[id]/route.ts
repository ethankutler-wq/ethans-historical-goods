import { getValidAccessToken } from "@/lib/strava-token";
import { stravaFetch } from "@/lib/strava";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not connected to Strava" }, { status: 401 });
  }

  try {
    const activity = await stravaFetch<unknown>(`/activities/${id}`, accessToken);
    return NextResponse.json(activity);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    throw err;
  }
}
