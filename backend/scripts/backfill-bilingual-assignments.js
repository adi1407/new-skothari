require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGO_URI / MONGODB_URI");
  await mongoose.connect(uri);

  const cursor = Article.find({}).cursor();
  let scanned = 0;
  let updated = 0;
  const incomplete = [];

  for (let article = await cursor.next(); article != null; article = await cursor.next()) {
    scanned += 1;
    let dirty = false;

    if (!article.writerEn) {
      article.writerEn = article.author || null;
      dirty = true;
    }
    if (!article.writerHi) {
      article.writerHi = article.author || null;
      dirty = true;
    }
    if (!article.editorEn && article.lastEditedBy) {
      article.editorEn = article.lastEditedBy;
      dirty = true;
    }
    if (!article.editorHi && article.lastEditedBy) {
      article.editorHi = article.lastEditedBy;
      dirty = true;
    }

    if (dirty) {
      await article.save();
      updated += 1;
    }

    const missing =
      !String(article.title || "").trim() ||
      !String(article.titleHi || "").trim() ||
      !String(article.summary || "").trim() ||
      !String(article.summaryHi || "").trim() ||
      !String(article.body || "").trim() ||
      !String(article.bodyHi || "").trim() ||
      !article.writerEn ||
      !article.writerHi ||
      !article.editorEn ||
      !article.editorHi ||
      !Array.isArray(article.images) ||
      article.images.length === 0 ||
      article.images.some(
        (img) =>
          !String(img.source || "").trim() ||
          !String(img.imageDescription || "").trim() ||
          !String(img.alt || "").trim() ||
          !String(img.imageTitle || "").trim()
      );
    if (missing) {
      incomplete.push(article.articleNumber || String(article._id));
    }
  }

  console.log("backfill-bilingual-assignments", {
    scanned,
    updated,
    incompleteCount: incomplete.length,
    incompleteSample: incomplete.slice(0, 25),
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
