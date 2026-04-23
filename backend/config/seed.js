const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Video = require("../models/Video");
const Article = require("../models/Article");
const { buildPayloads, SEED_TAG } = require("./articleSeedData");

async function seedAdmin() {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) return;

    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "Admin@1234", 12);
    await User.create({
      name:     process.env.SEED_ADMIN_NAME     || "Super Admin",
      email:    process.env.SEED_ADMIN_EMAIL    || "admin@kotharinews.com",
      password: hash,
      role:     "admin",
    });
    console.log("Admin account seeded:", process.env.SEED_ADMIN_EMAIL);
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}

async function seedSampleVideos() {
  try {
    const count = await Video.countDocuments();
    if (count > 0) return;

    const now = new Date();
    await Video.insertMany([
      {
        title: "PM मोदी का 'मन की बात' — देश से क्या बोले प्रधानमंत्री?",
        titleEn: "PM Modi's Mann Ki Baat — highlights",
        summary: "लोक कल्याण पर खास फोकस।",
        summaryEn: "Focus on public welfare.",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "28:42",
        views: "1.2M",
        category: "politics",
        sortOrder: 0,
        status: "published",
        publishedAt: now,
      },
      {
        title: "बजट 2025 विश्लेषण",
        titleEn: "Budget 2025 analysis",
        summary: "आम आदमी को क्या मिला?",
        summaryEn: "What the common citizen got.",
        youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        duration: "15:20",
        views: "890K",
        category: "business",
        sortOrder: 1,
        status: "published",
        publishedAt: now,
      },
      {
        title: "खेल हाइलाइट्स",
        titleEn: "Sports highlights",
        youtubeUrl: "https://youtu.be/9bZkp7q19f0",
        duration: "12:00",
        views: "2M",
        category: "sports",
        sortOrder: 2,
        status: "published",
        publishedAt: now,
      },
    ]);
    console.log("Sample published videos seeded (3).");
  } catch (err) {
    console.error("Video seed error:", err.message);
  }
}

async function seedSampleArticles() {
  try {
    const existing = await Article.countDocuments({ tags: SEED_TAG });
    if (existing > 0) {
      console.log("Sample articles already present (tag:", SEED_TAG + "), skip.");
      return;
    }
    const admin = await User.findOne({ role: "admin" }).select("_id").lean();
    if (!admin) {
      console.warn("seedSampleArticles: no admin user; run seed admin first.");
      return;
    }
    const batchId = Date.now().toString(36);
    const payloads = buildPayloads(admin._id, batchId);
    let ok = 0;
    for (const doc of payloads) {
      try {
        await Article.create(doc);
        ok += 1;
      } catch (err) {
        console.error("Article seed row failed:", err.message);
      }
    }
    console.log(`Sample articles seeded: ${ok}/${payloads.length} published (5 × 8 categories).`);
  } catch (err) {
    console.error("Article seed error:", err.message);
  }
}

async function seedAll() {
  await seedAdmin();
  await seedSampleVideos();
  await seedSampleArticles();
}

/** Run without starting the HTTP server (e.g. `node scripts/seedArticles.js`). */
async function seedArticlesOnly() {
  await seedAdmin();
  await seedSampleArticles();
}

module.exports = seedAll;
module.exports.seedArticlesOnly = seedArticlesOnly;
module.exports.seedSampleArticles = seedSampleArticles;
