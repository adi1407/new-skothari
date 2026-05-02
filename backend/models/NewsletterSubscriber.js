const mongoose = require("mongoose");

/** Public site email-only subscribers (e.g. footer form) — receives same digests as logged-in readers. */
const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    active: { type: Boolean, default: true },
    digestCadence: { type: String, enum: ["daily", "weekly", "off"], default: "daily" },
    lastDigestSentAt: { type: Date, default: null },
    source: { type: String, default: "web", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
