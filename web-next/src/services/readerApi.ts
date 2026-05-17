import { withPublicOrigin } from "../config/publicApi";
import { apiFetchSignal } from "../lib/apiFetchSignal";

export interface ReaderProfile {
  primaryLanguage: "hi" | "en";
  preferredCategories: string[];
  followedTopics: string[];
  newsletterEnabled: boolean;
  newsletterTopics: string[];
  digestCadence: "daily" | "weekly" | "off";
  profileVisibility: "private" | "public";
  bio: string;
  socialLinks: { twitter?: string; instagram?: string; linkedin?: string; website?: string };
  avatarOverride?: string;
}

export interface ReaderAccount {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  /** ISO string from API when present */
  lastLogin?: string;
  profile: ReaderProfile | null;
}

function api(path: string): string {
  return withPublicOrigin(`/api/reader${path}`);
}

async function authed<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const signal = init.signal ?? apiFetchSignal();
  const res = await fetch(api(path), {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function readerGoogleAuth(credential: string): Promise<{ token: string; reader: ReaderAccount }> {
  const res = await fetch(api("/auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
    signal: apiFetchSignal(),
  });
  if (!res.ok) {
    let message = "Reader sign-in failed";
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(message);
  }
  return res.json();
}

export async function readerMe(token: string): Promise<{ reader: ReaderAccount }> {
  return authed("/me", token);
}

export async function updateReaderPreferences(token: string, payload: Partial<ReaderProfile>) {
  return authed<{ profile: ReaderProfile }>("/preferences", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateReaderProfile(token: string, payload: Partial<ReaderProfile>) {
  return authed<{ profile: ReaderProfile }>("/profile", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listBookmarks(token: string) {
  return authed<{ bookmarks: Array<{ _id: string; article: any; createdAt: string }> }>("/bookmarks", token);
}

export async function addBookmark(token: string, articleId: string) {
  return authed("/bookmarks", token, {
    method: "POST",
    body: JSON.stringify({ articleId }),
  });
}

export async function removeBookmark(token: string, articleId: string) {
  return authed(`/bookmarks/${articleId}`, token, { method: "DELETE" });
}

export async function hasBookmarked(token: string, articleId: string) {
  return authed<{ bookmarked: boolean }>(`/bookmarks/${articleId}`, token);
}

export async function listUpvotes(token: string) {
  return authed<{ upvotes: Array<{ _id: string; article: any; createdAt: string }> }>("/upvotes", token);
}

export async function hasUpvoted(token: string, articleId: string) {
  return authed<{ hasUpvoted: boolean }>(`/upvotes/${articleId}`, token);
}

export async function addUpvote(token: string, articleId: string) {
  return authed<{ upvoteCount: number }>("/upvotes", token, {
    method: "POST",
    body: JSON.stringify({ articleId }),
  });
}

export async function removeUpvote(token: string, articleId: string) {
  return authed<{ upvoteCount: number }>(`/upvotes/${articleId}`, token, { method: "DELETE" });
}

export async function listHistory(token: string) {
  return authed<{ history: Array<{ _id: string; article: any; lastViewedAt: string; progressPct: number }> }>("/history", token);
}

export async function recordHistory(token: string, articleId: string, progressPct = 0, readSeconds = 0) {
  return authed("/history", token, {
    method: "POST",
    body: JSON.stringify({ articleId, progressPct, readSeconds }),
  });
}

export async function removeHistoryItem(token: string, articleId: string) {
  return authed(`/history/${articleId}`, token, { method: "DELETE" });
}

export async function clearHistory(token: string) {
  return authed("/history", token, { method: "DELETE" });
}

export async function listSessions(token: string) {
  return authed<{ sessions: any[] }>("/sessions", token);
}

export async function revokeSession(token: string, sessionId: string) {
  return authed(`/sessions/${sessionId}`, token, { method: "DELETE" });
}

export async function logoutAllOtherSessions(token: string) {
  return authed("/sessions/logout-all", token, { method: "POST" });
}

export async function exportReaderData(token: string) {
  return authed<any>("/export", token, { method: "POST" });
}

export async function deleteReaderAccount(token: string) {
  return authed("/account", token, { method: "DELETE" });
}

export async function sendSignal(
  token: string,
  payload: { eventType: "view" | "bookmark" | "share" | "complete" | "category_click"; articleId?: string; category?: string; weight?: number; meta?: Record<string, unknown> }
) {
  return authed("/signals", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRecommendations(token: string, limit = 12) {
  return authed<{ articles: any[]; categories: string[] }>(`/recommendations?limit=${limit}`, token);
}
