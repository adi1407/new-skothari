import { useRef, useEffect, useState, useMemo } from "react";
import { Activity, ChevronRight, Dot } from "lucide-react";
import { useLang } from "../context/LangContext";
import { fetchBreakingArticles, type BackendArticle } from "../services/newsApi";

export default function NewsTicker() {
  const { lang, t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [breakingArticles, setBreakingArticles] = useState<BackendArticle[]>([]);

  useEffect(() => {
    fetchBreakingArticles(18, lang).then((articles) => {
      if (articles.length) setBreakingArticles(articles);
    });
  }, [lang]);

  const items = useMemo(() => {
    return breakingArticles
      .map((a) => {
        const primary = a.primaryLocale === "hi" ? "hi" : "en";
        return (primary === "hi" ? (a.titleHi || a.title) : (a.title || a.titleHi || "")).trim();
      })
      .filter(Boolean);
  }, [breakingArticles]);
  const doubled = [...items, ...items];

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
    if (!track) return;

    let pos = 0;
    const speed = 0.72;
    let raf: number;
    let totalW = 0;

    const timer = setTimeout(() => {
      totalW = track.scrollWidth / 2;
    }, 50);

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
  }, [reduceMotion, items.length]);

  if (items.length === 0) return null;

  if (reduceMotion) {
    return (
      <div className="ticker-wrap ticker-wrap-v2 ticker-wrap-static" role="region" aria-label={t("लाइव न्यूज़", "Live News")}>
        <div className="ticker-label-v2">
          <Activity className="ticker-live-icon" size={16} strokeWidth={2.25} aria-hidden />
          {t("लाइव न्यूज़", "Live News")}
        </div>
        <div className="ticker-static-inner">
          {items.map((item, idx) => (
            <span key={`${idx}-${item.slice(0, 24)}`} className="ticker-static-chip">
              <Dot className="ticker-chip-bullet" size={14} strokeWidth={3} aria-hidden />
              <span className="ticker-chip-text">{item}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ticker-wrap ticker-wrap-v2" role="region" aria-label={t("लाइव न्यूज़", "Live News")}>
      <div className="ticker-label-v2">
        <Activity className="ticker-live-icon" size={16} strokeWidth={2.25} aria-hidden />
        {t("लाइव न्यूज़", "Live News")}
      </div>
      <div className="ticker-viewport ticker-viewport-v2">
        <div className="ticker-track ticker-track-v2" ref={trackRef}>
          {doubled.map((item, i) => (
            <span key={i} className="ticker-item ticker-item-v2">
              <span className="ticker-item-text">{item}</span>
              <ChevronRight className="ticker-sep-icon" size={15} strokeWidth={2} aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
