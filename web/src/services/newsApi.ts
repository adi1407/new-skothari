import { withPublicOrigin } from "../config/publicApi";

export interface BackendArticle {
  _id: string;
  title: string;
  titleHi?: string;
  summary?: string;
  summaryHi?: string;
  body?: string;
  bodyHi?: string;
  images: Array<{ url: string; caption?: string; isHero?: boolean }>;
  category: string;
  tags: string[];
  isBreaking: boolean;
  readTime: number;
  status: string;
  author?: { name: string };
  slug?: string;
  publishedAt?: string;
  createdAt: string;
  views: number;
}

function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return withPublicOrigin(p);
}

const BASE = "/api/public";

export interface BackendVideo {
  _id: string;
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

export async function fetchPublishedArticles(opts: { category?: string; limit?: number; page?: number } = {}): Promise<BackendArticle[]> {
  try {
    const params = new URLSearchParams();
    if (opts.category) params.set("category", opts.category);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.page) params.set("page", String(opts.page));
    const res = await fetch(publicUrl(`${BASE}/articles?${params}`));
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

export async function fetchArticleById(id: string): Promise<BackendArticle | null> {
  try {
    const res = await fetch(publicUrl(`${BASE}/articles/${id}`));
    if (!res.ok) return null;
    const data = await res.json();
    return data.article ?? null;
  } catch {
    return null;
  }
}

/** Published articles flagged breaking (ticker). */
export async function fetchBreakingArticles(limit = 20): Promise<BackendArticle[]> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(Math.min(limit, 50)));
    const res = await fetch(publicUrl(`${BASE}/breaking?${params}`));
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

/** Site search over published articles only. */
export async function fetchPublishedVideos(opts: { category?: string; limit?: number; page?: number } = {}): Promise<BackendVideo[]> {
  try {
    const params = new URLSearchParams();
    if (opts.category) params.set("category", opts.category);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.page) params.set("page", String(opts.page));
    const res = await fetch(publicUrl(`${BASE}/videos?${params}`));
    if (!res.ok) return [];
    const data = await res.json();
    return data.videos ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicSearch(q: string, limit = 15): Promise<BackendArticle[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  try {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("limit", String(Math.min(limit, 30)));
    const res = await fetch(publicUrl(`${BASE}/search?${params}`));
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}
