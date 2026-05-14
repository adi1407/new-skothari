"use client";

import YoutubeThumbImg from "../../../components/YoutubeThumbImg";
import { youtubeVideoIdFromUrl } from "../../../utils/youtube";

export type ArticleYoutubeEmbedItem = {
  youtubeUrl: string;
  caption?: string;
};

type TFn = (hi: string, en: string) => string;

function watchUrlFromStored(url: string): string {
  const id = youtubeVideoIdFromUrl(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

export default function ArticleYoutubeEmbeds({
  items,
  t,
}: {
  items: ArticleYoutubeEmbedItem[];
  t: TFn;
}) {
  if (!items.length) return null;

  return (
    <div className="article-youtube-embeds" role="region" aria-label={t("वीडियो", "Video")}>
      {items.map((item, i) => {
        const id = youtubeVideoIdFromUrl(item.youtubeUrl);
        if (!id) return null;
        const href = watchUrlFromStored(item.youtubeUrl);
        const alt = item.caption?.trim() || t("यूट्यूब वीडियो", "YouTube video");
        return (
          <a
            key={`${id}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="article-youtube-card"
          >
            <div className="article-youtube-thumb-wrap">
              <YoutubeThumbImg
                youtubeUrl={item.youtubeUrl}
                alt={alt}
                className="article-youtube-thumb-img"
              />
              <div className="article-youtube-play-badge" aria-hidden>
                <span>▶</span>
              </div>
            </div>
            <div className="article-youtube-meta">
              <div className="article-youtube-label">{t("यूट्यूब पर देखें", "Watch on YouTube")}</div>
              {item.caption?.trim() ? (
                <p className="article-youtube-caption">{item.caption.trim()}</p>
              ) : null}
            </div>
          </a>
        );
      })}
    </div>
  );
}
