/**
 * Backfill unique articleNumber (9-digit) for articles missing it.
 * Usage: node scripts/migrate-article-numbers.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function pickUniqueNumber() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const n = 100000000 + Math.floor(Math.random() * 900000000);
    /* eslint-disable no-await-in-loop */
    const clash = await Article.findOne({ articleNumber: n }).select("_id").lean();
    /* eslint-enable no-await-in-loop */
    if (!clash) return n;
  }
  throw new Error("Could not allocate article number");
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kothari-news";
  await mongoose.connect(uri);
  const missing = await Article.find({
    $or: [{ articleNumber: null }, { articleNumber: { $exists: false } }],
  })
    .select("_id")
    .lean();

  let ok = 0;
  for (const row of missing) {
    const num = await pickUniqueNumber();
    await Article.updateOne({ _id: row._id }, { $set: { articleNumber: num } });
    ok += 1;
    if (ok % 50 === 0) process.stdout.write(`… ${ok}\n`);
  }

  console.log(`migrate-article-numbers: updated ${ok} articles`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
