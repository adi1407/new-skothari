"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  ThumbsUp,
  Share2,
  Link2,
  MessageCircle,
  Mail,
  Send,
  X,
} from "lucide-react";

function BrandFb() {
  return (
    <span className="kn-share-brand kn-share-brand-fb" aria-hidden>
      f
    </span>
  );
}
function BrandX() {
  return (
    <span className="kn-share-brand kn-share-brand-x" aria-hidden>
      X
    </span>
  );
}
function BrandLi() {
  return (
    <span className="kn-share-brand kn-share-brand-li" aria-hidden>
      in
    </span>
  );
}
import { useReaderAuth } from "../../context/ReaderAuthContext";
import {
  addBookmark,
  addUpvote,
  hasBookmarked,
  hasUpvoted,
  removeBookmark,
  removeUpvote,
  sendSignal,
} from "../../services/readerApi";
import { fetchArticleById } from "../../services/newsApi";

interface Props {
  articleId: string;
  initialUpvotes: number;
  shareTitle: string;
  shareSummary?: string;
}

function openWin(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
}

function buildShareText(title: string, summary: string | undefined, url: string) {
  const line = summary?.trim()?.slice(0, 160);
  return line ? `${title}\n\n${line}\n\n${url}` : `${title}\n\n${url}`;
}

