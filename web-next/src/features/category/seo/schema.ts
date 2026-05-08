import { categories } from "../../../data/publicCategories";
import type { ContentArticle } from "../../../services/contentTypes";
import { toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";
import { categoryHeadline } from "../server/categoryFeed";

/**
 * CollectionPage JSON-LD for category routes (server-only).
 */
export function buildCategoryCollectionJsonLd(
  slug: string,
  list: ContentArticle[],
  locale: "hi" | "en"
): Record<string, unknown> {
  const category = categories.find((c) => c.slug === slug);
  const name =
    slug === "latest"
      ? locale === "hi"
        ? "ताज़ा खबरें"
        : "Latest news"
      : `${locale === "hi" ? category?.name ?? slug : category?.nameEn ?? slug} News`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: toAbsoluteUrl(`/category/${slug}`),
    hasPart: list.slice(0, 20).map((item) => ({
      "@type": "NewsArticle",
      headline: categoryHeadline(item, locale),
      url: toAbsoluteUrl(`/article/${item.id}`),
    })),
  };
}
