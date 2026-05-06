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

### Article feature layout (reference pattern)

The article route composes `app/article/[id]/page.tsx` (metadata + optional JSON-LD) with a thin client entry under `features/article/client/`. Feature code is split so SEO, server fetch, and UI can evolve independently:

| Path under `features/article/` | Role |
|--------------------------------|------|
| `types/` | Feature-local types and re-exports consumed by components/hooks. |
| `utils/` | Pure helpers (formatting, category colors, share URL builders). |
| `services/articleApi.ts` | Thin wrappers around shared `services/newsApi` for article-only calls. |
| `server/getArticle.ts` | Server-only article fetch for metadata / JSON-LD (uses `lib/serverPublicApi`). |
| `seo/metadata.ts` | `generateMetadata` helpers; uses `getArticle` from `server/`. |
| `seo/schema.ts` | `buildNewsArticleJsonLd` for `<script type="application/ld+json">` on the article route. |
| `hooks/` | `useArticle` (data + scroll), `useArticleClipboard`, `useBookmarks` (reader actions). |
| `components/` | `ArticleHero`, `ArticleContent`, `ArticleAuthor`, `ArticleSidebar`, related cards/strip, `CommentSection` placeholder. |

### Home (`features/home/`)

| Path | Role |
|------|------|
| `config/sections.ts` | Ordered category slugs and titles for homepage rails. |
| `server/homeFeed.ts` | Pure helpers: `pickCategory`, `headline`, `dek`. |
| `seo/schema.ts` | `buildHomeWebSiteJsonLd` — injected on `app/page.tsx`. |
| `components/HomeCategorySection.tsx` | Server component for one category rail (lead + grid card markup). |

The home route (`app/page.tsx`) keeps one server fetch; it maps sections via `pickCategory` and composes `HomeCategorySection`.

### Category (`features/category/`)

| Path | Role |
|------|------|
| `server/categoryFeed.ts` | `categoryHeadline`, `categoryDek` for server-rendered category grids. |
| `seo/metadata.ts` | `buildCategoryMetadata(slug)`. |
| `seo/schema.ts` | `buildCategoryCollectionJsonLd(slug, list, locale)` — used by `app/category/[slug]/page.tsx`. |

### Shows (`features/shows/`)

| Path | Role |
|------|------|
| `services/showsApi.ts` | Thin wrapper around `fetchPublishedVideos`. |
| `hooks/useShowsVideos.ts` | Loads and adapts videos when UI language changes. |
| `utils/categoryColors.ts` | `SHOWS_CATEGORY_COLORS` map by Hindi/English labels. |
| `components/` | `ShowsPageHeader`, `ShowsStatsRow`, `ShowsCategoryGroup`, `ShowsVideoCard`, `ShowsYtIcon`. |
| `seo/metadata.ts` | Static shows listing metadata. |

`ShowsPageClient` only wires `useShowsVideos` and these components.

### Profile (`features/profile/`)

| Path | Role |
|------|------|
| `types/profile.ts` | `ProfileTabKey`, `ProfileNavigate`. |
| `utils/parseJwtPayload.ts` | Google credential JWT decode (browser). |
| `hooks/` | `useProfileReaderLists`, `useProfilePrefsSync`, `useProfileGoogleSignIn`. |
| `components/` | `ProfileHeader`, `ProfileSignInSection`, `ProfileNav`, settings / bookmarks / liked / privacy panels. |

`ProfilePageClient` composes reader auth, lists, and tab panels; global styles stay in `views/profile-page.css`.

### Legal + auth (lightweight)

| Path | Role |
|------|------|
| `legal/components/LegalPageShell.tsx` | Shared kicker, title, updated line, lead, chip row; body is `children`. |
| `auth/types/auth.ts` | Placeholder for future shared auth types (redirect-only clients today). |

**Principle for all indexable features:** **route = metadata + JSON-LD + composition**, **client = hooks + presentational components**, **server + `seo/`** = one place for crawlable data.

## SEO Checklist for News Pages

- Home (`/`): metadata + organization/news JSON-LD
- Category (`/category/[slug]`): metadata + collection JSON-LD
- Article (`/article/[id]`): dynamic metadata + `NewsArticle` JSON-LD + canonical
- Shows (`/shows`): indexable metadata
- Legal pages (`/privacy`, `/cookies`, `/terms`): canonical metadata
- Keep `sitemap.ts` and `robots.ts` aligned with indexed routes
