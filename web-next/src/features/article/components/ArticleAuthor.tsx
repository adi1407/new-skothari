"use client";

import { Clock, Eye } from "lucide-react";

type TFn = (hi: string, en: string) => string;

export default function ArticleAuthor({
  authorInitial,
  authorName,
  time,
  viewsLabel,
  readTime,
  color,
  t,
}: {
  authorInitial: string;
  authorName: string;
  time: string;
  /** When omitted or empty, view count is not shown. */
  viewsLabel?: string;
  readTime?: string | number;
  color: string;
  t: TFn;
}) {
  const showViews = Boolean(viewsLabel?.trim());

  return (
    <div className="article-author-info">
      <div className="article-author-avatar" style={{ background: color + "20", color }}>
        {authorInitial}
      </div>
      <div>
        <div className="article-author-name">{authorName}</div>
        <div className="article-author-time">
          <Clock size={12} />
          <span>{time}</span>
          {showViews ? (
            <>
              <span className="art-sep" />
              <Eye size={12} />
              <span>{viewsLabel}</span>
            </>
          ) : null}
          {readTime ? (
            <>
              <span className="art-sep" />
              <span>
                📖 {readTime} {t("मिनट", "min read")}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
