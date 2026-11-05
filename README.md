# Nova Covenant International Trading: Website

A single-page B2B website for **Nova Covenant International Trading**, built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Playfair Display + Inter, GSAP + ScrollTrigger, Lucide icons, Zod and Resend.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm start` (serve the build), `npm run lint`.

## Structure

```
app/
  layout.tsx              fonts (Playfair Display + Inter), SEO / Open Graph, Organization JSON-LD
  page.tsx                assembles the sections in order
  globals.css             design tokens (colors, fonts, radii), container + section utilities
  api/enquiry/route.ts    POST handler: honeypot, rate limit, Zod validation, Resend
components/
  layout/                 Navbar (sticky, active-section, mobile menu), Footer
  sections/               Hero, About, Divisions, Products, Process, GlobalReach, WhyUs, Contact
  ui/                     Button, SectionHeading, DivisionCard, EnquiryForm, EnquireLink, Wordmark
  motion/                 Reveal (scroll reveals), HeroMotion (hero timeline + parallax)
lib/
  site.ts                 company constants, nav, division options, photo credits
  gsap.ts                 GSAP/ScrollTrigger registration
  validation.ts           shared Zod schema (client and server)
  email.ts                server-only Resend sender
```

Section anchors: `#home`, `#about`, `#divisions`, `#products`, `#process`, `#global-reach`, `#why-us`, `#contact`, `#footer`.

## Brand assets

| Item | File | Notes |
|---|---|---|
| NC monogram (gold, transparent) | `public/brand/nc-logo.png` | Shown beside the company name in the header, footer and secondary pages (`components/ui/Wordmark.tsx`) and in the Organization JSON-LD |
| Browser tab icon | `app/icon.png`, `app/favicon.ico` | Generated from the monogram (favicon has 16/32/48 px) |
| iPhone home-screen icon | `app/apple-icon.png` | Monogram on midnight navy, 180 px |

To replace the logo, overwrite these files with versions made from the new artwork (same names).

## Photography

Company-supplied images (replace any time, same filename):

| File | Used in | Notes |
|---|---|---|
| `public/images/hero/shipment.png` | Hero | Shipment / port imagery **only**, with no products (brand rule). Landscape, 2000 px+ wide is ideal. |
| `public/images/automotive/spare-parts.png` | Automotive & Mobility card | Landscape; shown at 16:9 |
| `public/images/makhana/makhana.png` | Food & Agriculture card | Landscape; shown at 16:9 |

`next/image` automatically serves resized WebP/AVIF versions, so large PNGs are fine.

## Founder section

Edit **`lib/founder.ts`**. Any empty field (`""`) shows as a dashed placeholder on the site:
- `name`: full public name
- `photo`: portrait path (4:5). Put the file in `public/founder/` with a new file name each time you change it, so no cached old image is shown.
- `background`: one line on experience or industry (optional)
- `linkedin`: full profile URL
- `message`: a **draft** founder's note; review and personalise it before launch
- Role ("Founder & Managing Director"), location ("Tirupur, India") and email are pre-filled from the business card details.

### 3D founder stage (three.js)

`components/three/ShipOrbitScene.tsx` renders the portrait as a **3D framed panel on a pedestal**, with a **low-poly container ship** sailing around it on a water ring. The ship has a hull, stacked containers in brand colours, a bridge, a funnel and a wake.
- When `founder.photo` is set, the **original photo is shown as-is** (no 3D stage). The 3D stage only appears while there is no photo.
- three.js is **lazy-loaded** by `components/three/FounderStage.tsx` only as the card approaches the viewport. The static 2D placeholder shows first and stays if WebGL isn't available.
- It renders only while on screen, tilts slightly with the mouse, and shows a single still frame with reduced motion.
- Adjust `ORBIT_R`, the ship scale and the lap speed (`angle += dt * 0.42`) in that file.

## Hero mouse parallax

On desktop with a mouse or trackpad, hero layers marked `data-depth` follow the pointer: the photo moves against it, the glow moves with it, and the text drifts slightly. A soft blue light follows the cursor. Tune the depth values in `components/sections/Hero.tsx`. It is off on touch devices and with reduced motion.

## World map (Global Reach)

- `public/images/map/world-dots.svg` (dotted map) and `lib/world-map.data.ts` (projected city positions) are **generated** by `node scripts/generate-world-map.mjs` (uses the `dotted-map` dev dependency). Edit the `cities` list in that script, run it, then adjust label placement in `components/motion/RouteMap.tsx` (`labelPos`).
- Routes start in India. **India – UAE (Dubai)** and **India – Nigeria (Lagos)** are tier `primary`: gold, glowing and drawn first. All others are blue dotted secondary routes.
- Animation: routes draw outward from India when the map scrolls into view, then dots march along each line and lights travel along the routes. With reduced motion, the map is static.

## Enquiries: leads, email and spam protection

Step-by-step setup for going live is in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

How a submission is handled (`app/api/enquiry/route.ts`):
1. Hidden honeypot field and a per-instance burst limit
2. Validation with the same Zod schema the browser uses (`lib/validation.ts`)
3. **Cloudflare Turnstile** check (`lib/turnstile.ts`, `components/ui/Turnstile.tsx`), enforced when `TURNSTILE_SECRET_KEY` is set
4. The lead is **saved to Supabase** by calling the database function `submit_lead()` with the publishable key (`lib/leads.ts`, clients in `lib/supabase/`, SQL in `supabase/migrations/0001_leads.sql`). No login needed. The function enforces rate limits (5 per connection per 10 min, 5 per email per hour, 200 per hour site-wide), and the table itself can't be read through the public API
5. **Email alert via Resend** (`lib/email.ts`), sent after the response. If it fails, the lead is still saved with `email_notified = false`

