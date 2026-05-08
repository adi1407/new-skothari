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
    url:              { type: String, required: true },
    caption:          { type: String, default: "" },
    isHero:           { type: Boolean, default: false },
    alt:              { type: String, default: "" },
    imageTitle:       { type: String, default: "" },
    imageDescription: { type: String, default: "" },
    source:           { type: String, default: "" },
    width:            { type: Number, default: null },
    height:           { type: Number, default: null },
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

    /** Unique 9-digit public id for canonical URLs (assigned on first save). */
    articleNumber: {
      type: Number,
      sparse: true,
      unique: true,
      index: true,
      min: 100000000,
      max: 999999999,
    },

    // ── Content ──
    title: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
    titleHi: { type: String, trim: true, maxlength: 250, default: "" },

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
      enum: ["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"],
      default: "desh",
    },

    tags: [{ type: String, trim: true }],

    isBreaking: { type: Boolean, default: false },

    readTime: { type: Number, default: 0 }, // minutes, auto-calculated

    // ── SEO (meta keywords English-only, single field) ──
    metaTitle: { type: String, trim: true, maxlength: 250, default: "" },
    metaTitleHi: { type: String, trim: true, maxlength: 250, default: "" },
    metaDescription: { type: String, trim: true, maxlength: 500, default: "" },
    metaDescriptionHi: { type: String, trim: true, maxlength: 500, default: "" },
    metaKeywords: { type: String, trim: true, maxlength: 500, default: "" },
    /** Display byline override (else populated author.name). */
    bylineName: { type: String, trim: true, maxlength: 200, default: "" },

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

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: { type: String, default: "" },
    rejectedAt: { type: Date, default: null },

    publishedAt: { type: Date, default: null },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
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

articleSchema.pre("save", async function preArticleSave(next) {
  try {
    if (this.articleNumber == null || this.articleNumber === undefined) {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const n = 100000000 + Math.floor(Math.random() * 900000000);
        /* eslint-disable no-await-in-loop */
        const clash = await this.constructor.findOne({ articleNumber: n }).select("_id").lean();
        /* eslint-enable no-await-in-loop */
        if (!clash) {
          this.articleNumber = n;
          break;
        }
      }
      if (this.articleNumber == null) {
        return next(new Error("Could not assign unique article number"));
      }
    }

    if (!this.slug) {
      const titleForSlug = this.primaryLocale === "hi" ? this.titleHi : this.title;
      let base = asciiSlugPart(titleForSlug);
      if (!base) base = "article";
      this.slug = `${base}-${Date.now()}`;
    }

    const primaryBody = this.primaryLocale === "hi" ? this.bodyHi : this.body;
    const words = String(primaryBody || "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    this.readTime = words ? Math.max(1, Math.ceil(words / 200)) : 0;

    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model("Article", articleSchema);
