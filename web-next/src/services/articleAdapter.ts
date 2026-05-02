import type { BackendArticle } from "./newsApi";
import type { NewsItem } from "../data/mockData";
import { withPublicOrigin } from "../config/publicApi";

const CAT_HI: Record<string, string> = {
  desh:       "देश",
  videsh:     "विदेश",
  rajneeti:   "राजनीति",
  khel:       "खेल",
  health:     "स्वास्थ्य",
  krishi:     "कृषि",
  business:   "व्यापार",
  manoranjan: "मनोरंजन",
};

const CAT_EN: Record<string, string> = {
  desh:       "Country",
  videsh:     "World",
  rajneeti:   "Politics",
  khel:       "Sports",
  health:     "Health",
  krishi:     "Agriculture",
  business:   "Business",
  manoranjan: "Entertainment",
};

function relativeTime(dateStr?: string): { hi: string; en: string } {
  if (!dateStr) return { hi: "अभी", en: "Just now" };
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return { hi: "अभी",                  en: "Just now" };
  if (mins < 60)  return { hi: `${mins} मिनट पहले`,    en: `${mins} min ago` };
  if (hours < 24) return { hi: `${hours} घंटे पहले`,   en: `${hours} hour${hours > 1 ? "s" : ""} ago` };
  if (days < 7)   return { hi: `${days} दिन पहले`,     en: `${days} day${days > 1 ? "s" : ""} ago` };
  return { hi: new Date(dateStr).toLocaleDateString("hi-IN"), en: new Date(dateStr).toLocaleDateString("en-IN") };
}

function getImageUrl(article: BackendArticle): string {
  const hero = article.images.find((i) => i.isHero) ?? article.images[0];
  if (!hero) return `https://picsum.photos/seed/${article._id}/800/500`;
  return withPublicOrigin(hero.url);
}

export function adaptArticle(a: BackendArticle): NewsItem {
  const time = relativeTime(a.publishedAt ?? a.createdAt);
  const authorName = a.author?.name ?? "संवाददाता";
  const rawTitleHi = String(a.titleHi || "").trim();
  const rawTitleEn = String(a.title || "").trim();
  const rawSummaryHi = String(a.summaryHi || "").trim();
  const rawSummaryEn = String(a.summary || "").trim();
  const bodyHi = String(a.bodyHi || "").trim();
  const bodyEn = String(a.body || "").trim();

  const title = rawTitleHi || rawTitleEn;
  const titleEnOut = rawTitleEn || rawTitleHi;
  const summary = rawSummaryHi || rawSummaryEn;
  const summaryEnOut = rawSummaryEn || rawSummaryHi;

  return {
    id:           a._id,
    category:     CAT_HI[a.category] ?? a.category,
    categoryEn:   CAT_EN[a.category] ?? a.category,
    categorySlug: a.category,
    title,
    titleEn:      titleEnOut,
    summary,
    summaryEn:    summaryEnOut,
    image:        getImageUrl(a),
    time:         time.hi,
    timeEn:       time.en,
    author:       authorName,
    authorEn:     authorName,
    isBreaking:   a.isBreaking,
    readTime:     String(a.readTime || ""),
    viewCount:    typeof a.views === "number" ? a.views : 0,
    upvoteCount:  typeof a.upvotes === "number" ? a.upvotes : 0,
    tags:         a.tags,
    tagsEn:       a.tags,
    content:      bodyHi ? [bodyHi] : bodyEn ? [bodyEn] : undefined,
    contentEn:    bodyEn ? [bodyEn] : bodyHi ? [bodyHi] : undefined,
  };
}

export function adaptArticles(articles: BackendArticle[]): NewsItem[] {
  return articles.map(adaptArticle);
}
