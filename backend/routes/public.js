const router = require("express").Router();
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Article = require("../models/Article");
const Video = require("../models/Video");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const { setNewsletterSubscription } = require("../services/newsletterSubscription");
const { sendLatestStoriesNewsletter } = require("../services/newsletterDigest");

function localeMatchQuery(req) {
  const loc = String(req.query.locale || "").toLowerCase();
  if (loc === "hi") return { primaryLocale: "hi" };
  if (loc === "en") return { primaryLocale: { $in: ["en", null] } };
  return {};
}

function localeVideoMatch(req) {
  const loc = String(req.query.locale || "").toLowerCase();
  if (loc === "hi") return { primaryLocale: "hi" };
  if (loc === "en") {
    return {
      $or: [{ primaryLocale: "en" }, { primaryLocale: null }, { primaryLocale: { $exists: false } }],
    };
  }
  return {};
}

function latestDaysFilter(latestDaysRaw) {
  const latestDays = Number(latestDaysRaw);
  if (!Number.isFinite(latestDays) || latestDays <= 0) return null;
  const since = new Date(Date.now() - latestDays * 24 * 60 * 60 * 1000);
  return { publishedAt: { $gte: since } };
}

// GET /api/public/videos — published only, for web /shows
router.get("/videos", async (req, res) => {
  try {
    const { category, limit = 30, page = 1 } = req.query;
    const q = { status: "published", ...localeVideoMatch(req) };
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
    const limit = Math.min(Number(req.query.limit) || 6, 6);
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
    const { category, limit = 20, page = 1, latestDays } = req.query;
    const q = { status: "published", ...localeMatchQuery(req) };
    if (category) q.category = category;
    const latestFilter = latestDaysFilter(latestDays);
    if (latestFilter) Object.assign(q, latestFilter);

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

// GET /api/public/articles/:id/recommendations — same category, tag overlap, then popular/recent (must be before /articles/:id)
router.get("/articles/:id/recommendations", async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.json({ articles: [] });
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 24);
    const localeQ = localeMatchQuery(req);

    const base = await Article.findOne({ _id: rawId, status: "published" }).select("category tags").lean();
    if (!base) {
      return res.json({ articles: [] });
    }

    const sameCat = await Article.find({
      status: "published",
      category: base.category,
      _id: { $ne: base._id },
      ...localeQ,
    })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(Math.min(10, limit))
      .lean();

    const pickedIds = [base._id, ...sameCat.map((a) => a._id)];
    const tagArr = Array.isArray(base.tags)
      ? base.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    let tagMatches = [];
    if (tagArr.length) {
      tagMatches = await Article.find({
        status: "published",
        _id: { $nin: pickedIds },
        tags: { $in: tagArr },
        ...localeQ,
      })
        .populate("author", "name")
        .sort({ publishedAt: -1 })
        .limit(8)
        .lean();
      pickedIds.push(...tagMatches.map((a) => a._id));
    }

    const need = limit - sameCat.length - tagMatches.length;
    const fill =
      need > 0
        ? await Article.find({
            status: "published",
            _id: { $nin: pickedIds },
            ...localeQ,
          })
            .populate("author", "name")
            .sort({ views: -1, publishedAt: -1 })
            .limit(need + 6)
            .lean()
        : [];

    const out = [];
    const seen = new Set();
    for (const a of [...sameCat, ...tagMatches, ...fill]) {
      const s = String(a._id);
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(a);
      if (out.length >= limit) break;
    }

    res.json({ articles: out });
  } catch (err) {
    console.error("[public/articles/:id/recommendations]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/articles/:id — no auth required, published only
router.get("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "published",
      },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "name")
      .lean();

    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json({ article });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/public/newsletter/subscribe — email-only signup from website footer
router.post(
  "/newsletter/subscribe",
  [
    body("email").isEmail().normalizeEmail(),
    body("digestCadence").optional().isIn(["daily", "weekly"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = String(req.body.email || "").toLowerCase().trim();
    const digestCadence = req.body.digestCadence === "weekly" ? "weekly" : "daily";
    try {
      let sub = await NewsletterSubscriber.findOne({ email });
      if (sub?.active) {
        return res.status(200).json({ ok: true, already: true, message: "Already subscribed" });
      }

      if (!sub) {
        await NewsletterSubscriber.create({
          email,
          active: true,
          source: "footer",
          digestCadence,
        });
      } else {
        sub.active = true;
        sub.digestCadence = digestCadence;
        await sub.save();
      }

      await setNewsletterSubscription({
        email,
        displayName: "",
        optIn: true,
      }).catch((e) => console.warn("[newsletter footer sync]", e.message));

      const r = await sendLatestStoriesNewsletter({
        email,
        displayName: "",
        isWelcome: true,
        digestCadence,
      });

      if (r.ok && !r.skipped) {
        await NewsletterSubscriber.updateOne({ email }, { $set: { lastDigestSentAt: new Date() } });
      }

      res.status(201).json({ ok: true, message: "Subscribed" });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(200).json({ ok: true, already: true });
      }
      console.error("[newsletter/subscribe]", err);
      res.status(500).json({ message: err.message || "Subscribe failed" });
    }
  }
);

module.exports = router;
