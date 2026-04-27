require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGO_URI / MONGODB_URI");
  await mongoose.connect(uri);
  const res = await Article.updateMany(
    { $or: [{ primaryLocale: { $exists: false } }, { primaryLocale: null }, { primaryLocale: "" }] },
    { $set: { primaryLocale: "en" } }
  );
  console.log("migrate-primary-locale", { matched: res.matchedCount, modified: res.modifiedCount });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
