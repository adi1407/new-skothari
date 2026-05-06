"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  Link2,
  Loader2,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconWhatsApp, IconXLogo } from "../../../components/icons/ShareBrandIcons";
import { useLang } from "../../../context/LangContext";
import { useReaderAuth } from "../../../context/ReaderAuthContext";
import ArticleContent from "../components/ArticleContent";
import ArticleHero from "../components/ArticleHero";
import ArticleSidebar from "../components/ArticleSidebar";
import { useArticle, useArticleClipboard } from "../hooks/useArticle";
import { useBookmarks } from "../hooks/useBookmarks";
import { categoryColors } from "../utils/formatArticle";
import { shareToTwitter, shareToWhatsApp } from "../utils/share";

export default function ArticlePageClient({ articleId }: { articleId: string }) {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { token } = useReaderAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const {
    article,
    loading,
    imgErr,
    setImgErr,
    recommendedArticles,
    mostReadSidebar,
    showBackTop,
  } = useArticle(articleId, lang);

  const { copied, handleCopyLink, handleUnifiedMobileShare } = useArticleClipboard();

  const {
    bookmarked,
    upvoted,
    upvoteCount,
    handleBookmarkToggle,
    handleUpvoteToggle,
  } = useBookmarks(articleId, token, article, navigate);

  if (loading) {
    return (
      <div
        className="article-page"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 200 }}
      >
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", color: "var(--brand-red)" }}
        />
      </div>
    );
  }

  if (!article) {
    return (
      <div
        className="article-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          paddingTop: 160,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-900)" }}>
          {t("खबर नहीं मिली", "Article not found")}
        </h2>
        <button type="button" className="article-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> {t("होम पर जाएं", "Go to Home")}
        </button>
      </div>
    );
  }

  const title = lang === "hi" ? article.title : article.titleEn;
  const summary = lang === "hi" ? article.summary : article.summaryEn;
  const category = lang === "hi" ? article.category : article.categoryEn;
  const tags = lang === "hi" ? (article.tags ?? []) : (article.tagsEn ?? []);
  const rawContent = lang === "hi" ? article.content : article.contentEn;
  const paragraphs =
    rawContent && rawContent.length > 0
      ? rawContent
      : lang === "hi"
        ? [
            article.summary,
            "इस विषय पर अधिक जानकारी जल्द उपलब्ध होगी। हमारे संवाददाता इस खबर पर नजर रखे हुए हैं।",
            "नवीनतम अपडेट के लिए खबर कोठरी के साथ बने रहें।",
          ]
        : [
            article.summaryEn,
            "More details on this story are being gathered by our correspondents. Stay tuned for live updates.",
            "Follow Khabar Kothri for the latest breaking news and comprehensive coverage.",
          ];

  const color = categoryColors[article.categorySlug] || "#BB1919";
  const sideRelated = recommendedArticles.slice(0, 4);
  const stripItems = recommendedArticles.slice(0, 8);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <motion.div
      className="article-page"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ArticleHero
        scaleX={scaleX}
        imageSrc={article.image}
        imageAlt={title}
        imgErr={imgErr}
        onImgError={() => setImgErr(true)}
      />
      <div className="article-page-layout">
        <ArticleContent
          article={article}
          lang={lang}
          t={t}
          color={color}
          title={title}
          summary={summary}
          category={category}
          tags={tags}
          paragraphs={paragraphs}
          stripItems={stripItems}
          bookmarked={bookmarked}
          upvoted={upvoted}
          upvoteCount={upvoteCount}
          onBookmark={handleBookmarkToggle}
          onUpvote={handleUpvoteToggle}
          copied={copied}
          onCopyLink={handleCopyLink}
          pageUrl={pageUrl}
        />
        <ArticleSidebar
          sideRelated={sideRelated}
          mostReadSidebar={mostReadSidebar}
          color={color}
          lang={lang}
          t={t}
          title={title}
          pageUrl={pageUrl}
          copied={copied}
          onCopyLink={handleCopyLink}
        />
      </div>
      {showBackTop && (
        <motion.button
          type="button"
          className="article-back-top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
      <div className="article-mobile-share-strip" role="toolbar" aria-label={t("शेयर", "Share")}>
        <button
          type="button"
          className="mobile-strip-btn mobile-strip-wa"
          onClick={() => shareToWhatsApp(title, pageUrl)}
          aria-label="WhatsApp"
        >
          <IconWhatsApp size={22} aria-hidden className="article-share-brand-icon" />
        </button>
        <button
          type="button"
          className="mobile-strip-btn mobile-strip-tw"
          onClick={() => shareToTwitter(title, pageUrl)}
          aria-label="X / Twitter"
        >
          <IconXLogo size={20} aria-hidden className="article-share-brand-icon" />
        </button>
        <button
          type="button"
          className="mobile-strip-share-unified"
          onClick={() => void handleUnifiedMobileShare(title, summary)}
          aria-label={t("शेयर करें", "Share")}
        >
          <Share2 size={18} strokeWidth={2} aria-hidden />
          <span className="mobile-strip-share-unified-text">{t("शेयर", "Share")}</span>
        </button>
        <button
          type="button"
          className="mobile-strip-btn"
          onClick={handleCopyLink}
          aria-label={copied ? t("लिंक कॉपी हो गया", "Link copied") : t("लिंक कॉपी करें", "Copy link")}
        >
          <Link2 size={18} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="mobile-strip-bookmark"
          onClick={() => void handleBookmarkToggle()}
          aria-label={t("बुकमार्क", "Bookmark")}
          style={bookmarked ? { color: "#BB1919" } : {}}
        >
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="mobile-strip-bookmark"
          onClick={() => void handleUpvoteToggle()}
          aria-label={t("अपवोट", "Upvote")}
          style={upvoted ? { color: "#BB1919" } : {}}
        >
          <ThumbsUp size={18} fill={upvoted ? "currentColor" : "none"} />
        </button>
      </div>
    </motion.div>
  );
}