export default function ArticleInteractions({
  articleId,
  initialUpvotes,
  shareTitle,
  shareSummary,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated } = useReaderAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl =
    typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "";

  useEffect(() => {
    setUpvotes(initialUpvotes);
  }, [articleId, initialUpvotes]);

  useEffect(() => {
    let cancelled = false;
    fetchArticleById(articleId)
      .then((a) => {
        if (cancelled || !a) return;
        const n = typeof a.upvotes === "number" ? a.upvotes : 0;
        setUpvotes(n);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  useEffect(() => {
    if (!token) return;
    hasUpvoted(token, articleId)
      .then((r) => setUpvoted(Boolean(r.hasUpvoted)))
      .catch(() => {});
  }, [token, articleId]);

  useEffect(() => {
    if (!token) return;
    hasBookmarked(token, articleId)
      .then((r) => setBookmarked(Boolean(r.bookmarked)))
      .catch(() => {});
  }, [token, articleId]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shareOpen]);

  const authNext = `/login?next=${encodeURIComponent(pathname || `/article/${articleId}`)}`;

  const toggleBookmark = async () => {
    if (!token || !isAuthenticated) {
      router.push(authNext);
      return;
    }
    try {
      if (bookmarked) {
        await removeBookmark(token, articleId);
        setBookmarked(false);
      } else {
        await addBookmark(token, articleId);
        await sendSignal(token, { eventType: "bookmark", articleId, weight: 3 }).catch(() => {});
        setBookmarked(true);
      }
    } catch {
      /* no-op */
    }
  };

  const toggleUpvote = async () => {
    if (!token || !isAuthenticated) {
      router.push(authNext);
      return;
    }
    try {
      if (upvoted) {
        const res = await removeUpvote(token, articleId);
        setUpvoted(false);
        setUpvotes(typeof res.upvoteCount === "number" ? res.upvoteCount : Math.max(0, upvotes - 1));
      } else {
        const res = await addUpvote(token, articleId);
        setUpvoted(true);
        setUpvotes(typeof res.upvoteCount === "number" ? res.upvoteCount : upvotes + 1);
      }
    } catch {
      fetchArticleById(articleId)
        .then((a) => {
          if (a && typeof a.upvotes === "number") setUpvotes(a.upvotes);
        })
        .catch(() => {});
    }
  };

  const sharePayload = buildShareText(shareTitle, shareSummary, pageUrl);

  const recordShare = () => {
    if (!token) return;
    sendSignal(token, { eventType: "share", articleId, weight: 2 }).catch(() => {});
  };

  const shareWhatsApp = () => {
    recordShare();
    openWin(`https://wa.me/?text=${encodeURIComponent(sharePayload)}`);
    setShareOpen(false);
  };

  const shareTelegram = () => {
    recordShare();
    openWin(
      `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`
    );
    setShareOpen(false);
  };

  const shareFacebook = () => {
    recordShare();
    openWin(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);
    setShareOpen(false);
  };

  const shareTwitter = () => {
    recordShare();
    openWin(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}`
    );
    setShareOpen(false);
  };

  const shareLinkedIn = () => {
    recordShare();
    openWin(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`);
    setShareOpen(false);
  };

  const shareEmail = () => {
    recordShare();
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(sharePayload);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareOpen(false);
  };

  const copyLink = useCallback(() => {
    if (token) sendSignal(token, { eventType: "share", articleId, weight: 2 }).catch(() => {});
    void navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }, [pageUrl, token, articleId]);

  const nativeShare = async () => {
    recordShare();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary?.slice(0, 200) || shareTitle,
          url: pageUrl,
        });
      } catch {
        /* dismissed */
      }
    }
    setShareOpen(false);
  };

  const shareItems = (
    <>
      <button type="button" className="kn-share-item kn-share-wa" onClick={shareWhatsApp}>
        <MessageCircle size={20} aria-hidden />
        <span>WhatsApp</span>
      </button>
      <button type="button" className="kn-share-item kn-share-tg" onClick={shareTelegram}>
        <Send size={20} aria-hidden />
        <span>Telegram</span>
      </button>
      <button type="button" className="kn-share-item kn-share-fb" onClick={shareFacebook}>
        <BrandFb />
        <span>Facebook</span>
      </button>
      <button type="button" className="kn-share-item kn-share-tw" onClick={shareTwitter}>
        <BrandX />
        <span>X / Twitter</span>
      </button>
      <button type="button" className="kn-share-item kn-share-li" onClick={shareLinkedIn}>
        <BrandLi />
        <span>LinkedIn</span>
      </button>
      <button type="button" className="kn-share-item kn-share-mail" onClick={shareEmail}>
        <Mail size={20} aria-hidden />
        <span>Email</span>
      </button>
      <button type="button" className="kn-share-item" onClick={copyLink}>
        <Link2 size={20} aria-hidden />
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>
      {"share" in navigator && (
        <button type="button" className="kn-share-item kn-share-more" onClick={() => void nativeShare()}>
          <Share2 size={20} aria-hidden />
          <span>More apps…</span>
        </button>
      )}
    </>
  );

  return (
    <>
      <div className="kn-article-toolbar">
        <div className="kn-article-toolbar-main">
          <button
            type="button"
            className={`kn-tool-btn ${upvoted ? "kn-tool-active" : ""}`}
            onClick={() => void toggleUpvote()}
            aria-pressed={upvoted}
          >
            <ThumbsUp size={18} strokeWidth={2} fill={upvoted ? "currentColor" : "none"} />
            <span className="kn-tool-label">{upvoted ? "Liked" : "Like"}</span>
            <span className="kn-tool-count">{upvotes}</span>
          </button>

          <button
            type="button"
            className={`kn-tool-btn ${bookmarked ? "kn-tool-active" : ""}`}
            onClick={() => void toggleBookmark()}
            aria-pressed={bookmarked}
          >
            <Bookmark size={18} strokeWidth={2} fill={bookmarked ? "currentColor" : "none"} />
            <span className="kn-tool-label">{bookmarked ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            className={`kn-tool-btn kn-tool-share ${shareOpen ? "kn-tool-active" : ""}`}
            aria-expanded={shareOpen}
            aria-haspopup="dialog"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={18} strokeWidth={2} />
            <span className="kn-tool-label">Share</span>
          </button>
        </div>

        <p className="kn-article-toolbar-hint">
          {!isAuthenticated ? (
            <>
              <Link href={authNext}>Sign in</Link> to like and save articles.
            </>
          ) : (
            "Thanks for reading Kothari News."
          )}
        </p>
      </div>

      <div className="kn-article-mobile-dock" role="toolbar" aria-label="Article actions">
        <button type="button" className={`kn-dock-btn ${upvoted ? "kn-dock-on" : ""}`} onClick={() => void toggleUpvote()}>
          <ThumbsUp size={22} strokeWidth={2} fill={upvoted ? "currentColor" : "none"} />
          <span>{upvotes}</span>
        </button>
        <button type="button" className={`kn-dock-btn ${bookmarked ? "kn-dock-on" : ""}`} onClick={() => void toggleBookmark()}>
          <Bookmark size={22} strokeWidth={2} fill={bookmarked ? "currentColor" : "none"} />
          <span>Save</span>
        </button>
        <button type="button" className="kn-dock-btn kn-dock-share" onClick={() => setShareOpen(true)}>
          <Share2 size={22} strokeWidth={2} />
          <span>Share</span>
        </button>
        <button type="button" className="kn-dock-btn kn-dock-wa" onClick={shareWhatsApp}>
          <MessageCircle size={22} strokeWidth={2} />
          <span>WA</span>
        </button>
      </div>

      {shareOpen && (
        <>
          <button type="button" className="kn-share-backdrop" aria-label="Close share menu" onClick={() => setShareOpen(false)} />
          <div className="kn-share-popover" role="dialog" aria-labelledby="kn-share-title">
            <div className="kn-share-popover-head">
              <strong id="kn-share-title">Share this story</strong>
              <button type="button" className="kn-share-close" onClick={() => setShareOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="kn-share-actions">{shareItems}</div>
          </div>
        </>
      )}
    </>
  );
}
