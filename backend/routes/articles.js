/* global __dirname */
const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const Article = require("../models/Article");
const User = require("../models/User");
const Task = require("../models/Task");
const { authenticate, authorize } = require("../middleware/auth");
const {
  WRITER_ROLES,
  EDITOR_ROLES,
  isWriterRole,
  isEditorRole,
  writerPrimaryLocaleConstraint,
  isAssignedWriter,
  isAdminLike,
} = require("../utils/roles");
const upload = require("../middleware/upload");
const sharp = require("sharp");
const {
  articleRefFilter,
  HERO_IMAGE_WIDTH,
  HERO_IMAGE_HEIGHT,
} = require("../utils/resolveArticleRef");

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

function imageHasRequiredMeta(img) {
  return Boolean(
    String(img?.source || "").trim() &&
    String(img?.imageDescription || "").trim() &&
    String(img?.alt || "").trim() &&
    String(img?.imageTitle || "").trim()
  );
}

function hasImageMetadata(article) {
  if (!Array.isArray(article.images) || article.images.length === 0) return false;
  return article.images.every((img) => imageHasRequiredMeta(img));
}

function normalizeSlugInput(v) {
  const s = String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 100);
}

function hasEnglishDeskContent(article) {
  return Boolean(
    String(article.title || "").trim() &&
    String(article.summary || "").trim() &&
    String(article.body || "").trim()
  );
}

function hasHindiDeskContent(article) {
  return Boolean(
    String(article.titleHi || "").trim() &&
    String(article.summaryHi || "").trim() &&
    String(article.bodyHi || "").trim()
  );
}

function canDeskEditorActOnArticle(user, article) {
  if (user.role === "super_admin" || user.role === "admin" || user.role === "editor") return true;
  if (user.role === "editor_en") return article.editorEn && String(article.editorEn) === String(user._id);
  if (user.role === "editor_hi") return article.editorHi && String(article.editorHi) === String(user._id);
  return false;
}

function canViewArticle(user, articleDoc) {
  if (user.role === "video_editor") return false;
  if (isAdminLike(user.role) || user.role === "editor") return true;
  if (isEditorRole(user.role)) {
    if (user.role === "editor_en") {
      return articleDoc.editorEn && String(articleDoc.editorEn) === String(user._id);
    }
    if (user.role === "editor_hi") {
      return articleDoc.editorHi && String(articleDoc.editorHi) === String(user._id);
    }
  }
  if (isWriterRole(user.role)) return isAssignedWriter(articleDoc, user._id);
  return false;
}

function canActEnglishDesk(user, article) {
  if (isAdminLike(user.role)) return true;
  if (user.role !== "writer_en" || !isAssignedWriter(article, user._id)) return false;
  if (article.writerEn) return String(article.writerEn) === String(user._id);
  return String(article.author) === String(user._id);
}

function canActHindiDesk(user, article) {
  if (isAdminLike(user.role)) return true;
  if (user.role !== "writer_hi" || !isAssignedWriter(article, user._id)) return false;
  if (article.writerHi) return String(article.writerHi) === String(user._id);
  return String(article.author) === String(user._id);
}

function isEnglishPrimaryArticle(article) {
  return normalizePrimaryLocale(article.primaryLocale) === "en";
}

/** Writer + editor for the article's primary language (English and Hindi workflows are independent). */
function hasAssignmentsForPrimaryLocale(article) {
  if (isEnglishPrimaryArticle(article)) {
    return Boolean(article.writerEn && article.editorEn);
  }
  return Boolean(article.writerHi && article.editorHi);
}

/** Full title, summary, body for whichever locale is primary. */
function hasContentForPrimaryLocale(article) {
  return isEnglishPrimaryArticle(article)
    ? hasEnglishDeskContent(article)
    : hasHindiDeskContent(article);
}

