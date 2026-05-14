const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    primaryLocale: {
      type: String,
      enum: ["hi", "en"],
      default: "en",
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 220 },
    titleEn: { type: String, trim: true, maxlength: 220, default: "" },
    summary: { type: String, trim: true, maxlength: 500, default: "" },
    summaryEn: { type: String, trim: true, maxlength: 500, default: "" },
    youtubeUrl: { type: String, required: true, trim: true, maxlength: 500 },
    /** Optional display metadata from the channel (filled in CMS). */
    youtubeChannelTitle: { type: String, trim: true, maxlength: 220, default: "" },
    youtubeChannelUrl: { type: String, trim: true, maxlength: 500, default: "" },
    duration: { type: String, trim: true, default: "" },
    views: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"],
      default: "desh",
    },
    /** Manual poster override; otherwise web uses YouTube hqdefault from URL */
    thumbnailOverride: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date, default: null },
    /** Cleared before demo re-seed (`seed.js`) */
    seedTag: { type: String, trim: true, default: "", index: true },
  },
  { timestamps: true }
);

videoSchema.index({ status: 1, sortOrder: 1 });
videoSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Video", videoSchema);
