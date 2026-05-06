/**
 * Thin wrappers around global news API — keeps article feature imports localized.
 */
import {
  fetchArticleById as fetchArticleByIdRaw,
  fetchPublishedArticles as fetchPublishedArticlesRaw,
  fetchRecommendedForArticle as fetchRecommendedForArticleRaw,
} from "../../../services/newsApi";

export async function getArticleById(id: string) {
  return fetchArticleByIdRaw(id);
}

export async function getRecommendedForArticle(
  articleId: string,
  opts: { limit?: number; locale?: "hi" | "en" }
) {
  return fetchRecommendedForArticleRaw(articleId, opts);
}

export async function getPublishedArticlesPage(opts: {
  limit?: number;
  page?: number;
  locale?: "hi" | "en";
}) {
  return fetchPublishedArticlesRaw(opts);
}
