const mongoose = require("mongoose");

const readerSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reader", readerSchema);
