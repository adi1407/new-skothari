import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Play, Pause, SkipForward, Clock } from "lucide-react";
import { podcasts } from "../data/mockData";
import { useLang } from "../context/LangContext";

const SPEEDS = ["1x", "1.5x", "2x"];

const WAVEFORM_HEIGHTS = [4, 8, 14, 10, 18, 12, 20, 15, 10, 18, 22, 14, 8, 16, 20, 12, 6, 14, 18, 10];

export default function PodcastSection() {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [activeEp, setActiveEp] = useState(0);
  const { lang, t } = useLang();

  const featured = podcasts[activeEp];
  const list = podcasts.filter((_, i) => i !== activeEp);

  return (
    <section className="section podcast-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <Mic size={17} style={{ color: "var(--brand-red)" }} />
            <div>
              <h2 className="section-title">{t("पॉडकास्ट", "Podcast")}</h2>
              <p className="section-subtitle" style={{ fontSize: 12, marginTop: 2 }}>
                {t("सुनिए खबरें — चलते-चलते", "Listen while you move")}
              </p>
            </div>
          </div>
          <button className="section-more-btn">
            {t("सभी एपिसोड", "All Episodes")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="podcast-layout">
          {/* Featured player */}
          <motion.div
            className="podcast-featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="podcast-artwork-wrap">
              <img
                src={featured.artwork}
                alt={lang === "hi" ? featured.title : featured.titleEn}
                className="podcast-artwork"
                loading="lazy"
              />
              {/* Waveform */}
              <div className={`podcast-waveform${playing ? " playing" : ""}`}>
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <span
                    key={i}
                    className="podcast-wave-bar"
                    style={{ height: h, animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Episode info */}
            <div className="podcast-info">
              <span className="podcast-series">
                {lang === "hi" ? featured.series : featured.seriesEn} · Ep. {featured.episodeNumber}
              </span>
              <h3 className="podcast-title">
                {lang === "hi" ? featured.title : featured.titleEn}
              </h3>
              <div className="podcast-meta">
                <span>{t("अतिथि:", "Guest:")} {lang === "hi" ? featured.guest : featured.guestEn}</span>
                <span className="card-meta-dot" />
                <Clock size={12} />
                <span>{featured.duration}</span>
                <span className="card-meta-dot" />
                <span>{lang === "hi" ? featured.publishedHi : featured.publishedEn}</span>
              </div>
            </div>

            {/* Progress bar (decorative) */}
            <div className="podcast-progress-wrap">
              <div className="podcast-progress-track">
                <div className="podcast-progress-fill" style={{ width: playing ? "38%" : "0%" }} />
              </div>
              <div className="podcast-progress-times">
                <span>{playing ? "16:14" : "00:00"}</span>
                <span>{featured.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="podcast-controls">
              <button
                className="podcast-speed-btn"
                onClick={() => setSpeedIdx((s) => (s + 1) % SPEEDS.length)}
              >
                {SPEEDS[speedIdx]}
              </button>
              <button
                className="podcast-play-btn"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
              </button>
              <button className="podcast-skip-btn">
                <SkipForward size={18} />
                <span>30s</span>
              </button>
            </div>

            {/* Subscribe row */}
            <div className="podcast-subscribe-row">
              {["Spotify", "Apple", "JioSaavn"].map((p) => (
                <button key={p} className="podcast-subscribe-pill">{p}</button>
              ))}
            </div>
          </motion.div>

          {/* Episode list */}
          <div className="podcast-list">
            {list.map((ep, i) => (
              <motion.div
                key={ep.id}
                className="podcast-list-item"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => setActiveEp(podcasts.indexOf(ep))}
              >
                <img src={ep.artwork} alt="" className="podcast-list-art" loading="lazy" />
                <div className="podcast-list-body">
                  <span className="podcast-list-series">
                    {lang === "hi" ? ep.series : ep.seriesEn} · Ep. {ep.episodeNumber}
                  </span>
                  <h4 className="podcast-list-title">
                    {lang === "hi" ? ep.title : ep.titleEn}
                  </h4>
                  <div className="podcast-list-meta">
                    <Clock size={10} />
                    <span>{ep.duration}</span>
                    <span className="card-meta-dot" />
                    <span>{lang === "hi" ? ep.publishedHi : ep.publishedEn}</span>
                  </div>
                </div>
                <button className="podcast-list-play">
                  <Play size={14} fill="currentColor" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
