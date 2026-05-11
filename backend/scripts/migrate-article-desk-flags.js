/**
 * One-time migration after staged desk submit + slug URLs:
 * - Set enDeskComplete / hiDeskComplete on existing articles.
 * - Map legacy User.role "writer" → writer_en.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");
const User = require("../models/User");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGO_URI / MONGODB_URI");
  await mongoose.connect(uri);

  const pipelineStatuses = await Article.updateMany(
    { status: { $in: ["submitted", "published", "rejected"] } },
    { $set: { enDeskComplete: true, hiDeskComplete: true } }
  );
  console.log("desk-flags pipeline statuses", {
    matched: pipelineStatuses.matchedCount,
    modified: pipelineStatuses.modifiedCount,
  });

  const draftBilingual = await Article.updateMany(
    {
      status: { $in: ["draft", "rejected"] },
      title: { $regex: /\S/ },
      titleHi: { $regex: /\S/ },
      summary: { $regex: /\S/ },
      summaryHi: { $regex: /\S/ },
      body: { $regex: /\S/ },
      bodyHi: { $regex: /\S/ },
    },
    { $set: { enDeskComplete: true, hiDeskComplete: true } }
  );
  console.log("desk-flags draft bilingual", {
    matched: draftBilingual.matchedCount,
    modified: draftBilingual.modifiedCount,
  });

  const users = await User.updateMany({ role: "writer" }, { $set: { role: "writer_en" } });
  console.log("user role writer → writer_en", {
    matched: users.matchedCount,
    modified: users.modifiedCount,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
