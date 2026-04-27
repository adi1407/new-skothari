const crypto = require("crypto");
const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Reader = require("../models/Reader");
const ReaderProfile = require("../models/ReaderProfile");
const Bookmark = require("../models/Bookmark");
const ReaderArticleView = require("../models/ReaderArticleView");
const ReaderSession = require("../models/ReaderSession");
const RecommendationSignal = require("../models/RecommendationSignal");
const Article = require("../models/Article");
const { authenticateReader, signReaderToken, readerPublic } = require("../middleware/readerAuth");

function err400(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function ensureProfile(readerId) {
  let profile = await ReaderProfile.findOne({ reader: readerId });
  if (!profile) {
    profile = await ReaderProfile.create({ reader: readerId });
  }
  return profile;
}

function sessionPayload(req) {
  return {
    sessionId: crypto.randomUUID(),
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || req.socket?.remoteAddress || "",
    lastSeenAt: new Date(),
  };
}

// Google-only (lightweight): client sends verified identity payload from Google SDK.
router.post(
  "/auth/google",
  [
    body("email").isEmail().normalizeEmail(),
    body("name").trim().notEmpty(),
    body("googleId").optional().trim().notEmpty(),
    body("avatar").optional().isString(),
  ],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const { email, name, googleId, avatar = "" } = req.body;
      let reader = await Reader.findOne({ email });
      if (!reader) {
        reader = await Reader.create({ email, name, googleId: googleId || null, avatar });
      } else {
        reader.name = name || reader.name;
        if (googleId) reader.googleId = googleId;
        if (avatar) reader.avatar = avatar;
      }
      reader.lastLogin = new Date();
      await reader.save();

      const profile = await ensureProfile(reader._id);
      const sp = sessionPayload(req);
      const session = await ReaderSession.create({ reader: reader._id, ...sp });
      const token = signReaderToken(reader, session.sessionId);

      res.json({ token, reader: readerPublic(reader, profile) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/me", authenticateReader, async (req, res) => {
  try {
    const profile = await ensureProfile(req.reader._id);
    if (req.readerSessionId) {
      await ReaderSession.findOneAndUpdate(
        { reader: req.reader._id, sessionId: req.readerSessionId, revokedAt: null },
        { $set: { lastSeenAt: new Date() } }
      );
    }
    res.json({ reader: readerPublic(req.reader, profile) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/preferences",
  authenticateReader,
  [
    body("primaryLanguage").optional().isIn(["hi", "en"]),
    body("preferredCategories").optional().isArray(),
    body("followedTopics").optional().isArray(),
    body("newsletterEnabled").optional().isBoolean(),
    body("newsletterTopics").optional().isArray(),
    body("digestCadence").optional().isIn(["daily", "weekly", "off"]),
  ],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const profile = await ensureProfile(req.reader._id);
      const fields = [
        "primaryLanguage",
        "preferredCategories",
        "followedTopics",
        "newsletterEnabled",
        "newsletterTopics",
        "digestCadence",
      ];
      fields.forEach((k) => {
        if (req.body[k] !== undefined) profile[k] = req.body[k];
      });
      await profile.save();
      res.json({ profile });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/profile",
  authenticateReader,
  [
    body("bio").optional().isLength({ max: 300 }),
    body("profileVisibility").optional().isIn(["private", "public"]),
    body("avatarOverride").optional().isString(),
    body("socialLinks").optional().isObject(),
  ],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const profile = await ensureProfile(req.reader._id);
      ["bio", "profileVisibility", "avatarOverride", "socialLinks"].forEach((k) => {
        if (req.body[k] !== undefined) profile[k] = req.body[k];
      });
      await profile.save();
      res.json({ profile });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/bookmarks", authenticateReader, async (req, res) => {
  try {
    const rows = await Bookmark.find({ reader: req.reader._id })
      .populate({
        path: "article",
        match: { status: "published" },
        select: "primaryLocale title titleHi summary summaryHi category images publishedAt createdAt readTime isBreaking views author body bodyHi",
      })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ bookmarks: rows.filter((r) => r.article) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/bookmarks",
  authenticateReader,
  [body("articleId").isMongoId()],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const exists = await Article.findOne({ _id: req.body.articleId, status: "published" }).select("_id");
      if (!exists) return res.status(404).json({ message: "Article not found" });
      const bookmark = await Bookmark.findOneAndUpdate(
        { reader: req.reader._id, article: req.body.articleId },
        { $setOnInsert: { reader: req.reader._id, article: req.body.articleId } },
        { upsert: true, new: true }
      );
      await RecommendationSignal.create({
        reader: req.reader._id,
        article: req.body.articleId,
        category: "",
        eventType: "bookmark",
        weight: 3,
      });
      res.status(201).json({ bookmark });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete("/bookmarks/:articleId", authenticateReader, async (req, res) => {
  try {
    await Bookmark.deleteOne({ reader: req.reader._id, article: req.params.articleId });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/history", authenticateReader, async (req, res) => {
  try {
    const rows = await ReaderArticleView.find({ reader: req.reader._id })
      .populate({
        path: "article",
        match: { status: "published" },
        select: "primaryLocale title titleHi summary summaryHi category images publishedAt createdAt readTime isBreaking views author body bodyHi",
      })
      .sort({ lastViewedAt: -1 })
      .lean();
    res.json({ history: rows.filter((r) => r.article) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/history",
  authenticateReader,
  [
    body("articleId").isMongoId(),
    body("progressPct").optional().isFloat({ min: 0, max: 100 }),
    body("readSeconds").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const exists = await Article.findOne({ _id: req.body.articleId, status: "published" }).select("category");
      if (!exists) return res.status(404).json({ message: "Article not found" });
      const view = await ReaderArticleView.findOneAndUpdate(
        { reader: req.reader._id, article: req.body.articleId },
        {
          $set: {
            progressPct: req.body.progressPct || 0,
            readSeconds: req.body.readSeconds || 0,
            lastViewedAt: new Date(),
          },
          $setOnInsert: { reader: req.reader._id, article: req.body.articleId },
        },
        { upsert: true, new: true }
      );
      await RecommendationSignal.create({
        reader: req.reader._id,
        article: req.body.articleId,
        category: exists.category || "",
        eventType: req.body.progressPct >= 90 ? "complete" : "view",
        weight: req.body.progressPct >= 90 ? 2 : 1,
        meta: { progressPct: req.body.progressPct || 0 },
      });
      res.status(201).json({ view });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete("/history/:articleId", authenticateReader, async (req, res) => {
  try {
    await ReaderArticleView.deleteOne({ reader: req.reader._id, article: req.params.articleId });
    res.json({ message: "History item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/history", authenticateReader, async (req, res) => {
  try {
    await ReaderArticleView.deleteMany({ reader: req.reader._id });
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/sessions", authenticateReader, async (req, res) => {
  try {
    const sessions = await ReaderSession.find({ reader: req.reader._id, revokedAt: null })
      .sort({ lastSeenAt: -1 })
      .lean();
    res.json({
      sessions: sessions.map((s) => ({
        ...s,
        isCurrent: req.readerSessionId && s.sessionId === req.readerSessionId,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/sessions/:sessionId", authenticateReader, async (req, res) => {
  try {
    await ReaderSession.findOneAndUpdate(
      { reader: req.reader._id, sessionId: req.params.sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    res.json({ message: "Session revoked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/sessions/logout-all", authenticateReader, async (req, res) => {
  try {
    const q = { reader: req.reader._id, revokedAt: null };
    if (req.readerSessionId) q.sessionId = { $ne: req.readerSessionId };
    await ReaderSession.updateMany(q, { $set: { revokedAt: new Date() } });
    res.json({ message: "Logged out from all other sessions" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/export", authenticateReader, async (req, res) => {
  try {
    const [profile, bookmarks, history, sessions, signals] = await Promise.all([
      ensureProfile(req.reader._id),
      Bookmark.find({ reader: req.reader._id }).lean(),
      ReaderArticleView.find({ reader: req.reader._id }).lean(),
      ReaderSession.find({ reader: req.reader._id }).lean(),
      RecommendationSignal.find({ reader: req.reader._id }).sort({ createdAt: -1 }).limit(500).lean(),
    ]);
    res.json({
      exportedAt: new Date().toISOString(),
      reader: readerPublic(req.reader, profile),
      bookmarks,
      history,
      sessions,
      signals,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/account", authenticateReader, async (req, res) => {
  try {
    await Promise.all([
      ReaderSession.updateMany({ reader: req.reader._id, revokedAt: null }, { $set: { revokedAt: new Date() } }),
      Bookmark.deleteMany({ reader: req.reader._id }),
      ReaderArticleView.deleteMany({ reader: req.reader._id }),
      RecommendationSignal.deleteMany({ reader: req.reader._id }),
      ReaderProfile.deleteOne({ reader: req.reader._id }),
    ]);
    req.reader.isActive = false;
    await req.reader.save();
    res.json({ message: "Reader account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/signals",
  authenticateReader,
  [
    body("eventType").isIn(["view", "bookmark", "share", "complete", "category_click"]),
    body("articleId").optional().isMongoId(),
    body("category").optional().isString(),
    body("weight").optional().isNumeric(),
  ],
  async (req, res) => {
    if (err400(req, res)) return;
    try {
      const signal = await RecommendationSignal.create({
        reader: req.reader._id,
        article: req.body.articleId || null,
        category: req.body.category || "",
        eventType: req.body.eventType,
        weight: Number(req.body.weight || 1),
        meta: req.body.meta || {},
      });
      res.status(201).json({ signal });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/recommendations", authenticateReader, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 12, 30);
    const byCat = await RecommendationSignal.aggregate([
      { $match: { reader: req.reader._id, category: { $ne: "" } } },
      { $group: { _id: "$category", score: { $sum: "$weight" } } },
      { $sort: { score: -1 } },
      { $limit: 5 },
    ]);
    const categories = byCat.map((x) => x._id);
    const q = { status: "published" };
    if (categories.length > 0) q.category = { $in: categories };
    const articles = await Article.find(q)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("primaryLocale title titleHi summary summaryHi category images publishedAt createdAt readTime isBreaking views author body bodyHi")
      .lean();
    res.json({ articles, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
