/* eslint-disable react-hooks/set-state-in-effect -- sync lists when auth token changes */
import { useEffect, useState } from "react";
import { listBookmarks, listUpvotes } from "../../../services/readerApi";
import type { ProfileReaderListRow } from "../types/profile";

type TFn = (hi: string, en: string) => string;

export function useProfileReaderLists(token: string | null, isAuthenticated: boolean, t: TFn) {
  const [bookmarks, setBookmarks] = useState<ProfileReaderListRow[]>([]);
  const [likedPosts, setLikedPosts] = useState<ProfileReaderListRow[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState("");

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setBookmarks([]);
      setLikedPosts([]);
      setPanelLoading(false);
      setPanelError("");
      return;
    }
    let cancelled = false;
    const loadToken = token;
    setPanelLoading(true);
    setPanelError("");
    Promise.all([
      listBookmarks(loadToken).then((r) => r.bookmarks || []),
      listUpvotes(loadToken).then((r) => r.upvotes || []),
    ])
      .then(([nextBookmarks, nextLiked]) => {
        if (cancelled) return;
        setBookmarks(nextBookmarks as ProfileReaderListRow[]);
        setLikedPosts(nextLiked as ProfileReaderListRow[]);
      })
      .catch(() => {
        if (!cancelled) {
          setPanelError(t("प्रोफ़ाइल डेटा लोड नहीं हुआ।", "Could not load profile data."));
        }
      })
      .finally(() => {
        if (!cancelled) setPanelLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, t]);

  return { bookmarks, likedPosts, panelLoading, panelError };
}
