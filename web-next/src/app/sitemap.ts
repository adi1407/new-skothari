import type { MetadataRoute } from "next";
import { categories } from "../data/publicCategories";
import { apiFetchSignal } from "../lib/apiFetchSignal";
import { serverApiUrl } from "../lib/serverApiOrigin";
import { getSiteUrl } from "../lib/seo/metadataHelpers";

type PublicArticle = {
  _id: string;
  publishedAt?: string;
  createdAt?: string;
};

const PAGE_LIMIT = 100;
const MAX_ARTICLES = Number(process.env.SITEMAP_MAX_ARTICLES || 5000);

function absolute(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${p}`;
}

async function fetchPublishedArticles(): Promise<PublicArticle[]> {
  const all: PublicArticle[] = [];
  let page = 1;

  while (all.length < MAX_ARTICLES) {
    let res: Response;
    try {
      res = await fetch(serverApiUrl(`/api/public/articles?limit=${PAGE_LIMIT}&page=${page}`), {
        next: { revalidate: 300 },
        signal: apiFetchSignal(),
      });
    } catch {
      break;
    }

    if (!res.ok) break;

    const data = (await res.json()) as { articles?: PublicArticle[] };
    const articles = data.articles || [];
    if (articles.length === 0) break;

    all.push(...articles);
    if (articles.length < PAGE_LIMIT) break;
    page += 1;
  }

  return all.slice(0, MAX_ARTICLES);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absolute("/shows"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absolute("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: absolute("/mission"), lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: absolute("/vision"), lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: absolute("/privacy"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug !== "home")
    .map((c) => ({
      url: absolute(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.7,
    }));

  const articles = await fetchPublishedArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absolute(`/article/${a._id}`),
    lastModified: a.publishedAt ? new Date(a.publishedAt) : a.createdAt ? new Date(a.createdAt) : now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
