"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ContentArticle } from "../services/contentTypes";
import { categoryDek, categoryHeadline } from "../features/category/server/categoryFeed";
import { dek as homeDek, headline as homeHeadline } from "../features/home/server/homeFeed";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublishedArticlesPage } from "../services/newsApi";
import { interleaveByCategory } from "../lib/mixedArticleOrder";
import styles from "../app/newsroom.module.css";

const MIXED_FALLBACK_TARGET = 12;
const MIXED_FETCH_PAGES = 5;
const MIXED_PAGE_SIZE = 24;

const PAGE_SIZE = 24;
const MAX_SKIP_PAGES = 60;

/** True when another page might exist (handles missing `total` from older APIs). */
function computeLoadable(total: number, seedLen: number): boolean {
  if (seedLen === 0) return false;
  if (total > seedLen) return true;
  if (total === 0 && seedLen >= PAGE_SIZE) return true;
  return false;
}

type FeedSource = "home" | "category";

/** Serializable props only — never add functions (RSC → client boundary). */
export type InfinitePublicArticleListProps = {
  locale: "hi" | "en";
  seedIds: string[];
  total: number;
  category?: string;
  latestDays?: number;
  feedSource?: FeedSource;
  sectionTitle?: string;
};

function itemHeadline(item: ContentArticle, locale: "hi" | "en", source: FeedSource): string {
  return source === "category" ? categoryHeadline(item, locale) : homeHeadline(item, locale);
}

function itemDek(item: ContentArticle, locale: "hi" | "en", source: FeedSource): string {
  return source === "category" ? categoryDek(item, locale) : homeDek(item, locale);
}

export default function InfinitePublicArticleList({
  locale,
  seedIds,
  total,
  category,
  latestDays,
  feedSource = "home",
  sectionTitle,
}: InfinitePublicArticleListProps) {
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

  const [mixedFallback, setMixedFallback] = useState<ContentArticle[]>([]);
  const [mixedLoading, setMixedLoading] = useState(false);
  const [mixedErr, setMixedErr] = useState("");

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
    setMixedFallback([]);
    setMixedErr("");
  }, [seedKey, total]);

  useEffect(() => {
    const loadableNow = computeLoadable(total, seedIds.length);
    if (loadableNow || seedIds.length === 0) {
      setMixedFallback([]);
      setMixedLoading(false);
      setMixedErr("");
      return;
    }

    const seed = new Set(seedIds);
    let cancelled = false;
    const ac = new AbortController();

    async function loadMixed() {
      setMixedLoading(true);
      setMixedErr("");
      const collected: ContentArticle[] = [];
      const seenIds = new Set<string>();

      try {
        for (let page = 1; page <= MIXED_FETCH_PAGES && collected.length < MIXED_FALLBACK_TARGET; page += 1) {
          const { articles } = await fetchPublishedArticlesPage({
            category,
            latestDays,
            limit: MIXED_PAGE_SIZE,
            page,
            locale,
            signal: ac.signal,
          });
          if (!articles.length) break;

          const ordered = interleaveByCategory(articles);
          const adapted = adaptArticles(ordered);
          for (const a of adapted) {
            if (seed.has(a.id) || seenIds.has(a.id)) continue;
            seenIds.add(a.id);
            collected.push(a);
            if (collected.length >= MIXED_FALLBACK_TARGET) break;
          }
        }
        if (!cancelled) setMixedFallback(collected);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (!cancelled) {
          setMixedFallback([]);
          setMixedErr(
            locale === "hi" ? "मिश्रित खबरें लोड नहीं हो सकीं।" : "Could not load mixed picks."
          );
        }
      } finally {
        if (!cancelled) setMixedLoading(false);
      }
    }

    void loadMixed();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [seedKey, total, locale, category, latestDays]);

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
    <section
      id="kn-more-stories"
      className={styles.sectionBlock}
      aria-busy={loading || mixedLoading}
    >
      {sectionTitle ? (
        <div className={styles.sectionHead}>
          <h2 className="section-title">{sectionTitle}</h2>
        </div>
      ) : null}

      {!loadable ? (
        <>
          <p className="card-summary" style={{ marginTop: 4 }}>
            {feedSource === "category"
              ? locale === "hi"
                ? "इस श्रेणी में मिली-जुली और खबरें — ऊपर दिखाई सूची के अलावा।"
                : "More mixed stories in this category — beyond the list above."
              : locale === "hi"
                ? "श्रेणियों से मिलाकर चुनी गईं और खबरें — ऊपर दिखाई सूची के अलावा।"
                : "Mixed picks from across sections — beyond what is already shown above."}
          </p>
          {mixedLoading ? (
            <p className="card-summary" style={{ marginTop: 12 }}>
              {locale === "hi" ? "लोड हो रहा है…" : "Loading…"}
            </p>
          ) : null}
          {mixedErr ? (
            <p className="card-summary" role="alert" style={{ marginTop: 8 }}>
              {mixedErr}
            </p>
          ) : null}
          {!mixedLoading && !mixedErr && mixedFallback.length === 0 ? (
            <p className="card-summary" style={{ marginTop: 8, opacity: 0.9 }}>
              {locale === "hi"
                ? "अतिरिक्त खबरें अभी उपलब्ध नहीं हैं। श्रेणियाँ देखें।"
                : "No additional stories to show right now. Browse categories."}
            </p>
          ) : null}
          {mixedFallback.length > 0 ? (
            <div className="cat-page-grid" style={{ marginTop: 16 }}>
              {mixedFallback.map((item) => (
                <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
                  <Link href={`/article/${item.id}`} className={styles.cardLink}>
                    <img
                      src={item.image}
                      alt={itemHeadline(item, locale, feedSource)}
                      width={800}
                      height={450}
                      className={styles.cardImage}
                      loading="lazy"
                      decoding="async"
                    />
                    <h3 className="card-title">{itemHeadline(item, locale, feedSource)}</h3>
                    <p className="card-summary">{itemDek(item, locale, feedSource)}</p>
                  </Link>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {loadable ? (
        <div className="cat-page-grid">
          {extra.map((item) => (
            <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
              <Link href={`/article/${item.id}`} className={styles.cardLink}>
                <img
                  src={item.image}
                  alt={itemHeadline(item, locale, feedSource)}
                  width={800}
                  height={450}
                  className={styles.cardImage}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="card-title">{itemHeadline(item, locale, feedSource)}</h3>
                <p className="card-summary">{itemDek(item, locale, feedSource)}</p>
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
