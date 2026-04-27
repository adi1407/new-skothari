# Khabar Kothri (news-kothari)

Monorepo: **public site** (`web/`), **CMS** (`cms/`), **API** (`backend/`).

## Quick start

1. **MongoDB** — set `MONGODB_URI` in `backend/.env` (see `backend/package.json` for scripts).
2. **Backend** — from repo root: `npm install --prefix backend` then `npm run dev --prefix backend` (default local port **5050**). On first connect, the DB seeds an admin (if missing), sample YouTube videos (if none), and **40 demo articles** (5 per category, tag `khabar-seed-2026`) if that tag is not already present. To seed articles only: `npm run seed:articles --prefix backend` (MongoDB must be running).
3. **CMS** — `npm install --prefix cms` then `npm run dev --prefix cms` (Vite proxies `/api` to the backend).
4. **Web** — `npm install --prefix web` then `npm run dev --prefix web` (default **http://localhost:5280**; proxies `/api` and `/uploads` to the backend on **5050** in dev).

### Public reader accounts (Google)

The public site uses **Google-only** sign-in on `/login`. `/register` redirects to `/login` (same `?next=`). Reader features (saved articles, reading history, profile settings, account delete) work once Google and the API are configured.

#### Step-by-step: Google Sign-In

1. **Google Cloud Console** — Open [Google Cloud Console](https://console.cloud.google.com/) → select or create a project.
2. **Enable API** — APIs & Services → Library → enable **Google+ API** (or **Google Identity Services** / People API as prompted for OAuth).
3. **OAuth consent screen** — APIs & Services → OAuth consent screen → choose **External** (or Internal for Workspace) → fill app name, support email, developer contact → add scopes if asked (default `email`, `profile`, `openid` are enough for sign-in).
4. **Create OAuth client** — APIs & Services → Credentials → **Create credentials** → **OAuth client ID** → Application type **Web application**.
5. **Authorized JavaScript origins** — Add exactly:
   - Local dev: `http://localhost:5280` (or whatever port your `web` Vite dev server uses).
   - Production: `https://your-production-site.com` (no path).
6. **Authorized redirect URIs** — For the `@react-oauth/google` button, you usually **do not** need a redirect URI beyond what Google suggests; if the console requires one, you can add `http://localhost:5280` and your production origin. Save and copy the **Client ID** (looks like `xxxxx.apps.googleusercontent.com`).
7. **Backend `backend/.env`** — Set `GOOGLE_CLIENT_ID=<same Client ID>`. Restart the backend after saving.
8. **Web `web/.env`** — Set `VITE_GOOGLE_CLIENT_ID=<same Client ID>`. Restart `npm run dev` for `web` (Vite only reads env at startup).
9. **Test** — Open `/login` on the web app → **Continue with Google** → complete sign-in → you should land on `/profile` (or `?next=`). Open an article while signed in to populate **History** on the profile.

#### Step-by-step: Newsletter sync (optional)

When a user saves profile settings and toggles **newsletter**, the backend calls a provider **only if** you configure one of the following in **`backend/.env`**:

**Option A — Webhook (good for Zapier / Make / your own API)**  
1. Create an HTTPS endpoint that accepts `POST` with JSON body: `{ "email": "...", "displayName": "...", "action": "subscribe" | "unsubscribe" }`.  
2. Set `NEWSLETTER_WEBHOOK_URL=https://your-endpoint` in `backend/.env`.  
3. Restart the backend. If this variable is set, **only the webhook is used** (Resend is not called for that toggle).

**Option B — Resend Audiences**  
1. Create a [Resend](https://resend.com) account → create an **Audience** → copy its ID.  
2. Create an API key with permission to manage that audience.  
3. In `backend/.env` set `RESEND_API_KEY=...` and `RESEND_NEWSLETTER_AUDIENCE_ID=...`.  
4. Leave `NEWSLETTER_WEBHOOK_URL` unset if you want Resend to handle subscribe/unsubscribe.  
5. Restart the backend.

If neither webhook nor Resend is configured, the newsletter checkbox still **saves** in MongoDB but nothing is sent externally.

### iPhone / Safari: “Cannot connect to server”

1. **Use your Wi‑Fi IP, not a virtual one.** Run `ipconfig` on the PC and pick the IPv4 under **Wireless LAN** / **Wi‑Fi** (usually `192.168.x.x` or `10.x.x.x`). **Do not** use addresses like `172.19.x.x` or `172.28.x.x` from “vEthernet” / WSL / Docker — those are not reachable from your phone. In Safari open **`http://<wifi-ip>:5280`** (plain **http**, not https).
2. **Same network** — PC and iPhone on the same Wi‑Fi; disable VPN on the PC if it still fails.
3. **Windows Firewall** — often blocks inbound port **5280**. From **Administrator** PowerShell, run `web/scripts/allow-vite-firewall.ps1`, or when Windows asks to allow **Node.js** on private networks, choose **Allow**. You can also add an inbound rule: TCP port **5280**, Private profile.
4. **Dev servers running** — `npm run dev --prefix backend` then `npm run dev --prefix web` on the PC before opening the phone URL.

## Roles (CMS + API)

| Role | CMS | API |
|------|-----|-----|
| **writer** | Own articles, submit for review | `POST`/`PATCH submit` own drafts; `GET /api/articles` scoped to author |
| **editor** | Overview, review queue, all articles, **YouTube videos** (list/create/edit), writers (read-only), tasks (read-only), article review/publish/reject | `GET /api/editor/*`, `GET/POST/PUT /api/videos`, publish/reject/unpublish, `PUT` articles; **no** `DELETE` articles, **no** user/task admin writes |
| **admin** | Full admin dashboard + user/task management + **videos** (including delete) + same editor tools | `GET /api/admin/*`, user CRUD, task assign/delete, article delete, `DELETE /api/videos/:id` |

Editors use **`/api/editor/*`** for desk metrics and lists so they never need admin-only user endpoints.

## Public API (no auth)

Used by the **web** app:

- `GET /api/public/articles` — published list (optional `category`, `page`, `limit`, **`locale=hi|en`** filters by article `primaryLocale`; omit to return all)
- `GET /api/public/articles/:id` — published article by id
- `GET /api/public/breaking` — published with `isBreaking` (ticker); optional **`locale=hi|en`**
- `GET /api/public/search?q=` — published search (min 2 chars); optional **`locale=hi|en`**

**Per-language articles:** Each CMS story has a **primary language** (`hi` or `en`). Hindi and English versions are **separate uploads** (two documents), not linked pairs. The web app passes `locale` from the site language so listings, search, and breaking news only show that language’s stories. Existing rows without `primaryLocale` default to English; run once: `node backend/scripts/migrate-primary-locale.js` (requires `MONGODB_URI` in `backend/.env`).
- `GET /api/public/videos` — published YouTube clips (optional `category`, `page`, `limit`)

Desk (JWT): `GET/POST/PUT /api/videos`, `GET /api/videos/:id` — **editor** + **admin**; `DELETE /api/videos/:id` — **admin** only.

## Web env (production)

If the API is on another origin, set in `web/.env.production` (or host env):

```bash
VITE_PUBLIC_API_ORIGIN=https://your-api.example.com
```

Leave unset for **same-origin** (e.g. reverse proxy serves both `/` and `/api`).

## Homepage content sources (`web`)

The public site is backed by **published articles** and **published YouTube videos** from the API only (no mock fallbacks for those). Legacy demo rails (QuickBriefs, podcasts, photo gallery, editor’s picks, state/fact-check/opinion/explainer blocks, etc.) are not mounted on the home page.

| Area | Source |
|------|--------|
| Hero, latest strip, category sections, category pages, article page | **API** published articles (`/api/public/articles`) |
| News ticker | **API** `/api/public/breaking` only (hidden if none) |
| Navbar search | **API** `/api/public/search` |
| **Shows / YouTube** (`ShowsSection`, `/shows`) | **API** `/api/public/videos` — `youtubeUrl`, optional summaries; thumbnails from YouTube (`hqdefault`) or `thumbnailOverride` |

## Scripts (root)

See root `package.json` for `npm --prefix web|cms|backend` shortcuts if defined.
