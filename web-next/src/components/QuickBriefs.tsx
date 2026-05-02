import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, ArrowRight, Clock } from "lucide-react";
import { latestNews } from "../data/mockData";
import { useLang } from "../context/LangContext";

const CAT_COLORS: Record<string, string> = {
  desh: "#BB1919",
  देश: "#BB1919",
  videsh: "#1A3A6B",
  विदेश: "#1A3A6B",
  rajneeti: "#810102",
  राजनीति: "#810102",
  khel: "#00695C",
  खेल: "#00695C",
  health: "#1B6B3A",
  स्वास्थ्य: "#1B6B3A",
  krishi: "#2E7D32",
  कृषि: "#2E7D32",
  business: "#7C4A00",
  व्यापार: "#7C4A00",
  manoranjan: "#6B1FA5",
  मनोरंजन: "#6B1FA5",
};

function getColor(cat: string): string {
  return CAT_COLORS[cat] || CAT_COLORS[cat.toLowerCase()] || "#BB1919";
}

export default function QuickBriefs() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const items = latestNews.slice(0, 6);
  const seeAllLabel = t("सभी देखें", "See All");

  return (
    <section className="section briefs-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <Zap size={17} fill="var(--brand-red)" style={{ color: "var(--brand-red)" }} />
            <h2 className="section-title">{t("त्वरित खबरें", "Quick Briefs")}</h2>
          </div>
          <button
            type="button"
            className="section-more-btn"
            aria-label={`${seeAllLabel} — ${t("देश", "Desh")}`}
            onClick={() => navigate("/category/desh")}
          >
            {seeAllLabel} <ArrowRight size={14} aria-hidden />
          </button>
        </motion.div>

        <div className="briefs-grid">
          {items.map((item, i) => {
            const title = lang === "hi" ? item.title : item.titleEn;
            const cat = lang === "hi" ? item.category : item.categoryEn;
            const time = lang === "hi" ? item.time : item.timeEn;
            const author = lang === "hi" ? item.author : item.authorEn;
            const color = getColor(item.categorySlug);

            return (
              <motion.article
                key={item.id}
                className="brief-card"
                style={{ "--brief-color": color } as React.CSSProperties}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? { duration: 0 } : { delay: i * 0.06, duration: 0.4 }}
                onClick={() => navigate(`/article/${item.id}`)}
              >
                {item.isBreaking && (
                  <span className="brief-breaking-dot" />
                )}
                <span className="brief-cat">{cat}</span>
                <h3 className="brief-title">{title}</h3>
                <div className="brief-meta">
                  <Clock size={10} />
                  <span>{time}</span>
                  <span className="brief-meta-sep">·</span>
                  <span>{author}</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
