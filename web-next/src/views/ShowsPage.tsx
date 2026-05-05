"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, ExternalLink, Tv2 } from "lucide-react";
import type { VideoItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import YoutubeThumbImg from "../components/YoutubeThumbImg";
import { fetchPublishedVideos } from "../services/newsApi";
import { adaptVideos } from "../services/videoAdapter";
import BrandLogo from "../components/BrandLogo";

const YtIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
  </svg>
);

const CAT_COLORS: Record<string, string> = {
  राजनीति: "#BB1919", Politics: "#BB1919",
  खेल: "#00695C",     Sports: "#00695C",
  तकनीक: "#1A56A7",   Tech: "#1A56A7",
  व्यापार: "#7C4A00", Business: "#7C4A00",
  मनोरंजन: "#6B1FA5", Entertainment: "#6B1FA5",
  स्वास्थ्य: "#1B6B3A", Health: "#1B6B3A",
  राज्य: "#5d4037",   State: "#5d4037",
};

export default function ShowsPage() {
  const { lang, t } = useLang();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetchPublishedVideos({ limit: 60, locale: lang }).then((raw) => setVideos(adaptVideos(raw)));
  }, [lang]);

  const cats = [...new Set(videos.map((v) => (lang === "hi" ? v.category : v.categoryEn)))];

  return (
    <motion.div
      className="shows-page"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="shows-page-header">
        <div className="shows-page-header-inner">
          <div className="shows-page-title-row">
            <BrandLogo className="shows-page-brand-logo" height={48} decorative />
            <div>
              <h1 className="shows-page-title">{t("शोज़", "Shows")}</h1>
              <p className="shows-page-sub">{t("हमारे YouTube चैनल पर देखें", "Watch on our YouTube channel")}</p>
            </div>
          </div>
          <a
            href="https://youtube.com/@kotharinews"
            target="_blank"
            rel="noopener noreferrer"
            className="shows-subscribe-btn"
          >
            <YtIcon size={16} />
            {t("सब्सक्राइब करें", "Subscribe")}
          </a>
        </div>
      </div>

      <div className="shows-page-body">
        {/* Channel stats */}
        <div className="shows-stats-row">
          {[
            { label: t("सब्सक्राइबर्स", "Subscribers"), value: "2.4M" },
            { label: t("वीडियो", "Videos"),              value: "1,200+" },
            { label: t("व्यूज़", "Total Views"),          value: "180M+" },
          ].map((s) => (
            <div key={s.label} className="shows-stat-card">
              <p className="shows-stat-value">{s.value}</p>
              <p className="shows-stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Videos grouped by category */}
        {cats.filter(Boolean).map((cat) => {
          const catVideos = videos.filter((v) => (lang === "hi" ? v.category : v.categoryEn) === cat);
          const color = CAT_COLORS[cat] || "#BB1919";
          return (
            <div key={cat} className="shows-cat-group">
              <div className="shows-cat-header" style={{ borderLeftColor: color }}>
                <Tv2 size={16} style={{ color }} />
                <h2 className="shows-cat-title" style={{ color }}>{cat}</h2>
              </div>
              <div className="shows-page-grid">
                {catVideos.map((v, i) => (
                  <motion.a
                    key={v.id}
                    href={v.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shows-page-card"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <div className="shows-page-thumb">
                      <YoutubeThumbImg
                        youtubeUrl={v.youtubeUrl}
                        alt={lang === "hi" ? v.title : v.titleEn}
                        className="shows-thumb-img"
                        fallbackSrc={v.thumbnail}
                      />
                      <div className="shows-thumb-overlay" />
                      <motion.div
                        className="shows-page-play"
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        <Play size={20} fill="white" color="white" />
                      </motion.div>
                      <span className="shows-duration"><Clock size={10} /> {v.duration}</span>
                    </div>
                    <div className="shows-page-card-body">
                      <h3 className="shows-page-card-title">
                        {lang === "hi" ? v.title : v.titleEn}
                      </h3>
                      {(lang === "hi" ? v.summary : v.summaryEn ?? v.summary) ? (
                        <p className="shows-page-card-summary">
                          {lang === "hi" ? v.summary : v.summaryEn ?? v.summary}
                        </p>
                      ) : null}
                      <div className="shows-meta">
                        <Eye size={12} /><span>{v.views} {t("व्यूज़", "views")}</span>
                        <span className="shows-meta-dot" />
                        <Clock size={12} /><span>{v.duration}</span>
                      </div>
                      <div className="shows-page-watch">
                        <ExternalLink size={12} />
                        {t("YouTube पर देखें", "Watch on YouTube")}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
