import { siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import { getArticle } from "../server/getArticle";

/**
 * Schema.org NewsArticle JSON-LD for server-rendered injection on article routes.
 */
export async function buildNewsArticleJsonLd(id: string): Promise<Record<string, unknown> | null> {
  const article = await getArticle(id);
  if (!article) return null;

  const hiPrimary = article.primaryLocale === "hi";
  const headline = hiPrimary
    ? String(article.metaTitleHi || "").trim() || article.titleHi || article.title || "Article"
    : String(article.metaTitle || "").trim() || article.title || article.titleHi || "Article";
  const description = hiPrimary
    ? String(article.metaDescriptionHi || "").trim() || article.summaryHi || article.summary || ""
    : String(article.metaDescription || "").trim() || article.summary || article.summaryHi || "";
  const imageUrl = article.images?.[0]?.url ? toAbsoluteUrl(article.images[0].url) : undefined;
  const publicId =
    article.articleNumber != null ? String(article.articleNumber) : id;
  const url = toAbsoluteUrl(`/article/${publicId}`);
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

  const authorName = String(article.bylineName || "").trim() || article.author?.name;
  if (authorName) {
    jsonLd.author = {
      "@type": "Person",
      name: authorName,
    };
  }

  const kw = String(article.metaKeywords || "").trim();
  if (kw) {
    jsonLd.keywords = kw;
  }

  return jsonLd;
}
