import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft, Clock, Eye, Bookmark, Share2, Link2,
  ChevronRight, Loader2, ArrowUp, MessageCircle,
} from "lucide-react";
import { categories } from "../data/publicCategories";
import type { NewsItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import { fetchArticleById, fetchPublishedArticles } from "../services/newsApi";
import { adaptArticle, adaptArticles } from "../services/articleAdapter";
import { useReaderAuth } from "../context/ReaderAuthContext";
import { addBookmark, recordHistory, removeBookmark, sendSignal } from "../services/readerApi";

const categoryColors: Record<string, string> = {
  politics: "#BB1919", sports: "#00695c", tech: "#1565c0",
  business: "#e65100", entertainment: "#4a148c", health: "#1b5e20",
  world: "#1a237e", social: "#4e342e", environment: "#1b5e20",
  analysis: "#37474f", home: "#BB1919", state: "#5d4037",
};

function isMongoId(id: string) { return /^[a-f0-9]{24}$/.test(id); }

function formatViewCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : Number(v.toFixed(1))}M`.replace(".0M", "M");
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : Number(v.toFixed(1))}K`.replace(".0K", "K");
  }
  return String(n);
}

/* ─── Share helpers ─────────────────────────────────────── */
function shareToTwitter(title: string, url: string) {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    "_blank", "width=600,height=400"
  );
}
function shareToFacebook(url: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank", "width=600,height=400"
  );
}
function shareToWhatsApp(title: string, url: string) {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(title + "\n" + url)}`,
    "_blank"
  );
}
async function nativeShare(title: string, url: string) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); } catch (_) { /* cancelled */ }
  }
}

/* ─── Sidebar: Related card ─────────────────────────────── */
function RelatedCard({ item, lang }: { item: NewsItem; lang: string }) {
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const title = lang === "hi" ? item.title : item.titleEn;
  const time  = lang === "hi" ? item.time  : item.timeEn;
  const cat   = lang === "hi" ? item.category : item.categoryEn;
  const color = categoryColors[item.categorySlug] || "#BB1919";
  return (
    <article
      className="aside-related-card"
      onClick={() => navigate(`/article/${item.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="aside-related-img">
        {!err
          ? <img src={item.image} alt={title} onError={() => setErr(true)} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", background: color + "22" }} />}
      </div>
      <div className="aside-related-body">
        <span className="aside-related-cat" style={{ color }}>{cat}</span>
        <h4 className="aside-related-title">{title}</h4>
        <div className="aside-related-meta"><Clock size={10} /><span>{time}</span></div>
      </div>
    </article>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { token } = useReaderAuth();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const [article, setArticle]     = useState<NewsItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [imgErr, setImgErr]       = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [relatedStories, setRelatedStories] = useState<NewsItem[]>([]);
  const [mostReadSidebar, setMostReadSidebar] = useState<NewsItem[]>([]);

  useEffect(() => {
    setLoading(true); setImgErr(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!id) { setLoading(false); return; }
    if (!isMongoId(id)) {
      setArticle(null);
      setLoading(false);
      return;
    }
    fetchArticleById(id).then((a) => {
      setArticle(a ? adaptArticle(a) : null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !article || String(article.id) !== id || !article.categorySlug) {
      setRelatedStories([]);
      setMostReadSidebar([]);
      return;
    }
    const aid = id;
    let cancelled = false;
    Promise.all([
      fetchPublishedArticles({ category: article.categorySlug, limit: 14, locale: lang }),
      fetchPublishedArticles({ limit: 12, page: 2, locale: lang }),
    ]).then(([relRaw, moreRaw]) => {
      if (cancelled) return;
      const rel = adaptArticles(relRaw).filter((n) => String(n.id) !== aid).slice(0, 6);
      const more = adaptArticles(moreRaw).filter((n) => String(n.id) !== aid).slice(0, 5);
      setRelatedStories(rel);
      setMostReadSidebar(more);
    });
    return () => {
      cancelled = true;
    };
  }, [id, article, lang]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, []);

  const handleBookmarkToggle = useCallback(async () => {
    if (!id) return;
    if (!token) {
      navigate(`/profile?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (bookmarked) {
      await removeBookmark(token, id).catch(() => {});
      setBookmarked(false);
      return;
    }
    await addBookmark(token, id).catch(() => {});
    await sendSignal(token, { eventType: "bookmark", articleId: id, weight: 3 }).catch(() => {});
    setBookmarked(true);
  }, [id, token, bookmarked, navigate]);

  useEffect(() => {
    if (!token || !id) return;
    const timer = window.setTimeout(() => {
      recordHistory(token, id, 15, 20).catch(() => {});
      sendSignal(token, { eventType: "view", articleId: id, weight: 1 }).catch(() => {});
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [token, id]);

  /* Loading */
  if (loading) return (
    <div className="article-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 200 }}>
      <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--brand-red)" }} />
    </div>
  );

  /* Not found */
  if (!article) return (
    <div className="article-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 160 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-900)" }}>
        {t("खबर नहीं मिली", "Article not found")}
      </h2>
      <button className="article-back-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={16} /> {t("होम पर जाएं", "Go to Home")}
      </button>
    </div>
  );

  const title    = lang === "hi" ? article.title    : article.titleEn;
  const summary  = lang === "hi" ? article.summary  : article.summaryEn;
  const author   = lang === "hi" ? article.author   : article.authorEn;
  const time     = lang === "hi" ? article.time     : article.timeEn;
  const category = lang === "hi" ? article.category : article.categoryEn;
  const tags     = lang === "hi" ? (article.tags ?? []) : (article.tagsEn ?? []);

  const rawContent = lang === "hi" ? article.content : article.contentEn;
  const paragraphs = rawContent && rawContent.length > 0
    ? rawContent
    : lang === "hi"
      ? [article.summary, "इस विषय पर अधिक जानकारी जल्द उपलब्ध होगी। हमारे संवाददाता इस खबर पर नजर रखे हुए हैं।", "नवीनतम अपडेट के लिए खबर कोठरी के साथ बने रहें।"]
      : [article.summaryEn, "More details on this story are being gathered by our correspondents. Stay tuned for live updates.", "Follow Khabar Kothri for the latest breaking news and comprehensive coverage."];

  const color   = categoryColors[article.categorySlug] || "#BB1919";
  const cat     = categories.find(c => c.slug === article.categorySlug);
  const sideRelated = relatedStories.slice(0, 4);
  const bottomRelated = relatedStories.slice(0, 3);
  const views   = formatViewCount(article.viewCount ?? 0);
  const pageUrl = window.location.href;
  const isHtml  = (s: string) => /<[a-z][\s\S]*>/i.test(s);

  return (
    <motion.div className="article-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* Reading progress */}
      <motion.div className="article-progress-bar" style={{ scaleX, transformOrigin: "0%" }} />

      {/* Hero */}
      <div className="article-hero-wrap">
        {!imgErr
          ? <img src={article.image} alt={title} className="article-hero-img" onError={() => setImgErr(true)} />
          : <div className="article-hero-fallback" />}
      </div>

      {/* Two-column layout */}
      <div className="article-page-layout">

        {/* ── MAIN COLUMN ── */}
        <main className="article-main-col">

          {/* Breadcrumb */}
          <div className="article-breadcrumb">
            <button className="article-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> {t("वापस", "Back")}
            </button>
            <ChevronRight size={13} style={{ opacity: 0.35 }} />
            {cat && (
              <Link to={`/category/${article.categorySlug}`} style={{ color, fontWeight: 600, fontSize: 13 }}>
                {lang === "hi" ? cat.name : cat.nameEn}
              </Link>
            )}
          </div>

          {/* Badges */}
          <div className="article-meta-top">
            {article.isBreaking && <span className="article-breaking-badge">⚡ {t("ब्रेकिंग", "Breaking")}</span>}
            <span className="article-cat-badge" style={{ color, borderColor: color + "40" }}>{category}</span>
          </div>

          {/* Headline */}
          <motion.h1 className="article-headline" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }}>
            {title}
          </motion.h1>

          {/* Deck */}
          <p className="article-deck">{summary}</p>

          {/* Byline */}
          <div className="article-byline">
            <div className="article-author-info">
              <div className="article-author-avatar" style={{ background: color + "20", color }}>
                {author.charAt(0)}
              </div>
              <div>
                <div className="article-author-name">{author}</div>
                <div className="article-author-time">
                  <Clock size={12} /><span>{time}</span>
                  <span className="art-sep" />
                  <Eye size={12} /><span>{views} {t("व्यूज़", "views")}</span>
                  {article.readTime && (
                    <><span className="art-sep" /><span>📖 {article.readTime} {t("मिनट", "min read")}</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop quick-share */}
            <div className="article-share-row article-byline-share">
              <button className="article-bookmark-btn"
                style={bookmarked ? { borderColor: color, color, background: color + "12" } : {}}
                onClick={() => void handleBookmarkToggle()}
                title={t("बुकमार्क", "Bookmark")}
              >
                <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
              </button>
              <button className="article-share-btn art-share-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
                <MessageCircle size={13} /> WhatsApp
              </button>
              <button className="article-share-btn" onClick={handleCopyLink}>
                <Link2 size={13} />{copied ? t("कॉपी!", "Copied!") : t("लिंक", "Link")}
              </button>
            </div>
          </div>

          {/* ── FULL SHARE BAR (mobile: shown after byline, desktop: hidden) ── */}
          <div className="article-share-bar-mobile">
            <p className="article-share-bar-label">{t("शेयर करें", "Share")}</p>
            <div className="article-share-bar-btns">
              <button className="art-share-pill art-share-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button className="art-share-pill art-share-tw" onClick={() => shareToTwitter(title, pageUrl)}>
                <Share2 size={14} /> X (Twitter)
              </button>
              <button className="art-share-pill art-share-fb" onClick={() => shareToFacebook(pageUrl)}>
                <Share2 size={14} /> Facebook
              </button>
              <button className="art-share-pill" onClick={handleCopyLink}>
                <Link2 size={14} />{copied ? t("कॉपी!", "Copied!") : t("लिंक कॉपी", "Copy Link")}
              </button>
              {"share" in navigator && (
                <button className="art-share-pill art-share-native" onClick={() => nativeShare(title, pageUrl)}>
                  <Share2 size={14} /> {t("और", "More")}
                </button>
              )}
            </div>
          </div>

          {/* Article body */}
          <motion.div className="article-body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
            {paragraphs.map((para, i) => (
              isHtml(para)
                ? <div key={i} dangerouslySetInnerHTML={{ __html: para }} />
                : <p key={i}>{para}</p>
            ))}

            <blockquote className="article-pull-quote" style={{ borderLeftColor: color }}>
              {`"${paragraphs[Math.min(1, paragraphs.length - 1)].replace(/<[^>]+>/g, "").slice(0, 140)}…"`}
            </blockquote>
          </motion.div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="article-tags-section">
              <p className="article-tags-label">{t("टैग्स", "Tags")}</p>
              <div className="article-tags">
                {tags.map(tag => <button key={tag} className="article-tag">#{tag}</button>)}
              </div>
            </div>
          )}

          {/* Bottom share section */}
          <div className="article-share-section">
            <p className="article-share-section-label">{t("इस खबर को शेयर करें", "Share this story")}</p>
            <div className="article-share-full-row">
              <button className="art-share-btn-full art-share-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="art-share-btn-full art-share-tw" onClick={() => shareToTwitter(title, pageUrl)}>
                <Share2 size={16} /> X (Twitter)
              </button>
              <button className="art-share-btn-full art-share-fb" onClick={() => shareToFacebook(pageUrl)}>
                <Share2 size={16} /> Facebook
              </button>
              <button className="art-share-btn-full" onClick={handleCopyLink}>
                <Link2 size={16} />{copied ? t("कॉपी हो गया!", "Copied!") : t("लिंक कॉपी करें", "Copy Link")}
              </button>
              {"share" in navigator && (
                <button className="art-share-btn-full art-share-native" onClick={() => nativeShare(title, pageUrl)}>
                  <Share2 size={16} /> {t("अन्य", "More")}
                </button>
              )}
            </div>
          </div>

          {/* Related stories — mobile / bottom (shows only on mobile via CSS) */}
          {bottomRelated.length > 0 && (
            <div className="article-related-mobile">
              <h3 className="article-related-mobile-title" style={{ borderLeftColor: color }}>
                {t("और खबरें", "More Stories")}
              </h3>
              <div className="article-related-mobile-list">
                {bottomRelated.map(item => (
                  <RelatedCard key={String(item.id)} item={item} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="article-sidebar">

          {/* Related in category */}
          {sideRelated.length > 0 && (
            <div className="aside-block">
              <div className="aside-block-header" style={{ borderLeftColor: color }}>
                <span>{t(`${category} में और`, `More in ${category}`)}</span>
              </div>
              <div className="aside-related-list">
                {sideRelated.map(item => (
                  <RelatedCard key={String(item.id)} item={item} lang={lang} />
                ))}
              </div>
            </div>
          )}

          {/* Share sidebar widget */}
          <div className="aside-block aside-share-widget">
            <div className="aside-block-header" style={{ borderLeftColor: color }}>
              <span>{t("शेयर करें", "Share Story")}</span>
            </div>
            <div className="aside-share-grid">
              <button className="aside-share-btn aside-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </button>
              <button className="aside-share-btn aside-tw" onClick={() => shareToTwitter(title, pageUrl)}>
                <Share2 size={16} />
                <span>X / Twitter</span>
              </button>
              <button className="aside-share-btn aside-fb" onClick={() => shareToFacebook(pageUrl)}>
                <Share2 size={16} />
                <span>Facebook</span>
              </button>
              <button className="aside-share-btn" onClick={handleCopyLink}>
                <Link2 size={16} />
                <span>{copied ? t("कॉपी!", "Copied!") : t("लिंक", "Copy Link")}</span>
              </button>
            </div>
          </div>

          {/* Most Read */}
          {mostReadSidebar.length > 0 && (
            <div className="aside-block">
              <div className="aside-block-header" style={{ borderLeftColor: "#BB1919" }}>
                <span>{t("सबसे ज़्यादा पढ़ी गई", "Most Read")}</span>
              </div>
              <ol className="aside-mostread-list">
                {mostReadSidebar.map((item, i) => {
                  const mTitle = lang === "hi" ? item.title : item.titleEn;
                  const mTime  = lang === "hi" ? item.time  : item.timeEn;
                  const mCat   = lang === "hi" ? item.category : item.categoryEn;
                  const mColor = categoryColors[item.categorySlug] || "#BB1919";
                  return (
                    <li key={String(item.id)} className="aside-mostread-item"
                      onClick={() => navigate(`/article/${item.id}`)} style={{ cursor: "pointer" }}>
                      <span className="aside-mostread-num">{String(i + 1).padStart(2, "0")}</span>
                      <div className="aside-mostread-body">
                        <span className="aside-mostread-cat" style={{ color: mColor }}>{mCat}</span>
                        <h4 className="aside-mostread-title">{mTitle}</h4>
                        <div className="aside-mostread-meta"><Clock size={10} /><span>{mTime}</span></div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Newsletter mini */}
          <div className="aside-block aside-newsletter">
            <p className="aside-newsletter-headline">
              {t("खबर कोठरी न्यूज़लेटर", "Khabar Kothri Newsletter")}
            </p>
            <p className="aside-newsletter-sub">
              {t("हर सुबह ताज़ी खबरें — सीधे आपके inbox में", "Top stories every morning, straight to your inbox")}
            </p>
            <input className="aside-newsletter-input" type="email"
              placeholder={t("आपका email", "your@email.com")} />
            <button className="aside-newsletter-btn">
              {t("सब्सक्राइब", "Subscribe Free")}
            </button>
          </div>
        </aside>
      </div>

      {/* ── BACK TO TOP ── */}
      {showBackTop && (
        <motion.button
          className="article-back-top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}

      {/* ── MOBILE STICKY SHARE BAR ── */}
      <div className="article-mobile-share-strip">
        <button className="mobile-strip-btn mobile-strip-wa" onClick={() => shareToWhatsApp(title, pageUrl)}>
          <MessageCircle size={18} />
        </button>
        <button className="mobile-strip-btn mobile-strip-tw" onClick={() => shareToTwitter(title, pageUrl)}>
          <Share2 size={18} />
        </button>
        <button className="mobile-strip-btn mobile-strip-fb" onClick={() => shareToFacebook(pageUrl)}>
          <Share2 size={18} />
        </button>
        <button className="mobile-strip-btn" onClick={handleCopyLink}>
          <Link2 size={18} />
        </button>
        {"share" in navigator && (
          <button className="mobile-strip-btn mobile-strip-native" onClick={() => nativeShare(title, pageUrl)}>
            <Share2 size={18} />
          </button>
        )}
        <button className="mobile-strip-bookmark"
          onClick={() => void handleBookmarkToggle()}
          style={bookmarked ? { color: "#BB1919" } : {}}>
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </motion.div>
  );
}
