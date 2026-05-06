/**
 * Article feature types — re-exports domain types and shared literals used across components.
 */
import type { NewsItem } from "../../../data/mockData";

export type { NewsItem };

/** Accent colors keyed by public category slug */
export type CategoryColorMap = Record<string, string>;
