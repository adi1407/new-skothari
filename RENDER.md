# Deploy the API on Render (`backend/`)

Use a **Web Service** for the Express API. The public site and CMS stay on **Vercel**; they call Render via **`NEXT_PUBLIC_API_ORIGIN`** (web-next) and **`VITE_API_ORIGIN`** (CMS).

### Your deployed frontends (exact origins)

| App | URL |
|-----|-----|
| **Public site** (web-next) | [https://new-skothari-zm44.vercel.app](https://new-skothari-zm44.vercel.app/) |
| **CMS** | [https://cms-aoidopaxb-adi1407s-projects.vercel.app](https://cms-aoidopaxb-adi1407s-projects.vercel.app/) |

**Set on Render** — `CLIENT_URLS` (one line, comma-separated, **no** trailing slashes):

```text
https://new-skothari-zm44.vercel.app,https://cms-aoidopaxb-adi1407s-projects.vercel.app
```

**Set on Vercel (web-next project)** — `NEXT_PUBLIC_SITE_URL`:

```text
https://new-skothari-zm44.vercel.app
```

**Google Cloud Console** (if you use Sign-In): **OAuth → Web client → Authorized JavaScript origins** must include both `https` origins above (no path).

### Google Sign-In (public site only) — `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

The **CMS does not use Google**; editors sign in with **email + password** only. Google is for **readers** on the web-next **Profile** page.

| Where | Key | Value |
|-------|-----|--------|
| **Vercel → web-next → Environment Variables** | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same string as your **Google Cloud** OAuth **Web** client ID (ends in `.apps.googleusercontent.com`). |
| **Google Cloud Console** → APIs & Services → Credentials → your **Web** OAuth client | **Authorized JavaScript origins** | Add `https://new-skothari-zm44.vercel.app` and `http://localhost:5280`. No path, no trailing slash. |
| **Render** (optional; backend does not verify Google server-side today) | `GOOGLE_CLIENT_ID` | Same client ID string if you want it set for consistency / future use. |

After setting `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel, trigger a **new Production deployment** (Next inlines `NEXT_PUBLIC_*` at build time).

### Fix: `Error 400: origin_mismatch` / “doesn't comply with Google's OAuth 2.0 policy”

Google blocks sign-in when the **page origin** is not listed on the **same** OAuth client as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → select the **project** that owns your Web client ID.
2. **APIs & Services** → **Credentials** → click your **OAuth 2.0 Client ID** of type **Web application** (the ID must match `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel).
3. Under **Authorized JavaScript origins**, click **ADD URI** and add **exactly** (copy from the browser address bar when the error appears):

   - `https://new-skothari-zm44.vercel.app`  
   - For local dev: `http://localhost:5280`

4. **Save**. Wait **1–5 minutes** for Google’s config to propagate, then hard-refresh the site (Ctrl+Shift+R) and try again.

**Must match character-for-character:** `https` not `http`, **no** path (`/profile`), **no** trailing slash, correct subdomain. If you use a **custom domain** (e.g. `https://www.yoursite.com`), add that origin too. Each **Vercel preview** URL (`*.vercel.app` with a different hostname) needs its **own** origin line — wildcards are **not** allowed.

**OAuth consent screen:** If the app is in **Testing**, add `aditiya236choudhary@gmail.com` (and any test users) under **Test users**. “In production” publishing is only needed for the general public.

### CMS cannot sign in — checklist

1. **Vercel → CMS project** → `VITE_API_ORIGIN` = your Render API URL (e.g. `https://your-api.onrender.com`), **no** trailing slash → **Redeploy CMS**.
2. **Render** → `CLIENT_URLS` includes `https://cms-aoidopaxb-adi1407s-projects.vercel.app` exactly.
3. **Render** → `NODE_ENV` = `production` (otherwise CORS may block the browser).
4. **Render** → `JWT_SECRET` must be set (login signs a JWT after password check).
5. **Admin user:** `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` on Render must match what you type in the CMS. The API now **creates this admin whenever that email is not in the DB** (older builds skipped if *any* admin existed — deploy this repo fix and restart once).
6. **Password out of sync?** Set **`SEED_ADMIN_SYNC_PASSWORD=1`** on Render with the desired `SEED_ADMIN_PASSWORD`, **redeploy once**, log in, then **remove** `SEED_ADMIN_SYNC_PASSWORD` so it is not left enabled.

---

## Five essential Render variables (key → example value)

Set these first in **Render → your Web Service → Environment**. Replace examples with your real Atlas URI, secret, and **exact** Vercel URLs (copy from the browser after each Vercel deploy).

| Key | Example value |
|-----|----------------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://dbuser:MyPass%40123@cluster0.abcd.mongodb.net/kothari-news?retryWrites=true&w=majority` |
| `JWT_SECRET` | `change_me_to_a_long_random_string_at_least_32_characters` |
| `CLIENT_URLS` | `https://new-skothari-zm44.vercel.app,https://cms-aoidopaxb-adi1407s-projects.vercel.app` |
| `SEED_ADMIN_PASSWORD` | `YourStrongAdminLoginPassword!` |

**Also set** (needed so the first admin account is created correctly): `SEED_ADMIN_EMAIL` (e.g. `admin@yourdomain.com`) and `SEED_ADMIN_NAME` (e.g. `Super Admin`). See §2 for the full list.

`CLIENT_URLS` must list **every** frontend origin that calls the API: your **web-next** URL and your **CMS** URL, comma-separated, **no spaces** (or spaces are trimmed), **no path** — only `https://…`.

---

## Connect Render ↔ Vercel (web-next + CMS)

Do this **after** Render gives you an API URL like `https://kothari-news-api.onrender.com` (no trailing slash).

### A) Render (backend) — CORS

In **Environment**, set **`CLIENT_URLS`** to both Vercel origins (same string as in the table above). Redeploy Render if you change it.

### B) Vercel — project 1: **web-next** (public site)

1. **New Project** → your repo → **Root Directory** = `web-next`.
2. **Settings → Environment Variables** (Production):

| Key | Example value |
|-----|----------------|
| `NEXT_PUBLIC_API_ORIGIN` | `https://kothari-news-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://new-skothari-zm44.vercel.app` |

3. **Deploy / Redeploy.**  
4. (Optional) **Google sign-in:** add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — same value as Render `GOOGLE_CLIENT_ID` if you use it.

### C) Vercel — project 2: **CMS** (separate project, same repo)

1. **New Project** → same repo → **Root Directory** = `cms`.
2. **Environment Variables** (Production):

| Key | Example value |
|-----|----------------|
| `VITE_API_ORIGIN` | `https://kothari-news-api.onrender.com` |

3. **Redeploy** so Vite bakes the variable into the build (`VITE_*` is compile-time).

### D) Checklist

- [ ] `https://YOUR-API.onrender.com/api/health` returns `{"status":"ok"}`  
- [ ] `CLIENT_URLS` on Render matches **both** live Vercel URLs exactly  
- [ ] `NEXT_PUBLIC_API_ORIGIN` on web-next = Render API origin  
- [ ] `NEXT_PUBLIC_SITE_URL` = web-next’s own URL  
- [ ] `VITE_API_ORIGIN` on CMS = same Render API origin  
- [ ] CMS and web-next **redeployed** after any env change  

---

## 1. Create the Web Service

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your **GitHub** (or GitLab) repo.
3. Configure:

| Field | Value |
|--------|--------|
| **Name** | e.g. `kothari-news-api` (becomes part of the URL) |
| **Region** | Choose closest to you / your users |
| **Branch** | `main` (or your production branch) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance type** | Free or paid (free tier sleeps on idle) |

4. **Health Check Path** (optional but recommended): `/api/health`

5. Click **Create Web Service**. After deploy, copy the URL, e.g. `https://kothari-news-api.onrender.com` — **no trailing slash**. Paste that origin into Vercel as described in **Connect Render ↔ Vercel** above.

---

## 2. Environment variables (Render → Environment)

Add each **Key** below. **Values** are examples — replace with your own secrets.

### Required for a working API

| Key | Example value | Notes |
|-----|----------------|--------|
| `NODE_ENV` | `production` | Enables strict CORS; required for real browsers hitting a separate origin. |
| `MONGO_URI` | `mongodb+srv://user:ENCODED_PASS@cluster0.xxxxx.mongodb.net/kothari-news?retryWrites=true&w=majority` | Atlas connection string. URL-encode password (`@` → `%40`, `#` → `%23`, etc.). |
| `JWT_SECRET` | `paste_a_long_random_string_at_least_32_chars` | Signs CMS staff JWTs and reader JWTs. |
| `CLIENT_URL` **or** `CLIENT_URLS` | See below | **CORS:** exact browser origins (`https://…`, no path). |

**`CLIENT_URL`** (single site only):

```text
https://new-skothari-zm44.vercel.app
```

**`CLIENT_URLS`** (your public site + CMS — use this on Render):

```text
https://new-skothari-zm44.vercel.app,https://cms-aoidopaxb-adi1407s-projects.vercel.app
```

| Key | Example value | Notes |
|-----|----------------|--------|
| `SEED_ADMIN_EMAIL` | `admin@yourdomain.com` | First **admin** user (created once if missing). |
| `SEED_ADMIN_PASSWORD` | `YourStrongPassword123!` | Login password for that admin. |
| `SEED_ADMIN_NAME` | `Super Admin` | Display name. |

### Strongly recommended defaults

| Key | Example value | Notes |
|-----|----------------|--------|
| `JWT_EXPIRES_IN` | `7d` | CMS JWT expiry. Omit → defaults to `7d`. |

### Optional — desk writers (seeded once if missing)

| Key | Example value | Notes |
|-----|----------------|--------|
| `SEED_WRITER_PASSWORD` | `Writer@1234` | Default password for seeded EN/HI writers. |
| `SEED_WRITER_EN_EMAIL` | `writer.en@yourdomain.com` | |
| `SEED_WRITER_EN_NAME` | `English Desk Writer` | |
| `SEED_WRITER_HI_EMAIL` | `writer.hi@yourdomain.com` | |
| `SEED_WRITER_HI_NAME` | `Hindi Desk Writer` | |

### Optional — Google (reader sign-in on public site)

Used by your **frontend** Google SDK; keep in Render if you document it for ops (backend reader route trusts client payload — see `routes/reader.js`).

| Key | Example value | Notes |
|-----|----------------|--------|
| `GOOGLE_CLIENT_ID` | `123456789-xxxx.apps.googleusercontent.com` | Same ID as Vercel `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. |

### CMS forgot-password email (SMTP — set on the API service)

CMS “Forgot password” sends a one-time code **only by email** (nodemailer). Without these variables, password reset by email is disabled.

| Key | Example value | Notes |
|-----|----------------|--------|
| `SMTP_HOST` | `smtp.gmail.com`, `smtp.sendgrid.net`, Amazon SES endpoint, or your mail server | Required. |
| `SMTP_PORT` | `587` | STARTTLS (typical). Use `465` with `SMTP_SECURE=true` for implicit TLS. |
| `SMTP_SECURE` | *(omit)*, `false`, or `true` | Set `true` when using port **465**. For port **587**, leave unset or `false`. |
| `SMTP_USER` | mailbox or API user | Often required (Gmail: full email; use an **app password**, not your login password). |
| `SMTP_PASS` | secret | Omit only if your relay allows unauthenticated SMTP (rare in production). |
| `CMS_PASSWORD_RESET_FROM` | `"Kothari CMS <noreply@yourdomain.com>"` | Must be allowed by your provider (same domain / verified sender). |

Optional: `SMTP_FROM` — same role as `CMS_PASSWORD_RESET_FROM` if you prefer that name.

### Optional — public newsletter (Resend audience or webhook)

| Key | Example value | Notes |
|-----|----------------|--------|
| `RESEND_NEWSLETTER_AUDIENCE_ID` | `aud_xxxxx` | With `RESEND_API_KEY` for audience sync. |
| `NEWSLETTER_WEBHOOK_URL` | `https://hooks.zapier.com/...` | Alternative to Resend audience. |

### Optional — digest email cron (`npm run newsletter:digest`)

| Key | Example value | Notes |
|-----|----------------|--------|
| `RESEND_API_KEY` | `re_xxxxxxxx` | Same key can power multiple features. |
| `NEWSLETTER_FROM` | `"Kothari News <newsletter@yourdomain.com>"` | Verified domain. |
| `NEWSLETTER_SITE_URL` | `https://new-skothari-zm44.vercel.app` | Links in emails; else first `CLIENT_URL` segment is used. |
| `NEWSLETTER_BRAND` | `Kothari News` | Subject / header branding. |

### Optional — server listen (usually leave unset on Render)

| Key | Example value | Notes |
|-----|----------------|--------|
| `PORT` | *(set automatically by Render)* | Do **not** override unless Render docs say so. |
| `HOST` | `0.0.0.0` | Default in `server.js` if unset — fine for Render. |

### Not used by current code (safe to omit)

| Key | Notes |
|-----|--------|
| `READER_JWT_SECRET` | Reader tokens use `JWT_SECRET` in `middleware/readerAuth.js`. |
| `READER_JWT_EXPIRES_IN` | Not referenced in code. |
| `MONGODB_URI` | Only some **scripts** fall back to this; the app uses **`MONGO_URI`**. |

---

## 3. Blueprint (`render.yaml`)

Repo root [`render.yaml`](./render.yaml) can create the service as a **Blueprint**; you still add **secrets** in the dashboard.

```yaml
services:
  - type: web
    name: kothari-news-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
```

---

## 4. After deploy

1. Open `https://YOUR-SERVICE.onrender.com/api/health` → should return `{"status":"ok"}`.
2. Set Vercel env vars to that origin (no trailing slash).
3. Redeploy Vercel if env vars change.

**Uploads:** Render’s disk is **ephemeral**. Files under `uploads/` may be lost on redeploy. Plan **S3** (or similar) for production media.

**Mongo Atlas:** allow **`0.0.0.0/0`** for Render’s dynamic IPs, or use Render’s [static outbound IPs](https://render.com/docs/static-outbound-ip-addresses) on a paid plan.

---

## 5. Full list — same keys as local `backend/.env`

Use the **same variable names** on Render as in your machine `backend/.env`. Do **not** commit real secrets to Git; paste them only in the Render dashboard.

| Key | Example / what to set on Render |
|-----|----------------------------------|
| `PORT` | *(leave unset — Render injects `PORT`)* | 
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your Atlas `mongodb+srv://…` (password URL-encoded) |
| `JWT_SECRET` | Long random string (not the dev placeholder) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` **or** `CLIENT_URLS` | For **web-next + CMS on Vercel**, use **`CLIENT_URLS`** with both `https://…` origins, comma-separated. Single app only → `CLIENT_URL`. |
| `GOOGLE_CLIENT_ID` | Same Web client ID as Vercel `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (or leave empty if unused) |
| `SEED_ADMIN_EMAIL` | First admin login email |
| `SEED_ADMIN_PASSWORD` | First admin login password |
| `SEED_ADMIN_NAME` | Display name, e.g. `Super Admin` |
| `SMTP_HOST` | Your SMTP server hostname (required for CMS forgot-password email) |
| `SMTP_PORT` | Usually `587` (STARTTLS) or `465` (SSL + `SMTP_SECURE=true`) |
| `SMTP_SECURE` | `true` for port 465; omit or `false` for 587 |
| `SMTP_USER` | SMTP username (often the mailbox email) |
| `SMTP_PASS` | SMTP password or app password |
| `CMS_PASSWORD_RESET_FROM` | `"Kothari CMS <noreply@yourdomain.com>"` — must match what your provider allows |

### Copy-paste block for Render (edit every value)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://USER:ENCODED_PASSWORD@cluster0.xxxxx.mongodb.net/kothari-news?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URLS=https://new-skothari-zm44.vercel.app,https://cms-aoidopaxb-adi1407s-projects.vercel.app
GOOGLE_CLIENT_ID=YOUR_NUMERIC_CLIENT_ID.apps.googleusercontent.com
SEED_ADMIN_EMAIL=admin@yourdomain.com
SEED_ADMIN_PASSWORD=YourStrongAdminPassword
SEED_ADMIN_NAME=Super Admin
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_or_app_password
CMS_PASSWORD_RESET_FROM="Kothari CMS <noreply@yourdomain.com>"
```

Add any **optional** keys from §2 (newsletter digest, extra writers, etc.) when you need them. See also [`backend/.env.example`](./backend/.env.example) for the full template including commented options.
