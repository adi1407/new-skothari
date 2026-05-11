const mongoose = require("mongoose");

/** Public hero image dimensions (strict CMS upload). */
const HERO_IMAGE_WIDTH = 2180;
const HERO_IMAGE_HEIGHT = 750;

function isNineDigitArticleNumber(str) {
  return typeof str === "string" && /^\d{9}$/.test(str);
}

/** True when string is a 24-char hex Mongo ObjectId. */
function isObjectIdString(str) {
  return mongoose.Types.ObjectId.isValid(str) && String(new mongoose.Types.ObjectId(str)) === str;
}

/**
 * Match `/article/{slug}-{9digits}` segment: slug is non-empty, last segment after final hyphen is 9 digits.
 * Returns { slug, articleNumber } or null.
 */
function parseSlugArticleNumber(raw) {
  const s = String(raw || "").trim();
  const m = /^(.+)-(\d{9})$/.exec(s);
  if (!m) return null;
  const slug = m[1].replace(/^-+|-+$/g, "");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
  return { slug, articleNumber: Number(m[2]) };
}

/**
 * Build a query filter for a single article by URL/API segment:
 * Mongo `_id` OR unique 9-digit `articleNumber` OR `{slug, articleNumber}` composite.
 */
function articleRefFilter(rawId, extra = {}) {
  const s = String(rawId || "").trim();
  if (isObjectIdString(s)) return { ...extra, _id: s };
  if (isNineDigitArticleNumber(s)) return { ...extra, articleNumber: Number(s) };
  const parsed = parseSlugArticleNumber(s);
  if (parsed) {
    return { ...extra, articleNumber: parsed.articleNumber, slug: parsed.slug };
  }
  return null;
}

/**
 * Resolve a URL/API segment to a published article's Mongo `_id`, or null.
 */
async function resolvePublishedArticleMongoId(Article, raw) {
  const ref = articleRefFilter(String(raw || ""));
  if (!ref) return null;
  const doc = await Article.findOne({ ...ref, status: "published" }).select("_id").lean();
  return doc ? String(doc._id) : null;
}

module.exports = {
  HERO_IMAGE_WIDTH,
  HERO_IMAGE_HEIGHT,
  isNineDigitArticleNumber,
  isObjectIdString,
  parseSlugArticleNumber,
  articleRefFilter,
  resolvePublishedArticleMongoId,
};
