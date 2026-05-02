# Kothari News (`web-next`)

Next.js App Router public reader site for this monorepo (`backend/` API, `cms/` desk).

## Environment

Create `web-next/.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:5280
NEXT_PUBLIC_API_ORIGIN=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

- Keep `NEXT_PUBLIC_API_ORIGIN` empty for local development to use built-in rewrites.
- Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for Google sign-in.
- Set `NEXT_PUBLIC_SITE_URL` to your canonical web origin in production (for metadata and sitemap URLs).
- Optional: set `INTERNAL_API_URL` when server-side Next runtime needs a different reachable API host for metadata/sitemap fetches.

## Run Commands

From `web-next/`:

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run start
```

(`dev` listens on **5280** per `package.json`; adjust URLs below if you override the port.)

## Local API Behavior

When `NEXT_PUBLIC_API_ORIGIN` is empty, `next.config.ts` rewrites:

- `/api/*` -> `http://localhost:5050/api/*`
- `/uploads/*` -> `http://localhost:5050/uploads/*`

So backend should be running on port **5050** for full data parity (match `next.config.ts` if yours differs).

### Verify connectivity (optional)

With both processes running (backend on `5050`, Next dev on `5280`):

```bash
npm run verify:connectivity
```

This checks `GET /api/health` on the backend and the same path through Next’s proxy. If your dev server uses another port, run:

`VERIFY_NEXT_URL=http://127.0.0.1:PORT npm run verify:connectivity`

### Production deployment

- Set `NEXT_PUBLIC_API_ORIGIN` to your API’s public base URL (no trailing slash), e.g. `https://api.example.com`. Rewrites are then disabled; the browser calls the API directly.
- Set `NEXT_PUBLIC_SITE_URL` to the public site origin, e.g. `https://www.example.com`.
- If needed, set `INTERNAL_API_URL` so `generateMetadata`/`sitemap` can fetch API from the Next server runtime environment.
- On the backend, set `CLIENT_URL` or `CLIENT_URLS` to the exact origin(s) of the deployed web app so CORS allows reader/auth requests.

See root [`DEPLOY.md`](../DEPLOY.md) for Vercel + Render.

## Routes

- `/`
- `/shows`
- `/article/[id]`
- `/category/[slug]`
- `/profile`
- `/login`
- `/register`
- `/privacy`

## Release checklist

1. Configure production env: `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
2. Run `npm run build` in `web-next` and resolve any environment-specific failures.
3. Smoke test: home, shows, category, article, profile, login/register, privacy; search, breaking ticker; Google sign-in if enabled.
