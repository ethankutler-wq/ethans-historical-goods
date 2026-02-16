# ethanshistoricalgoods

Your biking data, visualized your way. A custom Strava-powered dashboard.

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure Strava API**
   - Create an app at [Strava API Settings](https://www.strava.com/settings/api)
   - Set **Authorization Callback Domain** to `localhost` for local dev
   - See [STRAVA_SETUP.md](./STRAVA_SETUP.md) for the full walkthrough

3. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Strava Client ID and Client Secret.

4. **Database**
   ```bash
   echo 'DATABASE_URL="file:./dev.db"' >> .env.local
   npx prisma migrate dev --name init
   ```

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and click "Connect with Strava".

## Domain

Your domain stays the same. When deploying to production:

1. Set `NEXT_PUBLIC_APP_URL` to your production URL
2. Update Strava's Authorization Callback Domain to your domain (no `https://`)
