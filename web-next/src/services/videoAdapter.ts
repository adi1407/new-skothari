import type { BackendVideo } from "./newsApi";
import type { VideoItem } from "../data/mockData";
import { withPublicOrigin } from "../config/publicApi";

const CAT_HI: Record<string, string> = {
  desh:       "देश",
  videsh:     "विदेश",
  rajneeti:   "राजनीति",
  khel:       "खेल",
  health:     "स्वास्थ्य",
  krishi:     "कृषि",
  business:   "व्यापार",
  manoranjan: "मनोरंजन",
};

const CAT_EN: Record<string, string> = {
  desh:       "Country",
  videsh:     "World",
  rajneeti:   "Politics",
  khel:       "Sports",
  health:     "Health",
  krishi:     "Agriculture",
  business:   "Business",
  manoranjan: "Entertainment",
};

function relativePublished(dateStr?: string): { hi: string; en: string } {
  if (!dateStr) return { hi: "", en: "" };
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return { hi: "अभी", en: "Just now" };
  if (mins < 60) return { hi: `${mins} मिनट पहले`, en: `${mins} min ago` };
  if (hours < 24) return { hi: `${hours} घंटे पहले`, en: `${hours} hour${hours > 1 ? "s" : ""} ago` };
  if (days < 7) return { hi: `${days} दिन पहले`, en: `${days} day${days > 1 ? "s" : ""} ago` };
  return {
    hi: new Date(dateStr).toLocaleDateString("hi-IN"),
    en: new Date(dateStr).toLocaleDateString("en-IN"),
  };
}

export function adaptVideo(v: BackendVideo): VideoItem {
  const slug = v.category || "desh";
  const rel = relativePublished(v.publishedAt ?? v.createdAt);
  const thumbRaw = (v.thumbnailOverride || "").trim();
  const pl = v.primaryLocale === "hi" ? "hi" : "en";
  const rawHiLine = pl === "hi" ? String(v.title || "").trim() : String(v.titleEn || "").trim();
  const rawEnLine = pl === "hi" ? String(v.titleEn || "").trim() : String(v.title || "").trim();
  const titleHiUi = rawHiLine || rawEnLine;
  const titleEnUi = rawEnLine || rawHiLine;

  const rawSumHi = pl === "hi" ? String(v.summary || "").trim() : String(v.summaryEn || v.summary || "").trim();
  const rawSumEn = pl === "hi" ? String(v.summaryEn || v.summary || "").trim() : String(v.summary || "").trim();

  return {
    id: v._id,
    title: titleHiUi,
    titleEn: titleEnUi,
    thumbnail: thumbRaw ? withPublicOrigin(thumbRaw) : "",
    duration: v.duration ?? "",
    views: v.views ?? "",
    category: CAT_HI[slug] ?? slug,
    categoryEn: CAT_EN[slug] ?? slug,
    youtubeUrl: v.youtubeUrl,
    summary: rawSumHi || rawSumEn,
    summaryEn: rawSumEn || rawSumHi,
    publishedHi: rel.hi,
    publishedEn: rel.en,
  };
}

export function adaptVideos(videos: BackendVideo[]): VideoItem[] {
  return videos.map(adaptVideo);
}
