import type { Metadata } from "next";
import ArticlePageClient from "../../../features/article/client/ArticlePageClient";
import { buildArticleMetadata } from "../../../features/article/seo/metadata";
import { buildNewsArticleJsonLd } from "../../../features/article/seo/schema";

/**
 * Article body + recommendations load in the browser (same API origin as the user’s session),
 * so we never return Next’s 404 when the *server* cannot reach Render (common on Vercel without INTERNAL_API_URL).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  return buildArticleMetadata(id);
}

export default async function ArticleRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jsonLd = await buildNewsArticleJsonLd(id);

  return (
    <>
      {jsonLd != null ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <ArticlePageClient articleId={id} />
    </>
  );
}
