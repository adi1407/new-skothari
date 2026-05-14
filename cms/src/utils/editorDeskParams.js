/** Matches GET /articles and GET /editor/articles `primaryLocale` filter for desk editors. */

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
