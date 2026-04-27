const mongoose = require("mongoose");

const readerArticleViewSchema = new mongoose.Schema(
  {
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
      index: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readerArticleViewSchema.index({ reader: 1, article: 1 }, { unique: true });

module.exports = mongoose.model("ReaderArticleView", readerArticleViewSchema);
