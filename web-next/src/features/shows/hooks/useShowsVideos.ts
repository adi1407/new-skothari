import { useEffect, useState } from "react";
import type { VideoItem } from "../../../data/mockData";
import { adaptVideos } from "../../../services/videoAdapter";
import { getPublishedVideos } from "../services/showsApi";

export function useShowsVideos(lang: "hi" | "en") {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    getPublishedVideos({ limit: 60, locale: lang }).then((raw) => setVideos(adaptVideos(raw)));
  }, [lang]);

  return videos;
}
