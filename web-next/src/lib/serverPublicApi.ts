import type { BackendArticle } from "../services/newsApi";
import { apiFetchSignal } from "./apiFetchSignal";
import { serverApiUrl } from "./serverApiOrigin";

export async function fetchPublicArticles(params: {
  category?: string;
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
  latestDays?: number;
} = {}): Promise<BackendArticle[]> {
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
    if (!res.ok) return [];

    const data = (await res.json()) as { articles?: BackendArticle[] };
    return data.articles || [];
  } catch {
    return [];
  }
}

export async function fetchPublicArticleById(id: string): Promise<BackendArticle | null> {
  try {
    const res = await fetch(serverApiUrl(`/api/public/articles/${id}`), {
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
