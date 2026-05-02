const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "writer", "writer_en", "writer_hi"],
      default: "writer",
    },
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 300, default: "" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    /** CMS forgot-password OTP (select: false in queries unless +field) */
    passwordResetOtpHash: { type: String, select: false, default: null },
    passwordResetOtpExpiresAt: { type: Date, select: false, default: null },
    passwordResetLastSentAt: { type: Date, select: false, default: null },
    passwordResetWindowStart: { type: Date, select: false, default: null },
    passwordResetWindowCount: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

// Virtual: articles count (populated on demand via aggregation)
userSchema.virtual("articlesCount");

module.exports = mongoose.model("User", userSchema);
