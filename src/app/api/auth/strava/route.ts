import { getStravaAuthUrl } from "@/lib/strava";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = getStravaAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Strava auth error:", err);
    return NextResponse.redirect(
      new URL("/?error=strava_config", process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
