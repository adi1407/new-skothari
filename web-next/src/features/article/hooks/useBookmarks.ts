/* eslint-disable react-hooks/set-state-in-effect -- reader sync when token/article id changes matches legacy client */
import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "../types/article";
import {
  addBookmark,
  addUpvote,
  hasBookmarked,
  hasUpvoted,
  recordHistory,
  removeBookmark,
  removeUpvote,
  sendSignal,
} from "../../../services/readerApi";
import { publicArticleSegmentsMatch, upvoteCountFromApi } from "../utils/formatArticle";

/**
 * Reader bookmark/upvote state, sync with API, and lightweight engagement signals.
 */
/** Matches `useNavigate()` from `src/lib/routerShim.tsx` */
export type ArticleNavigate = (to: string | number, options?: { replace?: boolean }) => void;

export function useBookmarks(
  articleId: string,
  token: string | null,
  article: NewsItem | null,
  navigate: ArticleNavigate
) {
  const [bookmarked, setBookmarked] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  useEffect(() => {
    if (!article || !publicArticleSegmentsMatch(articleId, article)) {
      setUpvoteCount(0);
      return;
    }
    setUpvoteCount(typeof article.upvoteCount === "number" ? article.upvoteCount : 0);
  }, [article, articleId]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!articleId) return;
    if (!token) {
      navigate(`/profile?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (bookmarked) {
      await removeBookmark(token, articleId).catch(() => {});
      setBookmarked(false);
      return;
    }
    await addBookmark(token, articleId).catch(() => {});
    await sendSignal(token, { eventType: "bookmark", articleId, weight: 3 }).catch(() => {});
    setBookmarked(true);
  }, [articleId, token, bookmarked, navigate]);

  const handleUpvoteToggle = useCallback(async () => {
    if (!articleId) return;
    if (!token) {
      navigate(`/profile?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (upvoted) {
      setUpvoted(false);
      setUpvoteCount((c) => Math.max(0, c - 1));
      const res = await removeUpvote(token, articleId).catch(() => null);
      const serverCount = upvoteCountFromApi(res);
      if (serverCount != null) {
        setUpvoteCount(serverCount);
      } else {
        setUpvoted(true);
        setUpvoteCount((c) => c + 1);
      }
      return;
    }
    setUpvoted(true);
    setUpvoteCount((c) => c + 1);
    const res = await addUpvote(token, articleId).catch(() => null);
    const serverCount = upvoteCountFromApi(res);
    if (serverCount != null) {
      setUpvoteCount(serverCount);
    } else {
      setUpvoted(false);
      setUpvoteCount((c) => Math.max(0, c - 1));
    }
  }, [articleId, token, upvoted, navigate]);

  useEffect(() => {
    if (!token || !articleId) {
      setUpvoted(false);
      return;
    }
    let cancelled = false;
    hasUpvoted(token, articleId)
      .then((r) => {
        if (!cancelled) setUpvoted(Boolean(r.hasUpvoted));
      })
      .catch(() => {
        if (!cancelled) setUpvoted(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, articleId]);

  useEffect(() => {
    if (!token || !articleId) {
      setBookmarked(false);
      return;
    }
    let cancelled = false;
    hasBookmarked(token, articleId)
      .then((r) => {
        if (!cancelled) setBookmarked(Boolean(r.bookmarked));
      })
      .catch(() => {
        if (!cancelled) setBookmarked(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, articleId]);

  useEffect(() => {
    if (!token || !articleId) return;
    const timer = window.setTimeout(() => {
      recordHistory(token, articleId, 15, 20).catch(() => {});
      sendSignal(token, { eventType: "view", articleId, weight: 1 }).catch(() => {});
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [token, articleId]);

  return {
    bookmarked,
    upvoted,
    upvoteCount,
    handleBookmarkToggle,
    handleUpvoteToggle,
  };
}
