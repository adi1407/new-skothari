/** Matches GET /articles and GET /editor/articles `primaryLocale` filter for desk editors. */
import { isAdminLike, isEditorRole } from "../constants/roles";

/** Default desk when editor-in-chief / admin opens queue without a query string. */
export const DEFAULT_CHIEF_DESK_LOCALE = "en";

export function editorListSearch(role) {
  if (role === "editor_hi") return "?primaryLocale=hi";
  if (role === "editor_en") return "?primaryLocale=en";
  return "";
}

export function withEditorListSearch(path, role) {
  const q = editorListSearch(role);
  return q ? `${path}${q}` : path;
}

export function articleListParamsFromRole(role, extra = {}) {
  const params = { ...extra };
  if (role === "editor_hi") params.primaryLocale = "hi";
  else if (role === "editor_en") params.primaryLocale = "en";
  return params;
}

/**
 * Editor-in-chief and admin-like users use ?primaryLocale=en|hi on /editor/* lists.
 * Desk editors (editor_en / editor_hi) keep fixed locale from role.
 */
export function articleListParamsWithDeskUrl(role, searchParams, extra = {}) {
  const params = articleListParamsFromRole(role, { ...extra });
  if (role === "editor" || isAdminLike(role)) {
    const raw = searchParams?.get?.("primaryLocale");
    params.primaryLocale = raw === "hi" ? "hi" : "en";
  }
  return params;
}

/** Chief / admin: normalized ?primaryLocale= for linking to review / writer edit. */
export function chiefDeskSearchFromArticle(article) {
  const pl = article?.primaryLocale === "hi" ? "hi" : "en";
  return `?primaryLocale=${pl}`;
}

/**
 * Which language column the rich editor shows: URL `?primaryLocale=` for chief/admin,
 * fixed desk for writer_* / editor_en / editor_hi, else article primary when URL absent.
 */
export function resolveArticleDeskLocale(user, searchParams, formPrimary = "en") {
  if (!user?.role) return formPrimary === "hi" ? "hi" : "en";
  const r = String(user.role).trim();
  if (r === "writer_en" || r === "writer") return "en";
  if (r === "writer_hi") return "hi";
  if (r === "editor_en") return "en";
  if (r === "editor_hi") return "hi";
  const raw = searchParams?.get?.("primaryLocale");
  if (raw === "hi" || raw === "en") return raw;
  if (r === "editor" || isAdminLike(r)) return formPrimary === "hi" ? "hi" : "en";
  return formPrimary === "hi" ? "hi" : "en";
}

/** Single-column desk vs legacy bilingual (`both`) for rare non-desk roles. */
export function articleEditorDeskMode(user, resolvedDesk) {
  if (!user?.role) return "both";
  const r = String(user.role).trim();
  if (r === "writer_en" || r === "writer") return "en";
  if (r === "writer_hi") return "hi";
  if (r === "editor_en") return "en";
  if (r === "editor_hi") return "hi";
  if (r === "editor" || isAdminLike(r)) return resolvedDesk === "hi" ? "hi" : "en";
  return "both";
}

/** Back to queue after editing: preserve desk query; default English desk for chief/admin. */
export function editorQueuePathForUser(user, locationSearch = "") {
  const raw = String(locationSearch || "").trim();
  const qs = raw.startsWith("?") ? raw : raw ? `?${raw}` : "";
  if (qs) return `/editor/queue${qs}`;
  if (isAdminLike(user?.role) || user?.role === "editor") {
    return `/editor/queue?primaryLocale=${DEFAULT_CHIEF_DESK_LOCALE}`;
  }
  if (isEditorRole(user?.role)) {
    return withEditorListSearch("/editor/queue", user.role);
  }
  return "/editor/queue";
}
