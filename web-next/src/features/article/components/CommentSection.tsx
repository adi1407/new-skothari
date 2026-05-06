"use client";

type TFn = (hi: string, en: string) => string;

/**
 * Placeholder until a comments API exists. Set enabled when backend is ready.
 */
export default function CommentSection({
  enabled = false,
  t,
}: {
  enabled?: boolean;
  t: TFn;
}) {
  if (!enabled) return null;
  return (
    <section className="article-comments-placeholder" aria-label={t("टिप्पणियाँ", "Comments")}>
      <p className="article-subtle">{t("टिप्पणी प्रणाली जल्द आ रही है।", "Comments coming soon.")}</p>
    </section>
  );
}