Fallbacks: without Supabase it delivers by email only. With neither configured, the form returns 503 and asks the visitor to email directly. It never shows a false success. IP addresses are never stored, only a salted hash used for rate limiting. The buyer's email is used as Reply-To, never as the sender.

### Google Sheets lead tracking

Every saved lead is also added to the **Leads** tab of a Google Sheet (Date & Time, Full Name, Company Name, Business Email, Country, Division, Requirement, Message, Status), sent in the background after the response, so a Sheets problem never blocks an enquiry. Each new day starts with a day/date header, separated from the previous day by 3 empty rows. **Status** is a dropdown (Pending / Approved, default Pending). Edit `STATUS_OPTIONS` in the script to add more. Status changes in the sheet are for your tracking and don't sync back to Supabase.

Setup (one time):
1. Open the Google Sheet → **Extensions → Apps Script**. Delete the sample code and paste `google-apps-script/LeadsSheet.gs`.
2. Set `SECRET` at the top to the same value as `GOOGLE_SHEETS_WEBHOOK_SECRET`. Click **Save**.
3. **Deploy → New deployment →** type **Web app**. Execute as **Me**, Who has access **Anyone** → **Deploy** → authorise with your Google account → copy the **Web app URL**.
4. Set that URL as `GOOGLE_SHEETS_WEBHOOK_URL` in Vercel and redeploy.

The script checks the secret on every request and stores values as plain text (no formulas), so visitors can't inject anything into the sheet. After editing the script later, use **Deploy → Manage deployments → Edit → Version: New version** to keep the same URL.

### Environment variables

See `.env.example`. All are optional locally: without them, the site runs and the form shows the "email us directly" message.

| Variable | Where it's used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Lead storage (publishable key is public by design) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Email alerts (server only) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Spam protection (site key is public) |
| `GOOGLE_SHEETS_WEBHOOK_URL`, `GOOGLE_SHEETS_WEBHOOK_SECRET` | Copy of each lead in the Google Sheet (server only) |
| `IP_HASH_SALT` | Optional salt for rate-limit hashing |

To test Turnstile locally, use Cloudflare's always-pass test keys: site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

## Production setup

- **Security headers** (`next.config.ts`): CSP (no nonces, so pages stay static), HSTS, frame blocking, nosniff, referrer and permissions policies
- **SEO**: `app/robots.ts`, `app/sitemap.ts`, Open Graph metadata, Organization JSON-LD
- **Pages**: `/privacy` (privacy policy, review the wording before launch), custom 404 (`app/not-found.tsx`)
- **Analytics**: Vercel Analytics and Speed Insights (cookieless; enable both in the Vercel dashboard)
- **Region**: `vercel.json` runs server functions in Mumbai (`bom1`), next to the Supabase database

## Motion and accessibility

- GSAP runs inside `useGSAP` scopes with `gsap.matchMedia`, so everything is cleaned up automatically. Scroll reveals fire once and page scroll is never hijacked.
- `prefers-reduced-motion: reduce` skips the timelines and shows content immediately. Parallax runs only at ≥768 px.
- If the animation layer fails to start, a fallback in `layout.tsx` makes the content visible after 2.5 s.
- Semantic landmarks, skip link, labelled form fields with `aria-invalid` and `aria-describedby` errors, visible focus rings, and a keyboard-accessible mobile menu (Escape closes it).

## Content assumptions

- All copy uses only the confirmed facts: multi-country operations and sourcing; trading, sourcing and distribution; the two divisions and their products; a global B2B audience; the enquiry email.
- The Global Reach map names India as origin and the UAE, Nigeria, the Middle East, Africa and other markets as trade connections, at the founder's request. These are markets served, not offices.
- **Not included on purpose:** office locations, statistics, certifications, client logos, testimonials, postal address, social links, registration numbers, and delivery promises. Add them only once confirmed.
- Brand content (from the founder): the hero headline is the primary tagline **"Bridging Nations. Building Trust."** and its eyebrow is the secondary tagline **"Trade Beyond Borders."** The vision statement ("Build a globally recognized, trustworthy and profitable international trading company") sits in the About section. All three live in `lib/site.ts`. The brief's original headline is now the hero's supporting sentence.
- Typography: **Playfair Display** (serif) for headings and **Inter** for body and interface text.
- The "Helpful to include" list and form placeholders tell buyers what to send (part numbers, quantity, port, Incoterm). They make no claims about the company.

## Still needed before launch

- [x] Official NC logo (added). Brand guidelines still welcome
- [ ] Supabase, Turnstile, Resend and Vercel set up (DEPLOYMENT.md)
- [ ] Namecheap DNS changes (keep the Google Workspace email records)
- [ ] Review the privacy policy wording (`app/privacy/page.tsx`)
- [x] Founder name, portrait and LinkedIn URL (`lib/founder.ts`). Review the founder's message wording any time
- [ ] Optional confirmed details: WhatsApp business number, LinkedIn page, public location
