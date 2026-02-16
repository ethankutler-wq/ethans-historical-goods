# Strava API Setup Walkthrough

This guide walks you through connecting ethanshistoricalgoods to the Strava API for biking data and custom dashboards.

---

## Step 1: Create a Strava API Application

1. Go to **[Strava API Settings](https://www.strava.com/settings/api)** (or [labs.strava.com/developers](https://labs.strava.com/developers)).

2. Fill out the form:
   - **Application Name**: `ethanshistoricalgoods` (or your preferred name)
   - **Category**: Choose "Personal" or "Visualizer"
   - **Club**: Leave blank unless you have one
   - **Website**: Your domain (e.g. `https://ethanshistoricalgoods.com`)
   - **Authorization Callback Domain**: **Critical** — this must match your redirect URI
     - **Local dev**: `localhost`
     - **Production**: Your domain without `https://` (e.g. `ethanshistoricalgoods.com`)

3. Click **Create**.

4. You'll receive:
   - **Client ID** (integer)
   - **Client Secret** (keep this private)

---

## Step 2: Environment Variables

Create `.env.local` in the project root:

```env
# Strava API (from https://www.strava.com/settings/api)
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# OAuth redirect - must match Strava "Authorization Callback Domain"
# Local: http://localhost:3000/api/auth/strava/callback
# Production: https://yourdomain.com/api/auth/strava/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: The callback URL is `{NEXT_PUBLIC_APP_URL}/api/auth/strava/callback`. Strava validates the *domain* of your redirect URI against the "Authorization Callback Domain" you set. So:
- For `http://localhost:3000/api/auth/strava/callback` → use `localhost` as the callback domain
- For `https://ethanshistoricalgoods.com/api/auth/strava/callback` → use `ethanshistoricalgoods.com`

---

## Step 3: OAuth Flow Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Your App  │     │   Strava    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  Click "Connect   │                   │
       │  Strava"          │                   │
       │──────────────────>│                   │
       │                   │  Redirect to       │
       │                   │  /oauth/authorize  │
       │                   │──────────────────>│
       │                   │                   │
       │  User logs in &    │                   │
       │  authorizes       │                   │
       │<──────────────────────────────────────│
       │                   │                   │
       │  Redirect with    │                   │
       │  ?code=xxx        │                   │
       │──────────────────>│                   │
       │                   │  POST /oauth/token │
       │                   │  (code + secret)   │
       │                   │──────────────────>│
       │                   │                   │
       │                   │  access_token +    │
       │                   │  refresh_token    │
       │                   │<──────────────────│
       │                   │                   │
       │  Store tokens,    │                   │
       │  show dashboard  │                   │
       │<──────────────────│                   │
```

---

## Step 4: Scopes to Request

For biking dashboards, request these scopes when building the auth URL:

| Scope | Purpose |
|-------|---------|
| `activity:read_all` | All activities (including private) — needed for full history |
| `profile:read_all` | Profile info (FTP, weight for power-based metrics) |

Minimal scope for public activities only: `activity:read`

**Example scope string**: `activity:read_all,profile:read_all`

---

## Step 5: Token Lifecycle

- **Access token**: Expires every **6 hours**. Use for API requests.
- **Refresh token**: Long-lived. Use to get new access tokens when they expire.
- **Storage**: Store the refresh token securely (DB, encrypted). Never expose it to the client.

When you get a 401 from Strava, call the token refresh endpoint:

```
POST https://www.strava.com/oauth/token
  grant_type=refresh_token
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_CLIENT_SECRET
  refresh_token=YOUR_REFRESH_TOKEN
```

---

## Step 6: Key API Endpoints for Biking Dashboards

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/athlete` | GET | Current athlete profile |
| `/athlete/activities` | GET | List activities (paginated, `before`/`after` timestamps) |
| `/activities/{id}` | GET | Single activity details (distance, elevation, watts, map, etc.) |
| `/activities/{id}/streams` | GET | Time-series data: latlng, altitude, velocity, watts, cadence, heartrate |

**Activity list params**: `before`, `after` (Unix timestamps), `page`, `per_page` (max 200)

**Streams**: Request keys like `latlng`, `altitude`, `velocity_smooth`, `watts`, `cadence`, `heartrate`, `temp`

---

## Step 7: Rate Limits

- **200 requests** per 15 minutes
- **2,000 requests** per day

For dashboards: cache activity list, fetch details/streams on demand. Consider webhooks for new activities to avoid polling.

---

## Step 8: Domain & Deployment

Your domain is already set up. When deploying (e.g. Vercel):

1. Add env vars in the hosting dashboard
2. Set **Authorization Callback Domain** in Strava to your production domain
3. Set `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`

---

## Next Steps

1. Add `.env.local` with your Strava credentials
2. Run the app and click "Connect Strava"
3. Authorize the app in the Strava popup
4. You'll be redirected back with tokens stored; the dashboard will load your activities
