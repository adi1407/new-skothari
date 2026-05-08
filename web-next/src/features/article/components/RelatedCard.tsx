"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import type { NewsItem } from "../types/article";
import { categoryColors } from "../utils/formatArticle";

export default function RelatedCard({ item, lang }: { item: NewsItem; lang: string }) {
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const title = lang === "hi" ? item.title : item.titleEn;
  const time = lang === "hi" ? item.time : item.timeEn;
  const cat = lang === "hi" ? item.category : item.categoryEn;
  const color = categoryColors[item.categorySlug] || "#BB1919";
  return (
    <article
      className="aside-related-card aside-related-card--premium"
      onClick={() => navigate(`/article/${item.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="aside-related-img">
        {!err ? (
          <img src={item.image} alt="" onError={() => setErr(true)} loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: color + "22" }} />
        )}
      </div>
      <div className="aside-related-body">
        <span className="aside-related-cat" style={{ color }}>{cat}</span>
        <h4 className="aside-related-title">{title}</h4>
        <div className="aside-related-meta">
          <Clock size={10} />
          <span>{time}</span>
        </div>
      </div>
    </article>
  );
}
