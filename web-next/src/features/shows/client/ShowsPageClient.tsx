"use client";

import { motion } from "framer-motion";
import { useLang } from "../../../context/LangContext";
import ShowsCategoryGroup from "../components/ShowsCategoryGroup";
import ShowsPageHeader from "../components/ShowsPageHeader";
import ShowsStatsRow from "../components/ShowsStatsRow";
import { useShowsVideos } from "../hooks/useShowsVideos";

export default function ShowsPageClient() {
  const { lang, t } = useLang();
  const videos = useShowsVideos(lang);

  const cats = [...new Set(videos.map((v) => (lang === "hi" ? v.category : v.categoryEn)))];

  return (
    <motion.div className="shows-page" initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ShowsPageHeader t={t} />
      <div className="shows-page-body">
        <ShowsStatsRow t={t} />
        {videos.length === 0 ? (
          <p className="shows-page-sub">
            {t("वीडियो फ़ीड उपलब्ध नहीं है।", "Video feed is currently unavailable.")}
          </p>
        ) : null}
        {cats.filter(Boolean).map((cat) => (
          <ShowsCategoryGroup
            key={cat}
            cat={cat}
            catVideos={videos.filter((v) => (lang === "hi" ? v.category : v.categoryEn) === cat)}
            lang={lang}
            t={t}
          />
        ))}
      </div>
    </motion.div>
  );
}
