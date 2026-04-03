# Deployment Guide - Salon Management App

## Quick Summary

This guide walks you through deploying the Salon Management App to Vercel (recommended) or Railway.

## Prerequisites

- GitHub account (free)
- Vercel account (free)
- ~5 minutes of setup time

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Push Code to GitHub

Since we've already initialized git locally, you now need to push to GitHub.

**Create a new GitHub repository:**
1. Go to [github.com/new](https://github.com/new)
2. Create repository name: `salon-management-app`
3. Choose "Public" (or Private if you prefer)
4. Click "Create repository"

**Push local code:**
```bash
cd salon-management-app

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/salon-management-app.git

# Push code
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign in (create account if needed)
2. Click "Dashboard" → "Storage" (or "Postgres" tab)
3. Click "Create" → "Postgres" → "Create"
4. Select region (us-east-1 is fine)
5. Copy the connection string from ".env.local" - you'll need this next

### Step 3: Deploy to Vercel

**Via GitHub (Easiest):**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Find `salon-management-app` and click "Import"
5. On the settings page:
   - Framework: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Environment Variables:**
6. In "Environment Variables" section, add:
   - Key: `DATABASE_URL`
   - Value: [Paste the PostgreSQL connection string from Vercel Postgres]
7. Click "Deploy"

### Step 4: Run Database Migrations

After deployment completes:

1. Open your Vercel project dashboard
2. Click "Deployments" → Latest deployment
3. Click the "URL" to open your deployed app
4. In terminal, run migrations on the deployed database:

```bash
# Set environment to use production DATABASE_URL
# Option A: Temporarily update .env to production URL
# Option B: Use Vercel CLI

npx vercel env pull .env.local
npx prisma migrate deploy
npm run seed -- --production
```

**Or use Vercel CLI:**
```bash
npm i -g vercel
vercel env pull
npx prisma db push
npm run seed
```

### Your App is Live!

Visit `https://your-deployment.vercel.app` to see your salon management app!

---

## Option 2: Deploy to Railway

### Step 1-2: Push to GitHub (Same as Vercel)
(Follow steps 1 & 2 from Vercel guide above)

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `salon-management-app`
5. Add "PostgreSQL" service from "Add Service"
6. Configure environment variables:
   - `DATABASE_URL` will be auto-populated
   - Add `NODE_ENV=production`
7. Railway auto-deploys on git push!

---

## Post-Deployment: Customize for Production

### 1. Update Salon Data

The app currently uses seeded demo data. To customize:

**Option A: Update seed data and re-seed**
```bash
# Edit prisma/seed.ts with your salon info
npm run seed
```

**Option B: Create an admin page** (V2 feature)
- Add owner dashboard to add/edit salon information
- Currently, demo data is read-only

### 2. Add Custom Domain

**Vercel:**
1. Project Settings → Domains
2. Add your domain (e.g., `yoursalon.com`)
3. Follow DNS setup instructions

**Railway:**
1. Project Settings → Environment
2. Add RAILWAY_ENVIRONMENT_NAME
3. Configure custom domain in Project Settings

### 3. Monitor & Debug

**Vercel:**
- Analytics dashboard shows real-time traffic
- Function logs available in Deployments tab
- Error tracking via integrations

**Railway:**
- Real-time logs in dashboard
- Monitor CPU/memory usage
- Deployments history

---

## Common Issues & Fixes

### Issue: Database migrations fail on deploy

**Solution:**
```bash
# Run migrations locally then commit schema state
npx prisma db push
git add prisma/
git commit -m "Update database schema"
git push
```

### Issue: "DATABASE_URL not found"

**Solution:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Ensure `DATABASE_URL` is set for `Preview` and `Production`
3. Re-deploy after adding variable

### Issue: App loads but pages show "Loading..."

**Solution:**
- Check browser console for errors (F12 → Console)
- Verify API routes at `/api/salons` return data
- If 404: Check that `DATABASE_URL` is set in production

### Issue: Bookings don't persist

**Solution:**
- Verify database migration ran: Check Railway/Vercel logs
- Check that TimeSlots were created: Open database admin panel
- Re-run seed: `npm run seed`

---

## Architecture on Vercel

```
Your Domain
    ↓
Vercel CDN (Global Edge Network)
    ↓
Next.js Runtime (Serverless Functions)
    ├─ /api/* → API Routes (executed on-demand)
    ├─ /booking → Public Page
    ├─ /owner → Owner Dashboard
    └─ /stylist → Stylist Dashboard
    ↓
Vercel Postgres (Managed Database)
```

- **Automatic scaling**: Handles traffic spikes
- **Zero downtime deployments**: Git push → live in ~1 min
- **Preview URLs**: Every PR gets a live preview at `https://pr-123.yourproject.vercel.app`

---

## Performance Tips

### 1. Enable Caching
- Vercel automatically caches static page
- API routes cache for 60 seconds by default
- To cache longer:

```typescript
// In app/api/route.ts
export const revalidate = 3600; // Cache for 1 hour
```

### 2. Add ISR (Incremental Static Regeneration)
```typescript
// For /booking page
export const revalidate = 300; // Regenerate every 5 minutes
```

### 3. Monitor Database Connections
- Vercel Postgres includes connection pooling
- No configuration needed
- Supports up to 100 concurrent connections on free tier

---

## Scaling Beyond MVP

### When to Upgrade Vercel Plan
- **Free tier**: ~100k API requests/month perfect for MVP
- **Pro tier**: ~unlimited usage, needed when:
  - Multiple salons
  - 1000+ bookings/month
  - Real-time features added

### Database Upgrade Path
- **Free Vercel Postgres**: 1GB perfect for MVP
- **Paid Vercel Postgres**: Unlimited scaling
- **Alternative**: Use AWS RDS, managed by Railway/Render

### Multi-Tenant Expansion
1. Add `salonId` routing in API
2. Add salon selection to dashboards
3. Add owner authentication
4. Deploy new version - Vercel handles it!

---

## Monitoring & Analytics

### Setup Error Tracking (Optional)
```bash
npm install @sentry/nextjs
```

Add to vercel.json:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install @sentry/nextjs"
}
```

### Setup Usage Analytics
Vercel provides built-in analytics:
- Dashboard → Analytics tab
- View requests, edge requests, function invocations
- Monitor bandwidth usage

---

## Summary Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Create Vercel Postgres database
- [ ] Deploy via GitHub integration
- [ ] Set DATABASE_URL environment variable
- [ ] Run migrations: `vercel env pull && npx prisma db push`
- [ ] Run seed: `npm run seed`
- [ ] Test live URL
- [ ] Add custom domain (optional)
- [ ] Share link with salon owner!

**Estimated total time: 10-15 minutes**

Your salon management app is now live and ready for customers to book appointments! 🎉
