"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Dot } from "lucide-react";
import { useLang } from "../context/LangContext";
import { fetchPublishedArticles, type BackendArticle } from "../services/newsApi";
import { backendArticlePublicId } from "../services/articleAdapter";
import styles from "./footer-marquee.module.css";

function interleaveByCategory(articles: BackendArticle[]): BackendArticle[] {
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

function headline(a: BackendArticle, lang: "hi" | "en"): string {
  const primary = a.primaryLocale === "hi" ? "hi" : "en";
  const raw =
    lang === "hi"
      ? (a.titleHi || a.title || "").trim()
      : (a.title || a.titleHi || "").trim();
  if (raw) return raw;
  return primary === "hi" ? (a.titleHi || a.title || "").trim() : (a.title || a.titleHi || "").trim();
}

export default function FooterMixedNewsMarquee() {
  const { lang, t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [rows, setRows] = useState<{ id: string; href: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedArticles({ limit: 32, page: 1, locale: lang }).then((articles) => {
      if (cancelled || !articles.length) return;
      const mixed = interleaveByCategory(articles);
      const mapped = mixed.map((a) => ({
        id: a._id,
        href: `/article/${backendArticlePublicId(a)}`,
        label: headline(a, lang),
      })).filter((r) => r.label);
      setRows(mapped);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const doubled = useMemo(() => [...rows, ...rows], [rows]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const track = trackRef.current;
    if (!track || doubled.length === 0) return;

    let pos = 0;
    const speed = 0.55;
    let raf: number;
    let totalW = 0;

    const timer = window.setTimeout(() => {
      totalW = track.scrollWidth / 2;
    }, 80);

    const step = () => {
      if (totalW > 0) {
        pos += speed;
        if (pos >= totalW) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [reduceMotion, doubled.length]);

  if (rows.length === 0) return null;

  const regionLabel = t("मिली-जुली खबरें", "Mixed headlines");

  if (reduceMotion) {
    return (
      <div className={styles.wrap} role="region" aria-label={regionLabel}>
        <div className={styles.inner}>
          <div className={styles.label}>
            <Newspaper className={styles.labelIcon} size={15} strokeWidth={2.25} aria-hidden />
            {regionLabel}
          </div>
          <div className={styles.staticRow}>
            {rows.slice(0, 12).map((r) => (
              <Link key={r.id} to={r.href} className={styles.staticChip}>
                <Dot size={12} strokeWidth={3} className={styles.dot} aria-hidden />
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap} role="region" aria-label={regionLabel}>
      <div className={styles.inner}>
        <div className={styles.label}>
          <Newspaper className={styles.labelIcon} size={15} strokeWidth={2.25} aria-hidden />
          {regionLabel}
        </div>
        <div className={styles.trackOuter}>
          <div ref={trackRef} className={styles.track}>
            {doubled.map((r, idx) => (
              <Link key={`${r.id}-${idx}`} to={r.href} className={styles.item}>
                <Dot size={14} strokeWidth={3} className={styles.dot} aria-hidden />
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
