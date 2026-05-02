/**
 * Duplicate existing published English-primary seed articles as Hindi-primary.
 * Safe to run multiple times (idempotent via `seed-source:<id>` tag marker).
 *
 * Usage (repo root):
 *   npm run seed:hindi --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGO_URI / MONGODB_URI in backend/.env");

  await mongoose.connect(uri);

  const sourceArticles = await Article.find({
    status: "published",
    tags: "khabar-seed-2026",
    $or: [{ primaryLocale: "en" }, { primaryLocale: { $exists: false } }, { primaryLocale: null }],
  }).lean();

  let created = 0;
  let skipped = 0;

  for (const src of sourceArticles) {
    const sourceTag = `seed-source:${src._id}`;
    const alreadyExists = await Article.findOne({
      primaryLocale: "hi",
      tags: sourceTag,
    })
      .select("_id")
      .lean();

    if (alreadyExists) {
      skipped += 1;
      continue;
    }

    const doc = {
      primaryLocale: "hi",
      title: "",
      titleHi: src.titleHi || src.title || "",
      summary: "",
      summaryHi: src.summaryHi || src.summary || "",
      body: "",
      bodyHi: src.bodyHi || src.body || "",
      images: src.images || [],
      category: src.category,
      tags: [...new Set([...(src.tags || []), "khabar-seed-2026-hi", sourceTag])],
      isBreaking: !!src.isBreaking,
      status: src.status || "published",
      author: src.author,
      publishedAt: src.publishedAt || new Date(),
      task: null,
      views: 0,
    };

    await Article.create(doc);
    created += 1;
  }

  console.log("seed-hindi-from-existing", {
    sourceCount: sourceArticles.length,
    created,
    skipped,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
