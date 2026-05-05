const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const { body, query, validationResult } = require("express-validator");
const Article = require("../models/Article");
const Task = require("../models/Task");
const { authenticate, authorize } = require("../middleware/auth");
const {
  isWriterRole,
  writerPrimaryLocaleConstraint,
} = require("../utils/roles");
const upload = require("../middleware/upload");

// ── Helpers ──────────────────────────────────────────

function normalizePrimaryLocale(v) {
  return v === "hi" ? "hi" : "en";
}

function hasPrimaryContent(article) {
  const pl = normalizePrimaryLocale(article.primaryLocale);
  if (pl === "hi") {
    return !!(String(article.titleHi || "").trim() && String(article.bodyHi || "").trim());
  }
  return !!(String(article.title || "").trim() && String(article.body || "").trim());
}

function buildQuery(role, userId, filters = {}) {
  const q = {};

  // Writers only see their own articles
  if (isWriterRole(role)) q.author = userId;

  // Status filter
  if (filters.status) q.status = filters.status;
  else if (isWriterRole(role)) {
    // writers see all their own statuses (default: no filter beyond author)
  } else if (role === "editor") {
    // editors see submitted + published articles by default
    if (!filters.status) q.status = { $in: ["submitted", "published", "rejected"] };
  }

  if (filters.category) q.category = filters.category;
  if (filters.search) {
    q.$or = [
      { title:   { $regex: filters.search, $options: "i" } },
      { titleHi: { $regex: filters.search, $options: "i" } },
      { tags:    { $regex: filters.search, $options: "i" } },
    ];
  }
  return q;
}

