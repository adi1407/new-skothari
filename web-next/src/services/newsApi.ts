import { withPublicOrigin } from "../config/publicApi";
import { apiFetchSignal } from "../lib/apiFetchSignal";

export interface BackendArticle {
  _id: string;
  articleNumber?: number;
  title: string;
  titleHi?: string;
  summary?: string;
  summaryHi?: string;
  body?: string;
  bodyHi?: string;
  images: Array<{
    url: string;
    caption?: string;
    isHero?: boolean;
    alt?: string;
    imageTitle?: string;
    imageDescription?: string;
    source?: string;
  }>;
  category: string;
  tags: string[];
  isBreaking: boolean;
  readTime: number;
  status: string;
  author?: { name: string };
  bylineName?: string;
  metaTitle?: string;
  metaTitleHi?: string;
  metaDescription?: string;
  metaDescriptionHi?: string;
  metaKeywords?: string;
  primaryLocale?: "hi" | "en";
  slug?: string;
  publishedAt?: string;
  createdAt: string;
  views: number;
  upvotes?: number;
}

function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return withPublicOrigin(p);
}

const BASE = "/api/public";

export interface BackendVideo {
  _id: string;
  primaryLocale?: "hi" | "en";
  title: string;
  titleEn?: string;
  summary?: string;
  summaryEn?: string;
  youtubeUrl: string;
  duration?: string;
  views?: string;
  category: string;
  thumbnailOverride?: string;
  sortOrder?: number;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
}

export type PublishedArticlesPageResult = {
  articles: BackendArticle[];
  total: number;
  page: number;
};

export async function fetchPublishedArticles(opts: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
  latestDays?: number;
  signal?: AbortSignal;
} = {}): Promise<BackendArticle[]> {
  const { articles } = await fetchPublishedArticlesPage(opts);
  return articles;
}

/** Public article list with pagination metadata (same endpoint as `fetchPublishedArticles`). */
export async function fetchPublishedArticlesPage(opts: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
  latestDays?: number;
  signal?: AbortSignal;
} = {}): Promise<PublishedArticlesPageResult> {
  try {
    const params = new URLSearchParams();
    if (opts.category) params.set("category", opts.category);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.page) params.set("page", String(opts.page));
    if (opts.locale) params.set("locale", opts.locale);
    if (opts.latestDays) params.set("latestDays", String(opts.latestDays));
    const signal = opts.signal ?? apiFetchSignal() ?? undefined;
    const res = await fetch(publicUrl(`${BASE}/articles?${params}`), { signal });
    if (!res.ok) return { articles: [], total: 0, page: Number(opts.page) || 1 };
    const data = (await res.json()) as { articles?: BackendArticle[]; total?: number; page?: number };
    return {
      articles: data.articles ?? [],
      total: Number(data.total) || 0,
      page: Number(data.page) || Number(opts.page) || 1,
    };
  } catch {
    return { articles: [], total: 0, page: Number(opts.page) || 1 };
  }
}

export async function fetchArticleById(id: string): Promise<BackendArticle | null> {
  try {
    const enc = encodeURIComponent(String(id || "").trim());
    const res = await fetch(publicUrl(`${BASE}/articles/${enc}`), { signal: apiFetchSignal() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article ?? null;
  } catch {
    return null;
  }
}

/** Personalized mix: same category → shared tags → popular/recent (public). */
export async function fetchRecommendedForArticle(
  articleId: string,
  opts: { limit?: number; locale?: "hi" | "en" } = {}
): Promise<BackendArticle[]> {
  try {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.locale) params.set("locale", opts.locale);
    const enc = encodeURIComponent(String(articleId || "").trim());
    const res = await fetch(publicUrl(`${BASE}/articles/${enc}/recommendations?${params}`), {
      signal: apiFetchSignal(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

/** Published articles flagged breaking (ticker). */
export async function fetchBreakingArticles(limit = 20, locale?: "hi" | "en"): Promise<BackendArticle[]> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(Math.min(limit, 50)));
    if (locale) params.set("locale", locale);
    const res = await fetch(publicUrl(`${BASE}/breaking?${params}`), { signal: apiFetchSignal() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

/** Site search over published articles only. */
export async function fetchPublishedVideos(opts: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
} = {}): Promise<BackendVideo[]> {
  try {
    const params = new URLSearchParams();
    if (opts.category) params.set("category", opts.category);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.page) params.set("page", String(opts.page));
    if (opts.locale) params.set("locale", opts.locale);
    const res = await fetch(publicUrl(`${BASE}/videos?${params}`), { signal: apiFetchSignal() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.videos ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicSearch(q: string, limit = 15, locale?: "hi" | "en"): Promise<BackendArticle[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  try {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("limit", String(Math.min(limit, 30)));
    if (locale) params.set("locale", locale);
    const res = await fetch(publicUrl(`${BASE}/search?${params}`), { signal: apiFetchSignal() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}
