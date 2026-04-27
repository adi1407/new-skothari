/**
 * One-time: set primaryLocale to "en" on all articles missing it (legacy data).
 * Run from repo root: node backend/scripts/migrate-primary-locale.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const res = await Article.updateMany(
    { $or: [{ primaryLocale: { $exists: false } }, { primaryLocale: null }, { primaryLocale: "" }] },
    { $set: { primaryLocale: "en" } }
  );
  console.log("migrate-primary-locale:", { matched: res.matchedCount, modified: res.modifiedCount });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
