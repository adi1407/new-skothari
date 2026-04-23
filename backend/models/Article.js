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
    // ── Content ──
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
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

// Auto-generate slug from title
articleSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 100) +
      "-" +
      Date.now();
  }

  // Auto read time (avg 200 wpm)
  if (this.isModified("body") && this.body) {
    const words = this.body.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }

  next();
});

module.exports = mongoose.model("Article", articleSchema);
