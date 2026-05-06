import { fetchPublicArticleById } from "../../../lib/serverPublicApi";

/**
 * Server-only: raw published article for metadata / JSON-LD.
 * Returns null if missing or fetch fails.
 */
export async function getArticle(id: string) {
  return fetchPublicArticleById(id);
}
