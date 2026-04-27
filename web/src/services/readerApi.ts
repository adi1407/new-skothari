import { withPublicOrigin } from "../config/publicApi";
import type { BackendArticle } from "./newsApi";

const TOKEN_KEY = "kn_reader_token";

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return withPublicOrigin(p);
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function getReaderToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setReaderToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface ReaderPreferences {
  preferredLang: "hi" | "en";
  newsletterOptIn: boolean;
}

export interface ReaderProfile {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  googleId?: string;
  hasLocalPassword?: boolean;
  preferences?: ReaderPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export async function readerRegister(body: {
  displayName: string;
  email: string;
  password: string;
}): Promise<{ token: string; reader: ReaderProfile }> {
  const res = await fetch(apiUrl("/api/reader/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

export async function readerLogin(body: { email: string; password: string }): Promise<{ token: string; reader: ReaderProfile }> {
  const res = await fetch(apiUrl("/api/reader/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

export async function readerGoogleLogin(idToken: string): Promise<{ token: string; reader: ReaderProfile }> {
  const res = await fetch(apiUrl("/api/reader/auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Google sign-in failed");
  return data;
}

export async function readerFetchMe(): Promise<ReaderProfile> {
  const res = await fetch(apiUrl("/api/reader/me"), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Session expired");
  return data.reader;
}

export async function readerPatchMe(patch: {
  displayName?: string;
  preferences?: Partial<ReaderPreferences>;
}): Promise<ReaderProfile> {
  const res = await fetch(apiUrl("/api/reader/me"), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Update failed");
  return data.reader;
}

export async function readerChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(apiUrl("/api/reader/me/password"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Password change failed");
}

export async function readerBookmarkCheck(articleId: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/api/reader/me/bookmarks/check/${articleId}`), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return false;
  return Boolean(data.bookmarked);
}

export async function readerBookmarkAdd(articleId: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/reader/me/bookmarks/${articleId}`), {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 200 && res.status !== 201) {
    throw new Error(data.message || "Could not save");
  }
}

export async function readerBookmarkRemove(articleId: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/reader/me/bookmarks/${articleId}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not remove");
  }
}

export async function readerListBookmarks(page = 1, limit = 20): Promise<{ articles: BackendArticle[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(apiUrl(`/api/reader/me/bookmarks?${params}`), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load bookmarks");
  return { articles: data.articles ?? [], total: data.total ?? 0 };
}

/** Best-effort: failures are ignored so article views are never blocked. */
export async function readerRecordHistory(articleId: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/reader/me/history/${articleId}`), {
      method: "POST",
      headers: authHeaders(),
    });
    await res.json().catch(() => ({}));
  } catch {
    /* ignore */
  }
}

export async function readerListHistory(page = 1, limit = 20): Promise<{ articles: BackendArticle[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(apiUrl(`/api/reader/me/history?${params}`), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load history");
  return { articles: data.articles ?? [], total: data.total ?? 0 };
}

export async function readerDeleteAccount(): Promise<void> {
  const res = await fetch(apiUrl("/api/reader/me"), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not delete account");
}
