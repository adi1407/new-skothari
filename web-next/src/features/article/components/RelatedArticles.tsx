"use client";

import { Sparkles } from "lucide-react";
import type { NewsItem } from "../types/article";
import PremiumRecCard from "./PremiumRecCard";

type TFn = (hi: string, en: string) => string;

/** Horizontal “recommended for you” strip */
export function ArticleRecommendationStrip({
  items,
  lang,
  t,
}: {
  items: NewsItem[];
  lang: string;
  t: TFn;
}) {
  if (items.length === 0) return null;
  return (
    <section className="article-rec-strip" aria-labelledby="article-rec-heading">
      <div className="article-rec-strip-head">
        <div className="article-rec-strip-icon-wrap" aria-hidden>
          <Sparkles size={20} strokeWidth={2} />
        </div>
        <div className="article-rec-strip-head-text">
          <h2 id="article-rec-heading" className="article-rec-strip-title">
            {t("आपके लिए सिफारिश", "Recommended for you")}
          </h2>
          <p className="article-rec-strip-sub">
            {t(
              "इसी श्रेणी, टैग और पाठकों में लोकप्रिय खबरों से चुना गया।",
              "Picked from this category, shared topics, and what readers are opening next."
            )}
          </p>
        </div>
      </div>
      <div className="article-rec-strip-scroll">
        {items.map((item) => (
          <PremiumRecCard key={String(item.id)} item={item} lang={lang} />
        ))}
      </div>
    </section>
  );
}
