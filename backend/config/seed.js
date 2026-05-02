const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Video = require("../models/Video");
const Article = require("../models/Article");
const { buildPayloads, SEED_TAG } = require("./articleSeedData");

const VIDEO_SEED_TAG = "khabar-video-seed-2026";

const VIDEO_YT = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  "https://www.youtube.com/watch?v=9bZkp7q19f0",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  "https://www.youtube.com/watch?v=L_jWH84IxU4",
  "https://www.youtube.com/watch?v=ZXBcwyNnzKQ",
  "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  "https://www.youtube.com/watch?v=RgKAFK5djSk",
  "https://www.youtube.com/watch?v=YQHsXMglC9A",
  "https://www.youtube.com/watch?v=hY7m5jjJ9oM",
  "https://www.youtube.com/watch?v=09R8_2nJtjg",
  "https://www.youtube.com/watch?v=SlPhMPnQ58k",
  "https://www.youtube.com/watch?v=OPf0YbXqDm0",
  "https://www.youtube.com/watch?v=ktvTqknDobU",
  "https://www.youtube.com/watch?v=fLexgOxsZu0",
  "https://www.youtube.com/watch?v=LbTUjl_YfJY",
];

/** Headlines for demo embeds — Hindi-primary uses `title` (HI) + titleEn (EN); English-primary swaps storage so API filters stay consistent. */
function buildVideoSeedDocs(now) {
  const cats = ["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"];
  const pairs = [
    {
      hi: { title: "देश डेस्क ब्रीफिंग — आज की बड़ी खबरें", titleEn: "Country desk briefing — top stories today", sum: "तीन बड़े फैसलों पर संक्षिप्त विश्लेषण।", sumEn: "A quick walkthrough of three big decisions." },
      en: { title: "India tonight — policy & economy roundup", titleEn: "इंडिया टुनाइट — नीति और अर्थव्यवस्था राउंडअप", sum: "Editors unpack rural infra and metro timelines.", sumEn: "संपादक ग्रामीण बुनियादी ढांचे और मेट्रो समय सारणी समझाते हैं।" },
    },
    {
      hi: { title: "विदेश — विश्व शिखर से क्या संदेश?", titleEn: "World — key takeaway from the summit", sum: "समुद्री सुरक्षा पर संयुक्त बयान का मुख्य बिंदु।", sumEn: "Main points from the joint maritime statement." },
      en: { title: "Global Affairs Weekly — explainers & wires", titleEn: "ग्लोबल अफेयर्स वीकली — एक्सप्लेनर और वायर्स", sum: "Rates, corridors, and embassy advisories in five minutes.", sumEn: "दरें, गलियारे और दूतावास सलाह पाँच मिनट में।" },
    },
    {
      hi: { title: "संसद इस सप्ताह — विपक्ष का रुख क्या?", titleEn: "Parliament this week — opposition stance", sum: "बहस के नियमों पर घमासान की पृष्ठभूमि।", sumEn: "Context behind the uproar over debate rules." },
      en: { title: "Politics Inside — committees & counting calendar", titleEn: "पॉलिटिक्स इनसाइड — समितियाँ और गिनती कैलेंडर", sum: "GST panels and revised counting timelines decoded.", sumEn: "जीएसटी पैनल और संशोधित गिनती समय सारणी का विश्लेषण।" },
    },
    {
      hi: { title: "खेल डायरी — कैंप, चोट और फ्रेंचाइज़ तारीखें", titleEn: "Sports diary — camps, injuries, playoffs", sum: "फिटनेस बेंचमार्क और नॉकआउट स्थानों की पुष्टि।", sumEn: "Fitness benchmarks and neutral knockout venues locked." },
      en: { title: "Matchweek Studio — tactics & selections", titleEn: "मैचवीक स्टूडियो — रणनीति और चयन", sum: "Who gains from schedule tweaks before the tour?", sumEn: "दौरे से पहले कार्यक्रम बदलाव से किसे फायदा?" },
    },
    {
      hi: { title: "स्वास्थ्य अलर्ट — शिविर और हेल्पलाइन विस्तार", titleEn: "Health alert — camps & helpline expansion", sum: "स्क्रीनिंग शिविर और क्षेत्रीय भाषा परामर्शदाता।", sumEn: "Screening pushes and counsellors in regional languages." },
      en: { title: "Wellness Dispatch — studies & slots", titleEn: "वेलनेस डिस्पैच — अध्ययन और स्लॉट", sum: "Sleep regularity findings and evening vaccination slots.", sumEn: "नींद की नियमितता और शाम के टीकाकरण स्लॉट पर रिपोर्ट।" },
    },
    {
      hi: { title: "खेत से फ़ील्ड रिपोर्ट — फसल और बाज़ार संकेत", titleEn: "From the farm — crop & mandi signals", sum: "एमएसपी नोट और मृदा कार्ड डिजिटलीकरण की प्रगति।", sumEn: "MSP note progress and digitised soil-health grids." },
      en: { title: "Agri Economy — irrigation & bee clusters", titleEn: "एग्री इकोनॉमी — सिंचाई और मधुमक्खी क्लस्टर", sum: "Canal pilots, traceability QR for graded honey exports.", sumEn: "नहर पायलट और ग्रेडेड शहद निर्यात के लिए ट्रेसेबिलिटी क्यूआर।" },
    },
    {
      hi: { title: "बाज़ार ब्रीफ़ — RBI और एयरलाइन फ्रीक्वेंसी", titleEn: "Market brief — RBI stance & airline frequencies", sum: "नीति दरों पर बाज़ार की प्रथम प्रतिक्रिया।", sumEn: "First market takeaways after the policy commentary." },
      en: { title: "Business Week — SME credit & renewables", titleEn: "बिज़नेस वीक — एसएमई क्रेडिट और नवीकरणीय", sum: "Exporter credit lines tied to invoice APIs.", sumEn: "इनवॉइस एपीआई से जुड़े निर्यातक क्रेडिट लाइन पर फोकस।" },
    },
    {
      hi: { title: "मनोरंजन राउंडअप — ट्रेलर, फेस्टिवल और जूरी नोट्स", titleEn: "Entertainment roundup — trailers & jury notes", sum: "आठ एपिसोड ड्रामा का ट्रेलर और कार्बन ऑफसेट योजना।", sumEn: "Eight-part drama trailer plus festival offset pledges." },
      en: { title: "Culture Desk — casting calls & dates", titleEn: "कल्चर डेस्क — कास्टिंग और रिलीज़ तारीखें", sum: "Anthology workshops before monsoon shoots.", sumEn: "मानसून शूट से पहले एंथोलॉजी वर्कशॉप का दौर।" },
    },
  ];

  const docs = [];
  let k = 0;
  cats.forEach((category, idx) => {
    const pair = pairs[idx];
    const hiDoc = {
      primaryLocale: "hi",
      title: pair.hi.title,
      titleEn: pair.hi.titleEn,
      summary: pair.hi.sum,
      summaryEn: pair.hi.sumEn,
      youtubeUrl: VIDEO_YT[k++ % VIDEO_YT.length],
      duration: `${12 + (idx % 7)}:${10 + idx}`,
      views: `${(1.2 + idx * 0.21).toFixed(2)}M`,
      category,
      sortOrder: docs.length,
      status: "published",
      publishedAt: now,
      seedTag: VIDEO_SEED_TAG,
    };
    const enDoc = {
      primaryLocale: "en",
      title: pair.en.title,
      titleEn: pair.en.titleEn,
      summary: pair.en.sum,
      summaryEn: pair.en.sumEn,
      youtubeUrl: VIDEO_YT[k++ % VIDEO_YT.length],
      duration: `${14 + (idx % 5)}:${20 + idx}`,
      views: `${(0.85 + idx * 0.17).toFixed(2)}M`,
      category,
      sortOrder: docs.length + 1,
      status: "published",
      publishedAt: new Date(now.getTime() - idx * 60000),
      seedTag: VIDEO_SEED_TAG,
    };
    docs.push(hiDoc, enDoc);
  });
  return docs;
}

