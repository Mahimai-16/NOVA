# Going live: Supabase + Vercel + Namecheap

Follow these steps in order. Each one takes about 5–10 minutes. Steps 1–4 are free.

| Step | What | Result |
|---|---|---|
| 1 | Supabase | Database that stores every lead |
| 2 | Cloudflare Turnstile | Spam protection for the form |
| 3 | Resend | Email alert for every new lead |
| 4 | Vercel | The live website, auto-deployed from GitHub |
| 5 | Namecheap DNS | `novacovenanttrading.com` points to Vercel |

Keep a private note open while you work. You'll copy several keys from steps 1–3 into Vercel in step 4. **Never paste secret keys into chat, email or GitHub.**

---

## 1. Supabase: lead database

1. Go to **supabase.com** → sign up (GitHub sign-in is easiest) → **New project**.
   - Name: `nova-covenant`
   - Database password: click **Generate** and save it in your password manager
   - Region: **South Asia (Mumbai)**
2. When the project is ready, open **SQL Editor** → **New query**. Paste the whole of [`supabase/migrations/0001_leads.sql`](supabase/migrations/0001_leads.sql), then click **Run**. You should see "Success. No rows returned".
3. Open **Table Editor**. You should see an empty `leads` table.
4. Copy two values from **Project Settings**:
   - **Project URL** (Data API / API Keys page), like `https://abcdxyz.supabase.co` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **API Keys → Publishable key** (`sb_publishable_...`) → this is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

> No login is needed to submit the form. The publishable key is public by design: with it, visitors can only **add** a lead through the `submit_lead()` database function, which also enforces rate limits. Nobody can read, change or delete leads through the public API; you see them only in the Supabase dashboard. Never use the **secret** key (`sb_secret_...`) in this app.

**Managing leads:** open **Table Editor → leads**. Change `status` (new → contacted → quoted → won/lost/spam) and add `notes`. Use **Export → CSV** for a spreadsheet.

## 2. Cloudflare Turnstile: spam protection

1. Go to **dash.cloudflare.com** → sign up (free, no need to move your domain) → **Turnstile** → **Add widget**.
2. Widget name: `Nova Covenant website`. Hostnames: add `novacovenanttrading.com`, `www.novacovenanttrading.com` and `vercel.app`.
3. Widget mode: **Managed**. Pre-clearance: **No**. Click **Create**.
4. Copy the **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and the **Secret key** → `TURNSTILE_SECRET_KEY`.

## 3. Resend: email alerts

1. Go to **resend.com** → sign up → **Domains** → **Add domain** → `novacovenanttrading.com`. Region: closest to you.
2. Resend shows a few DNS records (on a `send` subdomain plus a DKIM `resend._domainkey` record). Add them in Namecheap, see step 5B.
3. Click **Verify** in Resend once they're added. It can take a few minutes, occasionally up to a few hours.
4. **API Keys** → **Create API key** (permission: Sending access) → `RESEND_API_KEY`.

Email alerts are optional. If Resend isn't set up yet, leads are still saved in Supabase.

## 4. Vercel: hosting

1. Go to **vercel.com** → **Sign up with GitHub** (as Mahimai-16).
2. **Add New → Project** → import **Mahimai-16/NOVA**. Framework: Next.js, detected automatically. Don't change the build settings.
3. Before clicking Deploy, open **Environment Variables** and add these, using the values from steps 1–3:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from step 1 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from step 1 |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from step 2 |
   | `TURNSTILE_SECRET_KEY` | from step 2 |
   | `RESEND_API_KEY` | from step 3 |
   | `CONTACT_TO_EMAIL` | `mahi@novacovenanttrading.com` |
   | `CONTACT_FROM_EMAIL` | `Nova Covenant Website <enquiries@novacovenanttrading.com>` |
   | `IP_HASH_SALT` | any long random string (optional) |

4. Click **Deploy**. After about a minute you get a link like `nova-xxxx.vercel.app`. Open it and send a test enquiry. It should appear in Supabase → `leads`, and the alert email should arrive.

From now on, every `git push` to `main` redeploys the site automatically. Other branches get their own preview link.

> If you add or change environment variables later, redeploy (Deployments → ⋯ → Redeploy), because `NEXT_PUBLIC_` values are built into the page.

## 5. Namecheap: connect the domain

### A. Point the website to Vercel
1. In Vercel: **Project → Settings → Domains** → add `novacovenanttrading.com`, and choose to redirect `www.novacovenanttrading.com` to it (or the other way round).
2. Vercel shows the exact DNS records to add. Usually:
   - `A` record, Host `@`, Value `76.76.21.21`
   - `CNAME` record, Host `www`, Value `cname.vercel-dns.com`

   Always use the values **Vercel shows you** if they differ.
3. In Namecheap: **Domain List → Manage → Advanced DNS**:
   - Delete only the existing **website** records for `@` and `www`: the default "URL Redirect Record", "parking page" CNAME, or an old `A` record.
   - Add the records from Vercel. TTL: Automatic.
4. Back in Vercel, the domain turns green within minutes (rarely up to 24 hours), and HTTPS is issued automatically.

### B. Add Resend's email records
Add each record exactly as Resend shows it: Type, Host and Value. In Namecheap, the Host is the part **before** `.novacovenanttrading.com`, for example `send` or `resend._domainkey`.

### ⚠️ Do NOT touch your Google Workspace email records
Leave these exactly as they are, or your company email stops working:
- the **MX** records for `@` (Google: `smtp.google.com` or `aspmx.l.google.com` etc.)
- the **TXT** record for `@` starting `v=spf1 include:_spf.google.com`
- the `google._domainkey` TXT record (DKIM) and any `_dmarc` record

Resend's records go on their own `send` subdomain, so they don't conflict. Don't create a second SPF record on `@`.

---

## Final checklist

- [ ] `https://novacovenanttrading.com` loads with the padlock (HTTPS), and `www` redirects
- [ ] A test enquiry appears in Supabase and the alert email arrives
- [ ] Company email (Google Workspace) still sends and receives
- [ ] Delete test leads in Supabase (or set their status to `spam`)
- [ ] Vercel → **Analytics** and **Speed Insights**: click Enable (free)
- [ ] Optional: submit `https://novacovenanttrading.com/sitemap.xml` in Google Search Console

## Troubleshooting

| Symptom | Fix |
|---|---|
| Form says "temporarily unavailable" | Neither Supabase nor Resend variables are set in Vercel. Add them and redeploy |
| Logs show `submit_lead failed: PGRST202` | The SQL file hasn't been run in Supabase yet (step 1.2) |
| Form says "couldn't verify this submission" | Turnstile keys are wrong or the hostname isn't listed in the Turnstile widget |
| Lead saved but no email | Check Resend → Logs, and that the domain shows **Verified**. The lead has `email_notified = false` |
| Error logs | Vercel → Project → **Logs**, filter by `/api/enquiry` |
