# Deployment Guide

Your app uses **SQLite** and **Strava OAuth**. Here are deployment options.

---

## Option A: Railway (recommended – SQLite works as-is)

Railway supports SQLite with persistent storage. No database changes needed.

### 1. Push code to GitHub

```bash
cd /Users/ethankutler/ethanshistoricalgoods
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ethanshistoricalgoods.git
git push -u origin main
```

### 2. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in (GitHub)
2. **New Project** → **Deploy from GitHub repo** → select your repo
3. Railway will detect Next.js and build automatically

### 3. Add SQLite volume

1. In your project, click **+ New** → **Volume**
2. Name it `data`
3. Mount path: `/data`
4. Copy the volume path (e.g. `/data/railway.db`)

### 4. Set environment variables

In Railway → your service → **Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:/data/railway.db` |
| `STRAVA_CLIENT_ID` | Your Strava Client ID |
| `STRAVA_CLIENT_SECRET` | Your Strava Client Secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.up.railway.app` (or your custom domain) |

### 5. Run migrations

In Railway → your service → **Settings** → add a **Deploy** command or run manually:

```bash
npx prisma migrate deploy
```

Or add to `package.json` build script (already has `prisma generate`). For first deploy, you may need to run migrations in a one-off command.

### 6. Update Strava API settings

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. **Authorization Callback Domain**: add `your-app.up.railway.app` (no `https://`)

---

## Option B: Vercel + Turso (serverless SQLite)

Vercel is serverless; file-based SQLite won’t work. Use [Turso](https://turso.tech) for SQLite-compatible hosting.

### 1. Create Turso database

```bash
# Install Turso CLI: https://docs.turso.tech/cli
turso db create ethanshistoricalgoods
turso db show ethanshistoricalgoods --url  # copy the libsql URL
turso db tokens create ethanshistoricalgoods  # copy the auth token
```

### 2. Switch Prisma to Turso

Install the driver:

```bash
npm install @libsql/client
```

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "sqlite"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Add to `.env`:

```
DATABASE_URL="libsql://ethanshistoricalgoods-YOUR_ORG.turso.io?authToken=YOUR_TOKEN"
DIRECT_URL="file:./dev.db"  # for migrations locally
```

Then run migrations and deploy to Vercel. (Turso setup has more steps; see [Turso + Prisma docs](https://docs.turso.tech/guides/prisma).)

---

## Option C: Vercel + Postgres (Supabase/Neon)

Use Postgres instead of SQLite. Requires a schema migration.

### 1. Create Postgres database

- [Supabase](https://supabase.com) or [Neon](https://neon.tech)
- Copy the connection string

### 2. Update Prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Migrate schema

```bash
npx prisma migrate dev --name switch_to_postgres
```

### 4. Deploy to Vercel

1. Push to GitHub
2. [vercel.com](https://vercel.com) → Import project
3. Add env vars: `DATABASE_URL`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`
4. Deploy

---

## Checklist (any option)

- [ ] Code pushed to GitHub
- [ ] `DATABASE_URL` set for production
- [ ] `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` set
- [ ] `NEXT_PUBLIC_APP_URL` = your production URL (e.g. `https://your-app.railway.app`)
- [ ] Strava **Authorization Callback Domain** includes your production domain
- [ ] Prisma migrations run (`npx prisma migrate deploy`)

---

## Quick start: Railway

```bash
# 1. Install Railway CLI (optional)
npm i -g @railway/cli
railway login

# 2. From your project directory
cd /Users/ethankutler/ethanshistoricalgoods
railway init
railway add  # add a volume for SQLite
railway up  # deploy
```

Then set variables in the Railway dashboard and update Strava’s callback domain.