async function enforceBreakingCap(maxBreaking = 6, keepArticleId = null) {
  const rows = await Article.find({ status: "published", isBreaking: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("_id")
    .lean();
  if (rows.length <= maxBreaking) return;

  const keepId = keepArticleId ? String(keepArticleId) : "";
  const demoteIds = [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    const id = String(row._id);
    if (id === keepId) continue;
    if (demoteIds.length >= rows.length - maxBreaking) break;
    demoteIds.push(row._id);
  }
  if (demoteIds.length === 0) return;
  await Article.updateMany({ _id: { $in: demoteIds } }, { $set: { isBreaking: false } });
}

// ── GET /api/articles ────────────────────────────────
// Writer: own articles | Editor: submitted+published | Admin: all
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const q = buildQuery(req.user.role, req.user._id, { status, category, search });

    // Admin ignores role restrictions — sees everything
    const finalQuery = req.user.role === "admin" ? {} : q;
    if (req.user.role === "admin") {
      if (status)   finalQuery.status   = status;
      if (category) finalQuery.category = category;
      if (search)   finalQuery.$or = [
        { title:   { $regex: search, $options: "i" } },
        { titleHi: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(finalQuery)
        .populate("author", "name email role")
        .populate("lastEditedBy", "name role")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Article.countDocuments(finalQuery),
    ]);

    res.json({
      articles,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/articles/:id ────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id)
      .populate("author", "name email role avatar bio")
      .populate("lastEditedBy", "name role")
      .populate("task", "title deadline priority");

    if (!article) return res.status(404).json({ message: "Article not found" });

    // Writers can only view their own
    if (isWriterRole(req.user.role) && article.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (article.status === "published") {
      article = await Article.findOneAndUpdate(
        { _id: req.params.id, status: "published" },
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate("author", "name email role avatar bio")
        .populate("lastEditedBy", "name role")
        .populate("task", "title deadline priority");
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
    }

    res.json({ article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/articles  (writer creates draft) ────────
router.post(
  "/",
  authenticate,
  authorize("writer", "admin"),
  [
    body("category")
      .isIn(["desh","videsh","rajneeti","khel","health","krishi","business","manoranjan"])
      .withMessage("Invalid category"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const primaryLocale = normalizePrimaryLocale(req.body.primaryLocale);
      const localeErr = writerPrimaryLocaleConstraint(req.user.role, primaryLocale);
      if (localeErr) return res.status(400).json({ message: localeErr });

      const { title, titleHi, summary, summaryHi, body: bodyText, bodyHi,
              category, tags, isBreaking, task: taskId } = req.body;

      if (primaryLocale === "hi") {
        if (!String(titleHi || "").trim()) {
          return res.status(400).json({ message: "Hindi title is required for Hindi-primary article" });
        }
      } else if (!String(title || "").trim()) {
        return res.status(400).json({ message: "Title is required for English-primary article" });
      }

      const article = await Article.create({
        primaryLocale,
        title, titleHi, summary, summaryHi,
        body: bodyText, bodyHi,
        category, tags, isBreaking,
        author: req.user._id,
        task: taskId || null,
        status: "draft",
      });

      // Link article to task if provided
      if (taskId) {
        await Task.findByIdAndUpdate(taskId, {
          article: article._id,
          status: "in_progress",
        });
      }

      const populated = await article.populate("author", "name email role");
      res.status(201).json({ article: populated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/articles/:id  (edit content) ────────────
// Writer: only own drafts/rejected | Editor+Admin: any
router.put("/:id", authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const isOwner = article.author.toString() === req.user._id.toString();

    if (isWriterRole(req.user.role)) {
      if (!isOwner) return res.status(403).json({ message: "Not your article" });
      if (!["draft", "rejected"].includes(article.status))
        return res.status(400).json({ message: "Cannot edit a submitted or published article" });
    }

    const allowed = [
      "primaryLocale",
      "title","titleHi","summary","summaryHi",
      "body","bodyHi","category","tags","isBreaking",
    ];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        article[f] = f === "primaryLocale" ? normalizePrimaryLocale(req.body[f]) : req.body[f];
      }
    });

    const putLocaleErr = writerPrimaryLocaleConstraint(req.user.role, article.primaryLocale);
    if (putLocaleErr) return res.status(400).json({ message: putLocaleErr });

    if (!isWriterRole(req.user.role)) {
      article.lastEditedBy = req.user._id;
    }

    await article.save();
    if (article.status === "published" && article.isBreaking) {
      await enforceBreakingCap(6, article._id);
    }
    const populated = await article.populate([
      { path: "author", select: "name email role" },
      { path: "lastEditedBy", select: "name role" },
    ]);
    res.json({ article: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/articles/:id  (admin only) ───────────
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    // Remove images from disk
    for (const img of article.images) {
      const filePath = path.join(__dirname, "../uploads", path.basename(img.url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/articles/:id/submit  (writer submits) ─
router.patch("/:id/submit", authenticate, authorize("writer", "admin"), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not your article" });

    if (article.status !== "draft" && article.status !== "rejected")
      return res.status(400).json({ message: `Cannot submit from status: ${article.status}` });

    if (!hasPrimaryContent(article))
      return res.status(400).json({
        message: article.primaryLocale === "hi"
          ? "Hindi title and body are required before submitting"
          : "Title and body are required before submitting",
      });

    article.status = "submitted";
    article.rejectionReason = "";
    await article.save();

    res.json({ article, message: "Article submitted for editor review" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/articles/:id/publish  (editor/admin) ──
router.patch("/:id/publish", authenticate, authorize("editor", "admin"), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.status !== "submitted")
      return res.status(400).json({ message: `Cannot publish from status: ${article.status}` });

    if (!hasPrimaryContent(article))
      return res.status(400).json({
        message: article.primaryLocale === "hi"
          ? "Cannot publish: Hindi title and body are required"
          : "Cannot publish: English title and body are required",
      });

    article.status = "published";
    article.publishedAt = new Date();
    article.lastEditedBy = req.user._id;
    await article.save();
    if (article.isBreaking) {
      await enforceBreakingCap(6, article._id);
    }

    // If article linked to a task, mark task complete
    if (article.task) {
      await Task.findByIdAndUpdate(article.task, {
        status: "completed",
        completedAt: new Date(),
      });
    }

    res.json({ article, message: "Article published successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/articles/:id/unpublish  (editor/admin) ─
router.patch("/:id/unpublish", authenticate, authorize("editor", "admin"), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.status !== "published")
      return res.status(400).json({ message: "Article is not published" });

    article.status = "submitted";
    article.publishedAt = null;
    article.lastEditedBy = req.user._id;
    await article.save();

    res.json({ article, message: "Article unpublished" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/articles/:id/reject  (editor/admin) ───
router.patch(
  "/:id/reject",
  authenticate,
  authorize("editor", "admin"),
  [body("reason").trim().notEmpty().withMessage("Rejection reason is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (article.status !== "submitted")
        return res.status(400).json({ message: "Can only reject submitted articles" });

      article.status = "rejected";
      article.rejectionReason = req.body.reason;
      article.rejectedAt = new Date();
      article.lastEditedBy = req.user._id;
      await article.save();

      res.json({ article, message: "Article rejected and returned to writer" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── POST /api/articles/:id/images  (upload images) ───
// Writer uploads to their own draft; editor/admin can upload to any
router.post(
  "/:id/images",
  authenticate,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (isWriterRole(req.user.role)) {
        if (article.author.toString() !== req.user._id.toString())
          return res.status(403).json({ message: "Not your article" });
        if (!["draft", "rejected"].includes(article.status))
          return res.status(400).json({ message: "Cannot upload images to submitted/published articles" });
      }

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const newImages = req.files.map((file, idx) => ({
        url: `${baseUrl}/uploads/${file.filename}`,
        caption: req.body[`caption_${idx}`] || "",
        isHero: idx === 0 && article.images.length === 0,
      }));

      article.images.push(...newImages);
      await article.save();

      res.json({ images: newImages, message: `${newImages.length} image(s) uploaded` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── DELETE /api/articles/:id/images/:filename ─────────
router.delete("/:id/images/:filename", authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (isWriterRole(req.user.role) && article.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your article" });

    const { filename } = req.params;
    article.images = article.images.filter((img) => !img.url.endsWith(filename));
    await article.save();

    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
