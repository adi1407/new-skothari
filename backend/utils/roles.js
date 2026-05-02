/** CMS desk roles that can draft/submit articles */
const WRITER_ROLES = ["writer", "writer_en", "writer_hi"];

function isWriterRole(role) {
  return WRITER_ROLES.includes(role);
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

module.exports = {
  WRITER_ROLES,
  isWriterRole,
  writerPrimaryLocaleConstraint,
};
