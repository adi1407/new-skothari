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
      enum: ["admin", "editor", "writer"],
      default: "writer",
    },
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 300, default: "" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: articles count (populated on demand via aggregation)
userSchema.virtual("articlesCount");

module.exports = mongoose.model("User", userSchema);
