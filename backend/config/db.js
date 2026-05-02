const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== "string" || !uri.trim()) {
    console.error("MongoDB connection error: MONGO_URI is missing.");
    console.error("Set MONGO_URI in backend/.env — see backend/.env.example (MongoDB Atlas).");
    process.exit(1);
  }

  const isAtlas = uri.includes("mongodb.net") || uri.includes("mongodb+srv://");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15_000,
    });
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    if (isAtlas) {
      console.error(
        "Atlas checklist: (1) Database user + password in MONGO_URI — special chars in password must be URL-encoded (e.g. @ → %40). " +
          "(2) Atlas → Network Access — allow your IP or 0.0.0.0/0 for dev. " +
          "(3) Cluster host in URI must match Atlas → Connect → Drivers."
      );
    } else {
      console.error(
        "Local Mongo: ensure the server is running and MONGO_URI is correct. " +
          "Example: mongodb://127.0.0.1:27017/kothari-news — or switch to Atlas (see backend/.env.example)."
      );
    }
    process.exit(1);
  }
}

module.exports = connectDB;
