"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ContentArticle } from "../services/contentTypes";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublishedArticlesPage } from "../services/newsApi";
import styles from "../app/newsroom.module.css";

const PAGE_SIZE = 24;
const MAX_SKIP_PAGES = 60;

/** True when another page might exist (handles missing `total` from older APIs). */
function computeLoadable(total: number, seedLen: number): boolean {
  if (seedLen === 0) return false;
  if (total > seedLen) return true;
  if (total === 0 && seedLen >= PAGE_SIZE) return true;
  return false;
}

type Props = {
  locale: "hi" | "en";
  seedIds: string[];
  total: number;
  category?: string;
  latestDays?: number;
  headline: (item: ContentArticle, locale: "hi" | "en") => string;
  dek: (item: ContentArticle, locale: "hi" | "en") => string;
  sectionTitle?: string;
};

export default function InfinitePublicArticleList({
  locale,
  seedIds,
  total,
  category,
  latestDays,
  headline,
  dek,
  sectionTitle,
}: Props) {
  const seen = useRef(new Set(seedIds));
  const [extra, setExtra] = useState<ContentArticle[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loadable = computeLoadable(total, seedIds.length);
  const [done, setDone] = useState(!loadable);
  const [err, setErr] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextPageRef = useRef(1);
  const doneRef = useRef(!loadable);
  const inFlightRef = useRef(false);

  const seedKey = seedIds.join(",");

  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  useEffect(() => {
    const nextLoadable = computeLoadable(total, seedIds.length);
    seen.current = new Set(seedIds);
    setExtra([]);
    setNextPage(1);
    nextPageRef.current = 1;
    const initialDone = !nextLoadable;
    setDone(initialDone);
    doneRef.current = initialDone;
    setErr("");
  }, [seedKey, total]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || doneRef.current) return;
    if (total > 0 && seen.current.size >= total) {
      setDone(true);
      doneRef.current = true;
      return;
    }

    inFlightRef.current = true;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setErr("");

    try {
      let p = nextPageRef.current;
      let guard = 0;

      while (guard < MAX_SKIP_PAGES) {
        guard += 1;
        const { articles, total: resTotal, page: resPage } = await fetchPublishedArticlesPage({
          category,
          latestDays,
          limit: PAGE_SIZE,
          page: p,
          locale,
          signal: ac.signal,
        });

        if (!articles.length) {
          setDone(true);
          doneRef.current = true;
          break;
        }

        const adapted = adaptArticles(articles);
        const fresh = adapted.filter((a) => !seen.current.has(a.id));
        fresh.forEach((a) => seen.current.add(a.id));

        const atEnd =
          resTotal > 0
            ? resPage * PAGE_SIZE >= resTotal
            : articles.length < PAGE_SIZE;
        if (atEnd) {
          if (fresh.length) setExtra((prev) => [...prev, ...fresh]);
          setDone(true);
          doneRef.current = true;
          const np = p + 1;
          nextPageRef.current = np;
          setNextPage(np);
          break;
        }

        if (fresh.length) {
          setExtra((prev) => [...prev, ...fresh]);
          const np = p + 1;
          nextPageRef.current = np;
          setNextPage(np);
          break;
        }

        p += 1;
        nextPageRef.current = p;
        setNextPage(p);
      }

      if (guard >= MAX_SKIP_PAGES) {
        setDone(true);
        doneRef.current = true;
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setErr(locale === "hi" ? "और खबरें लोड नहीं हो सकीं।" : "Could not load more stories.");
    } finally {
      inFlightRef.current = false;
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [category, latestDays, locale, total]);

  useEffect(() => {
    if (done || !computeLoadable(total, seedIds.length)) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [done, loadMore, total, seedIds.length]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (seedIds.length === 0) return null;

  return (
    <section className={styles.sectionBlock} aria-busy={loading}>
      {sectionTitle ? (
        <div className={styles.sectionHead}>
          <h2 className="section-title">{sectionTitle}</h2>
        </div>
      ) : null}

      {!loadable ? (
        <p className="card-summary" style={{ marginTop: 4 }}>
          {locale === "hi"
            ? "होम पर दिखाई गईं सभी उपलब्ध खबरें ऊपर दी गई हैं।"
            : "All available stories for the home page are shown in the sections above."}
        </p>
      ) : null}

      {loadable ? (
        <div className="cat-page-grid">
          {extra.map((item) => (
            <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
              <Link href={`/article/${item.id}`} className={styles.cardLink}>
                <img
                  src={item.image}
                  alt={headline(item, locale)}
                  width={800}
                  height={450}
                  className={styles.cardImage}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="card-title">{headline(item, locale)}</h3>
                <p className="card-summary">{dek(item, locale)}</p>
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {loadable && loading ? (
        <p className="card-summary" style={{ marginTop: 12 }}>
          {locale === "hi" ? "लोड हो रहा है…" : "Loading…"}
        </p>
      ) : null}
      {err ? (
        <p className="card-summary" role="alert" style={{ marginTop: 8 }}>
          {err}
        </p>
      ) : null}
      {loadable && done && extra.length > 0 ? (
        <p className="card-summary" style={{ marginTop: 12, opacity: 0.85 }}>
          {locale === "hi" ? "और खबरें यहीं समाप्त।" : "You are caught up."}
        </p>
      ) : null}

      {loadable ? <div ref={sentinelRef} style={{ height: 1, width: "100%" }} aria-hidden /> : null}
    </section>
  );
}
