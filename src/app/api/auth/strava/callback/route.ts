import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken } from "@/lib/strava";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error === "access_denied") {
    return NextResponse.redirect(new URL("/?error=denied", baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", baseUrl));
  }

  try {
    const tokens = await exchangeCodeForToken(code);

    await prisma.stravaToken.upsert({
      where: { athleteId: tokens.athleteId },
      create: {
        athleteId: tokens.athleteId,
        athleteName: tokens.athleteName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      update: {
        athleteName: tokens.athleteName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(new URL("/?error=exchange_failed", baseUrl));
  }
}
