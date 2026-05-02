# Khabar Kothri (news-kothari)

Monorepo: **public site** (`web-next/`), **CMS** (`cms/`), **API** (`backend/`).

## Quick start

1. **MongoDB Atlas** — copy the `mongodb+srv://…` string from Atlas (Database → Connect → Drivers) into **`MONGO_URI`** in `backend/.env`. URL-encode special characters in the password (e.g. `@` → `%40`). In Atlas → **Network Access**, allow your IP (or `0.0.0.0/0` for short-lived dev only). See `backend/.env.example`. Optional self-hosted URI: `mongodb://127.0.0.1:27017/kothari-news`.
2. **Backend** — from repo root: `npm install --prefix backend` then `npm run dev --prefix backend` (default port **5050** unless `PORT` is set). On first connect, the DB seeds an admin (if missing), sample YouTube videos (if none), and **40 demo articles** (5 per category, tag `khabar-seed-2026`) if that tag is not already present. To seed articles only: `npm run seed:articles --prefix backend` (Atlas must accept connections from your machine).
3. **CMS** — `npm install --prefix cms` then `npm run dev --prefix cms` (Vite proxies `/api` to the backend).
4. **Web (Next.js)** — `npm install --prefix web-next` then `npm run dev:web-next` from the repo root (or `npm run dev` inside `web-next/`). Local dev listens on **port 5280** and proxies `/api` and `/uploads` to the backend (see `web-next/next.config.ts`).

## Roles (CMS + API)

| Role | CMS | API |
|------|-----|-----|
| **writer** | Own articles, submit for review | `POST`/`PATCH submit` own drafts; `GET /api/articles` scoped to author |
| **editor** | Overview, review queue, all articles, **YouTube videos** (list/create/edit), writers (read-only), tasks (read-only), article review/publish/reject | `GET /api/editor/*`, `GET/POST/PUT /api/videos`, publish/reject/unpublish, `PUT` articles; **no** `DELETE` articles, **no** user/task admin writes |
| **admin** | Full admin dashboard + user/task management + **videos** (including delete) + same editor tools | `GET /api/admin/*`, user CRUD, task assign/delete, article delete, `DELETE /api/videos/:id` |

Editors use **`/api/editor/*`** for desk metrics and lists so they never need admin-only user endpoints.

## Public API (no auth)

Used by the **web-next** app:

- `GET /api/public/articles` — published list (optional `category`, `page`, `limit`, `locale=hi|en`)
- `GET /api/public/articles/:id` — published article by id
- `GET /api/public/breaking` — published with `isBreaking` (ticker), optional `locale=hi|en`
- `GET /api/public/search?q=` — published full-text style search (min 2 chars), optional `locale=hi|en`
- `GET /api/public/videos` — published YouTube clips (optional `category`, `page`, `limit`)

Per-language article model:
- Each article has one `primaryLocale` (`hi` or `en`) and is treated as a separate upload.
- Hindi and English versions are not linked pairs.
- During migration, requests without `locale` continue to return all published articles.
- One-time data migration command: `npm run migrate:primary-locale --prefix backend`.

Desk (JWT): `GET/POST/PUT /api/videos`, `GET /api/videos/:id` — **editor** + **admin**; `DELETE /api/videos/:id` — **admin** only.

## Web-next env (production / split API)

Copy [`web-next/.env.example`](web-next/.env.example) to `web-next/.env.local` for local overrides. For production when the API is on another origin, set host or Vercel env:

```bash
NEXT_PUBLIC_API_ORIGIN=https://your-api.example.com
NEXT_PUBLIC_SITE_URL=https://your-site.example.com
```

Leave `NEXT_PUBLIC_API_ORIGIN` empty for **same-origin** (e.g. reverse proxy serves both `/` and `/api`).

## Homepage content sources (`web-next`)

The public site is backed by **published articles** and **published YouTube videos** from the API only (no mock fallbacks for those). Legacy demo rails (QuickBriefs, podcasts, photo gallery, editor’s picks, state/fact-check/opinion/explainer blocks, etc.) are not mounted on the home page.

| Area | Source |
|------|--------|
| Hero, latest strip, category sections, category pages, article page | **API** published articles (`/api/public/articles`) |
| News ticker | **API** `/api/public/breaking` only (hidden if none) |
| Navbar search | **API** `/api/public/search` |
| **Shows / YouTube** (`ShowsSection`, `/shows`) | **API** `/api/public/videos` — `youtubeUrl`, optional summaries; thumbnails from YouTube (`hqdefault`) or `thumbnailOverride` |

## Production deploy

**Railway** (`backend/`) + **Vercel** (`web-next/`) + **Vercel** (`cms/` — second project). Env vars, CORS (`CLIENT_URLS`), and Google OAuth origins are documented in [`DEPLOY.md`](./DEPLOY.md).

## Scripts (root)

See root [`package.json`](package.json) for `npm run dev:web-next`, `dev:cms`, `dev:backend`, etc.
