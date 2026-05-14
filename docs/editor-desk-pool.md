# Editor article visibility (desk pool)

Language desk editors (`editor_en`, `editor_hi`) see and act on **all articles whose `primaryLocale` matches their desk** (English vs Hindi), not only stories where they are named on `editorEn` / `editorHi`. Chief editor (`editor`) and admins keep full access; optional `primaryLocale` query narrows lists for the chief where supported.

Publish/reject/edit gates use the same rule as list visibility via `canDeskEditorActOnArticle` in `backend/routes/articles.js`.
