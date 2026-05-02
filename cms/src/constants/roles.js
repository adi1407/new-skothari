/** Matches backend `utils/roles.js` — users who can use writer CMS routes */
export const WRITER_ROLES = ["writer", "writer_en", "writer_hi"];

export function isWriterRole(role) {
  return WRITER_ROLES.includes(role);
}

/** CMS Users filters & forms */
export const ALL_USER_ROLES = ["admin", "editor", "writer", "writer_en", "writer_hi"];

export function writerDeskLabel(role) {
  if (role === "writer_en") return "English writer";
  if (role === "writer_hi") return "Hindi writer";
  if (role === "writer") return "Writer (both)";
  if (role === "admin") return "Admin";
  if (role === "editor") return "Editor";
  return role || "";
}
