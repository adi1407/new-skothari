const mongoose = require("mongoose");

/*
  Status flow:
    draft  ──writer submits──►  submitted  ──editor publishes──►  published
                                    │
                               editor rejects
                                    │
                                  draft  (writer edits and resubmits)
*/

const imageSchema = new mongoose.Schema(
  {
    url:     { type: String, required: true },
    caption: { type: String, default: "" },
    isHero:  { type: Boolean, default: false },
  },
  { _id: false }
);

function asciiSlugPart(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

const articleSchema = new mongoose.Schema(
  {
    // Primary language for this story (separate uploads per locale; no pairing)
    primaryLocale: {
      type: String,
      enum: ["hi", "en"],
      default: "en",
      index: true,
    },

    // ── Content ──
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    titleHi: { type: String, trim: true, maxlength: 200, default: "" },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },

    summary: { type: String, trim: true, maxlength: 500, default: "" },
    summaryHi: { type: String, trim: true, maxlength: 500, default: "" },

    body: { type: String, default: "" },
    bodyHi: { type: String, default: "" },

    images: [imageSchema],

    category: {
      type: String,
      enum: ["politics", "sports", "tech", "business", "entertainment", "health", "world", "state"],
      default: "politics",
    },

    tags: [{ type: String, trim: true }],

    isBreaking: { type: Boolean, default: false },

    readTime: { type: Number, default: 0 },   // minutes, auto-calculated from primary body

    // ── Workflow ──
    status: {
      type: String,
      enum: ["draft", "submitted", "published", "rejected"],
      default: "draft",
      index: true,
    },

    // ── People ──
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // editor who last touched this
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Rejection ──
    rejectionReason: { type: String, default: "" },
    rejectedAt: { type: Date, default: null },

    // ── Publication ──
    publishedAt: { type: Date, default: null },

    // ── Linked task (optional) ──
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // ── Metadata ──
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Slug from primary title; read time from primary body
articleSchema.pre("save", function (next) {
  const pl = this.primaryLocale === "hi" ? "hi" : "en";
  const primaryTitle = pl === "hi" ? (this.titleHi || "") : (this.title || "");

  if (!this.slug) {
    let base = asciiSlugPart(primaryTitle);
    if (!base) base = "article";
    this.slug = `${base}-${Date.now()}`.slice(0, 120);
  }

  const primaryBody = pl === "hi" ? (this.bodyHi || "") : (this.body || "");
  const words = primaryBody.trim().split(/\s+/).filter(Boolean).length;
  this.readTime = words ? Math.max(1, Math.ceil(words / 200)) : 0;

  next();
});

module.exports = mongoose.model("Article", articleSchema);
