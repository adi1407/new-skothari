import type { CategoryColorMap } from "../types/article";

export const categoryColors: CategoryColorMap = {
  desh: "#BB1919",
  videsh: "#1A3A6B",
  rajneeti: "#810102",
  khel: "#00695C",
  health: "#1B6B3A",
  krishi: "#2E7D32",
  business: "#7C4A00",
  manoranjan: "#6B1FA5",
  home: "#BB1919",
};

export function isMongoId(id: string): boolean {
  return /^[a-f0-9]{24}$/.test(id);
}

/** Article URL segment: Mongo ObjectId, public 9-digit article number, or slug-9digits. */
export function isArticleRefId(id: string): boolean {
  const s = String(id || "").trim();
  if (isMongoId(s)) return true;
  if (/^\d{9}$/.test(s)) return true;
  return /^[a-z0-9-]+-\d{9}$/i.test(s);
}

/** True when the route segment refers to the same article as adapted `article`. */
export function publicArticleSegmentsMatch(
  routeSegment: string,
  article: { id: string; mongoId: string }
): boolean {
  const seg = String(routeSegment || "").trim();
  if (!seg || !article) return false;
  if (seg === article.mongoId || seg === article.id) return true;
  const m = /^[a-z0-9-]+-(\d{9})$/i.exec(seg);
  return Boolean(m && m[1] === article.id);
}

export function upvoteCountFromApi(res: unknown): number | null {
  if (!res || typeof res !== "object" || !("upvoteCount" in res)) return null;
  const n = Number((res as { upvoteCount: unknown }).upvoteCount);
  return Number.isFinite(n) ? n : null;
}

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : Number(v.toFixed(1))}M`.replace(".0M", "M");
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : Number(v.toFixed(1))}K`.replace(".0K", "K");
  }
  return String(n);
}

export function isHtmlParagraph(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s);
}
