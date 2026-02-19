# Philosophy Of.

A social blogging platform for personal philosophies on granular, specific topics.

Every post is permanently numbered from **100,000 down to 1**. Once they're gone, they're gone.

---

## Stack

- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — auth, database (Postgres), row-level security
- **Tailwind CSS** — styling
- **Vercel** — deployment (recommended)

---

## Setup (one-time, ~15 minutes)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any name and region)
3. Wait for it to finish provisioning (~1 minute)

### 2. Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Copy the entire contents of `supabase/migrations/001_init.sql`
3. Paste it into the editor and click **Run**

### 3. Configure auth

1. In Supabase, go to **Authentication → URL Configuration**
2. Set **Site URL** to your app URL (e.g. `https://your-app.vercel.app` or `http://localhost:3000` for local dev)
3. Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

### 4. Get your API keys

In your Supabase project, go to **Project Settings → API**. You need:
- **Project URL** (looks like `https://xxxx.supabase.co`)
- **anon / public key**

### 5. Set environment variables

**For local development:**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**For Vercel deployment:** In your Vercel project → Settings → Environment Variables, add the same two variables.

### 6. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add the two environment variables during setup
4. Click Deploy

Vercel auto-deploys on every push to `main`.

---

## How the countdown works

- The first post ever gets number **100,000**
- Each subsequent post gets the next number down: 99,999, 99,998, …
- Numbers are assigned atomically in the database — no duplicates possible
- If a post is deleted, its number is **permanently retired** (never reused)
- Once all 100,000 numbers are claimed, the platform stops accepting new posts

---

## File structure

```
app/
  page.tsx                      Public feed
  new/page.tsx                  Create a post (auth required)
  post/[id]/page.tsx            Individual post with likes + comments
  profile/[username]/page.tsx   User profile + their posts
  auth/signin/page.tsx          Sign in
  auth/signup/page.tsx          Sign up
  auth/callback/route.ts        Email confirmation handler
  api/posts/route.ts            POST: create a post
  api/likes/route.ts            POST: toggle a like
  api/comments/route.ts         POST: create a comment
components/
  Navbar.tsx                    Top nav with countdown display
  LikeButton.tsx                Optimistic like/unlike
  CommentSection.tsx            Comment list + form
  EditProfileForm.tsx           Inline profile editor
lib/supabase/
  client.ts                     Browser Supabase client
  server.ts                     Server Supabase client
supabase/migrations/
  001_init.sql                  Full database schema — run this once
middleware.ts                   Auth session refresh on every request
```
