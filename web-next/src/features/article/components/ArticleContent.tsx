"use client";

import DOMPurify from "isomorphic-dompurify";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bookmark, Share2, Link2, ThumbsUp, ChevronRight,
} from "lucide-react";
import { IconFacebook, IconWhatsApp, IconXLogo } from "../../../components/icons/ShareBrandIcons";
import { categories } from "../../../data/publicCategories";
import type { NewsItem } from "../types/article";
import ArticleAuthor from "./ArticleAuthor";
import CommentSection from "./CommentSection";
import { ArticleRecommendationStrip } from "./RelatedArticles";
import { isHtmlParagraph } from "../utils/formatArticle";
import { nativeShare, shareToFacebook, shareToTwitter, shareToWhatsApp } from "../utils/share";

function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li",
      "h2", "h3", "blockquote", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "rel", "target", "class"],
  });
}

type TFn = (hi: string, en: string) => string;

export default function ArticleContent({
  article,
  lang,
  t,
  color,
  title,
  summary,
  category,
  tags,
  paragraphs,
  stripItems,
  bookmarked,
  upvoted,
  upvoteCount,
  onBookmark,
  onUpvote,
  copied,
  onCopyLink,
  pageUrl,
}: {
  article: NewsItem;
  lang: "hi" | "en";
  t: TFn;
  color: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  paragraphs: string[];
  stripItems: NewsItem[];
  bookmarked: boolean;
  upvoted: boolean;
  upvoteCount: number;
  onBookmark: () => void;
  onUpvote: () => void;
  copied: boolean;
  onCopyLink: () => void;
  pageUrl: string;
}) {
  const navigate = useNavigate();
  const cat = categories.find((c) => c.slug === article.categorySlug);
  const time = lang === "hi" ? article.time : article.timeEn;
  const author = lang === "hi" ? article.author : article.authorEn;

  return (
    <main className="article-main-col">
      <div className="article-breadcrumb">
        <button type="button" className="article-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> {t("वापस", "Back")}
        </button>
        <ChevronRight size={13} style={{ opacity: 0.35 }} />
        {cat && (
          <Link to={`/category/${article.categorySlug}`} style={{ color, fontWeight: 600, fontSize: 13 }}>
            {lang === "hi" ? cat.name : cat.nameEn}
          </Link>
        )}
      </div>
      <div className="article-meta-top">
        {article.isBreaking && <span className="article-breaking-badge">⚡ {t("ब्रेकिंग", "Breaking")}</span>}
        <span className="article-cat-badge" style={{ color, borderColor: color + "40" }}>{category}</span>
      </div>
      <motion.h1 className="article-headline" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }}>
        {title}
      </motion.h1>
      <p className="article-deck">{summary}</p>
      <div className="article-byline">
        <ArticleAuthor
          authorInitial={author.charAt(0)}
          authorName={author}
          time={time}
          readTime={article.readTime}
          color={color}
          t={t}
        />
        <div className="article-share-row article-byline-share">
          <button
            type="button"
            className="article-bookmark-btn"
            style={bookmarked ? { borderColor: color, color, background: color + "12" } : {}}
            onClick={() => void onBookmark()}
            title={t("बुकमार्क", "Bookmark")}
          >
            <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className="article-bookmark-btn"
            style={upvoted ? { borderColor: color, color, background: color + "12" } : {}}
            onClick={() => void onUpvote()}
            title={t("अपवोट", "Upvote")}
          >
            <ThumbsUp size={15} fill={upvoted ? "currentColor" : "none"} />
          </button>
          <span className="article-upvote-count" title={t("कुल अपवोट", "Total upvotes")}>
            {upvoteCount} {t("अपवोट", "upvotes")}
          </span>
          <button type="button" className="article-share-btn art-share-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
            <IconWhatsApp size={14} aria-hidden className="article-share-brand-icon" /> WhatsApp
          </button>
          <button type="button" className="article-share-btn art-share-tw" onClick={() => shareToTwitter(title, pageUrl)} title="X / Twitter" aria-label="X / Twitter">
            <IconXLogo size={14} aria-hidden className="article-share-brand-icon" />
          </button>
          <button type="button" className="article-share-btn" onClick={onCopyLink}>
            <Link2 size={13} aria-hidden strokeWidth={2} />
            {copied ? t("कॉपी!", "Copied!") : t("लिंक", "Link")}
          </button>
        </div>
      </div>
      <motion.div className="article-body" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
        {paragraphs.length > 0 ? (
          <>
            {paragraphs.map((para, i) =>
              isHtmlParagraph(para) ? (
                <div key={i} dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(para) }} />
              ) : (
                <p key={i}>{para}</p>
              )
            )}
            <blockquote className="article-pull-quote" style={{ borderLeftColor: color }}>
              {`"${paragraphs[Math.min(1, paragraphs.length - 1)].replace(/<[^>]+>/g, "").slice(0, 140)}…"`}
            </blockquote>
          </>
        ) : (
          <p className="article-subtle">{t("विस्तृत सामग्री उपलब्ध नहीं है।", "Detailed content is unavailable.")}</p>
        )}
      </motion.div>
      {tags.length > 0 && (
        <div className="article-tags-section">
          <p className="article-tags-label">{t("टैग्स", "Tags")}</p>
          <div className="article-tags">{tags.map((tag) => <button key={tag} type="button" className="article-tag">#{tag}</button>)}</div>
        </div>
      )}
      <div className="article-share-section article-share-section--desktop-only">
        <p className="article-share-section-label">{t("इस खबर को शेयर करें", "Share this story")}</p>
        <div className="article-share-full-row">
          <button type="button" className="art-share-btn-full art-share-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
            <IconWhatsApp size={18} aria-hidden className="article-share-brand-icon" /> WhatsApp
          </button>
          <button type="button" className="art-share-btn-full art-share-tw" onClick={() => shareToTwitter(title, pageUrl)}>
            <IconXLogo size={18} aria-hidden className="article-share-brand-icon" /> X (Twitter)
          </button>
          <button type="button" className="art-share-btn-full art-share-fb" onClick={() => shareToFacebook(pageUrl)}>
            <IconFacebook size={18} aria-hidden className="article-share-brand-icon" /> Facebook
          </button>
          <button type="button" className="art-share-btn-full" onClick={onCopyLink}>
            <Link2 size={18} aria-hidden strokeWidth={2} />
            {copied ? t("कॉपी हो गया!", "Copied!") : t("लिंक कॉपी करें", "Copy Link")}
          </button>
          {"share" in navigator && (
            <button type="button" className="art-share-btn-full art-share-native" onClick={() => nativeShare(title, pageUrl)}>
              <Share2 size={18} aria-hidden strokeWidth={2} /> {t("अन्य", "More")}
            </button>
          )}
        </div>
      </div>
      <ArticleRecommendationStrip items={stripItems} lang={lang} t={t} />
      <CommentSection t={t} />
    </main>
  );
}
