/**
 * Replace ALL articles with 100 English + 100 Hindi published stories (CMS format).
 *
 * - Deletes every article, then clears Task.article links.
 * - Content is generated programmatically (category rotation, unique slug/articleNumber).
 * - Author = first admin; desk writers/editors from roster when present.
 *
 * Run from repo root:
 *   npm run seed:news-200 --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Article = require("../models/Article");
const Task = require("../models/Task");

const NEW_TAG = "khabar-news-200-v1";
const COUNT_PER_LOCALE = 100;

const CATEGORIES = [
  "desh",
  "videsh",
  "rajneeti",
  "khel",
  "health",
  "krishi",
  "business",
  "manoranjan",
];

function img(seed) {
  return `https://picsum.photos/seed/${seed}/1200/675`;
}

function imageWithMeta({ seed, caption, isHero, titleForAlt }) {
  const alt = isHero ? `Hero: ${titleForAlt}`.slice(0, 200) : `Inline: ${titleForAlt}`.slice(0, 200);
  return {
    url: img(seed),
    caption: caption || "",
    isHero: !!isHero,
    alt,
    imageTitle: String(titleForAlt || "News image").slice(0, 120),
    imageDescription: isHero
      ? "Lead photograph for this article (seed/demo)."
      : "Supporting photograph for this article (seed/demo).",
    source: "Picsum / seed demo",
  };
}

function enBody(lead, extras) {
  const paragraphs = [
    `<p>${lead}</p>`,
    "<p>Officials briefed reporters that coordination meetings are planned across affected districts and a central monitoring desk has been activated.</p>",
    ...extras.map((p) => `<p>${p}</p>`),
    "<p>Our newsroom will keep updating this report with verified developments and on-ground reactions.</p>",
  ];
  return paragraphs.join("");
}

function hiBody(lead, extras) {
  const paragraphs = [
    `<p>${lead}</p>`,
    "<p>अधिकारियों ने पत्रकारों को बताया कि प्रभावित जिलों में समन्वय बैठकों की योजना है और एक केंद्रीय निगरानी डेस्क सक्रिय कर दिया गया है।</p>",
    ...extras.map((p) => `<p>${p}</p>`),
    "<p>पुष्ट अपडेट और ज़मीनी प्रतिक्रियाओं के साथ इस रिपोर्ट को लगातार अपडेट किया जाएगा।</p>",
  ];
  return paragraphs.join("");
}

function readTimeFromHtml(html) {
  const words = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return words ? Math.max(1, Math.ceil(words / 200)) : 1;
}

function buildPayloads(ctx) {
  const { authorId, writerEn, writerHi, editorEn, editorHi } = ctx;
  const deskEn = { writerEn, writerHi, editorEn, editorHi };
  const docs = [];
  const baseTime = Date.now();
  let seq = 0;
  const ts = () => new Date(baseTime - seq++ * 3 * 60 * 1000);

  for (let idx = 0; idx < COUNT_PER_LOCALE; idx += 1) {
    const category = CATEGORIES[idx % CATEGORIES.length];
    const seedTag = `en-${category}-${idx + 1}`;
    const n = 710000001 + idx;
    const slug = `s200e${String(idx + 1).padStart(3, "0")}`;
    const title = `Seed EN ${idx + 1}: ${category} — desk briefing update`;
    const summary = `Automated English seed #${idx + 1} in ${category}; mirrors CMS fields for hero images, summary, and published workflow.`.slice(
      0,
      500
    );
    const lead = `This is English-primary seed story #${idx + 1} (${category}). It exercises bilingual desk flags, metadata, and public URL shape.`;
    const extras = [
      `Desk note ${idx + 1}: editors validated category "${category}" and tagging for mixed home feeds.`,
      "Stakeholders emphasised transparent timelines and district-level follow-ups in the next review window.",
    ];
    const body = enBody(lead, extras);
    docs.push({
      primaryLocale: "en",
      articleNumber: n,
      slug,
      title,
      titleHi: "",
      summary,
      summaryHi: "",
      body,
      bodyHi: "",
      metaTitle: title.slice(0, 250),
      metaDescription: summary.slice(0, 500),
      metaTitleHi: "",
      metaDescriptionHi: "",
      metaKeywords: `${category}, india, news, seed200`,
      images: [
        imageWithMeta({
          seed: `200-en-${category}-${idx + 1}-hero`,
          caption: title.slice(0, 200),
          isHero: true,
          titleForAlt: title,
        }),
        imageWithMeta({
          seed: `200-en-${category}-${idx + 1}-inline`,
          caption: "File image",
          isHero: false,
          titleForAlt: title,
        }),
      ],
      category,
      tags: [category, "khabar-kothri", NEW_TAG, seedTag],
      isBreaking: idx === 0,
      status: "published",
      enDeskComplete: true,
      hiDeskComplete: false,
      author: authorId,
      ...deskEn,
      publishedAt: ts(),
      readTime: readTimeFromHtml(body),
      views: 100 + idx,
    });
  }

  for (let idx = 0; idx < COUNT_PER_LOCALE; idx += 1) {
    const category = CATEGORIES[idx % CATEGORIES.length];
    const seedTag = `hi-${category}-${idx + 1}`;
    const n = 720000001 + idx;
    const slug = `s200h${String(idx + 1).padStart(3, "0")}`;
    const titleHi = `सीड HI ${idx + 1}: ${category} — डेस्क ब्रीफिंग अपडेट`.slice(0, 250);
    const summaryHi = `स्वचालित हिंदी सीड #${idx + 1} (${category}); हीरो चित्र, सार और प्रकाशित वर्कफ़्लो के लिए फ़ील्ड जाँच।`.slice(
      0,
      500
    );
    const lead = `यह हिंदी-प्राथमिक सीड कहानी #${idx + 1} (${category}) है; यह द्विभाषी डेस्क ध्वजों और सार्वजनिक URL आकार का परीक्षण करती है।`;
    const extras = [
      `डेस्क नोट ${idx + 1}: संपादकों ने श्रेणी "${category}" और मिश्रित होम फ़ीड के लिए टैगिंग सत्यापित की।`,
      "हितधारकों ने अगली समीक्षा खिड़की में पारदर्शी समयसीमा और जिला स्तर पर अनुवर्ती पर जोर दिया।",
    ];
    const bodyHi = hiBody(lead, extras);
    docs.push({
      primaryLocale: "hi",
      articleNumber: n,
      slug,
      title: "",
      titleHi,
      summary: "",
      summaryHi,
      body: "",
      bodyHi,
      metaTitle: "",
      metaDescription: "",
      metaTitleHi: titleHi.slice(0, 250),
      metaDescriptionHi: summaryHi.slice(0, 500),
      metaKeywords: `${category}, samachar, hindi, seed200`,
      images: [
        imageWithMeta({
          seed: `200-hi-${category}-${idx + 1}-hero`,
          caption: titleHi.slice(0, 200),
          isHero: true,
          titleForAlt: titleHi,
        }),
        imageWithMeta({
          seed: `200-hi-${category}-${idx + 1}-inline`,
          caption: "फ़ाइल चित्र",
          isHero: false,
          titleForAlt: titleHi,
        }),
      ],
      category,
      tags: [category, "khabar-kothri", NEW_TAG, seedTag],
      isBreaking: idx === 0,
      status: "published",
      enDeskComplete: false,
      hiDeskComplete: true,
      author: authorId,
      ...deskEn,
      publishedAt: ts(),
      readTime: readTimeFromHtml(bodyHi),
      views: 100 + idx,
    });
  }

  return docs;
}

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) {
    throw new Error("No admin user found. Please run admin seed first.");
  }

  const [wEn, wHi, eEn, eHi] = await Promise.all([
    User.findOne({ role: "writer_en", isActive: true }).select("_id").lean(),
    User.findOne({ role: "writer_hi", isActive: true }).select("_id").lean(),
    User.findOne({ role: "editor_en", isActive: true }).select("_id").lean(),
    User.findOne({ role: "editor_hi", isActive: true }).select("_id").lean(),
  ]);
  const chief = await User.findOne({ role: "editor", isActive: true }).select("_id").lean();

  const authorId = admin._id;
  const writerEn = wEn?._id || authorId;
  const writerHi = wHi?._id || authorId;
  const editorEn = eEn?._id || chief?._id || authorId;
  const editorHi = eHi?._id || chief?._id || authorId;

  const beforeArticles = await Article.countDocuments();
  const taskUnlink = await Task.updateMany({ article: { $ne: null } }, { $set: { article: null } });
  const del = await Article.deleteMany({});

  const payloads = buildPayloads({
    authorId,
    writerEn,
    writerHi,
    editorEn,
    editorHi,
  });

  let inserted = 0;
  try {
    const res = await Article.insertMany(payloads, { ordered: false });
    inserted = res.length;
  } catch (err) {
    if (err?.insertedDocs?.length) {
      inserted = err.insertedDocs.length;
    }
    console.error("insertMany partial failure:", err.message);
    throw err;
  }

  const totalEn = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "en" });
  const totalHi = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "hi" });
  const totalAll = await Article.countDocuments();

  const sample = await Article.find({ tags: NEW_TAG })
    .select("primaryLocale articleNumber slug title titleHi")
    .sort({ articleNumber: 1 })
    .limit(6)
    .lean();

  const byCategory = await Article.aggregate([
    { $match: { tags: NEW_TAG } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log("seed-news-200 complete:", {
    deletedArticles: del.deletedCount,
    articlesBefore: beforeArticles,
    tasksArticleCleared: taskUnlink.modifiedCount,
    inserted,
    totalArticlesNow: totalAll,
    english: totalEn,
    hindi: totalHi,
    expectedPerLocale: COUNT_PER_LOCALE,
    sampleSlugsAndNumbers: sample,
    byCategory: byCategory.reduce((m, r) => ({ ...m, [r._id]: r.count }), {}),
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
