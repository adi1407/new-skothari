import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, ArrowRight, Clock, BookOpen } from "lucide-react";
import type { NewsItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import { fetchPublishedArticles } from "../services/newsApi";
import { adaptArticles } from "../services/articleAdapter";

const CAT_COLORS: Record<string, string> = {
  desh: "#BB1919", देश: "#BB1919",
  videsh: "#1A3A6B", विदेश: "#1A3A6B",
  rajneeti: "#810102", राजनीति: "#810102",
  khel: "#00695C", खेल: "#00695C",
  health: "#1B6B3A", स्वास्थ्य: "#1B6B3A",
  krishi: "#2E7D32", कृषि: "#2E7D32",
  business: "#7C4A00", व्यापार: "#7C4A00",
  manoranjan: "#6B1FA5", मनोरंजन: "#6B1FA5",
};
function catColor(slug: string) {
  return CAT_COLORS[slug] || "#BB1919";
}

export default function LatestNews() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [mostRead, setMostRead] = useState<NewsItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchPublishedArticles({ limit: 10, locale: lang, latestDays: 3 }),
      fetchPublishedArticles({ limit: 10, page: 2, locale: lang, latestDays: 3 }),
    ]).then(([p1, p2]) => {
      setNews(adaptArticles(p1));
      setMostRead(adaptArticles(p2).slice(0, 5));
      setReady(true);
    });
  }, [lang]);

  const lead = news[0];
  const grid = news.slice(1, 5);
  const viewAll = t("सभी देखें", "View All");

  if (!ready) {
    return (
      <section className="section latest-section" aria-busy="true">
        <div className="section-inner" style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-400)" }}>…</div>
      </section>
    );
  }

  if (!lead) return null;

  return (
    <section className="section latest-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
        >
          <div className="section-title-wrap">
            <TrendingUp size={17} style={{ color: "var(--brand-red)" }} aria-hidden />
            <h2 className="section-title">{t("ताज़ा खबरें", "Latest News")}</h2>
          </div>
          <button
            type="button"
            className="section-more-btn"
            aria-label={`${viewAll} — ${t("ताज़ा", "Latest")}`}
            onClick={() => navigate("/category/latest")}
          >
            {viewAll} <ArrowRight size={14} aria-hidden />
          </button>
        </motion.div>

        <div className="latest-v2-layout">
          <div className="latest-v2-left">
            <motion.article
              className="latest-lead-card"
              style={{ "--cat-color": catColor(lead.categorySlug) } as React.CSSProperties}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
              onClick={() => navigate(`/article/${lead.id}`)}
            >
              <div className="latest-lead-img-wrap">
                <img
                  src={lead.image}
                  alt={lang === "hi" ? lead.title : lead.titleEn}
                  className="latest-lead-img"
                  loading="lazy"
                />
                {lead.isBreaking && (
                  <span className="latest-lead-breaking">{t("ब्रेकिंग", "Breaking")}</span>
                )}
              </div>
              <div className="latest-lead-body">
                <span className="latest-lead-cat" style={{ color: catColor(lead.categorySlug) }}>
                  {lang === "hi" ? lead.category : lead.categoryEn}
                </span>
                <h3 className="latest-lead-title">
                  {lang === "hi" ? lead.title : lead.titleEn}
                </h3>
                <p className="latest-lead-summary">
                  {lang === "hi" ? lead.summary : lead.summaryEn}
                </p>
                <div className="latest-lead-footer">
                  <div className="latest-lead-meta">
                    <span className="latest-lead-author-chip">
                      <span className="latest-lead-avatar">
                        {(lang === "hi" ? lead.author : lead.authorEn).charAt(0)}
                      </span>
                      {lang === "hi" ? lead.author : lead.authorEn}
                    </span>
                    <Clock size={12} aria-hidden />
                    <span>{lang === "hi" ? lead.time : lead.timeEn}</span>
                    {lead.readTime && (
                      <>
                        <span className="latest-lead-dot" />
                        <BookOpen size={12} aria-hidden />
                        <span>{lead.readTime} {t("मिनट", "min")}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="latest-lead-read-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/article/${lead.id}`); }}
                  >
                    {t("पढ़ें", "Read")} <ArrowRight size={13} aria-hidden />
                  </button>
                </div>
              </div>
            </motion.article>

            <div className="latest-v2-grid">
              {grid.map((item, i) => (
                <motion.article
                  key={String(item.id)}
                  className="latest-grid-card"
                  style={{ "--cat-color": catColor(item.categorySlug) } as React.CSSProperties}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? { duration: 0 } : { delay: i * 0.07, duration: 0.4 }}
                  onClick={() => navigate(`/article/${item.id}`)}
                >
                  <div className="latest-grid-img-wrap">
                    <img
                      src={item.image}
                      alt={lang === "hi" ? item.title : item.titleEn}
                      className="latest-grid-img"
                      loading="lazy"
                    />
                    {item.isBreaking && <span className="card-breaking-tag">{t("ब्रेकिंग", "Breaking")}</span>}
                  </div>
                  <div className="latest-grid-body">
                    <span className="latest-grid-cat" style={{ color: catColor(item.categorySlug) }}>
                      {lang === "hi" ? item.category : item.categoryEn}
                    </span>
                    <h3 className="latest-grid-title">
                      {lang === "hi" ? item.title : item.titleEn}
                    </h3>
                    <div className="latest-grid-meta">
                      <Clock size={10} aria-hidden />
                      <span>{lang === "hi" ? item.time : item.timeEn}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <aside className="latest-v2-mostread" aria-label={t("सबसे ज़्यादा पढ़ी गई", "Most Read")}>
            <div className="mostread-header">
              <TrendingUp size={14} style={{ color: "var(--brand-red)" }} aria-hidden />
              <span>{t("सबसे ज़्यादा पढ़ी गई", "Most Read")}</span>
            </div>
            <ol className="mostread-list">
              {mostRead.map((item, i) => (
                <motion.li
                  key={String(item.id)}
                  className="mostread-item"
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? { duration: 0 } : { delay: i * 0.07, duration: 0.4 }}
                  onClick={() => navigate(`/article/${item.id}`)}
                >
                  <span className="mostread-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="mostread-body">
                    <span className="mostread-cat" style={{ color: catColor(item.categorySlug) }}>
                      {lang === "hi" ? item.category : item.categoryEn}
                    </span>
                    <h4 className="mostread-title">
                      {lang === "hi" ? item.title : item.titleEn}
                    </h4>
                    <div className="mostread-meta">
                      <Clock size={10} aria-hidden />
                      <span>{lang === "hi" ? item.time : item.timeEn}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </aside>
        </div>

        <nav className="latest-mostread-mobile" aria-label={t("सबसे ज़्यादा पढ़ी गई", "Most Read")}>
          <div className="latest-mostread-mobile-head">
            <TrendingUp size={14} style={{ color: "var(--brand-red)" }} aria-hidden />
            <span>{t("सबसे ज़्यादा पढ़ी गई", "Most Read")}</span>
          </div>
          <div className="latest-mostread-mobile-scroll">
            {mostRead.map((item, i) => (
              <button
                key={String(item.id)}
                type="button"
                className="latest-mostread-pill"
                onClick={() => navigate(`/article/${item.id}`)}
              >
                <span className="latest-mostread-pill-num" style={{ color: catColor(item.categorySlug) }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="latest-mostread-pill-title">
                  {lang === "hi" ? item.title : item.titleEn}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
