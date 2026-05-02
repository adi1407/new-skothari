import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categories } from "../../../data/publicCategories";
import { adaptArticles } from "../../../services/articleAdapter";
import { fetchPublicArticles } from "../../../lib/serverPublicApi";
import { getServerUiLang } from "../../../lib/serverLocale";
import type { NewsItem } from "../../../data/mockData";
import { defaultDescription, siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import styles from "../../newsroom.module.css";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/category/${slug}`;
  const category = categories.find((c) => c.slug === slug);
  const label = category?.nameEn ?? slug;
  const title = `${label} News`;
  const description = `Latest ${label.toLowerCase()} coverage, breaking updates, explainers, and analysis on ${siteName}.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [label, `${label} news`, "Kothari News"],
  };
}

function headline(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.title || item.titleEn : item.titleEn || item.title;
}

function dek(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.summary || item.summaryEn : item.summaryEn || item.summary;
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = await getServerUiLang();
  const category = categories.find((c) => c.slug === slug);
  const list = adaptArticles(await fetchPublicArticles({ category: slug, limit: 24, locale }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${locale === "hi" ? category?.name ?? slug : category?.nameEn ?? slug} News`,
    url: toAbsoluteUrl(`/category/${slug}`),
    hasPart: list.slice(0, 20).map((item) => ({
      "@type": "NewsArticle",
      headline: headline(item, locale),
      url: toAbsoluteUrl(`/article/${item.id}`),
    })),
  };

  return (
    <main className="cat-page">
      <div className="cat-page-header">
        <div className="cat-page-header-inner">
          <h1 className="cat-page-title">{locale === "hi" ? category?.name ?? slug : category?.nameEn ?? slug}</h1>
          <p className="cat-page-count">
            {locale === "hi" ? `${list.length} खबरें` : `${list.length} stories`}
          </p>
        </div>
      </div>

      <div className="cat-page-body">
        <section className="cat-page-grid">
          {list.map((item) => (
            <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
              <Link href={`/article/${item.id}`} className={styles.cardLink}>
                <Image
                  src={item.image}
                  alt={headline(item, locale)}
                  width={800}
                  height={450}
                  className={styles.cardImage}
                />
                <h3 className="card-title">{headline(item, locale)}</h3>
                <p className="card-summary">{dek(item, locale)}</p>
              </Link>
            </article>
          ))}
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
