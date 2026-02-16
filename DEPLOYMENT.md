# Deployment Guide (Railway + SQLite)

The app uses **SQLite** and **Strava OAuth**. Railway supports SQLite with persistent storage—no database setup needed.

---

## 1. Push to GitHub

```bash
git add .
git commit -m "Revert to SQLite for Railway deployment"
git push origin main
```

---

## 2. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in (GitHub)
2. **New Project** → **Deploy from GitHub repo** → select `ethans-historical-goods`
3. Railway will detect Next.js

---

## 3. Add SQLite volume

1. In your project, click **+ New** → **Volume**
2. Name it `data`
3. Mount path: `/data`
4. Attach it to your service

---

## 4. Set environment variables

In Railway → your service → **Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:/data/railway.db` |
| `STRAVA_CLIENT_ID` | From [Strava API Settings](https://www.strava.com/settings/api) |
| `STRAVA_CLIENT_SECRET` | From Strava API Settings |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.up.railway.app` (Railway will give you this) |

---

## 5. Run migrations

Add to your build command or run once:

```bash
npx prisma migrate deploy
```

Or add to `package.json` build: `"build": "prisma generate && prisma migrate deploy && next build"`

---

## 6. Update Strava

[Strava API Settings](https://www.strava.com/settings/api) → **Authorization Callback Domain**: add your Railway domain (e.g. `your-app.up.railway.app`)

---

## Local development

Uses SQLite out of the box. Just run:

```bash
npm install
npx prisma migrate dev
npm run dev
```
