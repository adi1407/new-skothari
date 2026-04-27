const mongoose = require("mongoose");

const recommendationSignalSchema = new mongoose.Schema(
  {
    reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required: true, index: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", default: null, index: true },
    category: { type: String, default: "", index: true },
    eventType: {
      type: String,
      enum: ["view", "bookmark", "share", "complete", "category_click"],
      required: true,
      index: true,
    },
    weight: { type: Number, default: 1 },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecommendationSignal", recommendationSignalSchema);
