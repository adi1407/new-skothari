# Deploy: Vercel (web) + Render (API)

The public site (`web/`) calls the API with `VITE_PUBLIC_API_ORIGIN`. The API (`backend/`) allows browser requests only from origins you list in `CLIENT_URL` / `CLIENT_URLS`.

## 1. MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) (or any hosted Mongo). Create a database user, allow network access (`0.0.0.0/0` for Render, or Render’s outbound IPs if you lock it down), and copy the **SRV connection string** into `MONGO_URI` on Render.

## 2. Render (backend)

1. In [Render](https://dashboard.render.com): **New +** → **Web Service**, connect this repo.
2. **Root directory:** `backend`
3. **Build command:** `npm install`  
   **Start command:** `npm start`
4. **Instance type:** Free is fine for testing; note **cold starts** and that the **filesystem is ephemeral** — uploaded images in `uploads/` can disappear on redeploy. For production media, plan object storage (e.g. S3) or a persistent disk.
5. **Environment** (Render → Environment):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your Atlas URI |
   | `JWT_SECRET` | Long random string |
   | `JWT_EXPIRES_IN` | `7d` (optional) |
   | `CLIENT_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
   | `SEED_ADMIN_EMAIL` | First admin email |
   | `SEED_ADMIN_PASSWORD` | Strong password |
   | `SEED_ADMIN_NAME` | Display name |
   | `GOOGLE_CLIENT_ID` | (Optional) Web client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enables **Google Sign-In** for public readers (`POST /api/reader/auth/google`). |
   | `READER_JWT_SECRET` | (Optional) Separate secret for reader JWTs; if omitted, `JWT_SECRET` is used with an `aud: "reader"` claim. |

   Render sets `PORT` automatically — do not override unless you know you need to.

6. Deploy and copy the service URL (e.g. `https://kothari-news-backend.onrender.com`).

Optional: connect the repo and use the root [`render.yaml`](./render.yaml) as a **Blueprint** so the service is created from the file; you still add secrets in the dashboard.

## 3. Vercel (frontend)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import this repo.
2. **Root directory:** `web`
3. **Framework:** Vite (auto-detected).
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `VITE_PUBLIC_API_ORIGIN` | Same as Render URL, **no trailing slash**, e.g. `https://kothari-news-backend.onrender.com` |
   | `VITE_GOOGLE_CLIENT_ID` | (Optional) Same value as `GOOGLE_CLIENT_ID` — shows “Continue with Google” on `/login` and `/register`. |

5. Deploy. If client-side routes 404 on refresh, [`web/vercel.json`](./web/vercel.json) already rewrites to `index.html`.

## 4. Point CORS at the live site

After Vercel gives you a URL, set Render **`CLIENT_URL`** (or **`CLIENT_URLS`**, comma-separated) to that exact origin, including `https://`, no path. Redeploy the API if it was deployed before the frontend URL existed.

## 5. CMS (optional)

For local dev, `cms/vite.config.js` proxies `/api` to your machine. If you host the CMS on its own URL later, set `axios` `baseURL` in `cms/src/api.js` to your Render API origin and add that CMS origin to **`CLIENT_URLS`** on Render so CORS allows it.

## Health check

Render can use **`/api/health`** (see `render.yaml`) to verify the service is up.

## 6. Google Sign-In (optional)

1. In Google Cloud Console, create **OAuth 2.0 Client ID** → Application type **Web application**.
2. **Authorized JavaScript origins:** `http://localhost:5173`, and your production site `https://your-app.vercel.app` (no path).
3. You do **not** need a redirect URI for the ID-token (popup) flow used here.
4. Copy the **Client ID** into Render `GOOGLE_CLIENT_ID` and Vercel `VITE_GOOGLE_CLIENT_ID` (same string).

Public reader APIs live under **`/api/reader`** (register, login, Google auth, profile, saved articles). They are separate from CMS staff auth under **`/api/auth`**.
