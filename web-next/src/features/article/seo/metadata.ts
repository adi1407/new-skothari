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

  const title = article.titleHi || article.title || "Article";
  const description = article.summaryHi || article.summary || defaultDescription;
  const imagePath = article.images?.[0]?.url;
  const imageUrl = imagePath ? toAbsoluteUrl(imagePath) : undefined;

  return {
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
}
