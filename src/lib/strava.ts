const STRAVA_BASE = "https://www.strava.com";
const STRAVA_API = "https://www.strava.com/api/v3";

export function getStravaAuthUrl(state?: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectUri = `${baseUrl}/api/auth/strava/callback`;

  if (!clientId) {
    throw new Error("STRAVA_CLIENT_ID is not set");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "force",
    scope: "activity:read_all,profile:read_all",
    ...(state && { state }),
  });

  return `${STRAVA_BASE}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectUri = `${baseUrl}/api/auth/strava/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Strava credentials not configured");
  }

  const res = await fetch(`${STRAVA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token exchange failed: ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number; firstname: string; lastname: string };
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at * 1000),
    athleteId: String(data.athlete.id),
    athleteName: `${data.athlete.firstname} ${data.athlete.lastname}`.trim(),
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Strava credentials not configured");
  }

  const res = await fetch(`${STRAVA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token refresh failed: ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at * 1000),
  };
}

export async function stravaFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${STRAVA_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava API error: ${err}`);
  }

  return res.json() as Promise<T>;
}
