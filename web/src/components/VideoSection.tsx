import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Tv2, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { VideoItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import BrandLogo from "./BrandLogo";
import YoutubeThumbImg from "./YoutubeThumbImg";
import { fetchPublishedVideos } from "../services/newsApi";
import { adaptVideos } from "../services/videoAdapter";

export default function VideoSection() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetchPublishedVideos({ limit: 12 }).then((raw) => setVideos(adaptVideos(raw)));
  }, []);

  if (videos.length === 0) return null;

  const featured = videos[0];
  const stack = videos.slice(1, 5);

  const featuredTitle = lang === "hi" ? featured.title : featured.titleEn;
  const featuredCategory = lang === "hi" ? featured.category : featured.categoryEn;
  const featuredSummary =
    lang === "hi" ? featured.summary ?? "" : featured.summaryEn ?? featured.summary ?? "";
  const featuredPublished =
    lang === "hi" ? featured.publishedHi : featured.publishedEn;

  return (
    <section className="section video-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-title-wrap" style={{ alignItems: "center", gap: 10 }}>
            <Tv2 size={17} style={{ color: "var(--brand-red)" }} aria-hidden />
            <h2 className="section-title">{t("वीडियो", "Videos")}</h2>
            <span className="video-live-badge">
              <span className="video-live-dot" />
              {t("YouTube", "YouTube")}
            </span>
          </div>
          <button type="button" className="section-more-btn" onClick={() => navigate("/shows")}>
            {t("सभी वीडियो", "All Videos")} <ArrowRight size={14} aria-hidden />
          </button>
        </motion.div>

        <div className="video-layout">
          {/* Featured — opens on YouTube in new tab */}
          <motion.article
            className="video-featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a
              href={featured.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="video-featured-link"
              aria-label={`${featuredTitle} — ${t("YouTube पर देखें", "Watch on YouTube")}`}
            >
              <div className="video-thumb-wrap">
                <YoutubeThumbImg
                  youtubeUrl={featured.youtubeUrl}
                  alt={featuredTitle}
                  className="video-thumb"
                  fallbackSrc={featured.thumbnail}
                />
                <div className="video-thumb-overlay" />
                <motion.div className="video-play-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-hidden>
                  <Play size={22} fill="white" color="white" />
                </motion.div>
                <div className="video-duration">
                  <Clock size={11} aria-hidden />
                  {featured.duration}
                </div>
              </div>
            </a>
            <div className="video-body">
              <div className="video-channel-row">
                <BrandLogo className="video-channel-logo" height={36} decorative />
                <div>
                  <div className="video-channel-name">{t("टीवी", "TV")}</div>
                  <div className="video-channel-sub">{t("2.4M सब्सक्राइबर्स", "2.4M subscribers")}</div>
                </div>
              </div>
              <span className="card-cat-label" style={{ color: "var(--brand-red)" }}>
                {featuredCategory}
              </span>
              <h3 className="video-featured-title">{featuredTitle}</h3>
              {featuredSummary ? <p className="video-summary">{featuredSummary}</p> : null}
              <div className="card-meta" style={{ marginTop: 8 }}>
                <Eye size={12} aria-hidden />
                <span>{featured.views}</span>
                <span className="card-meta-dot" />
                <Clock size={12} aria-hidden />
                <span>{featured.duration}</span>
                {featuredPublished ? (
                  <>
                    <span className="card-meta-dot" />
                    <span>{featuredPublished}</span>
                  </>
                ) : null}
              </div>
              <a
                href={featured.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-yt-cta"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} aria-hidden />
                {t("YouTube पर देखें", "Watch on YouTube")}
              </a>
            </div>
          </motion.article>

          {/* Stack */}
          <div className="video-stack">
            {stack.map((video, i) => {
              const title = lang === "hi" ? video.title : video.titleEn;
              const category = lang === "hi" ? video.category : video.categoryEn;
              const summary =
                lang === "hi" ? video.summary ?? "" : video.summaryEn ?? video.summary ?? "";
              const published = lang === "hi" ? video.publishedHi : video.publishedEn;
              return (
                <motion.a
                  key={video.id}
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-stack-item"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  aria-label={`${title} — ${t("YouTube पर देखें", "Watch on YouTube")}`}
                >
                  <div className="video-stack-thumb-wrap" style={{ position: "relative" }}>
                    <YoutubeThumbImg
                      youtubeUrl={video.youtubeUrl}
                      alt={title}
                      className="video-stack-thumb"
                      fallbackSrc={video.thumbnail}
                    />
                    <div className="video-thumb-overlay" />
                    <div className="video-stack-play" aria-hidden>
                      <Play size={14} fill="white" color="white" />
                    </div>
                    <div className="video-duration video-stack-duration">{video.duration}</div>
                  </div>
                  <div className="video-stack-body">
                    <span className="card-cat-label" style={{ color: "var(--brand-red)", fontSize: 10 }}>
                      {category}
                    </span>
                    <h4 className="video-stack-title">{title}</h4>
                    {summary ? <p className="video-stack-summary">{summary}</p> : null}
                    <div className="card-meta" style={{ marginTop: 4 }}>
                      <Eye size={11} aria-hidden />
                      <span>{video.views}</span>
                      {published ? (
                        <>
                          <span className="card-meta-dot" />
                          <span>{published}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
