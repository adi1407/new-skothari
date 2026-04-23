/**
 * Seed 5 published articles per category (40 total) without starting the API server.
 * Usage: from repo root, `npm run seed:articles --prefix backend`
 * Skips if any article already has tag `khabar-seed-2026`.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const seed = require("../config/seed");

connectDB()
  .then(() => seed.seedArticlesOnly())
  .then(() => mongoose.connection.close())
  .then(() => {
    console.log("Database connection closed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close().finally(() => process.exit(1));
  });
