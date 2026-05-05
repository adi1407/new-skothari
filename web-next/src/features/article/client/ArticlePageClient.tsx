"use client";

import ArticlePageView from "../../../views/ArticlePage";

export default function ArticlePageClient({ articleId }: { articleId: string }) {
  return <ArticlePageView articleId={articleId} />;
}
