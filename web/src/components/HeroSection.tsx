import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Clock, ArrowUpRight, Zap, Bookmark, Share2, Eye } from "lucide-react";
import type { NewsItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import { fetchPublishedArticles } from "../services/newsApi";
import { adaptArticles } from "../services/articleAdapter";

const ROTATION_INTERVAL = 8000;

export default function HeroSection() {
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imgErr, setImgErr] = useState<Record<string | number, boolean>>({});
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [narrowHero, setNarrowHero] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setNarrowHero(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setHeroLoading(true);
    fetchPublishedArticles({ limit: 4 }).then((articles) => {
      setStories(adaptArticles(articles).slice(0, 4));
      setHeroLoading(false);
    });
  }, []);

  useEffect(() => {
    if (stories.length === 0) return;
    if (reduceMotion) {
      setProgress(0);
      return;
    }
    /* Auto-rotate distracts on small screens; user picks from the list */
    if (narrowHero) {
      setProgress(0);
      return;
    }
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / ROTATION_INTERVAL) * 100, 100);
      setProgress(p);
      if (p < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % stories.length);
      setProgress(0);
      startTimeRef.current = Date.now();
    }, ROTATION_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIdx, stories.length, reduceMotion, narrowHero]);

  useEffect(() => {
    if (activeIdx >= stories.length) setActiveIdx(0);
  }, [stories.length, activeIdx]);

  const goTo = (idx: number) => {
    setActiveIdx(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  if (!heroLoading && stories.length === 0) {
    return (
      <section className="hero-section hero-cinematic-wrap" aria-live="polite">
        <div className="hero-cinematic-inner" style={{ padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "var(--ink-600)", maxWidth: 480, margin: "0 auto" }}>
            {t("अभी कोई प्रकाशित खबर नहीं है। CMS से लेख प्रकाशित करने के बाद वे यहाँ दिखेंगी।", "No published stories yet. Publish articles from the CMS to see them here.")}
          </p>
        </div>
      </section>
    );
  }

  const story = stories[activeIdx] ?? stories[0];
  if (!story) {
    return (
      <section className="hero-section hero-cinematic-wrap">
        <div className="hero-cinematic-inner" style={{ padding: 80, display: "flex", justifyContent: "center" }}>
          <span style={{ color: "var(--ink-400)" }}>…</span>
        </div>
      </section>
    );
  }

  const title    = lang === "hi" ? story.title    : story.titleEn;
  const summary  = lang === "hi" ? story.summary  : story.summaryEn;
  const category = lang === "hi" ? story.category : story.categoryEn;
  const time     = lang === "hi" ? story.time     : story.timeEn;
  const author   = lang === "hi" ? story.author   : story.authorEn;
  const rawTags = (lang === "hi" ? story.tags : story.tagsEn) ?? [];
  const tags = rawTags.slice(0, 8).map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

  return (
    <section className="hero-section hero-cinematic-wrap">
      <div className="hero-cinematic-inner">

        {/* ── Main Cinematic Feature ── */}
        <div className="hero-cinematic-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(story.id)}
              className="hero-cin-img-frame"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {!imgErr[story.id] ? (
                <img
                  src={story.image}
                  alt={title}
                  className="hero-cin-img"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => setImgErr((e) => ({ ...e, [story.id]: true }))}
                />
              ) : (
                <div className="hero-cin-fallback" />
              )}
              <div className="hero-cin-gradient" />
            </motion.div>
          </AnimatePresence>

          {/* Overlay text on image */}
          <div className="hero-cin-overlay">
            <div className="hero-cin-badges">
              {story.isBreaking && (
                <span className="hero-cin-breaking">
                  <span className="hero-cin-dot" />
                  {t("ब्रेकिंग", "Breaking")}
                </span>
              )}
              <span className="hero-cin-cat">{category}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={String(story.id) + lang}
                className="hero-cin-text"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className="hero-cin-headline"
                  onClick={() => navigate(`/article/${story.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {title}
                </h1>
                <p className="hero-cin-summary">{summary}</p>
              </motion.div>
            </AnimatePresence>

            <div className="hero-cin-byline">
              <div className="hero-cin-author">
                <span className="hero-cin-avatar">{author.charAt(0)}</span>
                <span className="hero-cin-author-name">{author}</span>
                <span className="hero-cin-sep">·</span>
                <Clock size={12} style={{ opacity: 0.7 }} />
                <span className="hero-cin-time">{time}</span>
                {story.readTime && (
                  <>
                    <span className="hero-cin-sep">·</span>
                    <span className="hero-cin-readtime">{story.readTime} {t("मिनट", "min")}</span>
                  </>
                )}
              </div>
              <div className="hero-cin-actions">
                <button className="hero-cin-action-btn" title={t("बुकमार्क", "Bookmark")}>
                  <Bookmark size={15} />
                </button>
                <button className="hero-cin-action-btn" title={t("शेयर", "Share")}>
                  <Share2 size={15} />
                </button>
                <button
                  className="hero-cin-read-btn"
                  onClick={() => navigate(`/article/${story.id}`)}
                >
                  {t("पूरी खबर", "Read Story")}
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            <div className="hero-cin-progress-row">
              {stories.map((s, i) => (
                <button
                  key={String(s.id)}
                  className="hero-cin-progress-bar"
                  onClick={() => goTo(i)}
                  aria-label={`Story ${i + 1}`}
                >
                  <span
                    className="hero-cin-progress-fill"
                    style={{
                      width: narrowHero
                        ? i === activeIdx
                          ? "100%"
                          : "0%"
                        : i < activeIdx
                          ? "100%"
                          : i === activeIdx
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <aside className="hero-cin-side">
          <div className="hero-cin-side-header">
            <Zap size={13} fill="currentColor" style={{ color: "var(--brand-red)" }} />
            <span>{t("टॉप स्टोरीज़", "Top Stories")}</span>
          </div>
          {narrowHero && (
            <p className="hero-cin-side-hint">
              {t(
                "नीचे किसी खबर पर टैप करें — ऊपर मुख्य शीर्षक बदल जाएगा। पढ़ने के लिए \"पूरी खबर\" दबाएँ।",
                "Tap a story below to change the headline. Use “Read Story” to open the article."
              )}
            </p>
          )}

          <div className="hero-cin-side-list">
            {stories.map((s, i) => {
              const sTitle = lang === "hi" ? s.title : s.titleEn;
              const sCat   = lang === "hi" ? s.category : s.categoryEn;
              const sTime  = lang === "hi" ? s.time : s.timeEn;
              return (
                <motion.article
                  key={String(s.id)}
                  className={`hero-cin-side-item${activeIdx === i ? " active" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: 0.1 + i * 0.08, duration: 0.4 }}
                  onClick={() => {
                    goTo(i);
                    if (!narrowHero) navigate(`/article/${s.id}`);
                  }}
                >
                  <span className="hero-cin-side-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="hero-cin-side-thumb-wrap">
                    {!imgErr[s.id] ? (
                      <img
                        src={s.image}
                        alt={sTitle}
                        className="hero-cin-side-thumb"
                        loading="lazy"
                        onError={() => setImgErr((e) => ({ ...e, [s.id]: true }))}
                      />
                    ) : (
                      <div className="hero-cin-side-thumb-fallback" />
                    )}
                  </div>
                  <div className="hero-cin-side-body">
                    <span className="hero-cin-side-cat">{sCat}</span>
                    <h3 className="hero-cin-side-title">{sTitle}</h3>
                    <div className="hero-cin-side-meta">
                      <Clock size={10} />
                      <span>{sTime}</span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {tags.length > 0 && (
          <div className="hero-cin-tags-section">
            <p className="hero-cin-tags-label">
              <Eye size={11} />
              {t("ट्रेंडिंग", "Trending")}
            </p>
            <div className="hero-cin-tags-row">
              {tags.map((tag) => (
                <button key={tag} type="button" className="hero-cin-tag">{tag}</button>
              ))}
            </div>
          </div>
          )}
        </aside>

      </div>
    </section>
  );
}
