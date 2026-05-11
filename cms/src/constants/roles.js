/** Matches backend `utils/roles.js` */

export const WRITER_ROLES = ["writer_en", "writer_hi"];

export const EDITOR_ROLES = ["editor", "editor_en", "editor_hi"];

/** English editor field in article assignments: desk editors + admins who can review EN queue. */
export const ENGLISH_EDITOR_ASSIGNMENT_ROLES = ["editor", "editor_en", "super_admin", "admin"];

export const VIDEO_STAFF_ROLES = ["video_editor", "editor", "super_admin", "admin"];

export const ADMIN_LIKE_ROLES = ["super_admin", "admin"];

/** Every assignable CMS role (User schema enum). */
export const ALL_USER_ROLES = [
  "super_admin",
  "admin",
  "writer_en",
  "writer_hi",
  "editor_en",
  "editor_hi",
  "editor",
  "video_editor",
];

export function isWriterRole(role) {
  return WRITER_ROLES.includes(role);
}

export function isEditorRole(role) {
  return EDITOR_ROLES.includes(role);
}

export function isVideoStaff(role) {
  return VIDEO_STAFF_ROLES.includes(role);
}

export function isAdminLike(role) {
  return ADMIN_LIKE_ROLES.includes(role);
}

export function writerDeskLabel(role) {
  if (role === "writer_en") return "English writer";
  if (role === "writer_hi") return "Hindi writer";
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  if (role === "editor_en") return "English editor";
  if (role === "editor_hi") return "Hindi editor";
  if (role === "editor") return "Editor in chief";
  if (role === "video_editor") return "Video editor";
  return role || "";
}
