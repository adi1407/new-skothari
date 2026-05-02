const router = require("express").Router();
const { body, query, validationResult } = require("express-validator");
const Video = require("../models/Video");
const { authenticate, authorize } = require("../middleware/auth");

const YT_HOST = /youtube\.com|youtu\.be/i;

function isLikelyYoutubeUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.trim());
    return YT_HOST.test(u.hostname);
  } catch {
    return false;
  }
}

// ── GET /api/videos (editor + admin desk) ─────────────────
router.get(
  "/",
  authenticate,
  authorize("editor", "admin"),
  [
    query("status").optional().isIn(["draft", "published"]),
    query("category").optional().isIn([
      "desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan",
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { status, category, page = 1, limit = 50 } = req.query;
      const q = {};
      if (status) q.status = status;
      if (category) q.category = category;

      const skip = (Number(page) - 1) * Number(limit);
      const [videos, total] = await Promise.all([
        Video.find(q)
          .sort({ sortOrder: 1, updatedAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Video.countDocuments(q),
      ]);

      res.json({
        videos,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── GET /api/videos/:id ─────────────────────────────────
router.get("/:id", authenticate, authorize("editor", "admin"), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ video });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/videos ────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("editor", "admin"),
  [
    body("title").trim().notEmpty(),
    body("youtubeUrl").trim().notEmpty().custom((v) => {
      if (!isLikelyYoutubeUrl(v)) throw new Error("Must be a valid YouTube URL");
      return true;
    }),
    body("category")
      .optional()
      .isIn(["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const payload = { ...req.body };
      if (payload.status === "published" && !payload.publishedAt) {
        payload.publishedAt = new Date();
      }
      const video = await Video.create(payload);
      res.status(201).json({ video });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── PUT /api/videos/:id ─────────────────────────────────
router.put(
  "/:id",
  authenticate,
  authorize("editor", "admin"),
  [
    body("youtubeUrl")
      .optional()
      .custom((v) => {
        if (v == null || v === "") return true;
        if (!isLikelyYoutubeUrl(v)) throw new Error("Must be a valid YouTube URL");
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ message: "Video not found" });

      const allowed = [
        "primaryLocale",
        "title", "titleEn", "summary", "summaryEn", "youtubeUrl",
        "duration", "views", "category", "thumbnailOverride", "sortOrder", "status", "publishedAt",
        "seedTag",
      ];
      allowed.forEach((f) => {
        if (req.body[f] !== undefined) video[f] = req.body[f];
      });

      if (video.status === "published" && !video.publishedAt) {
        video.publishedAt = new Date();
      }
      if (video.status === "draft") {
        video.publishedAt = null;
      }

      await video.save();
      res.json({ video });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── DELETE /api/videos/:id (admin only) ─────────────────
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
