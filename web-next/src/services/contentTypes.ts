export type LocaleCode = "hi" | "en";

/** Backend-adapted article model consumed by route UI/features. */
export interface ContentArticle {
  /** Public route id (9-digit article number when assigned, else Mongo id). */
  id: string;
  /** Mongo `_id` for reader API calls when needed; mirrors backend document id. */
  mongoId: string;
  category: string;
  categoryEn: string;
  categorySlug: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  image: string;
  time: string;
  timeEn: string;
  author: string;
  authorEn: string;
  isBreaking: boolean;
  readTime: string;
  viewCount: number;
  upvoteCount: number;
  tags: string[];
  tagsEn: string[];
  content?: string[];
  contentEn?: string[];
}

/** Backend-adapted video model consumed by shows feature UI. */
export interface ContentVideo {
  id: string;
  title: string;
  titleEn: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
  categoryEn: string;
  youtubeUrl: string;
  summary?: string;
  summaryEn?: string;
  publishedHi?: string;
  publishedEn?: string;
}
