import type { ContentArticle } from "../../../services/contentTypes";

export function categoryHeadline(item: ContentArticle, locale: "hi" | "en") {
  return locale === "hi" ? item.title || item.titleEn : item.titleEn || item.title;
}

export function categoryDek(item: ContentArticle, locale: "hi" | "en") {
  return locale === "hi" ? item.summary || item.summaryEn : item.summaryEn || item.summary;
}
