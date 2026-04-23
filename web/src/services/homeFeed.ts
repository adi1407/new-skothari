import type { NewsItem } from "../data/mockData";
import { fetchPublishedArticles } from "./newsApi";
import { adaptArticles } from "./articleAdapter";

/** One fetch for the home page; map with `pickCategory` / `pickLatest`. */
export async function loadHomeArticles(limit = 100): Promise<NewsItem[]> {
  const raw = await fetchPublishedArticles({ limit });
  return adaptArticles(raw);
}

export function pickCategory(feed: NewsItem[], slug: string, max: number): NewsItem[] {
  return feed.filter((a) => a.categorySlug === slug).slice(0, max);
}
