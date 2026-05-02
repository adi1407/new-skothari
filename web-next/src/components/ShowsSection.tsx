import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, ArrowRight, ExternalLink } from "lucide-react";

const YtIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>;
import type { VideoItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import { useNavigate } from "react-router-dom";
import YoutubeThumbImg from "./YoutubeThumbImg";
import { fetchPublishedVideos } from "../services/newsApi";
import { adaptVideos } from "../services/videoAdapter";

export default function ShowsSection() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetchPublishedVideos({ limit: 12, locale: lang }).then((raw) => setVideos(adaptVideos(raw)));
  }, [lang]);

  if (videos.length === 0) return null;

  const featured = videos[0];
  const rest = videos.slice(1, 5);

  return (
    <section className="section shows-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-title-wrap">
            <YtIcon />
            <h2 className="section-title">{t("हमारे शोज़", "Our Shows")}</h2>
            <span className="shows-yt-badge">YouTube</span>
          </div>
          <button className="section-more-btn" onClick={() => navigate("/shows")}>
            {t("सभी शोज़", "All Shows")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="shows-layout">
          {/* Featured */}
          <motion.a
            href={featured.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shows-featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="shows-featured-thumb">
              <YoutubeThumbImg
                youtubeUrl={featured.youtubeUrl}
                alt={lang === "hi" ? featured.title : featured.titleEn}
                className="shows-thumb-img"
                fallbackSrc={featured.thumbnail}
              />
              <div className="shows-thumb-overlay" />
              <motion.div className="shows-play-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Play size={26} fill="white" color="white" />
              </motion.div>
              <span className="shows-duration"><Clock size={11} /> {featured.duration}</span>
              <span className="shows-yt-tag"><YtIcon /> YouTube</span>
            </div>
            <div className="shows-featured-body">
              <span className="shows-cat-label">{lang === "hi" ? featured.category : featured.categoryEn}</span>
              <h3 className="shows-featured-title">{lang === "hi" ? featured.title : featured.titleEn}</h3>
              {(lang === "hi" ? featured.summary : featured.summaryEn ?? featured.summary) ? (
                <p className="shows-card-summary">
                  {lang === "hi" ? featured.summary : featured.summaryEn ?? featured.summary}
                </p>
              ) : null}
              <div className="shows-meta">
                <Eye size={13} /><span>{featured.views} {t("व्यूज़", "views")}</span>
                <span className="shows-meta-dot" />
                <Clock size={13} /><span>{featured.duration}</span>
              </div>
              <div className="shows-watch-btn">
                <ExternalLink size={13} />
                {t("YouTube पर देखें", "Watch on YouTube")}
              </div>
            </div>
          </motion.a>

          {/* Grid */}
          <div className="shows-grid">
            {rest.map((v, i) => (
              <motion.a
                key={v.id}
                href={v.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shows-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div className="shows-card-thumb">
                  <YoutubeThumbImg
                    youtubeUrl={v.youtubeUrl}
                    alt={lang === "hi" ? v.title : v.titleEn}
                    className="shows-thumb-img"
                    fallbackSrc={v.thumbnail}
                  />
                  <div className="shows-thumb-overlay" />
                  <div className="shows-card-play">
                    <Play size={16} fill="white" color="white" />
                  </div>
                  <span className="shows-duration"><Clock size={10} /> {v.duration}</span>
                </div>
                <div className="shows-card-body">
                  <span className="shows-cat-label">{lang === "hi" ? v.category : v.categoryEn}</span>
                  <h4 className="shows-card-title">{lang === "hi" ? v.title : v.titleEn}</h4>
                  <div className="shows-meta" style={{ fontSize: 11, marginTop: 4 }}>
                    <Eye size={11} /><span>{v.views}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
