import type { BackendArticle } from "../services/newsApi";

/** Round-robin mix so adjacent items skew across categories (marquee + “More stories” fallback). */
export function interleaveByCategory(articles: BackendArticle[]): BackendArticle[] {
  const byCat = new Map<string, BackendArticle[]>();
  for (const a of articles) {
    const k = a.category || "other";
    const arr = byCat.get(k) ?? [];
    arr.push(a);
    byCat.set(k, arr);
  }
  const queues = [...byCat.values()];
  const out: BackendArticle[] = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}
