import type { BackendArticle } from "../services/newsApi";
import { apiFetchSignal } from "./apiFetchSignal";
import { serverApiUrl } from "./serverApiOrigin";

export type PublicArticlesPage = {
  articles: BackendArticle[];
  total: number;
  page: number;
};

export async function fetchPublicArticles(params: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
  latestDays?: number;
} = {}): Promise<BackendArticle[]> {
  const { articles } = await fetchPublicArticlesPage(params);
  return articles;
}

export async function fetchPublicArticlesPage(params: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
  latestDays?: number;
} = {}): Promise<PublicArticlesPage> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.page) qs.set("page", String(params.page));
  if (params.locale) qs.set("locale", params.locale);
  if (params.latestDays) qs.set("latestDays", String(params.latestDays));

  try {
    const res = await fetch(serverApiUrl(`/api/public/articles?${qs.toString()}`), {
      next: { revalidate: 60 },
      signal: apiFetchSignal(),
    });
    if (!res.ok) return { articles: [], total: 0, page: Number(params.page) || 1 };

    const data = (await res.json()) as { articles?: BackendArticle[]; total?: number; page?: number };
    return {
      articles: data.articles || [],
      total: Number(data.total) || 0,
      page: Number(data.page) || Number(params.page) || 1,
    };
  } catch {
    return { articles: [], total: 0, page: Number(params.page) || 1 };
  }
}

export async function fetchPublicArticleById(id: string): Promise<BackendArticle | null> {
  try {
    const res = await fetch(serverApiUrl(`/api/public/articles/${encodeURIComponent(String(id || "").trim())}`), {
      cache: "no-store",
      signal: apiFetchSignal(),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { article?: BackendArticle };
    return data.article || null;
  } catch {
    return null;
  }
}
