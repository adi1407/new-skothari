import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { stateNews } from "../data/mockData";
import { useLang } from "../context/LangContext";

const STATES = [
  { key: "delhi",  labelHi: "दिल्ली",        labelEn: "Delhi",        color: "#1565C0" },
  { key: "up",     labelHi: "उत्तर प्रदेश",  labelEn: "U.P.",         color: "#2E7D32" },
  { key: "mh",     labelHi: "महाराष्ट्र",    labelEn: "Maha.",        color: "#FF7043" },
  { key: "rj",     labelHi: "राजस्थान",      labelEn: "Rajasthan",    color: "#C0392B" },
  { key: "mp",     labelHi: "म.प्र.",         labelEn: "M.P.",         color: "#7B1FA2" },
  { key: "bihar",  labelHi: "बिहार",          labelEn: "Bihar",        color: "#F57F17" },
];

export default function StateNewsSection() {
  const [activeState, setActiveState] = useState("delhi");
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const stateConfig = STATES.find((s) => s.key === activeState)!;
  const stories = stateNews[activeState] || [];
  const mainStory = stories[0];
  const sideStories = stories.slice(1, 4);

  return (
    <section className="section state-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <MapPin size={17} style={{ color: "var(--brand-red)" }} />
            <h2 className="section-title">{t("राज्य समाचार", "State News")}</h2>
          </div>
          <button className="section-more-btn">
            {t("सभी राज्य", "All States")} <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Tab strip */}
        <div className="state-tabs">
          {STATES.map((s) => (
            <button
              key={s.key}
              className={`state-tab${activeState === s.key ? " active" : ""}`}
              style={activeState === s.key ? { "--tab-color": s.color } as React.CSSProperties : undefined}
              onClick={() => setActiveState(s.key)}
            >
              {lang === "hi" ? s.labelHi : s.labelEn}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeState}
            className="state-layout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* Main story */}
            {mainStory && (
              <article
                className="state-main-card"
                onClick={() => navigate(`/article/${mainStory.id}`)}
              >
                <div className="state-main-img-wrap">
                  <img
                    src={mainStory.image}
                    alt={lang === "hi" ? mainStory.title : mainStory.titleEn}
                    className="state-main-img"
                    loading="lazy"
                  />
                  <span
                    className="state-badge"
                    style={{ background: stateConfig.color }}
                  >
                    {lang === "hi" ? stateConfig.labelHi : stateConfig.labelEn}
                  </span>
                </div>
                <div className="state-main-body">
                  <h3 className="state-main-title">
                    {lang === "hi" ? mainStory.title : mainStory.titleEn}
                  </h3>
                  <p className="state-main-summary">
                    {lang === "hi" ? mainStory.summary : mainStory.summaryEn}
                  </p>
                  <div className="state-main-meta">
                    <Clock size={12} />
                    <span>{lang === "hi" ? mainStory.time : mainStory.timeEn}</span>
                    <span className="card-meta-dot" />
                    <span>{lang === "hi" ? mainStory.author : mainStory.authorEn}</span>
                  </div>
                </div>
              </article>
            )}

            {/* Side stories */}
            <div className="state-side-list">
              {sideStories.map((story) => (
                <article
                  key={story.id}
                  className="state-side-item"
                  onClick={() => navigate(`/article/${story.id}`)}
                >
                  <div className="state-side-img-wrap">
                    <img
                      src={story.image}
                      alt={lang === "hi" ? story.title : story.titleEn}
                      className="state-side-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="state-side-body">
                    <h4 className="state-side-title">
                      {lang === "hi" ? story.title : story.titleEn}
                    </h4>
                    <div className="state-side-meta">
                      <Clock size={10} />
                      <span>{lang === "hi" ? story.time : story.timeEn}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
