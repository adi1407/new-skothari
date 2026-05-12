import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categories } from "../../../data/publicCategories";
import { buildCategoryMetadata } from "../../../features/category/seo/metadata";
import { buildCategoryCollectionJsonLd } from "../../../features/category/seo/schema";
import { categoryDek, categoryHeadline } from "../../../features/category/server/categoryFeed";
import { adaptArticles } from "../../../services/articleAdapter";
import { fetchPublicArticlesPage } from "../../../lib/serverPublicApi";
import { getServerUiLang } from "../../../lib/serverLocale";
import InfinitePublicArticleList from "../../../components/InfinitePublicArticleList";
import styles from "../../newsroom.module.css";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  return buildCategoryMetadata(slug);
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = await getServerUiLang();
  const category = categories.find((c) => c.slug === slug);
  const { articles: rawList, total: listTotal } = await fetchPublicArticlesPage(
    slug === "latest"
      ? { latestDays: 3, limit: 24, locale }
      : { category: slug, limit: 24, locale }
  );
  const list = adaptArticles(rawList);
  const seedIds = list.map((a) => a.id);
  const jsonLd = buildCategoryCollectionJsonLd(slug, list, locale);

  return (
    <main className="cat-page">
      <div className="cat-page-header">
        <div className="cat-page-header-inner">
          <h1 className="cat-page-title">{locale === "hi" ? category?.name ?? slug : category?.nameEn ?? slug}</h1>
          <p className="cat-page-count">
            {slug === "latest"
              ? locale === "hi"
                ? `${list.length} खबरें · पिछले 3 दिन · ${listTotal} कुल`
                : `${list.length} stories · last 3 days · ${listTotal} total`
              : locale === "hi"
                ? `${list.length} खबरें · ${listTotal} कुल`
                : `${list.length} stories · ${listTotal} total`}
          </p>
        </div>
      </div>

      <div className="cat-page-body">
        <section className="cat-page-grid">
          {list.length === 0 ? (
            <article className={`card-default ${styles.cardBody}`}>
              <p className="card-summary">
                {locale === "hi"
                  ? "इस श्रेणी के लिए अभी खबरें उपलब्ध नहीं हैं।"
                  : "No stories are currently available for this category."}
              </p>
            </article>
          ) : null}
          {list.map((item) => (
            <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
              <Link href={`/article/${item.id}`} className={styles.cardLink}>
                <Image
                  src={item.image}
                  alt={categoryHeadline(item, locale)}
                  width={800}
                  height={450}
                  className={styles.cardImage}
                />
                <h3 className="card-title">{categoryHeadline(item, locale)}</h3>
                <p className="card-summary">{categoryDek(item, locale)}</p>
              </Link>
            </article>
          ))}
        </section>
        <InfinitePublicArticleList
          locale={locale}
          seedIds={seedIds}
          total={listTotal}
          category={slug === "latest" ? undefined : slug}
          latestDays={slug === "latest" ? 3 : undefined}
          headline={categoryHeadline}
          dek={categoryDek}
          sectionTitle={locale === "hi" ? "और खबरें" : "More stories"}
        />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
