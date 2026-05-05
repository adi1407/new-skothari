# Web-Next Architecture (SEO-First)

This project follows an App Router architecture for a news site where crawlability, metadata quality, and rendering stability are core requirements.

## Current Structure (After Cleanup)

- `app/`: route entrypoints, route metadata, server rendering, sitemap/robots
- `views/`: page-level client views (interactive UX, hooks, browser APIs)
- `components/`: reusable UI/sections used across pages
- `context/`: global providers (`lang`, `reader auth`)
- `lib/`: server-safe helpers, SEO helpers, URL helpers, fetch utilities
- `services/`: adapters and API services used by views/server pages

## Required Boundary Rules

### 1) Route Files Must Be SEO + Composition

Files in `app/**/page.tsx` should primarily contain:

- `metadata` or `generateMetadata`
- canonical/openGraph/twitter metadata
- server data fetch and minimal composition
- JSON-LD for article/category/home pages where relevant

Avoid putting client-side hooks directly in route files for indexable pages.

### 2) Client Hooks Must Stay in View/Feature Layer

Hooks such as `useState`, `useEffect`, auth/session handling, and browser APIs belong in:

- `views/*`
- future `features/*/client/*`
- future `features/*/hooks/*`

Every file using React hooks must start with `"use client"` when used under App Router boundaries.

### 3) Reusable UI Should Move to a UI Layer

Use `components/ui/` for generic primitives:

- buttons, badges, cards, chips, inputs, tabs, skeletons, modals

Use `components/` for domain sections:

- hero, latest news, ticker, opinion, shows, article interactions

## Target Structure (Incremental)

```text
src/
  app/
  features/
    home/
    category/
    article/
    shows/
    auth/
    profile/
    legal/
  components/
    ui/
    layout/
    news/
  hooks/
  context/
  lib/
    seo/
  services/
```

## SEO Checklist for News Pages

- Home (`/`): metadata + organization/news JSON-LD
- Category (`/category/[slug]`): metadata + collection JSON-LD
- Article (`/article/[id]`): dynamic metadata + `NewsArticle` JSON-LD + canonical
- Shows (`/shows`): indexable metadata
- Legal pages (`/privacy`, `/cookies`, `/terms`): canonical metadata
- Keep `sitemap.ts` and `robots.ts` aligned with indexed routes
