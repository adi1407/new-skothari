const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required: true, index: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true, index: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ reader: 1, article: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
