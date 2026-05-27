# RewardQuest (cloud version)

Two-account family reward app. Parent and kid each sign in on their own phones,
share the same data live. Photo/video proofs upload to Supabase, parent
approves from their phone, points and video archive sync across devices.

## What this version adds vs. local version

- Real accounts (parent + kid)
- Parent dashboard on a separate phone
- Live sync between phones
- Cloud video archive that survives forever
- Reward redemption queue

## Deploying

You need: a Supabase project (already set up), a GitHub account, a Vercel
account, and the custom domain.

### 1. Push to GitHub

1. Create a new GitHub repo named `rewardquest`.
2. Upload this entire folder's contents through GitHub's web uploader.
3. Commit.

### 2. Deploy to Vercel

1. Go to vercel.com, click **Add New → Project**.
2. Import your `rewardquest` repo.
3. **Before clicking Deploy**, scroll to **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_KEY` = your Supabase publishable key
4. Click **Deploy**.

### 3. Connect your domain

In Vercel project: **Settings → Domains**, add `myrewardquest.com`.
Vercel will give you DNS records to set at your registrar.

### 4. Create the accounts

1. Open the live site.
2. **Parent signs up first.** This creates the family with default tasks/rewards.
3. The kid signs up second (using her own email) — she'll be linked into the same family as the kid role.
4. Each adds the site to their home screen via Safari → Share → Add to Home Screen.

## Data layout

Stored in your Supabase project. Tables: `families`, `tasks`, `decisions`,
`rewards`, `claims`, `videos`, `redemptions`. Photos/videos in the
`proofs` storage bucket.

Free-tier limits: 500 MB database (plenty), 1 GB storage (50–200 short
videos), 50,000 monthly active users (you'll never get close).

## Local development

```
npm install
cp .env.example .env
# fill in your Supabase URL + key in .env
npm run dev
```
