/** 11-char YouTube video id */
const ID_RE = /^[\w-]{11}$/;

/**
 * Extract video id from watch, youtu.be, embed, or shorts URLs.
 */
export function youtubeVideoIdFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim(), "https://www.youtube.com");
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
      if (embed?.[1] && ID_RE.test(embed[1])) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shorts?.[1] && ID_RE.test(shorts[1])) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}
