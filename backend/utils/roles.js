/** Desk writers — no legacy `writer`. */
const WRITER_ROLES = ["writer_en", "writer_hi"];

/** Text / newsroom editors (chief + language desks). */
const TEXT_EDITOR_ROLES = ["editor", "editor_en", "editor_hi"];

/** Video CMS desk + chief editor + admins. */
const VIDEO_STAFF_ROLES = ["video_editor", "editor", "super_admin", "admin"];

const ADMIN_LIKE_ROLES = ["super_admin", "admin"];

const ALL_STAFF_ROLES = [
  "super_admin",
  "admin",
  "writer_en",
  "writer_hi",
  "editor_en",
  "editor_hi",
  "editor",
  "video_editor",
];

function isWriterRole(role) {
  return WRITER_ROLES.includes(role);
}

function isEditorRole(role) {
  return TEXT_EDITOR_ROLES.includes(role);
}

function isVideoStaff(role) {
  return VIDEO_STAFF_ROLES.includes(role);
}

function isAdminLike(role) {
  return ADMIN_LIKE_ROLES.includes(role);
}

function isSuperAdmin(role) {
  return role === "super_admin";
}

/** Enforce primaryLocale by desk: EN writers only English-primary, HI writers only Hindi-primary */
function writerPrimaryLocaleConstraint(role, primaryLocale) {
  const pl = primaryLocale === "hi" ? "hi" : "en";
  if (role === "writer_en" && pl !== "en") {
    return "English desk writers must use English as the primary language.";
  }
  if (role === "writer_hi" && pl !== "hi") {
    return "Hindi desk writers must use Hindi as the primary language.";
  }
  return null;
}

/** Writers assigned to an article (co-desk). */
function isAssignedWriter(article, userId) {
  const id = String(userId);
  if (String(article.author) === id) return true;
  if (article.writerEn && String(article.writerEn) === id) return true;
  if (article.writerHi && String(article.writerHi) === id) return true;
  return false;
}

/** Mongo filter for article list by editor desk (null = no extra filter). */
function editorArticleListExtra(role, userId) {
  if (role === "editor_en") return { editorEn: userId };
  if (role === "editor_hi") return { editorHi: userId };
  if (role === "editor" || role === "super_admin" || role === "admin") return null;
  return null;
}

module.exports = {
  WRITER_ROLES,
  TEXT_EDITOR_ROLES,
  EDITOR_ROLES: TEXT_EDITOR_ROLES,
  VIDEO_STAFF_ROLES,
  ADMIN_LIKE_ROLES,
  ALL_STAFF_ROLES,
  isWriterRole,
  isEditorRole,
  isVideoStaff,
  isAdminLike,
  isSuperAdmin,
  writerPrimaryLocaleConstraint,
  isAssignedWriter,
  editorArticleListExtra,
};
