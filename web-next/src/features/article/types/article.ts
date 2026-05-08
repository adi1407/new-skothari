/**
 * Article feature types — re-exports domain types and shared literals used across components.
 */
import type { ContentArticle } from "../../../services/contentTypes";

export type NewsItem = ContentArticle;

/** Accent colors keyed by public category slug */
export type CategoryColorMap = Record<string, string>;
