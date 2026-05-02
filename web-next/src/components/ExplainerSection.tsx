import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import { explainerNews } from "../data/mockData";
import { useLang } from "../context/LangContext";

const EXPLAIN_COLOR = "#1A3A6B";

export default function ExplainerSection() {
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const featured = explainerNews[0];
  const rest = explainerNews.slice(1);

  return (
    <section className="section explainer-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <Lightbulb size={17} style={{ color: EXPLAIN_COLOR }} />
            <div>
              <h2 className="section-title" style={{ borderLeftColor: EXPLAIN_COLOR }}>
                {t("समझिए इन खबरों को", "Explained")}
              </h2>
              <p className="section-subtitle" style={{ color: EXPLAIN_COLOR, opacity: 0.7, fontSize: 12, marginTop: 2 }}>
                {t("जटिल खबरें, सरल भाषा में", "Complex stories, made simple")}
              </p>
            </div>
          </div>
          <button className="section-more-btn" style={{ color: EXPLAIN_COLOR, borderColor: EXPLAIN_COLOR }}>
            {t("सभी देखें", "See All")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="explainer-grid">
          {/* Featured — spans 2 cols */}
          <motion.article
            className="explainer-card explainer-featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(`/article/${featured.id}`)}
          >
            <div className="explainer-img-wrap">
              <img
                src={featured.image}
                alt={lang === "hi" ? featured.title : featured.titleEn}
                className="explainer-img"
                loading="lazy"
              />
              <span className="explainer-points-badge">
                {featured.pointsCount} {t("मुद्दे", "POINTS")}
              </span>
            </div>
            <div className="explainer-body">
              <span className="explainer-cat-label">
                {lang === "hi" ? featured.category : featured.categoryEn}
              </span>
              <h3 className="explainer-title">
                {lang === "hi" ? featured.title : featured.titleEn}
              </h3>
              <p className="explainer-summary">
                {lang === "hi" ? featured.summary : featured.summaryEn}
              </p>
              <div className="explainer-footer">
                <div className="explainer-meta">
                  <BookOpen size={12} />
                  <span>{featured.readTime} {t("मिनट पढ़ें", "min read")}</span>
                </div>
                <button className="explainer-read-btn">
                  {t("पढ़ें", "Read")} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.article>

          {/* Rest */}
          {rest.map((item, i) => (
            <motion.article
              key={item.id}
              className="explainer-card"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              onClick={() => navigate(`/article/${item.id}`)}
            >
              <div className="explainer-img-wrap">
                <img
                  src={item.image}
                  alt={lang === "hi" ? item.title : item.titleEn}
                  className="explainer-img"
                  loading="lazy"
                />
                <span className="explainer-points-badge">
                  {item.pointsCount} {t("मुद्दे", "POINTS")}
                </span>
              </div>
              <div className="explainer-body">
                <span className="explainer-cat-label">
                  {lang === "hi" ? item.category : item.categoryEn}
                </span>
                <h3 className="explainer-title">
                  {lang === "hi" ? item.title : item.titleEn}
                </h3>
                <p className="explainer-summary">
                  {lang === "hi" ? item.summary : item.summaryEn}
                </p>
                <div className="explainer-footer">
                  <div className="explainer-meta">
                    <BookOpen size={12} />
                    <span>{item.readTime} {t("मिनट", "min")}</span>
                  </div>
                  <button className="explainer-read-btn">
                    {t("पढ़ें", "Read")} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
