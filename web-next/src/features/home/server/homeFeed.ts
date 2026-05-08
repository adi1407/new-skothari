import type { ContentArticle } from "../../../services/contentTypes";

export function pickCategory<T extends { categorySlug: string }>(feed: T[], slug: string, max: number): T[] {
  return feed.filter((a) => a.categorySlug === slug).slice(0, max);
}

export function headline(item: ContentArticle, locale: "hi" | "en") {
  return locale === "hi" ? item.title || item.titleEn : item.titleEn || item.title;
}

export function dek(item: ContentArticle, locale: "hi" | "en") {
  return locale === "hi" ? item.summary || item.summaryEn : item.summaryEn || item.summary;
}
