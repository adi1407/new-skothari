const router = require("express").Router();
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const Reader = require("../models/Reader");
const Bookmark = require("../models/Bookmark");
const Article = require("../models/Article");
const { signReaderToken, authenticateReader, readerPublic } = require("../middleware/readerAuth");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

function publishedArticleSelect() {
  return "title titleHi summary summaryHi category images publishedAt createdAt readTime isBreaking views author status tags body bodyHi";
}

/** Strip to safe public fields (only call for published articles). */
function articleBookmarkPayload(doc) {
  if (!doc) return null;
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    _id: a._id,
    title: a.title,
    titleHi: a.titleHi,
    summary: a.summary,
    summaryHi: a.summaryHi,
    category: a.category,
    images: a.images,
    publishedAt: a.publishedAt,
    readTime: a.readTime,
    isBreaking: a.isBreaking,
    views: a.views,
    author: a.author,
  };
}

// ── POST /api/reader/register ───────────────────────────
router.post(
  "/register",
  authLimiter,
  [
    body("displayName").trim().notEmpty().withMessage("Name required").isLength({ max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { displayName, email, password } = req.body;
    try {
      const existing = await Reader.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const hash = await bcrypt.hash(password, 12);
      const reader = await Reader.create({
        displayName,
        email,
        password: hash,
        hasLocalPassword: true,
      });

      const token = signReaderToken(reader._id);
      res.status(201).json({ token, reader: readerPublic(reader) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /api/reader/login ──────────────────────────────
router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const reader = await Reader.findOne({ email }).select("+password");
      if (!reader || !reader.password)
        return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, reader.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      reader.password = undefined;
      const token = signReaderToken(reader._id);
      res.json({ token, reader: readerPublic(reader) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /api/reader/auth/google ────────────────────────
router.post("/auth/google", authLimiter, async (req, res) => {
  const idToken = (req.body && req.body.idToken) || "";
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ message: "idToken required" });
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ message: "Google sign-in is not configured" });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const sub = payload.sub;
    const email = String(payload.email).toLowerCase().trim();
    const name = (payload.name || email.split("@")[0] || "Reader").slice(0, 80);
    const picture = payload.picture || "";

    let reader = await Reader.findOne({ googleId: sub });
    if (reader) {
      const token = signReaderToken(reader._id);
      return res.json({ token, reader: readerPublic(reader) });
    }

    reader = await Reader.findOne({ email });
    if (reader) {
      if (reader.googleId && reader.googleId !== sub) {
        return res.status(409).json({ message: "This email is linked to another account" });
      }
      reader.googleId = sub;
      if (picture && !reader.avatar) reader.avatar = picture;
      await reader.save();
      const token = signReaderToken(reader._id);
      return res.json({ token, reader: readerPublic(reader) });
    }

    reader = await Reader.create({
      email,
      googleId: sub,
      displayName: name,
      avatar: picture || "",
      password: null,
    });
    const token = signReaderToken(reader._id);
    res.status(201).json({ token, reader: readerPublic(reader) });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ message: "Google sign-in failed" });
  }
});

// ── GET /api/reader/me ──────────────────────────────────
router.get("/me", authenticateReader, (req, res) => {
  res.json({ reader: readerPublic(req.reader) });
});

// ── PATCH /api/reader/me ────────────────────────────────
router.patch(
  "/me",
  authenticateReader,
  [
    body("displayName").optional().trim().notEmpty().isLength({ max: 80 }),
    body("preferences.preferredLang").optional().isIn(["hi", "en"]),
    body("preferences.newsletterOptIn").optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { displayName, preferences } = req.body;
    const update = {};
    if (displayName !== undefined) update.displayName = displayName;
    if (preferences && typeof preferences === "object") {
      if (preferences.preferredLang !== undefined) {
        update["preferences.preferredLang"] = preferences.preferredLang;
      }
      if (preferences.newsletterOptIn !== undefined) {
        update["preferences.newsletterOptIn"] = Boolean(preferences.newsletterOptIn);
      }
    }

    try {
      const reader = await Reader.findByIdAndUpdate(req.reader._id, { $set: update }, { new: true }).select("-password");
      res.json({ reader: readerPublic(reader) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/reader/me/password ────────────────────────
router.put(
  "/me/password",
  authenticateReader,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const reader = await Reader.findById(req.reader._id).select("+password");
      if (!reader.password) {
        return res.status(400).json({ message: "Password sign-in is not set for this account" });
      }
      const match = await bcrypt.compare(req.body.currentPassword, reader.password);
      if (!match) return res.status(401).json({ message: "Current password is incorrect" });

      reader.password = await bcrypt.hash(req.body.newPassword, 12);
      await reader.save();
      res.json({ message: "Password updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── GET /api/reader/me/bookmarks/check/:articleId ───────
router.get("/me/bookmarks/check/:articleId", authenticateReader, async (req, res) => {
  try {
    const exists = await Bookmark.exists({
      reader: req.reader._id,
      article: req.params.articleId,
    });
    res.json({ bookmarked: Boolean(exists) });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/reader/me/bookmarks/:articleId ────────────
router.post("/me/bookmarks/:articleId", authenticateReader, async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.articleId,
      status: "published",
    }).lean();
    if (!article) return res.status(404).json({ message: "Article not found" });

    try {
      await Bookmark.create({ reader: req.reader._id, article: article._id });
      return res.status(201).json({ bookmarked: true, article: articleBookmarkPayload(article) });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ bookmarked: true, article: articleBookmarkPayload(article) });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reader/me/bookmarks/:articleId ─────────
router.delete("/me/bookmarks/:articleId", authenticateReader, async (req, res) => {
  try {
    await Bookmark.deleteOne({ reader: req.reader._id, article: req.params.articleId });
    res.json({ bookmarked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/reader/me/bookmarks ────────────────────────
router.get("/me/bookmarks", authenticateReader, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [marks, total] = await Promise.all([
      Bookmark.find({ reader: req.reader._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "article",
          select: publishedArticleSelect(),
          match: { status: "published" },
          populate: { path: "author", select: "name" },
        })
        .lean(),
      Bookmark.countDocuments({ reader: req.reader._id }),
    ]);

    const articles = marks
      .map((m) => m.article)
      .filter(Boolean)
      .map(articleBookmarkPayload);

    res.json({ articles, total, page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
