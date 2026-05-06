import { fetchPublishedVideos } from "../../../services/newsApi";

/** Thin wrapper so shows feature imports stay under `features/shows`. */
export function getPublishedVideos(opts: Parameters<typeof fetchPublishedVideos>[0]) {
  return fetchPublishedVideos(opts);
}
