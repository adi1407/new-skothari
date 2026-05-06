import { siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import { getArticle } from "../server/getArticle";

/**
 * Schema.org NewsArticle JSON-LD for server-rendered injection on article routes.
 */
export async function buildNewsArticleJsonLd(id: string): Promise<Record<string, unknown> | null> {
  const article = await getArticle(id);
  if (!article) return null;

  const headline = article.titleHi || article.title || "Article";
  const description = article.summaryHi || article.summary || "";
  const imageUrl = article.images?.[0]?.url ? toAbsoluteUrl(article.images[0].url) : undefined;
  const url = toAbsoluteUrl(`/article/${id}`);
  const datePublished = article.publishedAt || article.createdAt;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
  };

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  if (article.author?.name) {
    jsonLd.author = {
      "@type": "Person",
      name: article.author.name,
    };
  }

  return jsonLd;
}
