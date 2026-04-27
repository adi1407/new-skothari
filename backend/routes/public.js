const router = require("express").Router();
const Article = require("../models/Article");
const Video = require("../models/Video");

function localeMatchQuery(req) {
  const loc = String(req.query.locale || "").toLowerCase();
  if (loc === "hi") return { primaryLocale: "hi" };
  if (loc === "en") return { primaryLocale: { $in: ["en", null] } };
  return {};
}

// GET /api/public/videos — published only, for web /shows
router.get("/videos", async (req, res) => {
  try {
    const { category, limit = 30, page = 1 } = req.query;
    const q = { status: "published" };
    if (category) q.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [videos, total] = await Promise.all([
      Video.find(q)
        .sort({ sortOrder: 1, publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Video.countDocuments(q),
    ]);

    res.json({ videos, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/breaking — published + isBreaking, newest first
router.get("/breaking", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 15, 50);
    const articles = await Article.find({ status: "published", isBreaking: true, ...localeMatchQuery(req) })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("primaryLocale title titleHi category publishedAt isBreaking")
      .lean();

    res.json({ articles });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/search?q= — published articles only (for nav / site search)
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 12, 30);
    if (q.length < 2) {
      return res.json({ articles: [] });
    }

    const articles = await Article.find({
      status: "published",
      ...localeMatchQuery(req),
      $or: [
        { title: { $regex: q, $options: "i" } },
        { titleHi: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { summaryHi: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json({ articles });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/articles — no auth required, only published
router.get("/articles", async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const q = { status: "published", ...localeMatchQuery(req) };
    if (category) q.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(q)
        .populate("author", "name")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Article.countDocuments(q),
    ]);

    res.json({ articles, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/articles/:id — no auth required, published only
router.get("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: "published",
    }).populate("author", "name").lean();

    if (!article) return res.status(404).json({ message: "Article not found" });

    // Increment views (fire and forget)
    Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.json({ article });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
