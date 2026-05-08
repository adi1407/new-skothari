import type { Metadata } from "next";
import { defaultDescription, siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import { getArticle } from "../server/getArticle";

export async function buildArticleMetadata(id: string): Promise<Metadata> {
  const canonicalPath = `/article/${id}`;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "Article",
      description: defaultDescription,
      alternates: { canonical: canonicalPath },
    };
  }

  const hiPrimary = article.primaryLocale === "hi";
  const metaTitle = hiPrimary
    ? String(article.metaTitleHi || "").trim() || article.titleHi || article.title
    : String(article.metaTitle || "").trim() || article.title || article.titleHi;
  const title = metaTitle || article.titleHi || article.title || "Article";

  const metaDesc = hiPrimary
    ? String(article.metaDescriptionHi || "").trim() || article.summaryHi || article.summary
    : String(article.metaDescription || "").trim() || article.summary || article.summaryHi;
  const description = metaDesc || defaultDescription;

  const keywords = String(article.metaKeywords || "").trim();

  const imagePath = article.images?.[0]?.url;
  const imageUrl = imagePath ? toAbsoluteUrl(imagePath) : undefined;

  const meta: Metadata = {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalPath,
      siteName,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };

  if (keywords) {
    meta.keywords = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  }

  return meta;
}
