const mongoose = require("mongoose");

const readerSessionSchema = new mongoose.Schema(
  {
    reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    revokedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReaderSession", readerSessionSchema);
