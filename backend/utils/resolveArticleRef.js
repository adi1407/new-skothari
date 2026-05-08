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
 * Build a query filter for a single article by URL/API segment:
 * Mongo `_id` OR unique 9-digit `articleNumber`.
 */
function articleRefFilter(rawId, extra = {}) {
  if (isObjectIdString(rawId)) return { ...extra, _id: rawId };
  if (isNineDigitArticleNumber(rawId)) return { ...extra, articleNumber: Number(rawId) };
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
  articleRefFilter,
  resolvePublishedArticleMongoId,
};
