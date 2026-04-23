import type { BackendArticle } from "./newsApi";
import type { NewsItem } from "../data/mockData";
import { withPublicOrigin } from "../config/publicApi";

const CAT_HI: Record<string, string> = {
  politics:      "राजनीति",
  sports:        "खेल",
  tech:          "तकनीक",
  business:      "व्यापार",
  entertainment: "मनोरंजन",
  health:        "स्वास्थ्य",
  world:         "विश्व",
  state:         "राज्य",
};

const CAT_EN: Record<string, string> = {
  politics:      "Politics",
  sports:        "Sports",
  tech:          "Tech",
  business:      "Business",
  entertainment: "Entertainment",
  health:        "Health",
  world:         "World",
  state:         "State",
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

  return {
    id:           a._id,
    category:     CAT_HI[a.category] ?? a.category,
    categoryEn:   CAT_EN[a.category] ?? a.category,
    categorySlug: a.category,
    title:        a.titleHi || a.title,
    titleEn:      a.title,
    summary:      a.summaryHi || a.summary || "",
    summaryEn:    a.summary || "",
    image:        getImageUrl(a),
    time:         time.hi,
    timeEn:       time.en,
    author:       authorName,
    authorEn:     authorName,
    isBreaking:   a.isBreaking,
    readTime:     String(a.readTime || ""),
    viewCount:    typeof a.views === "number" ? a.views : 0,
    tags:         a.tags,
    tagsEn:       a.tags,
    content:      a.bodyHi ? [a.bodyHi] : undefined,
    contentEn:    a.body   ? [a.body]   : undefined,
  };
}

export function adaptArticles(articles: BackendArticle[]): NewsItem[] {
  return articles.map(adaptArticle);
}
