/** Max YouTube clips per article (routes enforce same). */
const MAX_ARTICLE_YOUTUBE_EMBEDS = 5;

const YT_HOST = /youtube\.com|youtu\.be/i;
const ID_RE = /^[\w-]{11}$/;

function isLikelyYoutubeHostname(hostname) {
  const h = String(hostname || "").replace(/^www\./, "");
  return YT_HOST.test(h);
}

/**
 * Extract 11-char video id from watch, youtu.be, embed, or shorts URLs.
 * @param {string} url
 * @returns {string|null}
 */
function youtubeVideoIdFromUrl(url) {
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

function canonicalWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Normalize and validate `youtubeEmbeds` from request body.
 * @param {unknown} raw
 * @returns {{ ok: true, value: Array<{ youtubeUrl: string, caption: string }> } | { ok: false, message: string }}
 */
function parseArticleYoutubeEmbeds(raw) {
  if (raw === undefined) {
    return { ok: true, value: undefined };
  }
  if (raw === null) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false, message: "youtubeEmbeds must be an array" };
  }
  if (raw.length > MAX_ARTICLE_YOUTUBE_EMBEDS) {
    return { ok: false, message: `At most ${MAX_ARTICLE_YOUTUBE_EMBEDS} YouTube clips allowed per article` };
  }

  const out = [];
  for (let i = 0; i < raw.length; i += 1) {
    const row = raw[i];
    if (row == null || typeof row !== "object") {
      return { ok: false, message: `Invalid YouTube embed at index ${i}` };
    }
    const urlIn = String(row.youtubeUrl ?? "").trim();
    if (!urlIn) continue;

    let hostOk = false;
    try {
      hostOk = isLikelyYoutubeHostname(new URL(urlIn).hostname);
    } catch {
      hostOk = false;
    }
    if (!hostOk) {
      return { ok: false, message: `Invalid YouTube URL at index ${i}` };
    }

    const id = youtubeVideoIdFromUrl(urlIn);
    if (!id) {
      return { ok: false, message: `Could not read YouTube video id from URL at index ${i}` };
    }

    const caption = String(row.caption ?? "")
      .trim()
      .slice(0, 220);
    out.push({ youtubeUrl: canonicalWatchUrl(id), caption });
  }

  return { ok: true, value: out };
}

module.exports = {
  MAX_ARTICLE_YOUTUBE_EMBEDS,
  youtubeVideoIdFromUrl,
  parseArticleYoutubeEmbeds,
  canonicalWatchUrl,
};
