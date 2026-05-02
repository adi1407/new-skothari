# Deploy: Railway (API) + Vercel (web-next) + Vercel (CMS)

Target layout:

| Piece | Host | Repo path |
|-------|------|------------|
| **API** | [Railway](https://railway.app) | `backend/` |
| **Public site** | [Vercel](https://vercel.com) | `web-next/` |
| **Staff CMS** | Vercel (second project) | `cms/` |

The API does **not** run on Vercel as this Express app. The browser talks to Railway for `/api/*` and `/uploads/*`. CORS on the API must allow **both** Vercel origins (public site + CMS).

---

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access** → allow **`0.0.0.0/0`** (simplest for Railway) or Railway’s egress IPs if you lock it down.
3. Copy the **`mongodb+srv://…`** string into Railway as **`MONGO_URI`** (encode special characters in the password, e.g. `@` → `%40`).

---

## 2. Railway (backend)

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo** (or empty project + **GitHub** plugin).
2. Add a **service** from this repo; set **Root directory** to **`backend`** (or deploy only the `backend` folder).
3. **Start command:** `npm start` (see [`backend/package.json`](./backend/package.json)). Railway sets **`PORT`** automatically.
4. Optional: repo includes [`backend/railway.toml`](./backend/railway.toml) with **`/api/health`** for health checks.

### Environment variables (Railway → service → **Variables**)

| Key | Example / notes |
|-----|------------------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas `mongodb+srv://…` |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | `7d` (optional) |
| **`CLIENT_URLS`** | **Comma-separated, no spaces:** your **web-next** Vercel URL **and** your **CMS** Vercel URL, e.g. `https://news.vercel.app,https://news-cms.vercel.app` — exact `https://` origins, no path. Alternatively set a single **`CLIENT_URL`** if you only need one. |
| `SEED_ADMIN_EMAIL` | First admin login email |
| `SEED_ADMIN_PASSWORD` | Strong password |
| `SEED_ADMIN_NAME` | Display name |
| `GOOGLE_CLIENT_ID` | (Optional) Google **Web** OAuth client — reader sign-in on the public site |
| `READER_JWT_SECRET` | (Optional) Reader JWT secret; defaults to `JWT_SECRET` |

5. **Generate domain** (Railway → **Networking** → public URL) and copy the HTTPS origin, e.g. `https://kothari-news-api.up.railway.app` — no trailing slash. This is your **`NEXT_PUBLIC_API_ORIGIN`** (web-next) and **`VITE_API_ORIGIN`** (CMS).

**Uploads:** Railway’s filesystem is **ephemeral**. Images under `uploads/` can disappear on redeploy. For production, use object storage (e.g. S3) or a volume.

---

## 3. Vercel — public site (`web-next`)

1. **New Project** → import the same Git repo.
2. **Root directory:** **`web-next`** — set this under Vercel → **Settings → General → Root Directory** (do **not** put `rootDirectory` in `vercel.json`; the platform rejects it).
3. **Framework:** Next.js. Build: `npm run build` (see [`web-next/package.json`](./web-next/package.json)).

### Environment variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_ORIGIN` | Railway public API URL, **no trailing slash** |
| `NEXT_PUBLIC_SITE_URL` | This Vercel deployment URL, e.g. `https://your-news.vercel.app` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | (Optional) Same as Railway `GOOGLE_CLIENT_ID` |

Redeploy after env changes. `next.config.ts` whitelists that host for **Next/Image** when articles use `/uploads/…` on the API.

---

## 4. Vercel — CMS (`cms`)

Use a **second Vercel project** (same repo, different root).

1. **New Project** → same repo.
2. **Root directory:** **`cms`** — only in Vercel **Settings → General → Root Directory**, not in `vercel.json`.
3. **Framework:** Vite (or “Other” with [`cms/vercel.json`](./cms/vercel.json)). **Output directory:** `dist` (from `vite build`).
4. SPA fallback is configured in **`cms/vercel.json`** (rewrites to `index.html`).

### Environment variables

| Key | Value |
|-----|-------|
| **`VITE_API_ORIGIN`** | Same Railway URL as above, **no trailing slash** |

`VITE_*` vars are inlined at **build** time — trigger a **redeploy** after changing them.

Local dev: leave unset; `cms/vite.config.js` proxies `/api` and `/uploads` to `localhost:5050`.

---

## 5. CORS checklist

After both Vercel URLs exist, set Railway **`CLIENT_URLS`** to **both** origins (comma-separated). If you add a custom domain, add those `https://` origins too.

---

## 6. Google Sign-In (optional)

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Web client → **Authorized JavaScript origins**, add:

- `http://localhost:5280` (local web-next)
- Your **production** web-next origin, e.g. `https://your-news.vercel.app`
- (Only if you use Google on CMS) your CMS origin

Use the same **Client ID** in Railway `GOOGLE_CLIENT_ID` and Vercel `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

---

## 7. Alternative: Render for API

You can host **`backend/`** on [Render](https://render.com) instead of Railway; use the same env vars and point **`NEXT_PUBLIC_API_ORIGIN`** / **`VITE_API_ORIGIN`** at the Render URL. See [`render.yaml`](./render.yaml).

---

## Health check

`GET /api/health` → `{ "status": "ok" }` — use on Railway/Render as the health check path.
