import type { Metadata } from "next";
import ArticlePageView from "../../../views/ArticlePage";
import { fetchPublicArticleById } from "../../../lib/serverPublicApi";
import { defaultDescription, siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";

/**
 * Article body + recommendations load in the browser (same API origin as the user’s session),
 * so we never return Next’s 404 when the *server* cannot reach Render (common on Vercel without INTERNAL_API_URL).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const canonicalPath = `/article/${id}`;

  const article = await fetchPublicArticleById(id);
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

export default async function ArticleRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticlePageView articleId={id} />;
}
