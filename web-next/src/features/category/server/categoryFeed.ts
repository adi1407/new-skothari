import type { NewsItem } from "../../../data/mockData";

export function categoryHeadline(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.title || item.titleEn : item.titleEn || item.title;
}

export function categoryDek(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.summary || item.summaryEn : item.summaryEn || item.summary;
}
