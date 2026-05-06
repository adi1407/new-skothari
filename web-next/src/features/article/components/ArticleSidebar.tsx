"use client";

import { useNavigate } from "react-router-dom";
import { Clock, Link2 } from "lucide-react";
import { IconFacebook, IconWhatsApp, IconXLogo } from "../../../components/icons/ShareBrandIcons";
import type { NewsItem } from "../../../data/mockData";
import RelatedCard from "./RelatedCard";
import { categoryColors } from "../utils/formatArticle";
import { shareToFacebook, shareToTwitter, shareToWhatsApp } from "../utils/share";

type TFn = (hi: string, en: string) => string;

export default function ArticleSidebar({
  sideRelated,
  mostReadSidebar,
  color,
  lang,
  t,
  title,
  pageUrl,
  copied,
  onCopyLink,
}: {
  sideRelated: NewsItem[];
  mostReadSidebar: NewsItem[];
  color: string;
  lang: "hi" | "en";
  t: TFn;
  title: string;
  pageUrl: string;
  copied: boolean;
  onCopyLink: () => void;
}) {
  const navigate = useNavigate();

  return (
    <aside className="article-sidebar">
      {sideRelated.length > 0 && (
        <div className="aside-block">
          <div className="aside-block-header" style={{ borderLeftColor: color }}>
            <span>{t("संबंधित खबरें", "Related picks")}</span>
          </div>
          <div className="aside-related-list">
            {sideRelated.map((item) => (
              <RelatedCard key={String(item.id)} item={item} lang={lang} />
            ))}
          </div>
        </div>
      )}
      <div className="aside-block aside-share-widget">
        <div className="aside-block-header" style={{ borderLeftColor: color }}>
          <span>{t("शेयर करें", "Share Story")}</span>
        </div>
        <div className="aside-share-grid">
          <button
            type="button"
            className="aside-share-btn aside-wa"
            onClick={() => shareToWhatsApp(title, pageUrl)}
          >
            <IconWhatsApp size={18} aria-hidden className="article-share-brand-icon" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            className="aside-share-btn aside-tw"
            onClick={() => shareToTwitter(title, pageUrl)}
          >
            <IconXLogo size={18} aria-hidden className="article-share-brand-icon" />
            <span>X / Twitter</span>
          </button>
          <button
            type="button"
            className="aside-share-btn aside-fb"
            onClick={() => shareToFacebook(pageUrl)}
          >
            <IconFacebook size={18} aria-hidden className="article-share-brand-icon" />
            <span>Facebook</span>
          </button>
          <button type="button" className="aside-share-btn" onClick={onCopyLink}>
            <Link2 size={18} aria-hidden strokeWidth={2} />
            <span>{copied ? t("कॉपी!", "Copied!") : t("लिंक", "Copy Link")}</span>
          </button>
        </div>
      </div>
      {mostReadSidebar.length > 0 && (
        <div className="aside-block">
          <div className="aside-block-header" style={{ borderLeftColor: "#BB1919" }}>
            <span>{t("सबसे ज़्यादा पढ़ी गई", "Most Read")}</span>
          </div>
          <ol className="aside-mostread-list">
            {mostReadSidebar.map((item, i) => {
              const mTitle = lang === "hi" ? item.title : item.titleEn;
              const mTime = lang === "hi" ? item.time : item.timeEn;
              const mCat = lang === "hi" ? item.category : item.categoryEn;
              const mColor = categoryColors[item.categorySlug] || "#BB1919";
              return (
                <li
                  key={String(item.id)}
                  className="aside-mostread-item"
                  onClick={() => navigate(`/article/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="aside-mostread-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="aside-mostread-body">
                    <span className="aside-mostread-cat" style={{ color: mColor }}>{mCat}</span>
                    <h4 className="aside-mostread-title">{mTitle}</h4>
                    <div className="aside-mostread-meta">
                      <Clock size={10} />
                      <span>{mTime}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
      <div className="aside-block aside-newsletter">
        <p className="aside-newsletter-headline">{t("खबर कोठरी न्यूज़लेटर", "Khabar Kothri Newsletter")}</p>
        <p className="aside-newsletter-sub">
          {t("हर सुबह ताज़ी खबरें — सीधे आपके inbox में", "Top stories every morning, straight to your inbox")}
        </p>
        <input className="aside-newsletter-input" type="email" placeholder={t("आपका email", "your@email.com")} />
        <button type="button" className="aside-newsletter-btn">{t("सब्सक्राइब", "Subscribe Free")}</button>
      </div>
    </aside>
  );
}