function buildQuery(role, userId, filters = {}) {
  const q = {};
  const uid = userId;

  if (role === "video_editor") {
    return { _id: { $in: [] } };
  }

  if (isWriterRole(role)) {
    q.$or = [{ author: uid }, { writerEn: uid }, { writerHi: uid }];
  } else if (role === "editor_en") {
    q.editorEn = uid;
  } else if (role === "editor_hi") {
    q.editorHi = uid;
  }

  if (filters.status) q.status = filters.status;
  else if (isWriterRole(role)) {
    /* all statuses for assigned writers */
  } else if (isEditorRole(role) || isAdminLike(role)) {
    if (!filters.status) q.status = { $in: ["submitted", "published", "rejected"] };
  }

  if (filters.category) q.category = filters.category;
  if (filters.search) {
    const searchOr = [
      { title: { $regex: filters.search, $options: "i" } },
      { titleHi: { $regex: filters.search, $options: "i" } },
      { tags: { $regex: filters.search, $options: "i" } },
    ];
    if (q.$or) {
      q.$and = [{ $or: q.$or }, { $or: searchOr }];
      delete q.$or;
    } else {
      q.$or = searchOr;
    }
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

// ── GET /api/articles/assignment-users ─────────────────
// Available writer/editor users for bilingual assignment in CMS editor form.
router.get(
  "/assignment-users",
  authenticate,
  authorize("__writers__", "__textEditors__", "__adminLike__"),
  async (_req, res) => {
    try {
      const [writers, editors] = await Promise.all([
        User.find({ role: { $in: WRITER_ROLES }, isActive: true })
          .select("name email role")
          .sort({ name: 1 })
          .lean(),
        User.find({ role: { $in: EDITOR_ROLES }, isActive: true })
          .select("name email role")
          .sort({ name: 1 })
          .lean(),
      ]);
      res.json({ writers, editors });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── GET /api/articles ────────────────────────────────
// Writer: own articles | Editor: submitted+published | Admin: all
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const q = buildQuery(req.user.role, req.user._id, { status, category, search });

    const finalQuery = isAdminLike(req.user.role) ? {} : q;
    if (isAdminLike(req.user.role)) {
      if (status)   finalQuery.status   = status;
      if (category) finalQuery.category = category;
      if (search) {
        finalQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { titleHi: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(finalQuery)
        .populate("author", "name email role")
        .populate("lastEditedBy", "name role")
        .populate("writerEn writerHi editorEn editorHi", "name email role")
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

// ── GET /api/articles/lookup-by-number/:articleNumber — insert related link in CMS
router.get(
  "/lookup-by-number/:articleNumber",
  authenticate,
  authorize("__writers__", "__textEditors__", "__adminLike__"),
  async (req, res) => {
    try {
      const ref = articleRefFilter(req.params.articleNumber);
      if (!ref || ref._id) {
        return res.status(400).json({ message: "Invalid article number or slug-id segment" });
      }
      const article = await Article.findOne(ref)
        .select("title titleHi articleNumber slug status author writerEn writerHi primaryLocale")
        .lean();
      if (!article) return res.status(404).json({ message: "Article not found" });

      const staff = isEditorRole(req.user.role) || isAdminLike(req.user.role);
      const canSee =
        article.status === "published" || isAssignedWriter(article, req.user._id) || staff;
      if (!canSee) return res.status(404).json({ message: "Article not found" });

      const num = article.articleNumber;
      const slug = String(article.slug || "").trim();
      const urlPath = slug ? `/article/${slug}-${num}` : `/article/${num}`;

      res.json({
        articleNumber: article.articleNumber,
        title: article.title || "",
        titleHi: article.titleHi || "",
        primaryLocale: article.primaryLocale || "en",
        slug: slug || undefined,
        urlPath,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── GET /api/articles/:id ────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    const ref = articleRefFilter(req.params.id);
    if (!ref) return res.status(404).json({ message: "Article not found" });

    let article = await Article.findOne(ref)
      .populate("author", "name email role avatar bio")
      .populate("lastEditedBy", "name role")
      .populate("writerEn writerHi editorEn editorHi", "name email role")
      .populate("task", "title deadline priority");

    if (!article) return res.status(404).json({ message: "Article not found" });

    if (!canViewArticle(req.user, article)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (article.status === "published") {
      article = await Article.findOneAndUpdate(
        { ...ref, status: "published" },
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate("author", "name email role avatar bio")
        .populate("lastEditedBy", "name role")
        .populate("writerEn writerHi editorEn editorHi", "name email role")
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
  authorize("__writers__", "__adminLike__"),
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
              category, tags, isBreaking, task: taskId,
              metaTitle, metaTitleHi, metaDescription, metaDescriptionHi,
              metaKeywords, bylineName,
              writerEn, writerHi, editorEn, editorHi } = req.body;

      const slugRaw = normalizeSlugInput(req.body.slug);
      if (slugRaw) {
        const clash = await Article.findOne({ slug: slugRaw }).select("_id").lean();
        if (clash) return res.status(400).json({ message: "Slug already in use" });
      }

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
        metaTitle: metaTitle ?? "",
        metaTitleHi: metaTitleHi ?? "",
        metaDescription: metaDescription ?? "",
        metaDescriptionHi: metaDescriptionHi ?? "",
        metaKeywords: metaKeywords ?? "",
        bylineName: bylineName ?? "",
        slug: slugRaw || undefined,
        author: req.user._id,
        writerEn: writerEn || (req.user.role === "writer_en" ? req.user._id : null),
        writerHi: writerHi || (req.user.role === "writer_hi" ? req.user._id : null),
        editorEn: editorEn || null,
        editorHi: editorHi || null,
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

      const populated = await article.populate([
        { path: "author", select: "name email role" },
        { path: "writerEn writerHi editorEn editorHi", select: "name email role" },
      ]);
      res.status(201).json({ article: populated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/articles/:id  (edit content) ────────────
// Assigned desk writers: draft/rejected only, language-scoped fields | Editors/Admin: per desk rules
router.put("/:id", authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (req.user.role === "video_editor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const editorKeys = [
      "primaryLocale",
      "title",
      "titleHi",
      "summary",
      "summaryHi",
      "body",
      "bodyHi",
      "category",
      "tags",
      "isBreaking",
      "metaTitle",
      "metaTitleHi",
      "metaDescription",
      "metaDescriptionHi",
      "metaKeywords",
      "bylineName",
      "task",
      "writerEn",
      "writerHi",
      "editorEn",
      "editorHi",
      "slug",
    ];
    const writerSharedKeys = ["category", "tags", "isBreaking", "task", "slug", "metaKeywords", "bylineName"];
    const writerEnKeys = [
      "primaryLocale",
      "title",
      "summary",
      "body",
      "metaTitle",
      "metaDescription",
      ...writerSharedKeys,
    ];
    const writerHiKeys = [
      "primaryLocale",
      "titleHi",
      "summaryHi",
      "bodyHi",
      "metaTitleHi",
      "metaDescriptionHi",
      ...writerSharedKeys,
    ];

    let keysToApply = editorKeys;
    if (isWriterRole(req.user.role)) {
      if (!isAssignedWriter(article, req.user._id)) {
        return res.status(403).json({ message: "Not assigned to this article" });
      }
      if (!["draft", "rejected"].includes(article.status)) {
        return res.status(400).json({ message: "Cannot edit a submitted or published article" });
      }
      keysToApply = req.user.role === "writer_en" ? writerEnKeys : writerHiKeys;
    } else if (isEditorRole(req.user.role) || isAdminLike(req.user.role)) {
      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    keysToApply.forEach((f) => {
      if (req.body[f] === undefined) return;
      if (f === "task") {
        const t = req.body.task;
        article.task = t && String(t).trim() ? t : null;
      } else if (f === "slug") {
        const s = normalizeSlugInput(req.body.slug);
        article.slug = s || undefined;
      } else if (f === "primaryLocale") {
        article.primaryLocale = normalizePrimaryLocale(req.body[f]);
      } else {
        article[f] = req.body[f];
      }
    });

    const putLocaleErr = writerPrimaryLocaleConstraint(req.user.role, article.primaryLocale);
    if (putLocaleErr) return res.status(400).json({ message: putLocaleErr });

    if (article.slug) {
      const clash = await Article.findOne({ slug: article.slug, _id: { $ne: article._id } })
        .select("_id")
        .lean();
      if (clash) return res.status(400).json({ message: "Slug already in use" });
    }

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
      { path: "writerEn writerHi editorEn editorHi", select: "name email role" },
    ]);
    res.json({ article: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/articles/:id  (admin only) ───────────
router.delete("/:id", authenticate, authorize("__adminLike__"), async (req, res) => {
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

// ── PATCH /api/articles/:id/submit-en  (English desk ready) ─
router.patch(
  "/:id/submit-en",
  authenticate,
  authorize("__writers__", "__adminLike__"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!canActEnglishDesk(req.user, article)) {
        return res.status(403).json({ message: "Not allowed to complete the English desk for this article" });
      }

      if (!["draft", "rejected"].includes(article.status)) {
        return res.status(400).json({ message: `Cannot update English desk from status: ${article.status}` });
      }

      if (!hasEnglishDeskContent(article)) {
        return res.status(400).json({
          message: "English title, summary, and body are required before marking the English desk complete",
        });
      }

      article.enDeskComplete = true;
      await article.save();
      res.json({ article, message: "English desk marked complete" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PATCH /api/articles/:id/submit-hi  (Hindi desk ready) ─
router.patch(
  "/:id/submit-hi",
  authenticate,
  authorize("__writers__", "__adminLike__"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!canActHindiDesk(req.user, article)) {
        return res.status(403).json({ message: "Not allowed to complete the Hindi desk for this article" });
      }

      if (!["draft", "rejected"].includes(article.status)) {
        return res.status(400).json({ message: `Cannot update Hindi desk from status: ${article.status}` });
      }

      if (!hasHindiDeskContent(article)) {
        return res.status(400).json({
          message: "Hindi title, summary, and body are required before marking the Hindi desk complete",
        });
      }

      article.hiDeskComplete = true;
      await article.save();
      res.json({ article, message: "Hindi desk marked complete" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PATCH /api/articles/:id/submit  (writer submits to editors) ─
router.patch(
  "/:id/submit",
  authenticate,
  authorize("__writers__", "__adminLike__"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!isAssignedWriter(article, req.user._id) && !isAdminLike(req.user.role)) {
        return res.status(403).json({ message: "Not assigned to this article" });
      }

      if (article.status !== "draft" && article.status !== "rejected") {
        return res.status(400).json({ message: `Cannot submit from status: ${article.status}` });
      }

      if (!hasContentForPrimaryLocale(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "English title, summary, and body are required before submitting"
            : "Hindi title, summary, and body are required before submitting",
        });
      }

      if (!hasPrimaryContent(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "English title and body are required before submitting"
            : "Hindi title and body are required before submitting",
        });
      }

      if (!hasAssignmentsForPrimaryLocale(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "English writer and editor assignments are required before submitting"
            : "Hindi writer and editor assignments are required before submitting",
        });
      }

      if (!hasImageMetadata(article)) {
        return res.status(400).json({
          message: "Each image must include source, description, alt text, and image title before submitting",
        });
      }

      if (isEnglishPrimaryArticle(article)) {
        article.enDeskComplete = true;
      } else {
        article.hiDeskComplete = true;
      }

      article.status = "submitted";
      article.rejectionReason = "";
      await article.save();

      res.json({ article, message: "Article submitted for editor review" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PATCH /api/articles/:id/publish  (editor/admin) ──
router.patch(
  "/:id/publish",
  authenticate,
  authorize("__textEditors__", "__adminLike__"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (article.status !== "submitted") {
        return res.status(400).json({ message: `Cannot publish from status: ${article.status}` });
      }

      if (!hasContentForPrimaryLocale(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "Cannot publish: English title, summary, and body are required"
            : "Cannot publish: Hindi title, summary, and body are required",
        });
      }

      if (!hasPrimaryContent(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "Cannot publish: English title and body are required"
            : "Cannot publish: Hindi title and body are required",
        });
      }

      if (!hasAssignmentsForPrimaryLocale(article)) {
        return res.status(400).json({
          message: isEnglishPrimaryArticle(article)
            ? "Cannot publish: English writer and editor assignments are required"
            : "Cannot publish: Hindi writer and editor assignments are required",
        });
      }

      if (!hasImageMetadata(article)) {
        return res.status(400).json({
          message: "Cannot publish: each image must include source, description, alt text, and image title",
        });
      }

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
  }
);

// ── PATCH /api/articles/:id/unpublish  (editor/admin) ─
router.patch(
  "/:id/unpublish",
  authenticate,
  authorize("__textEditors__", "__adminLike__"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (article.status !== "published") {
        return res.status(400).json({ message: "Article is not published" });
      }

      article.status = "submitted";
      article.publishedAt = null;
      article.lastEditedBy = req.user._id;
      await article.save();

      res.json({ article, message: "Article unpublished" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PATCH /api/articles/:id/reject  (editor/admin) ───
router.patch(
  "/:id/reject",
  authenticate,
  authorize("__textEditors__", "__adminLike__"),
  [body("reason").trim().notEmpty().withMessage("Rejection reason is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (article.status !== "submitted") {
        return res.status(400).json({ message: "Can only reject submitted articles" });
      }

      article.status = "rejected";
      article.enDeskComplete = false;
      article.hiDeskComplete = false;
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
        if (!isAssignedWriter(article, req.user._id)) {
          return res.status(403).json({ message: "Not assigned to this article" });
        }
        if (!["draft", "rejected"].includes(article.status)) {
          return res.status(400).json({ message: "Cannot upload images to submitted/published articles" });
        }
      } else if (isEditorRole(req.user.role) || isAdminLike(req.user.role)) {
        if (!canDeskEditorActOnArticle(req.user, article)) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const newImages = [];
      for (let idx = 0; idx < req.files.length; idx += 1) {
        const file = req.files[idx];
        const diskPath = path.join(__dirname, "../uploads", file.filename);
        let meta;
        try {
          meta = await sharp(diskPath).metadata();
        } catch (_e) {
          if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
          return res.status(400).json({ message: `Invalid image file (upload ${idx + 1})` });
        }
        if (meta.width !== HERO_IMAGE_WIDTH || meta.height !== HERO_IMAGE_HEIGHT) {
          if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
          return res.status(400).json({
            message: `Image ${idx + 1} must be exactly ${HERO_IMAGE_WIDTH}×${HERO_IMAGE_HEIGHT}px (received ${meta.width ?? "?"}×${meta.height ?? "?"})`,
          });
        }
        const source = String(req.body[`source_${idx}`] || "").trim();
        const imageDescription = String(req.body[`imageDescription_${idx}`] || "").trim();
        const alt = String(req.body[`alt_${idx}`] || "").trim();
        const imageTitle = String(req.body[`imageTitle_${idx}`] || "").trim();
        if (!source || !imageDescription || !alt || !imageTitle) {
          if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
          return res.status(400).json({
            message: `Image ${idx + 1}: source, description, alt text, and image title are required`,
          });
        }
        newImages.push({
          url: `${baseUrl}/uploads/${file.filename}`,
          caption: req.body[`caption_${idx}`] || "",
          alt,
          imageTitle,
          imageDescription,
          source,
          width: meta.width,
          height: meta.height,
          isHero: idx === 0 && article.images.length === 0,
        });
      }

      article.images.push(...newImages);
      await article.save();

      res.json({ images: newImages, message: `${newImages.length} image(s) uploaded` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PATCH /api/articles/:id/images/:index — edit metadata (no re-upload)
router.patch("/:id/images/:index", authenticate, async (req, res) => {
  try {
    const idx = Number(req.params.index);
    if (!Number.isInteger(idx) || idx < 0) {
      return res.status(400).json({ message: "Invalid image index" });
    }
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (isWriterRole(req.user.role)) {
      if (!isAssignedWriter(article, req.user._id)) {
        return res.status(403).json({ message: "Not assigned to this article" });
      }
      if (!["draft", "rejected"].includes(article.status)) {
        return res.status(400).json({ message: "Cannot edit images on submitted/published articles" });
      }
    } else if (isEditorRole(req.user.role) || isAdminLike(req.user.role)) {
      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!article.images[idx]) return res.status(404).json({ message: "Image not found" });

    const img = article.images[idx];
    const patch = ["caption", "alt", "imageTitle", "imageDescription", "source"];
    patch.forEach((k) => {
      if (req.body[k] !== undefined) img[k] = String(req.body[k] ?? "");
    });
    if (
      !String(img.source || "").trim() ||
      !String(img.imageDescription || "").trim() ||
      !String(img.alt || "").trim() ||
      !String(img.imageTitle || "").trim()
    ) {
      return res.status(400).json({
        message: "Image source, description, alt text, and image title are required",
      });
    }
    if (req.body.isHero === true) {
      article.images.forEach((im, i) => {
        im.isHero = i === idx;
      });
    }

    await article.save();
    res.json({ image: article.images[idx], article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/articles/:id/images/:filename ─────────
router.delete("/:id/images/:filename", authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (isWriterRole(req.user.role)) {
      if (!isAssignedWriter(article, req.user._id)) {
        return res.status(403).json({ message: "Not assigned to this article" });
      }
    } else if (isEditorRole(req.user.role) || isAdminLike(req.user.role)) {
      if (!canDeskEditorActOnArticle(req.user, article)) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

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
