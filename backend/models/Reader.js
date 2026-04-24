const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    preferredLang: { type: String, enum: ["hi", "en"], default: "hi" },
    newsletterOptIn: { type: Boolean, default: false },
  },
  { _id: false }
);

const readerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    avatar: { type: String, default: "" },
    /** True if user registered with email/password or set a password (Google-only users false). */
    hasLocalPassword: { type: Boolean, default: false },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reader", readerSchema);
