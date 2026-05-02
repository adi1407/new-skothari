/**
 * Remove ALL articles from the database.
 *
 * Use when you want to clear demo/seed content so writers can publish fresh articles
 * via the CMS. Does NOT touch users, videos, or other collections.
 *
 * Usage (from repo root):
 *   node backend/scripts/clear-articles.js
 * or:
 *   npm run articles:clear --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Article = require("../models/Article");

async function run() {
  await connectDB();

  const before = await Article.countDocuments();
  const result = await Article.deleteMany({});

  console.log("clear-articles:", {
    articlesBefore: before,
    deleted: result.deletedCount,
    articlesAfter: await Article.countDocuments(),
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
