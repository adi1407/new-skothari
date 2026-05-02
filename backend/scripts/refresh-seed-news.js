/**
 * Refresh demo/seed news with a mixed Hindi-English editorial stream:
 * - Removes old khabar seed articles.
 * - Inserts fresh published articles in current CMS format.
 * - Keeps some topics same across hi/en and some different.
 *
 * Usage (repo root):
 *   node backend/scripts/refresh-seed-news.js
 * or:
 *   npm run seed:refresh-news --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Article = require("../models/Article");

const BASE_TAG = "khabar-seed-2026";
const NEW_TAG = "khabar-seed-2026-v2";

const CATEGORIES = ["politics", "sports", "tech", "business", "entertainment", "health", "world", "state"];

function hero(seed) {
  return `https://picsum.photos/seed/${seed}/1200/675`;
}

function makeDoc({
  locale,
  title,
  summary,
  bodyHtml,
  category,
  tags,
  imageSeed,
  authorId,
  publishedAt,
  isBreaking = false,
}) {
  const isHi = locale === "hi";
  const uniqueTags = [...new Set([BASE_TAG, NEW_TAG, ...tags])];
  return {
    primaryLocale: locale,
    title: isHi ? "" : title,
    titleHi: isHi ? title : "",
    summary: isHi ? "" : summary,
    summaryHi: isHi ? summary : "",
    body: isHi ? "" : bodyHtml,
    bodyHi: isHi ? bodyHtml : "",
    images: [
      { url: hero(imageSeed), caption: title, isHero: true },
      { url: hero(`${imageSeed}-inline`), caption: "File image", isHero: false },
    ],
    category,
    tags: uniqueTags,
    isBreaking,
    status: "published",
    author: authorId,
    publishedAt,
    views: 800,
  };
}

function enBody(lead) {
  return [
    `<p>${lead}</p>`,
    "<p>Officials said implementation notes are being reviewed with district-level coordination teams. Stakeholder consultations are expected to continue this week.</p>",
    "<p>Our newsroom will keep updating this story with verified developments and on-ground reactions.</p>",
  ].join("");
}

function hiBody(lead) {
  return [
    `<p>${lead}</p>`,
    "<p>अधिकारियों ने कहा कि क्रियान्वयन नोट्स की समीक्षा जिला-स्तरीय समन्वय टीमों के साथ जारी है। हितधारकों से परामर्श इस सप्ताह जारी रहने की संभावना है।</p>",
    "<p>पुष्ट अपडेट और ज़मीनी प्रतिक्रियाओं के साथ यह रिपोर्ट लगातार अपडेट की जाएगी।</p>",
  ].join("");
}

function buildDataset(authorId) {
  const now = Date.now();
  let seq = 0;
  const nextTime = () => new Date(now - seq++ * 8 * 60 * 1000);
  const docs = [];

  // Same-topic pairs (hi + en both present)
  const paired = [
    {
      category: "sports",
      en: {
        title: "National camp starts with strict fitness benchmark",
        summary: "Coaches start VO2 and injury-prevention drills before the tournament window.",
        lead: "Team analysts began morning testing with position-wise load tracking and recovery protocols.",
      },
      hi: {
        title: "राष्ट्रीय शिविर सख्त फिटनेस बेंचमार्क के साथ शुरू",
        summary: "कोचों ने टूर्नामेंट विंडो से पहले वीओ2 और चोट-रोधी ड्रिल शुरू कीं।",
        lead: "टीम विश्लेषकों ने सुबह के सत्र में पोज़िशन-आधारित लोड ट्रैकिंग और रिकवरी प्रोटोकॉल शुरू किए।",
      },
      isBreaking: true,
    },
    {
      category: "politics",
      en: {
        title: "State policy debate enters second phase in assembly",
        summary: "Ruling and opposition benches clash over implementation timeline.",
        lead: "Lawmakers debated financing and district rollout priorities during the extended afternoon session.",
      },
      hi: {
        title: "विधानसभा में राज्य नीति पर बहस दूसरे चरण में",
        summary: "सत्तापक्ष और विपक्ष में क्रियान्वयन समय-सीमा पर तीखी बहस हुई।",
        lead: "विधायकों ने विस्तारित दोपहर सत्र में फंडिंग और जिला-स्तर प्राथमिकताओं पर चर्चा की।",
      },
    },
    {
      category: "tech",
      en: {
        title: "Public cloud providers announce low-latency regional nodes",
        summary: "New infrastructure aims to improve response time for local apps.",
        lead: "Engineering teams said edge routing changes will reduce latency spikes during peak traffic.",
      },
      hi: {
        title: "पब्लिक क्लाउड प्रदाताओं ने लो-लेटेंसी क्षेत्रीय नोड्स घोषित किए",
        summary: "नई इंफ्रास्ट्रक्चर से स्थानीय ऐप्स का रिस्पॉन्स टाइम बेहतर होगा।",
        lead: "इंजीनियरिंग टीमों ने कहा कि एज रूटिंग बदलाव से पीक ट्रैफिक में लेटेंसी स्पाइक कम होंगे।",
      },
    },
  ];

  paired.forEach((p, idx) => {
    docs.push(
      makeDoc({
        locale: "en",
        title: p.en.title,
        summary: p.en.summary,
        bodyHtml: enBody(p.en.lead),
        category: p.category,
        tags: [p.category, "khabar-kothri", "paired-topic"],
        imageSeed: `v2-${p.category}-pair-${idx + 1}-en`,
        authorId,
        publishedAt: nextTime(),
        isBreaking: Boolean(p.isBreaking),
      })
    );
    docs.push(
      makeDoc({
        locale: "hi",
        title: p.hi.title,
        summary: p.hi.summary,
        bodyHtml: hiBody(p.hi.lead),
        category: p.category,
        tags: [p.category, "khabar-kothri", "paired-topic"],
        imageSeed: `v2-${p.category}-pair-${idx + 1}-hi`,
        authorId,
        publishedAt: nextTime(),
        isBreaking: Boolean(p.isBreaking),
      })
    );
  });

  // English-only and Hindi-only stories (different streams)
  const enOnly = [
    ["business", "Export credit window opens for MSME clusters", "Banks roll out same-day approvals for verified invoice histories.", "Officials expect stronger quarter-end shipment volume from small exporters."],
    ["world", "Maritime summit drafts humanitarian corridor protocol", "Delegates agree on a faster emergency clearance mechanism.", "Coastal agencies will run a joint drill with logistics partners next month."],
    ["entertainment", "Streaming studio greenlights crime anthology season", "Production teams begin casting for six standalone episodes.", "Showrunners confirmed each episode will feature a different city and investigative arc."],
    ["health", "City hospitals pilot unified emergency bed dashboard", "A real-time dashboard links occupancy across major facilities.", "Health administrators said this could reduce transfer delays during peak hours."],
    ["state", "Urban transport body approves electric bus depot expansion", "Two depots will add fast-charging lanes in phase one.", "Project engineers say route reliability should improve before festive traffic."],
  ];

  enOnly.forEach((row, idx) => {
    docs.push(
      makeDoc({
        locale: "en",
        title: row[1],
        summary: row[2],
        bodyHtml: enBody(row[3]),
        category: row[0],
        tags: [row[0], "khabar-kothri", "en-only"],
        imageSeed: `v2-${row[0]}-en-only-${idx + 1}`,
        authorId,
        publishedAt: nextTime(),
      })
    );
  });

  const hiOnly = [
    ["business", "खुदरा बाज़ार में त्योहारी मांग के लिए नई सप्लाई योजना", "थोक और रिटेल चैनलों में समन्वय बढ़ाने की रणनीति तैयार हुई।", "व्यापार मंडलों का कहना है कि समय पर स्टॉकिंग से कीमतों में अनावश्यक उतार-चढ़ाव कम होगा।"],
    ["world", "विदेशी बाज़ार संकेतों के बीच मुद्रा स्थिरता पर विशेष निगरानी", "विश्लेषकों ने अल्पकालिक जोखिम प्रबंधन पर जोर दिया।", "आर्थिक सलाहकारों के अनुसार, आयात-निर्यात संतुलन के आंकड़े अगले सप्ताह दिशा स्पष्ट करेंगे।"],
    ["entertainment", "क्षेत्रीय संगीत समारोह के लिए कलाकार सूची जारी", "आयोजकों ने युवा प्रतिभाओं के लिए अलग मंच की घोषणा की।", "कार्यक्रम टीम ने बताया कि इस बार लाइव सहयोग और लोक वाद्य प्रस्तुतियां मुख्य आकर्षण होंगी।"],
    ["health", "जिला स्वास्थ्य केंद्रों में मातृ-स्वास्थ्य फॉलोअप ट्रैकर शुरू", "एएनएम और आशा कार्यकर्ताओं को नया डिजिटल मॉड्यूल दिया गया।", "स्वास्थ्य विभाग का दावा है कि इससे समय पर जांच और रेफरल में सुधार होगा।"],
    ["state", "राज्य राजमार्ग परियोजना में मानसून सुरक्षा ऑडिट अनिवार्य", "निर्माण एजेंसियों को त्वरित अनुपालन रिपोर्ट जमा करने के निर्देश।", "तकनीकी टीमों ने कहा कि जल निकासी और ढलान स्थिरता मानकों की साप्ताहिक समीक्षा होगी।"],
  ];

  hiOnly.forEach((row, idx) => {
    docs.push(
      makeDoc({
        locale: "hi",
        title: row[1],
        summary: row[2],
        bodyHtml: hiBody(row[3]),
        category: row[0],
        tags: [row[0], "khabar-kothri", "hi-only"],
        imageSeed: `v2-${row[0]}-hi-only-${idx + 1}`,
        authorId,
        publishedAt: nextTime(),
      })
    );
  });

  // Ensure at least one story in every category for both streams where possible.
  for (const cat of CATEGORIES) {
    const hasEn = docs.some((d) => d.category === cat && d.primaryLocale === "en");
    const hasHi = docs.some((d) => d.category === cat && d.primaryLocale === "hi");
    if (!hasEn) {
      docs.push(
        makeDoc({
          locale: "en",
          title: `${cat[0].toUpperCase()}${cat.slice(1)} desk update: policy and field watch`,
          summary: "Editors are tracking the latest verified developments from this beat.",
          bodyHtml: enBody("The desk has issued a rolling brief while correspondents gather district updates."),
          category: cat,
          tags: [cat, "khabar-kothri", "en-fallback"],
          imageSeed: `v2-${cat}-en-fallback`,
          authorId,
          publishedAt: nextTime(),
        })
      );
    }
    if (!hasHi) {
      docs.push(
        makeDoc({
          locale: "hi",
          title: `${cat} डेस्क अपडेट: नीति और ज़मीनी निगरानी`,
          summary: "इस बीट पर सत्यापित अपडेट के लिए संपादकीय टीम लगातार नज़र रख रही है।",
          bodyHtml: hiBody("डेस्क ने रोलिंग ब्रीफ जारी किया है और संवाददाता जिला-स्तर के अपडेट जुटा रहे हैं।"),
          category: cat,
          tags: [cat, "khabar-kothri", "hi-fallback"],
          imageSeed: `v2-${cat}-hi-fallback`,
          authorId,
          publishedAt: nextTime(),
        })
      );
    }
  }

  return docs;
}

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) {
    throw new Error("No admin user found. Please run admin seed first.");
  }

  const removeQuery = {
    $or: [
      { tags: BASE_TAG },
      { tags: NEW_TAG },
      { tags: /khabar-seed-2026-hi/i },
      { tags: /seed-source:/i },
    ],
  };

  const beforeCount = await Article.countDocuments(removeQuery);
  await Article.deleteMany(removeQuery);

  const payloads = buildDataset(admin._id);
  await Article.insertMany(payloads, { ordered: false });

  const insertedCount = await Article.countDocuments({ tags: NEW_TAG });
  const hiCount = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "hi" });
  const enCount = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "en" });

  console.log("Seed refresh complete:", {
    removedOldSeedArticles: beforeCount,
    insertedNewSeedArticles: insertedCount,
    hindiCount: hiCount,
    englishCount: enCount,
  });
}

run()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await mongoose.connection.close();
    process.exit(1);
  });

