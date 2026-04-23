import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import type { NewsItem } from "../data/mockData";
import { useLang } from "../context/LangContext";

export type CategorySectionVariant = "rail" | "compact" | "listFirst";

interface CategorySectionProps {
  titleHi: string;
  titleEn: string;
  icon: ReactNode;
  color: string;
  mainStory: NewsItem;
  gridStories: NewsItem[];
  bgAlt?: boolean;
  /** Route slug for /category/:slug — must match `categories` in mockData */
  slug: string;
  variant?: CategorySectionVariant;
}

export default function CategorySection({
  titleHi,
  titleEn,
  icon,
  color,
  mainStory,
  gridStories,
  bgAlt,
  slug,
  variant = "rail",
}: CategorySectionProps) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [imgErr, setImgErr] = useState<Record<string | number, boolean>>({});

  const sectionTitle = lang === "hi" ? titleHi : titleEn;
  const moreLabel = t("और खबरें", "More");
  const moreAria = `${moreLabel} — ${sectionTitle}`;

  const mainTitle = lang === "hi" ? mainStory.title : mainStory.titleEn;
  const mainSummary = lang === "hi" ? mainStory.summary : mainStory.summaryEn;
  const mainCat = lang === "hi" ? mainStory.category : mainStory.categoryEn;
  const mainTime = lang === "hi" ? mainStory.time : mainStory.timeEn;
  const mainAuthor = lang === "hi" ? mainStory.author : mainStory.authorEn;

  const compactStories = useMemo(
    () => [mainStory, ...gridStories].slice(0, 4),
    [mainStory, gridStories],
  );

  const imgOk = (id: string | number) => !imgErr[id];

  const renderSideList = (classExtra = "") => (
    <div className={`cat-side-list cat-side-numbered${classExtra}`}>
      {gridStories.map((story, i) => {
        const sTitle = lang === "hi" ? story.title : story.titleEn;
        const sTime = lang === "hi" ? story.time : story.timeEn;
        return (
          <motion.article
            key={story.id}
            className="cat-side-item"
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={reduceMotion ? { duration: 0 } : { delay: i * 0.08, duration: 0.4 }}
            onClick={() => navigate(`/article/${story.id}`)}
          >
            <span className="cat-side-num" style={{ color }}>{String(i + 1).padStart(2, "0")}</span>
            <div className="cat-side-body">
              <h4 className="cat-side-title">{sTitle}</h4>
              <div className="cat-side-meta">
                <Clock size={10} />
                <span>{sTime}</span>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );

  return (
    <section className={`section cat-section${bgAlt ? " cat-section-alt" : ""}`}>
      <div className="section-inner">
        <motion.div
          className="cat-section-header"
          style={{ "--cat-color": color } as React.CSSProperties}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
        >
          <div className="cat-section-title-side">
            <span className="cat-section-icon" aria-hidden>{icon}</span>
            <h2 className="cat-section-title">{sectionTitle}</h2>
          </div>
          <button
            type="button"
            className="cat-section-more-btn"
            style={{ color }}
            aria-label={moreAria}
            onClick={() => navigate(`/category/${slug}`)}
          >
            {moreLabel} <ArrowRight size={13} aria-hidden />
          </button>
        </motion.div>

        {variant === "compact" && (
          <div className="cat-layout cat-variant--compact" style={{ "--cat-color": color } as React.CSSProperties}>
            {compactStories.map((story, i) => {
              const title = lang === "hi" ? story.title : story.titleEn;
              const cat = lang === "hi" ? story.category : story.categoryEn;
              const time = lang === "hi" ? story.time : story.timeEn;
              return (
                <motion.article
                  key={String(story.id)}
                  className="cat-compact-card"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? { duration: 0 } : { delay: i * 0.06, duration: 0.4 }}
                  onClick={() => navigate(`/article/${story.id}`)}
                >
                  <div className="cat-compact-img-wrap">
                    {imgOk(story.id) ? (
                      <img
                        src={story.image}
                        alt={title}
                        className="cat-compact-img"
                        loading="lazy"
                        onError={() => setImgErr((e) => ({ ...e, [story.id]: true }))}
                      />
                    ) : (
                      <div className="cat-compact-img-fallback" style={{ background: color + "22" }} />
                    )}
                  </div>
                  <div className="cat-compact-body">
                    <span className="cat-compact-cat" style={{ color }}>{cat}</span>
                    <h3 className="cat-compact-title">{title}</h3>
                    <div className="cat-compact-meta">
                      <Clock size={10} aria-hidden />
                      <span>{time}</span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {variant === "listFirst" && (
          <div className="cat-layout cat-variant--listFirst">
            <motion.article
              className="cat-listfirst-stack"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.45 }}
              onClick={() => navigate(`/article/${mainStory.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="cat-listfirst-lead">
                <span className="card-cat-label" style={{ color }}>{mainCat}</span>
                <h3 className="cat-main-title">{mainTitle}</h3>
                <p className="cat-main-summary">{mainSummary}</p>
                <div className="card-meta" style={{ marginTop: 10 }}>
                  <Clock size={12} aria-hidden />
                  <span>{mainTime}</span>
                  <span className="card-meta-dot" />
                  <span>{mainAuthor}</span>
                </div>
              </div>
              <div className="cat-listfirst-img-wrap" aria-hidden>
                {imgOk(mainStory.id) ? (
                  <img
                    src={mainStory.image}
                    alt=""
                    className="cat-listfirst-img"
                    loading="lazy"
                    onError={() => setImgErr((e) => ({ ...e, [mainStory.id]: true }))}
                  />
                ) : (
                  <div className="cat-listfirst-img-fallback" style={{ background: color + "22" }} />
                )}
              </div>
            </motion.article>
            {renderSideList(" cat-side-listFirst")}
          </div>
        )}

        {variant === "rail" && (
          <div className="cat-layout cat-variant--rail">
            <motion.article
              className="cat-main-card"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
              onClick={() => navigate(`/article/${mainStory.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="cat-main-img-wrap">
                {imgOk(mainStory.id) ? (
                  <img
                    src={mainStory.image}
                    alt={mainTitle}
                    className="cat-main-img"
                    loading="lazy"
                    onError={() => setImgErr((e) => ({ ...e, [mainStory.id]: true }))}
                  />
                ) : (
                  <div style={{ background: color + "22", height: "100%" }} />
                )}
              </div>
              <div className="cat-main-text">
                <span className="card-cat-label" style={{ color }}>{mainCat}</span>
                <h3 className="cat-main-title">{mainTitle}</h3>
                <p className="cat-main-summary">{mainSummary}</p>
                <div className="card-meta" style={{ marginTop: 10 }}>
                  <Clock size={12} aria-hidden />
                  <span>{mainTime}</span>
                  <span className="card-meta-dot" />
                  <span>{mainAuthor}</span>
                </div>
              </div>
            </motion.article>
            {renderSideList()}
          </div>
        )}
      </div>
    </section>
  );
}
