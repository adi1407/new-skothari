import type { BackendVideo } from "./newsApi";
import type { VideoItem } from "../data/mockData";
import { withPublicOrigin } from "../config/publicApi";

const CAT_HI: Record<string, string> = {
  politics: "राजनीति",
  sports: "खेल",
  tech: "तकनीक",
  business: "व्यापार",
  entertainment: "मनोरंजन",
  health: "स्वास्थ्य",
  world: "विश्व",
  state: "राज्य",
};

const CAT_EN: Record<string, string> = {
  politics: "Politics",
  sports: "Sports",
  tech: "Tech",
  business: "Business",
  entertainment: "Entertainment",
  health: "Health",
  world: "World",
  state: "State",
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
  const slug = v.category || "politics";
  const rel = relativePublished(v.publishedAt ?? v.createdAt);
  const thumbRaw = (v.thumbnailOverride || "").trim();
  return {
    id: v._id,
    title: v.title,
    titleEn: v.titleEn ?? v.title,
    thumbnail: thumbRaw ? withPublicOrigin(thumbRaw) : "",
    duration: v.duration ?? "",
    views: v.views ?? "",
    category: CAT_HI[slug] ?? slug,
    categoryEn: CAT_EN[slug] ?? slug,
    youtubeUrl: v.youtubeUrl,
    summary: v.summary ?? "",
    summaryEn: v.summaryEn ?? v.summary ?? "",
    publishedHi: rel.hi,
    publishedEn: rel.en,
  };
}

export function adaptVideos(videos: BackendVideo[]): VideoItem[] {
  return videos.map(adaptVideo);
}
