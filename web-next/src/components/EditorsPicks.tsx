import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, Clock } from "lucide-react";
import { editorsPicks } from "../data/mockData";
import { useLang } from "../context/LangContext";

const CAT_COLORS: Record<string, string> = {
  analysis: "#1A3A6B", विश्लेषण: "#1A3A6B",
  opinion: "#C97B22", विचार: "#C97B22",
  environment: "#2E7D32", पर्यावरण: "#2E7D32",
  society: "#6B1FA5", समाज: "#6B1FA5",
  "long-read": "#37474F", "long read": "#37474F",
};
const TYPE_BADGES: Record<string, { hi: string; en: string }> = {
  analysis: { hi: "विश्लेषण", en: "ANALYSIS" },
  opinion: { hi: "विचार", en: "OPINION" },
  environment: { hi: "पर्यावरण", en: "ENVIRONMENT" },
  society: { hi: "समाज", en: "SOCIETY" },
};

function getColor(slug: string, cat: string) {
  return CAT_COLORS[slug] || CAT_COLORS[cat] || "#BB1919";
}

export default function EditorsPicks() {
  const { lang, t } = useLang();
  const navigate = useNavigate();

  return (
    <section className="editors-section">
      <div className="editors-bg">
        <div className="section-inner">
          <motion.div
            className="editors-header"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="editors-title-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={18} style={{ color: "var(--brand-red)" }} />
                <div>
                  <h2 className="section-title editors-title-text">
                    {t("संपादक की पसंद", "Editor's Picks")}
                  </h2>
                  <p className="editors-subtitle">
                    {t("गहराई से समझिए — चुनिंदा नज़रिया", "Curated by our editors")}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              className="editors-all-btn"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("सभी देखें", "View All")}
              <ArrowRight size={15} />
            </motion.button>
          </motion.div>

          <div className="editors-grid">
            {editorsPicks.map((item, i) => {
              const color = getColor(item.categorySlug, lang === "hi" ? item.category : item.categoryEn);
              const catKey = item.categorySlug;
              const badge = TYPE_BADGES[catKey];
              return (
                <motion.article
                  key={item.id}
                  className="card-editor"
                  style={{ "--cat-color": color } as React.CSSProperties}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  onClick={() => navigate(`/article/${item.id}`)}
                >
                  <div className="card-editor-img-wrap">
                    <img src={item.image} alt={lang === "hi" ? item.title : item.titleEn} className="card-editor-img" loading="lazy" />
                    <div className="card-editor-overlay" />
                    {badge && (
                      <span className="card-editor-type-pill" style={{ background: color }}>
                        {lang === "hi" ? badge.hi : badge.en}
                      </span>
                    )}
                  </div>
                  <div className="card-editor-body">
                    <h3 className="card-editor-title">
                      {lang === "hi" ? item.title : item.titleEn}
                    </h3>
                    <p className="card-editor-summary">
                      {lang === "hi" ? item.summary : item.summaryEn}
                    </p>
                    <div className="card-editor-footer">
                      <div className="card-author-row">
                        <div
                          className="card-author-avatar"
                          style={{ background: color + "22", color }}
                        >
                          {(lang === "hi" ? item.author : item.authorEn).charAt(0)}
                        </div>
                        <div>
                          <div className="card-author-name">
                            {lang === "hi" ? item.author : item.authorEn}
                          </div>
                          <div className="card-editor-readtime">
                            <Clock size={10} />
                            {lang === "hi" ? item.time : item.timeEn}
                            {item.readTime && (
                              <>
                                <span className="card-meta-dot" />
                                <BookOpen size={10} />
                                {item.readTime} {t("मिनट", "min")}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="card-read-arrow" style={{ background: color }}>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
