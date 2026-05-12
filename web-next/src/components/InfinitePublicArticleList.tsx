"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ContentArticle } from "../services/contentTypes";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublishedArticlesPage } from "../services/newsApi";
import styles from "../app/newsroom.module.css";

const PAGE_SIZE = 24;
const MAX_SKIP_PAGES = 60;

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
  const [done, setDone] = useState(total <= seedIds.length);
  const [err, setErr] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextPageRef = useRef(1);
  const doneRef = useRef(total <= seedIds.length);
  const inFlightRef = useRef(false);

  const seedKey = seedIds.join(",");

  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  useEffect(() => {
    seen.current = new Set(seedIds);
    setExtra([]);
    setNextPage(1);
    nextPageRef.current = 1;
    const initialDone = total <= seedIds.length;
    setDone(initialDone);
    doneRef.current = initialDone;
    setErr("");
  }, [seedKey, total]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || doneRef.current) return;
    if (seen.current.size >= total) {
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

        const atEnd = resPage * PAGE_SIZE >= resTotal;
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
    if (done) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [done, loadMore]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (total <= seedIds.length && extra.length === 0) return null;

  return (
    <section className={styles.sectionBlock} aria-busy={loading}>
      {sectionTitle ? (
        <div className={styles.sectionHead}>
          <h2 className="section-title">{sectionTitle}</h2>
        </div>
      ) : null}

      <div className="cat-page-grid">
        {extra.map((item) => (
          <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
            <Link href={`/article/${item.id}`} className={styles.cardLink}>
              <Image
                src={item.image}
                alt={headline(item, locale)}
                width={800}
                height={450}
                className={styles.cardImage}
              />
              <h3 className="card-title">{headline(item, locale)}</h3>
              <p className="card-summary">{dek(item, locale)}</p>
            </Link>
          </article>
        ))}
      </div>

      {loading ? (
        <p className="card-summary" style={{ marginTop: 12 }}>
          {locale === "hi" ? "लोड हो रहा है…" : "Loading…"}
        </p>
      ) : null}
      {err ? (
        <p className="card-summary" role="alert" style={{ marginTop: 8 }}>
          {err}
        </p>
      ) : null}
      {done && extra.length > 0 ? (
        <p className="card-summary" style={{ marginTop: 12, opacity: 0.85 }}>
          {locale === "hi" ? "और खबरें यहीं समाप्त।" : "You are caught up."}
        </p>
      ) : null}

      <div ref={sentinelRef} style={{ height: 1, width: "100%" }} aria-hidden />
    </section>
  );
}
