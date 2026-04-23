import { useEffect, useMemo, useState } from "react";
import { youtubeVideoIdFromUrl } from "../utils/youtube";

type Props = {
  youtubeUrl: string;
  alt: string;
  className?: string;
  /** Used when URL has no id or the CDN image fails */
  fallbackSrc?: string;
};

function hqThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * YouTube poster (hqdefault) with one-step fallback to a static thumbnail.
 */
export default function YoutubeThumbImg({ youtubeUrl, alt, className, fallbackSrc }: Props) {
  const id = useMemo(() => youtubeVideoIdFromUrl(youtubeUrl), [youtubeUrl]);
  const primary = id ? hqThumb(id) : (fallbackSrc ?? "");
  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(primary || fallbackSrc || "");
  }, [primary, fallbackSrc]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (fallbackSrc && src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}
