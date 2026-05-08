import { useEffect, useState } from "react";
import { adaptVideos } from "../../../services/videoAdapter";
import { getPublishedVideos } from "../services/showsApi";
import type { VideoItem } from "../types/shows";

export function useShowsVideos(lang: "hi" | "en") {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    getPublishedVideos({ limit: 60, locale: lang }).then((raw) => setVideos(adaptVideos(raw)));
  }, [lang]);

  return videos;
}
