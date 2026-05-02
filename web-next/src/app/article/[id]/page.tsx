import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleInteractions from "../../../components/article/ArticleInteractions.client";
import { fetchPublicArticleById } from "../../../lib/serverPublicApi";
import { defaultDescription, siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import styles from "../../newsroom.module.css";

/** Fresh engagement counts — avoids stale ISR cache for likes/upvotes */
export const dynamic = "force-dynamic";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}

function normalizeBodyParagraphs(input: string): string[] {
  if (!input) return [];

  const hasHtmlTags = /<[^>]+>/.test(input);
  if (!hasHtmlTags) {
    return input
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  const textified = decodeHtmlEntities(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|blockquote|h[1-6]|ul|ol)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  return textified
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

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

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await fetchPublicArticleById(id);
  if (!article) notFound();

  const title = article.titleHi || article.title || "Untitled";
  const summary = article.summaryHi || article.summary || "";
  const body = article.bodyHi || article.body || "";
  const bodyParagraphs = normalizeBodyParagraphs(body);
  const image = article.images?.[0]?.url ? toAbsoluteUrl(article.images[0].url) : "";
  const upvotes = typeof article.upvotes === "number" ? article.upvotes : 0;
  const published = article.publishedAt || article.createdAt;
  const publishedLabel =
    published &&
    new Date(published).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: summary || defaultDescription,
    image: image ? [image] : undefined,
    datePublished: published,
    dateModified: published,
    mainEntityOfPage: toAbsoluteUrl(`/article/${id}`),
    author: {
      "@type": "Person",
      name: article.author?.name || "Kothari News",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
  };

  return (
    <main className="article-page">
      <div className={styles.articleLayout}>
        <article className="article-main-col">
          <nav className={styles.articleMetaRow} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.articleCrumbSep} aria-hidden>
              ›
            </span>
            <Link href={`/category/${article.category}`}>{article.category}</Link>
            {publishedLabel ? (
              <>
                <span className={styles.articleCrumbSep} aria-hidden>
                  ·
                </span>
                <time dateTime={published}>{publishedLabel}</time>
              </>
            ) : null}
          </nav>
          <h1 className="article-headline">{title}</h1>
          {summary ? <p className="article-deck">{summary}</p> : null}
          {image ? (
            <Image
              src={image}
              alt={title}
              width={1280}
              height={720}
              priority
              className={`article-hero-img ${styles.articleHero}`}
            />
          ) : null}
          <ArticleInteractions
            articleId={id}
            initialUpvotes={upvotes}
            shareTitle={title}
            shareSummary={summary}
          />
          <div className="article-body">
            {(bodyParagraphs.length ? bodyParagraphs : [summary]).filter(Boolean).map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
          {article.tags?.length ? (
            <div className="article-tags-section">
              <p className="article-tags-label">Tags</p>
              <div className="article-tags">
                {article.tags.map((t) => (
                  <span key={t} className="article-tag">#{t}</span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
