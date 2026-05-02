import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PenLine, ArrowRight, BookOpen } from "lucide-react";
import { opinionPieces } from "../data/mockData";
import { useLang } from "../context/LangContext";

const OPINION_BADGE: Record<string, { label: string; labelEn: string; color: string }> = {
  analysis: { label: "विश्लेषण", labelEn: "ANALYSIS", color: "#1A3A6B" },
  opinion: { label: "विचार", labelEn: "OPINION", color: "#C97B22" },
  column: { label: "स्तंभ", labelEn: "COLUMN", color: "#6B1FA5" },
  "ground-report": { label: "ग्राउंड रिपोर्ट", labelEn: "GROUND REPORT", color: "#00695C" },
};

export default function OpinionSection() {
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const featured = opinionPieces[0];
  const rest = opinionPieces.slice(1);

  return (
    <section className="section opinion-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <PenLine size={17} style={{ color: "var(--ink-700)" }} />
            <div>
              <h2 className="section-title" style={{ borderLeftColor: "#37474F" }}>
                {t("विचार / विश्लेषण", "Opinion & Analysis")}
              </h2>
              <p className="section-subtitle" style={{ fontSize: 12, marginTop: 2 }}>
                {t("हमारे लेखक। उनका नज़रिया।", "Our writers. Their perspective.")}
              </p>
            </div>
          </div>
          <button className="section-more-btn" style={{ color: "#37474F", borderColor: "#37474F" }}>
            {t("सभी कॉलम", "All Columns")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="opinion-grid">
          {/* Featured — 2× wide */}
          <motion.article
            className="opinion-card opinion-featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(`/article/${featured.id}`)}
          >
            <div className="opinion-author-row">
              <div
                className="opinion-avatar opinion-avatar-lg"
                style={{ "--ring-color": OPINION_BADGE[featured.opinionType]?.color } as React.CSSProperties}
              >
                {featured.authorInitials}
              </div>
              <div>
                <div className="opinion-author-name">{lang === "hi" ? featured.author : featured.authorEn}</div>
                <div className="opinion-author-desig">
                  {lang === "hi" ? featured.authorDesignation : featured.authorDesignationEn}
                </div>
              </div>
            </div>
            <hr className="opinion-divider" />
            <span
              className="opinion-type-badge"
              style={{ background: OPINION_BADGE[featured.opinionType]?.color }}
            >
              {lang === "hi"
                ? OPINION_BADGE[featured.opinionType]?.label
                : OPINION_BADGE[featured.opinionType]?.labelEn}
            </span>
            <h3 className="opinion-title opinion-title-featured">
              {lang === "hi" ? featured.title : featured.titleEn}
            </h3>
            <p className="opinion-summary">
              {lang === "hi" ? featured.summary : featured.summaryEn}
            </p>
            <div className="opinion-footer">
              <div className="opinion-meta">
                {featured.readTime && (
                  <>
                    <BookOpen size={12} />
                    <span>{featured.readTime} {t("मिनट", "min")}</span>
                  </>
                )}
              </div>
              <button className="opinion-read-btn">
                {t("पढ़ें", "Read")} <ArrowRight size={13} />
              </button>
            </div>
          </motion.article>

          {/* Rest */}
          {rest.map((item, i) => {
            const badge = OPINION_BADGE[item.opinionType];
            return (
              <motion.article
                key={item.id}
                className="opinion-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.4 }}
                onClick={() => navigate(`/article/${item.id}`)}
              >
                <div className="opinion-author-row">
                  <div
                    className="opinion-avatar opinion-avatar-sm"
                    style={{ "--ring-color": badge?.color } as React.CSSProperties}
                  >
                    {item.authorInitials}
                  </div>
                  <div>
                    <div className="opinion-author-name opinion-author-name-sm">
                      {lang === "hi" ? item.author : item.authorEn}
                    </div>
                    <div className="opinion-author-desig">
                      {lang === "hi" ? item.authorDesignation : item.authorDesignationEn}
                    </div>
                  </div>
                </div>
                <hr className="opinion-divider" />
                <span className="opinion-type-badge" style={{ background: badge?.color }}>
                  {lang === "hi" ? badge?.label : badge?.labelEn}
                </span>
                <h3 className="opinion-title">
                  {lang === "hi" ? item.title : item.titleEn}
                </h3>
                <div className="opinion-footer">
                  <div className="opinion-meta">
                    {item.readTime && (
                      <>
                        <BookOpen size={11} />
                        <span>{item.readTime} {t("मिनट", "min")}</span>
                      </>
                    )}
                  </div>
                  <button className="opinion-read-btn">
                    {t("पढ़ें", "Read")} <ArrowRight size={13} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
