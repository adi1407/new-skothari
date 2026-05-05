/**
 * Remove seeded demo content only (keeps real editorial content).
 *
 * Usage:
 *   node backend/scripts/cleanup-seeded-content.js
 *   npm run seed:cleanup --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Article = require("../models/Article");
const Video = require("../models/Video");

const ARTICLE_SEED_TAG = "khabar-seed-2026";
const VIDEO_SEED_TAG = "khabar-video-seed-2026";

async function run() {
  await connectDB();

  const [beforeArticles, beforeVideos] = await Promise.all([
    Article.countDocuments(),
    Video.countDocuments(),
  ]);

  const [articleDelete, videoDelete] = await Promise.all([
    Article.deleteMany({ tags: ARTICLE_SEED_TAG }),
    Video.deleteMany({ seedTag: VIDEO_SEED_TAG }),
  ]);

  const [afterArticles, afterVideos] = await Promise.all([
    Article.countDocuments(),
    Video.countDocuments(),
  ]);

  console.log("cleanup-seeded-content:", {
    articleSeedTag: ARTICLE_SEED_TAG,
    videoSeedTag: VIDEO_SEED_TAG,
    articlesBefore: beforeArticles,
    articlesDeleted: articleDelete.deletedCount,
    articlesAfter: afterArticles,
    videosBefore: beforeVideos,
    videosDeleted: videoDelete.deletedCount,
    videosAfter: afterVideos,
  });
}

run()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });
