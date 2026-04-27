const mongoose = require("mongoose");

const readerArticleViewSchema = new mongoose.Schema(
  {
    reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required: true, index: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    progressPct: { type: Number, default: 0, min: 0, max: 100 },
    readSeconds: { type: Number, default: 0, min: 0 },
    lastViewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

readerArticleViewSchema.index({ reader: 1, article: 1 }, { unique: true });

module.exports = mongoose.model("ReaderArticleView", readerArticleViewSchema);
