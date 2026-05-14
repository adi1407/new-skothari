"use client";

import { motion } from "framer-motion";
import { Play, Clock, ExternalLink } from "lucide-react";
import YoutubeThumbImg from "../../../components/YoutubeThumbImg";
import type { VideoItem } from "../types/shows";

type TFn = (hi: string, en: string) => string;

export default function ShowsVideoCard({
  v,
  lang,
  t,
  index,
}: {
  v: VideoItem;
  lang: "hi" | "en";
  t: TFn;
  index: number;
}) {
  return (
    <motion.a
      href={v.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="shows-page-card"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <div className="shows-page-thumb">
        <YoutubeThumbImg
          youtubeUrl={v.youtubeUrl}
          alt={lang === "hi" ? v.title : v.titleEn}
          className="shows-thumb-img"
          fallbackSrc={v.thumbnail}
        />
        <div className="shows-thumb-overlay" />
        <motion.div className="shows-page-play" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}>
          <Play size={20} fill="white" color="white" />
        </motion.div>
        <span className="shows-duration">
          <Clock size={10} /> {v.duration}
        </span>
      </div>
      <div className="shows-page-card-body">
        <h3 className="shows-page-card-title">{lang === "hi" ? v.title : v.titleEn}</h3>
        {(lang === "hi" ? v.summary : v.summaryEn ?? v.summary) ? (
          <p className="shows-page-card-summary">{lang === "hi" ? v.summary : v.summaryEn ?? v.summary}</p>
        ) : null}
        <div className="shows-meta">
          <Clock size={12} />
          <span>{v.duration}</span>
        </div>
        <div className="shows-page-watch">
          <ExternalLink size={12} />
          {t("YouTube पर देखें", "Watch on YouTube")}
        </div>
      </div>
    </motion.a>
  );
}