async function seedAdmin() {
  try {
    const email = String(process.env.SEED_ADMIN_EMAIL || "admin@kotharinews.com")
      .toLowerCase()
      .trim();
    const name = process.env.SEED_ADMIN_NAME || "Super Admin";
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";
    const hash = await bcrypt.hash(password, 12);

    const existing = await User.findOne({ email }).select("+password");
    if (existing) {
      // One-time recovery: set SEED_ADMIN_SYNC_PASSWORD=1 on Render, redeploy once, then remove it.
      if (
        process.env.SEED_ADMIN_SYNC_PASSWORD === "1" &&
        existing.role === "admin" &&
        existing.isActive
      ) {
        existing.password = hash;
        existing.name = name;
        await existing.save();
        console.log("Admin password/name synced from env (remove SEED_ADMIN_SYNC_PASSWORD after use):", email);
      }
      return;
    }

    await User.create({
      name,
      email,
      password: hash,
      role: "admin",
    });
    console.log("Admin account seeded:", email);
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}

/** English + Hindi desk writers (CMS login). Override via SEED_WRITER_* env vars. */
async function seedDeskWriters() {
  try {
    const pass = process.env.SEED_WRITER_PASSWORD || "Writer@1234";
    const hash = await bcrypt.hash(pass, 12);
    const desks = [
      {
        name: process.env.SEED_WRITER_EN_NAME || "English Desk Writer",
        email: process.env.SEED_WRITER_EN_EMAIL || "writer.en@kotharinews.com",
        role: "writer_en",
      },
      {
        name: process.env.SEED_WRITER_HI_NAME || "Hindi Desk Writer",
        email: process.env.SEED_WRITER_HI_EMAIL || "writer.hi@kotharinews.com",
        role: "writer_hi",
      },
    ];
    for (const d of desks) {
      const exists = await User.findOne({ email: d.email });
      if (exists) continue;
      await User.create({
        name: d.name,
        email: d.email,
        password: hash,
        role: d.role,
      });
      console.log(`Desk writer seeded (${d.role}):`, d.email);
    }
  } catch (err) {
    console.error("Desk writers seed error:", err.message);
  }
}

async function seedSampleVideos() {
  try {
    await Video.deleteMany({ seedTag: VIDEO_SEED_TAG });
    const now = new Date();
    const docs = buildVideoSeedDocs(now);
    await Video.insertMany(docs);
    console.log(`Published demo videos seeded: ${docs.length} (${VIDEO_SEED_TAG}).`);
  } catch (err) {
    console.error("Video seed error:", err.message);
  }
}

async function seedSampleArticles() {
  try {
    await Article.deleteMany({ tags: SEED_TAG });
    const admin = await User.findOne({ role: "admin" }).select("_id").lean();
    if (!admin) {
      console.warn("seedSampleArticles: no admin user; run seed admin first.");
      return;
    }
    const batchId = Date.now().toString(36);
    const payloads = buildPayloads(admin._id, batchId);
    let ok = 0;
    for (const doc of payloads) {
      try {
        await Article.create(doc);
        ok += 1;
      } catch (err) {
        console.error("Article seed row failed:", err.message);
      }
    }
    console.log(`Sample articles seeded: ${ok}/${payloads.length} published (${payloads.length / 8} × 8 categories, hi/en primaryLocale mix).`);
  } catch (err) {
    console.error("Article seed error:", err.message);
  }
}

async function seedAll() {
  await seedAdmin();
  await seedDeskWriters();
  await seedSampleVideos();
  await seedSampleArticles();
}

/** Run without starting the HTTP server (e.g. `node scripts/seedArticles.js`). */
async function seedArticlesOnly() {
  await seedAdmin();
  await seedDeskWriters();
  await seedSampleArticles();
}

module.exports = seedAll;
module.exports.seedArticlesOnly = seedArticlesOnly;
module.exports.seedSampleArticles = seedSampleArticles;
module.exports.seedDeskWriters = seedDeskWriters;
