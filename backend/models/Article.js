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

const articleSchema = new mongoose.Schema(
  {
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

    readTime: { type: Number, default: 0 },   // minutes, auto-calculated

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

function asciiSlugPart(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

// Auto-generate slug from primary-locale title
articleSchema.pre("save", function (next) {
  if (!this.slug) {
    const titleForSlug = this.primaryLocale === "hi" ? this.titleHi : this.title;
    let base = asciiSlugPart(titleForSlug);
    if (!base) base = "article";
    this.slug = `${base}-${Date.now()}`;
  }

  // Auto read time from primary body (avg 200 wpm)
  const primaryBody = this.primaryLocale === "hi" ? this.bodyHi : this.body;
  const words = String(primaryBody || "").split(/\s+/).filter(Boolean).length;
  this.readTime = words ? Math.max(1, Math.ceil(words / 200)) : 0;

  next();
});

module.exports = mongoose.model("Article", articleSchema);
