# Paradigm — Project Tracker

A project tracking platform for Paradigm Oral Healths managing national accounts.

---

## Deploy to Vercel (Step-by-Step)

### 1. Push to GitHub
1. Create a new repo on GitHub (private recommended)
2. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/paradigm-oh.git
   git push -u origin main
   ```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework will auto-detect as **Next.js** — leave defaults

### 3. Add Postgres Database
1. In your Vercel project → **Storage** tab → **Create Database** → **Postgres**
2. Name it `paradigm-oh-db`, choose a region close to you
3. Click **Connect** — Vercel auto-populates all `POSTGRES_*` env vars

### 3b. Add Blob Storage (for photo uploads)
1. In your Vercel project → **Storage** tab → **Create Database** → **Blob**
2. Name it `paradigm-oh-blob`
3. Click **Connect** — Vercel auto-populates `BLOB_READ_WRITE_TOKEN`

### 4. Set Environment Variables
In Vercel → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `ADMIN_PASSWORD` | Your chosen admin password |
| `VIEWER_PASSWORD` | Your chosen viewer (customer) password |
| `JWT_SECRET` | A random string, 32+ chars (use a password generator) |

> The `POSTGRES_*` vars are set automatically when you connect the database.

### 5. Deploy
Click **Deploy**. Vercel builds and deploys automatically.

### 6. Initialize the Database
After deploy, visit:
```
https://your-app.vercel.app/api/migrate
```
(Log in as admin first.) This creates the database table.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
# Fill in .env.local with your passwords + Vercel Postgres credentials

# Run dev server
npm run dev
```

Visit http://localhost:3000

---

## How It Works

- **Admin login** → full access: add projects, edit all fields, delete
- **Viewer login** → read-only view of all projects and statuses
- **Project Status** → expandable phase tracker with 9 stages
- **Invoice Status** → expandable tracker with 5 stages + date field
- Data persists in Vercel Postgres, accessible from any device

---

## Project Phases

**Project Status:** Pending → Proposal Approval → Design → Design Approval → Pending Deposit → Manufacturing → Shipping → Pending Installation → Final Balance

**Invoice Status:** No Invoice Issued → Pending Deposit → Deposit Received → Pending Final Balance → Paid in Full
