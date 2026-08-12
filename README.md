# Akash Admin Dashboard

Web admin portal for the Akash practitioner marketplace. Talks to the app API at `/api/v1` using Firebase Google OAuth for admin sign-in.

## Setup

```bash
cp .env.example .env
# Fill Firebase web config + API base URL
npm install
npm run dev
```

### Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API root including `/api/v1` (default `/api/v1`, proxied to `localhost:3000` in dev) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_APP_ID` | Firebase app id |

Admins must already exist in the backend (seeded / invited). Unknown Google emails get `403`.

## Live API areas

Fully wired to the documented admin backend:

- Auth — Google OAuth, refresh rotation, logout, `/me`
- Practitioners — list/filters/CSV, detail, moderate, commission override, suspend/reactivate
- Clients — list/metrics/CSV, detail, edit name/phone, notes, suspend/reactivate
- Sessions — list/stats/CSV, detail financial ledger, admin refund
- Promo codes — CRUD behind `settings:*`
- Revenue — `GET /admin/revenue/summary` + `daily-series` (7/30/90), plus accounting snapshot on dashboard
- Transactions — ledger list/KPIs/detail (`/admin/transactions*`)
- Payouts — list/KPIs/CSV/detail + failed-payout retry (`payouts:retry`)
- Wallet — platform overview + Stripe movements (cursor pagination)
- Modalities — directory, stats/matrix/trend/activity, CSV export, create/edit/disable, icon upload
- Reviews — moderation list/KPIs/CSV, flag, resolve-flags, hide/unhide
- Notifications — delivery feed/KPIs/CSV, failed-push retry; Live Refresh via `/admin` Socket.io
- Dashboard — dedicated `/admin/dashboard/*` KPIs, revenue trend, recent transactions, new joinings + Live Refresh

Deferred from v1 (not in UI): Users/admin-management, Analytics, Disputes.

## Deploy — `https://akashtherapies.com/adminportal`

The root domain is served by **Lovable** (the marketing site) and cannot host this build.
A **Cloudflare Worker** claims only the `/adminportal*` path and proxies it to Cloudflare Pages,
leaving the marketing site untouched.

```
akashtherapies.com/            → Lovable (unchanged)
akashtherapies.com/adminportal → Worker → Pages (this app)
```

The build already nests everything under `/adminportal/`, so paths map 1:1 through the proxy.

### 1. Build

Set the **production API** in `.env` (absolute URL — the dev proxy does not exist in prod):

```bash
VITE_API_BASE_URL=https://api.YOUR-HOST.com/api/v1
# optional, for Live Refresh
# VITE_SOCKET_URL=https://api.YOUR-HOST.com
# plus the Firebase web config for Google sign-in
```

```bash
npm run build     # → dist/adminportal/** and dist/_redirects
```

The API must send CORS headers allowing `https://akashtherapies.com`.

### 2. Publish to Cloudflare Pages

```bash
npx -y wrangler@latest pages deploy dist --project-name akash-admin
```

Verify the Pages URL works before touching DNS: `https://akash-admin.pages.dev/adminportal`

### 3. Move DNS to Cloudflare

The Worker route only works when the zone lives in **your own** Cloudflare account.

1. Cloudflare → **Add a site** → `akashtherapies.com` (Free plan) → it imports existing records.
2. **Verify every record below imported** — a missing MX record breaks email.
3. GoDaddy → **DNS → Nameservers → Change** → *I'll use my own nameservers* → enter the two
   Cloudflare nameservers. Propagation is usually under an hour.

Records live at the time of migration:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `@` | `185.158.133.1` | Lovable — keep **Proxied** |
| CNAME | `admin` | `akash-dev-999d6.web.app` | existing Firebase Hosting subdomain |
| MX | `@` | `aspmx.l.google.com` (1), `alt1`/`alt2` (5), `alt3`/`alt4` (10) | **Google Workspace email** |
| TXT | `@` | `v=spf1 include:dc-aa8e722993._spfm.akashtherapies.com ~all` | SPF |
| TXT | `dc-aa8e722993._spfm` | `v=spf1 include:_spf.google.com ~all` | SPF macro target |
| TXT | `@` | `google-site-verification=ejUZL2wMChCX91bc3RyqOVgOHpfEbleJAM1WEah5JHU` | keep |

### 4. Deploy the Worker

`cloudflare/worker.js` proxies the path; `cloudflare/wrangler.toml` binds the route.
Update `ADMIN_ORIGIN` in the Worker if the Pages project is named differently.

```bash
cd cloudflare
npx -y wrangler@latest deploy
```

### 5. Verify

```bash
curl -I https://akashtherapies.com/adminportal/   # 200
curl -I https://akashtherapies.com/               # still the Lovable site
```

Deep links (`/adminportal/sessions/123`) resolve via `dist/_redirects`, written by `npm run postbuild`.

### Redeploying later

```bash
npm run build
npx -y wrangler@latest pages deploy dist --project-name akash-admin
```

The Worker only needs redeploying if its route or origin changes.

## Scripts

- `npm run dev` — Vite dev server (also under `/adminportal`)
- `npm run build` — production build into `dist/adminportal/`
- `npm run preview` — preview build
- `npm run lint` — ESLint
