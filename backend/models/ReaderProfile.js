const mongoose = require("mongoose");

const readerProfileSchema = new mongoose.Schema(
  {
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
      unique: true,
      index: true,
    },
    primaryLanguage: { type: String, enum: ["hi", "en"], default: "hi" },
    preferredCategories: [{ type: String, trim: true }],
    followedTopics: [{ type: String, trim: true }],
    newsletterEnabled: { type: Boolean, default: false },
    newsletterTopics: [{ type: String, trim: true }],
    digestCadence: { type: String, enum: ["daily", "weekly", "off"], default: "daily" },
    profileVisibility: { type: String, enum: ["private", "public"], default: "private" },
    bio: { type: String, default: "", maxlength: 300 },
    socialLinks: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    avatarOverride: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReaderProfile", readerProfileSchema);
