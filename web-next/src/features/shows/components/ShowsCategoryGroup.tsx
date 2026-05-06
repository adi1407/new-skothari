"use client";

import { Tv2 } from "lucide-react";
import type { VideoItem } from "../../../data/mockData";
import { SHOWS_CATEGORY_COLORS } from "../utils/categoryColors";
import ShowsVideoCard from "./ShowsVideoCard";

type TFn = (hi: string, en: string) => string;

export default function ShowsCategoryGroup({
  cat,
  catVideos,
  lang,
  t,
}: {
  cat: string;
  catVideos: VideoItem[];
  lang: "hi" | "en";
  t: TFn;
}) {
  const color = SHOWS_CATEGORY_COLORS[cat] || "#BB1919";
  return (
    <div className="shows-cat-group">
      <div className="shows-cat-header" style={{ borderLeftColor: color }}>
        <Tv2 size={16} style={{ color }} />
        <h2 className="shows-cat-title" style={{ color }}>
          {cat}
        </h2>
      </div>
      <div className="shows-page-grid">
        {catVideos.map((v, i) => (
          <ShowsVideoCard key={v.id} v={v} lang={lang} t={t} index={i} />
        ))}
      </div>
    </div>
  );
}
