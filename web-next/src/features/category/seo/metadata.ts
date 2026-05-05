import type { Metadata } from "next";
import { categories } from "../../../data/publicCategories";
import { siteName } from "../../../lib/seo/metadataHelpers";

export function buildCategoryMetadata(slug: string): Metadata {
  const canonicalPath = `/category/${slug}`;
  const category = categories.find((c) => c.slug === slug);
  const label = category?.nameEn ?? slug;
  const title = slug === "latest" ? `Latest News — ${siteName}` : `${label} News`;
  const description =
    slug === "latest"
      ? `Stories published in the last 3 days on ${siteName}.`
      : `Latest ${label.toLowerCase()} coverage, breaking updates, explainers, and analysis on ${siteName}.`;

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
