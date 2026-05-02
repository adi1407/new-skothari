/**
 * Seed 20 English + 20 Hindi published articles in current CMS format.
 *
 * Categories used: desh, videsh, rajneeti, khel, health, krishi, business, manoranjan
 * - Skips if NEW_TAG already present (idempotent).
 * - Author = first admin user.
 * - All articles published with hero image + inline image.
 *
 * Run from repo root:
 *   npm run seed:news-40 --prefix backend
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Article = require("../models/Article");

const NEW_TAG = "khabar-news-40-v2";

const CATEGORIES = [
  "desh",
  "videsh",
  "rajneeti",
  "khel",
  "health",
  "krishi",
  "business",
  "manoranjan",
];

function img(seed) {
  return `https://picsum.photos/seed/${seed}/1200/675`;
}

function enBody(lead, ...extra) {
  const paragraphs = [
    `<p>${lead}</p>`,
    "<p>Officials briefed reporters that coordination meetings are planned across affected districts and a central monitoring desk has been activated.</p>",
    ...extra.map((p) => `<p>${p}</p>`),
    "<p>Our newsroom will keep updating this report with verified developments and on-ground reactions.</p>",
  ];
  return paragraphs.join("");
}

function hiBody(lead, ...extra) {
  const paragraphs = [
    `<p>${lead}</p>`,
    "<p>अधिकारियों ने पत्रकारों को बताया कि प्रभावित जिलों में समन्वय बैठकों की योजना है और एक केंद्रीय निगरानी डेस्क सक्रिय कर दिया गया है।</p>",
    ...extra.map((p) => `<p>${p}</p>`),
    "<p>पुष्ट अपडेट और ज़मीनी प्रतिक्रियाओं के साथ इस रिपोर्ट को लगातार अपडेट किया जाएगा।</p>",
  ];
  return paragraphs.join("");
}

const EN_ARTICLES = [
  // ── desh (3) ─────────────────────────────────────────────
  {
    category: "desh",
    isBreaking: true,
    title: "Cabinet clears national highway corridor with safety audits",
    summary: "The package includes EV-ready facilities, faster land settlement and round-the-clock incident control rooms.",
    lead: "The Union Cabinet approved a multi-state highway corridor with mandatory safety audits and EV charging plazas at every major junction.",
    extras: [
      "Project secretaries said state-level coordination committees will start work within the next two weeks.",
    ],
  },
  {
    category: "desh",
    title: "Centre rolls out unified disaster response grid for coastal states",
    summary: "Real-time data feeds from 11 coastal states will share into a single command dashboard.",
    lead: "A unified disaster response grid linking 11 coastal states went live with real-time vessel, weather and shelter data on a single dashboard.",
    extras: [
      "District magistrates can now request resources directly through the grid console.",
    ],
  },
  {
    category: "desh",
    title: "Rural broadband milestone: 200,000 villages now on fibre",
    summary: "The expansion drive crossed its three-year target months ahead of schedule, ministry data shows.",
    lead: "India's rural broadband rollout has crossed 200,000 villages on fibre, months ahead of the published target.",
    extras: [
      "Officials said the next phase will focus on last-mile reliability and grievance redressal.",
    ],
  },

  // ── videsh (3) ────────────────────────────────────────────
  {
    category: "videsh",
    title: "Maritime summit closes with joint statement on shipping safety",
    summary: "Member nations agreed on faster information sharing for illegal fishing and emergency corridors.",
    lead: "A regional maritime summit closed with a joint statement pledging faster information sharing on illegal fishing and humanitarian corridors.",
    extras: [
      "Coast guard chiefs will hold a follow-up technical meeting in the coming month.",
    ],
  },
  {
    category: "videsh",
    title: "Indian envoy meets diaspora groups in Europe to expand outreach",
    summary: "Cultural centres, scholarships and consular helpdesks featured prominently in the discussion.",
    lead: "India's envoy met diaspora associations across three European cities to discuss cultural centres, scholarships and faster consular services.",
    extras: [
      "A new appointments portal for routine consular work is being piloted next quarter.",
    ],
  },
  {
    category: "videsh",
    title: "G20 working group revises framework for cross-border payments",
    summary: "Drafts focus on settlement speed, transparency and small-value remittance costs.",
    lead: "A G20 working group released a revised framework targeting faster, cheaper cross-border payments with transparent fee disclosures.",
    extras: [
      "Pilot rails for small-value remittances will launch with three corridor countries.",
    ],
  },

  // ── rajneeti (3) ──────────────────────────────────────────
  {
    category: "rajneeti",
    title: "All-party committee finalises code of conduct for state polls",
    summary: "Members agreed on stricter rules around digital advertising and AI-generated content.",
    lead: "An all-party committee finalised an updated election code of conduct with stricter rules for digital ads and AI-generated political content.",
    extras: [
      "Returning officers will be trained on the new takedown protocol next month.",
    ],
  },
  {
    category: "rajneeti",
    title: "Opposition bloc to hold strategy meet ahead of monsoon session",
    summary: "The agenda focuses on price rise, agrarian distress and federal financial transfers.",
    lead: "A coalition of opposition parties will meet ahead of the monsoon session to align floor strategy on price rise and federal transfers.",
    extras: [
      "Working groups have been formed for Lok Sabha and Rajya Sabha co-ordination.",
    ],
  },
  {
    category: "rajneeti",
    title: "Centre and states agree to simplified GST returns for small traders",
    summary: "A simpler quarterly mechanism is proposed for businesses below the agreed turnover threshold.",
    lead: "Finance ministers from major states backed a simpler GST returns mechanism for small traders below an agreed turnover threshold.",
    extras: [
      "Tax authorities will issue draft rules within four weeks for industry feedback.",
    ],
  },

  // ── khel (3) ──────────────────────────────────────────────
  {
    category: "khel",
    title: "National camp opens with focus on fitness benchmarks",
    summary: "Coaches outlined VO2 testing and injury-prevention drills before the international calendar.",
    lead: "The national camp opened with a fitness-first agenda, including VO2 testing and structured injury-prevention drills.",
    extras: [
      "Selectors will use camp data alongside performance scores for the next squad.",
    ],
  },
  {
    category: "khel",
    title: "Indian shooters bag two golds at international rifle meet",
    summary: "Personal best scores recorded across 10m air rifle and 50m three-position events.",
    lead: "Indian shooters won two golds at an international rifle competition with personal best scores in both 10m and 50m events.",
    extras: [
      "Federation officials confirmed an additional team for the next World Cup leg.",
    ],
  },
  {
    category: "khel",
    title: "Youth football league adds two metro divisions for next season",
    summary: "Officials cited rising participation and improving stadium availability across cities.",
    lead: "The national youth football league will add two more metro divisions next season after a sharp rise in registrations and ground availability.",
    extras: [
      "A unified registration portal goes live for clubs at the start of the new window.",
    ],
  },

  // ── health (2) ────────────────────────────────────────────
  {
    category: "health",
    title: "Health ministry expands rural screening drive to 200 blocks",
    summary: "The drive adds diabetes, hypertension and anaemia checks at primary centres.",
    lead: "The health ministry expanded its rural screening drive to 200 blocks, adding diabetes, hypertension and anaemia checks at primary care.",
    extras: [
      "ANM and ASHA workers received refresher training to support the rollout.",
    ],
  },
  {
    category: "health",
    title: "Mental health helpline adds regional language counsellors",
    summary: "The expansion follows a sustained rise in incoming calls during exam season.",
    lead: "A national mental health helpline added counsellors in eight regional languages after a sustained rise in calls.",
    extras: [
      "Hospitals can now refer patients directly into the helpline's escalation system.",
    ],
  },

  // ── krishi (3) ────────────────────────────────────────────
  {
    category: "krishi",
    title: "Govt rolls out climate-resilient seeds for kharif farmers",
    summary: "Distribution begins with maize, paddy and pulses across 14 districts.",
    lead: "The agriculture ministry began distributing climate-resilient seed varieties for the kharif season across 14 districts.",
    extras: [
      "Field-level agronomists will document yield outcomes for next season's planning.",
    ],
  },
  {
    category: "krishi",
    title: "FPOs get easier credit access through new portal",
    summary: "Farmer Producer Organisations can now apply through a single window with digital KYC.",
    lead: "Farmer Producer Organisations gained easier credit access through a single-window portal with digital KYC and verified invoice history.",
    extras: [
      "Banks have committed faster turnaround timelines for verified clusters.",
    ],
  },
  {
    category: "krishi",
    title: "Soil health card 2.0 to add sensor-based moisture data",
    summary: "Pilot blocks will receive low-cost sensors connected to the existing card platform.",
    lead: "The next version of soil health cards will include sensor-based moisture data, beginning with pilot blocks across three states.",
    extras: [
      "Krishi Vigyan Kendras will lead training and quarterly review meetings.",
    ],
  },

  // ── business (2) ──────────────────────────────────────────
  {
    category: "business",
    title: "Export credit window opens for MSME clusters",
    summary: "Banks roll out same-day approvals for verified invoice histories.",
    lead: "An export credit window opened for MSME clusters with same-day approvals for verified invoice histories.",
    extras: [
      "Officials expect stronger quarter-end shipment volumes from small exporters.",
    ],
  },
  {
    category: "business",
    title: "Retail festive demand survey points to higher discretionary spend",
    summary: "Apparel, electronics and travel categories led the early indicators.",
    lead: "An industry survey ahead of the festive period pointed to higher discretionary spending across apparel, electronics and travel.",
    extras: [
      "Retailers said inventory plans were re-tuned to match the early signal.",
    ],
  },

  // ── manoranjan (1) ────────────────────────────────────────
  {
    category: "manoranjan",
    title: "Streaming studio greenlights crime anthology season",
    summary: "Production teams begin casting for six standalone episodes across cities.",
    lead: "A streaming studio greenlit a crime anthology season featuring six standalone episodes shot across different Indian cities.",
    extras: [
      "Showrunners confirmed the cast and shoot schedule will be announced in stages.",
    ],
  },
];

const HI_ARTICLES = [
  // ── desh (3) ─────────────────────────────────────────────
  {
    category: "desh",
    isBreaking: true,
    title: "कैबिनेट ने सुरक्षा ऑडिट के साथ राष्ट्रीय राजमार्ग गलियारे को मंजूरी दी",
    summary: "पैकेज में ईवी-तैयार सुविधाएँ, तेज़ भूमि निपटान और चौबीस घंटे की निगरानी डेस्क शामिल है।",
    lead: "केंद्रीय कैबिनेट ने अनिवार्य सुरक्षा ऑडिट और हर बड़े जंक्शन पर ईवी चार्जिंग प्लाज़ा के साथ बहुराज्यीय राजमार्ग गलियारे को मंजूरी दी।",
    extras: [
      "परियोजना सचिवों के अनुसार राज्य स्तर पर समन्वय समितियाँ अगले दो सप्ताह में काम शुरू करेंगी।",
    ],
  },
  {
    category: "desh",
    title: "तटीय राज्यों के लिए एकीकृत आपदा प्रतिक्रिया ग्रिड चालू",
    summary: "11 तटीय राज्यों से रीयल-टाइम डेटा एक डैशबोर्ड पर एकत्र होगा।",
    lead: "11 तटीय राज्यों को जोड़ने वाली एकीकृत आपदा प्रतिक्रिया ग्रिड लाइव हो गई, जिसमें जहाज़, मौसम और आश्रय का रीयल-टाइम डेटा है।",
    extras: [
      "जिला अधिकारी अब ग्रिड कंसोल से सीधे संसाधनों का अनुरोध कर सकेंगे।",
    ],
  },
  {
    category: "desh",
    title: "ग्रामीण ब्रॉडबैंड: दो लाख गाँव अब फ़ाइबर पर",
    summary: "विस्तार अभियान तय समय से कई महीने पहले अपने तीन-वर्षीय लक्ष्य से आगे निकल गया।",
    lead: "देश का ग्रामीण ब्रॉडबैंड रोलआउट दो लाख गाँवों के फ़ाइबर कनेक्टिविटी आँकड़े के साथ तय लक्ष्य से आगे निकल गया।",
    extras: [
      "अधिकारियों के अनुसार अगला चरण अंतिम-मील विश्वसनीयता और शिकायत निवारण पर केंद्रित होगा।",
    ],
  },

  // ── videsh (3) ────────────────────────────────────────────
  {
    category: "videsh",
    title: "समुद्री शिखर सम्मेलन शिपिंग सुरक्षा पर साझा बयान के साथ संपन्न",
    summary: "सदस्य देशों ने अवैध मछली पकड़ने और मानवीय गलियारों पर तेज़ सूचना साझाकरण पर सहमति जताई।",
    lead: "क्षेत्रीय समुद्री शिखर सम्मेलन शिपिंग सुरक्षा और मानवीय गलियारों पर तेज़ सूचना साझाकरण के साझा बयान के साथ संपन्न हुआ।",
    extras: [
      "तटरक्षक प्रमुख अगले महीने तकनीकी अनुवर्ती बैठक करेंगे।",
    ],
  },
  {
    category: "videsh",
    title: "भारतीय राजदूत ने यूरोप में प्रवासी समूहों से मुलाकात की",
    summary: "सांस्कृतिक केंद्र, छात्रवृत्तियाँ और वाणिज्य दूत हेल्पडेस्क बैठक के मुख्य विषय रहे।",
    lead: "भारत के राजदूत ने यूरोप के तीन शहरों में प्रवासी संघों से मुलाकात कर सांस्कृतिक केंद्रों, छात्रवृत्तियों और तेज़ वाणिज्य दूत सेवाओं पर चर्चा की।",
    extras: [
      "रूटीन वाणिज्य-दूत कार्यों के लिए अगली तिमाही नई अपॉइंटमेंट पोर्टल का पायलट चलेगा।",
    ],
  },
  {
    category: "videsh",
    title: "G20 कार्य समूह ने सीमा-पार भुगतान का संशोधित ढाँचा जारी किया",
    summary: "ड्राफ्ट निपटान गति, पारदर्शिता और छोटे रेमिटेंस की लागत पर केंद्रित हैं।",
    lead: "G20 के एक कार्य समूह ने तेज़, सस्ते सीमा-पार भुगतान के लिए संशोधित ढाँचा जारी किया, जिसमें शुल्क की पारदर्शी जानकारी अनिवार्य है।",
    extras: [
      "तीन गलियारा देशों के साथ छोटे रेमिटेंस के लिए पायलट रेल शुरू किए जाएँगे।",
    ],
  },

  // ── rajneeti (3) ──────────────────────────────────────────
  {
    category: "rajneeti",
    title: "सर्वदलीय समिति ने राज्य चुनावों के लिए आचार संहिता अंतिम की",
    summary: "सदस्यों ने डिजिटल विज्ञापन और एआई-निर्मित सामग्री पर सख़्त नियमों पर सहमति जताई।",
    lead: "एक सर्वदलीय समिति ने डिजिटल विज्ञापनों और एआई-निर्मित राजनीतिक सामग्री पर सख़्त प्रावधानों के साथ अद्यतन आचार संहिता को अंतिम रूप दिया।",
    extras: [
      "रिटर्निंग अधिकारियों को नए टेकडाउन प्रोटोकॉल पर अगले महीने प्रशिक्षित किया जाएगा।",
    ],
  },
  {
    category: "rajneeti",
    title: "विपक्षी गठबंधन मानसून सत्र से पहले रणनीति बैठक करेगा",
    summary: "एजेंडा महंगाई, कृषि संकट और संघीय वित्तीय हस्तांतरण पर केंद्रित है।",
    lead: "विपक्षी दलों का गठबंधन मानसून सत्र से पहले महंगाई और संघीय हस्तांतरण पर रणनीति को संरेखित करने के लिए बैठक करेगा।",
    extras: [
      "लोकसभा और राज्यसभा समन्वय के लिए अलग-अलग कार्य समूह बनाए गए हैं।",
    ],
  },
  {
    category: "rajneeti",
    title: "केंद्र और राज्यों ने छोटे व्यापारियों के लिए सरल जीएसटी रिटर्न पर सहमति जताई",
    summary: "तय टर्नओवर सीमा से नीचे के व्यवसायों के लिए सरल त्रैमासिक प्रक्रिया प्रस्तावित है।",
    lead: "बड़े राज्यों के वित्त मंत्रियों ने तय टर्नओवर सीमा से नीचे के छोटे व्यापारियों के लिए सरल जीएसटी रिटर्न प्रक्रिया का समर्थन किया।",
    extras: [
      "कर अधिकारी उद्योग की प्रतिक्रिया के लिए चार सप्ताह में मसौदा नियम जारी करेंगे।",
    ],
  },

  // ── khel (3) ──────────────────────────────────────────────
  {
    category: "khel",
    title: "राष्ट्रीय शिविर फिटनेस बेंचमार्क पर केंद्रित होकर शुरू",
    summary: "अंतरराष्ट्रीय कैलेंडर से पहले कोचों ने वीओ2 टेस्टिंग और चोट-रोधी ड्रिल की रूपरेखा तैयार की।",
    lead: "राष्ट्रीय शिविर वीओ2 टेस्टिंग और संरचित चोट-रोधी ड्रिल के साथ फिटनेस-प्राथमिकता वाले एजेंडे पर खुला।",
    extras: [
      "चयनकर्ता अगली टीम के लिए शिविर डेटा को प्रदर्शन स्कोर के साथ देखेंगे।",
    ],
  },
  {
    category: "khel",
    title: "भारतीय निशानेबाज़ों ने अंतरराष्ट्रीय राइफल मीट में दो स्वर्ण जीते",
    summary: "10 मीटर एयर राइफल और 50 मीटर थ्री-पोज़िशन में व्यक्तिगत सर्वश्रेष्ठ स्कोर दर्ज।",
    lead: "भारतीय निशानेबाज़ों ने अंतरराष्ट्रीय राइफल प्रतियोगिता में दो स्वर्ण जीते और दोनों स्पर्धाओं में अपना सर्वश्रेष्ठ स्कोर बनाया।",
    extras: [
      "महासंघ ने अगले विश्व कप चरण के लिए अतिरिक्त टीम की पुष्टि की।",
    ],
  },
  {
    category: "khel",
    title: "युवा फुटबॉल लीग अगले सीज़न दो मेट्रो डिवीज़न जोड़ेगी",
    summary: "अधिकारियों ने बढ़ती भागीदारी और बेहतर स्टेडियम उपलब्धता का उल्लेख किया।",
    lead: "राष्ट्रीय युवा फुटबॉल लीग पंजीकरण और मैदान उपलब्धता बढ़ने के बाद अगले सीज़न दो और मेट्रो डिवीज़न जोड़ेगी।",
    extras: [
      "नए विंडो की शुरुआत में क्लबों के लिए एकीकृत पंजीकरण पोर्टल लाइव होगा।",
    ],
  },

  // ── health (2) ────────────────────────────────────────────
  {
    category: "health",
    title: "स्वास्थ्य मंत्रालय ने ग्रामीण स्क्रीनिंग अभियान को 200 ब्लॉकों तक बढ़ाया",
    summary: "अभियान में मधुमेह, उच्च रक्तचाप और एनीमिया जाँच जोड़ी गई हैं।",
    lead: "स्वास्थ्य मंत्रालय ने ग्रामीण स्क्रीनिंग अभियान को 200 ब्लॉकों तक बढ़ाया, जिसमें प्राथमिक केंद्रों पर मधुमेह, उच्च रक्तचाप और एनीमिया की जाँच होगी।",
    extras: [
      "एएनएम और आशा कार्यकर्ताओं को रोलआउट के लिए पुनश्चर्या प्रशिक्षण मिला।",
    ],
  },
  {
    category: "health",
    title: "मानसिक स्वास्थ्य हेल्पलाइन में क्षेत्रीय भाषा परामर्शदाता जोड़े",
    summary: "परीक्षा सीज़न में बढ़ती कॉलों के बाद यह विस्तार किया गया।",
    lead: "एक राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन में लगातार कॉल बढ़ने के बाद आठ क्षेत्रीय भाषाओं में परामर्शदाता जोड़े गए।",
    extras: [
      "अस्पताल अब हेल्पलाइन की एस्केलेशन प्रणाली में सीधे रेफरल भेज सकेंगे।",
    ],
  },

  // ── krishi (3) ────────────────────────────────────────────
  {
    category: "krishi",
    title: "खरीफ किसानों के लिए जलवायु-सहनशील बीज वितरण शुरू",
    summary: "मक्का, धान और दलहन का वितरण 14 जिलों में शुरू।",
    lead: "कृषि मंत्रालय ने खरीफ सीज़न के लिए जलवायु-सहनशील बीज क़िस्मों का वितरण 14 जिलों में शुरू कर दिया।",
    extras: [
      "क्षेत्रीय कृषि वैज्ञानिक अगले सीज़न की योजना के लिए उपज परिणाम दर्ज करेंगे।",
    ],
  },
  {
    category: "krishi",
    title: "नई पोर्टल से एफपीओ को आसान ऋण पहुँच",
    summary: "कृषक उत्पादक संगठन अब डिजिटल केवाईसी के साथ सिंगल विंडो से आवेदन कर सकेंगे।",
    lead: "कृषक उत्पादक संगठनों को सिंगल-विंडो पोर्टल से आसान ऋण पहुँच मिली, जिसमें डिजिटल केवाईसी और सत्यापित बिल इतिहास शामिल है।",
    extras: [
      "बैंकों ने सत्यापित क्लस्टरों के लिए तेज़ टर्नअराउंड समय प्रतिबद्ध किया है।",
    ],
  },
  {
    category: "krishi",
    title: "मृदा स्वास्थ्य कार्ड 2.0 में सेंसर-आधारित नमी डेटा जुड़ेगा",
    summary: "पायलट ब्लॉकों को मौजूदा कार्ड प्लेटफ़ॉर्म से जुड़े कम-लागत सेंसर मिलेंगे।",
    lead: "मृदा स्वास्थ्य कार्ड के अगले संस्करण में सेंसर-आधारित नमी डेटा शामिल होगा, जिसकी शुरुआत तीन राज्यों के पायलट ब्लॉकों से होगी।",
    extras: [
      "कृषि विज्ञान केंद्र प्रशिक्षण और त्रैमासिक समीक्षा बैठकों का नेतृत्व करेंगे।",
    ],
  },

  // ── business (2) ──────────────────────────────────────────
  {
    category: "business",
    title: "एमएसएमई क्लस्टरों के लिए निर्यात ऋण विंडो खुली",
    summary: "बैंक सत्यापित बिल इतिहास के लिए उसी दिन की मंज़ूरी देंगे।",
    lead: "एमएसएमई क्लस्टरों के लिए निर्यात ऋण विंडो खोली गई, जिसमें सत्यापित बिल इतिहास के लिए उसी दिन की मंज़ूरी संभव है।",
    extras: [
      "अधिकारियों को छोटे निर्यातकों से मज़बूत तिमाही-अंत शिपमेंट मात्रा की उम्मीद है।",
    ],
  },
  {
    category: "business",
    title: "त्योहारी मांग सर्वे ने उच्च विवेकाधीन खर्च का संकेत दिया",
    summary: "परिधान, इलेक्ट्रॉनिक्स और यात्रा श्रेणियाँ शुरुआती संकेतकों में आगे रहीं।",
    lead: "त्योहारी अवधि से पहले उद्योग सर्वे ने परिधान, इलेक्ट्रॉनिक्स और यात्रा श्रेणियों में उच्च विवेकाधीन खर्च का संकेत दिया।",
    extras: [
      "खुदरा विक्रेताओं ने प्रारंभिक संकेत के अनुसार इन्वेंटरी योजनाओं को फिर से ट्यून किया है।",
    ],
  },

  // ── manoranjan (1) ────────────────────────────────────────
  {
    category: "manoranjan",
    title: "स्ट्रीमिंग स्टूडियो ने क्राइम एंथोलॉजी सीज़न को मंज़ूरी दी",
    summary: "प्रोडक्शन टीम ने अलग-अलग शहरों की छह स्वतंत्र एपिसोडों के लिए कास्टिंग शुरू की।",
    lead: "एक स्ट्रीमिंग स्टूडियो ने क्राइम एंथोलॉजी सीज़न को मंज़ूरी दी, जिसमें भारत के अलग-अलग शहरों में छह स्वतंत्र एपिसोड शूट होंगे।",
    extras: [
      "शोरनरों ने पुष्टि की कि कास्ट और शूट शेड्यूल चरणबद्ध रूप से घोषित होगा।",
    ],
  },
];

if (EN_ARTICLES.length !== 20) {
  throw new Error(`Expected 20 English articles, got ${EN_ARTICLES.length}`);
}
if (HI_ARTICLES.length !== 20) {
  throw new Error(`Expected 20 Hindi articles, got ${HI_ARTICLES.length}`);
}

const VALID_CATEGORIES = new Set(CATEGORIES);
for (const a of [...EN_ARTICLES, ...HI_ARTICLES]) {
  if (!VALID_CATEGORIES.has(a.category)) {
    throw new Error(`Unknown category in seed list: ${a.category}`);
  }
}

function buildPayloads(authorId) {
  const docs = [];
  const baseTime = Date.now();
  let seq = 0;
  const ts = () => new Date(baseTime - seq++ * 7 * 60 * 1000);

  EN_ARTICLES.forEach((a, idx) => {
    const seedTag = `en-${a.category}-${idx + 1}`;
    docs.push({
      primaryLocale: "en",
      title: a.title,
      titleHi: "",
      summary: a.summary,
      summaryHi: "",
      body: enBody(a.lead, ...(a.extras || [])),
      bodyHi: "",
      images: [
        { url: img(`v4-en-${a.category}-${idx + 1}-hero`), caption: a.title, isHero: true },
        { url: img(`v4-en-${a.category}-${idx + 1}-inline`), caption: "File image", isHero: false },
      ],
      category: a.category,
      tags: [a.category, "khabar-kothri", NEW_TAG, seedTag],
      isBreaking: !!a.isBreaking,
      status: "published",
      author: authorId,
      publishedAt: ts(),
      views: 800 + idx * 13,
    });
  });

  HI_ARTICLES.forEach((a, idx) => {
    const seedTag = `hi-${a.category}-${idx + 1}`;
    docs.push({
      primaryLocale: "hi",
      title: "",
      titleHi: a.title,
      summary: "",
      summaryHi: a.summary,
      body: "",
      bodyHi: hiBody(a.lead, ...(a.extras || [])),
      images: [
        { url: img(`v4-hi-${a.category}-${idx + 1}-hero`), caption: a.title, isHero: true },
        { url: img(`v4-hi-${a.category}-${idx + 1}-inline`), caption: "फ़ाइल चित्र", isHero: false },
      ],
      category: a.category,
      tags: [a.category, "khabar-kothri", NEW_TAG, seedTag],
      isBreaking: !!a.isBreaking,
      status: "published",
      author: authorId,
      publishedAt: ts(),
      views: 800 + idx * 11,
    });
  });

  return docs;
}

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) {
    throw new Error("No admin user found. Please run admin seed first.");
  }

  const existing = await Article.countDocuments({ tags: NEW_TAG });
  if (existing > 0) {
    console.log(`Articles with tag '${NEW_TAG}' already present (${existing}). Skipping insert.`);
    return;
  }

  const payloads = buildPayloads(admin._id);

  let okCount = 0;
  for (const doc of payloads) {
    try {
      await Article.create(doc);
      okCount += 1;
    } catch (err) {
      console.error("Article create failed:", err.message);
    }
  }

  const totalEn = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "en" });
  const totalHi = await Article.countDocuments({ tags: NEW_TAG, primaryLocale: "hi" });

  const byCategory = await Article.aggregate([
    { $match: { tags: NEW_TAG } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log("seed-news-40 complete:", {
    inserted: okCount,
    english: totalEn,
    hindi: totalHi,
    byCategory: byCategory.reduce((m, r) => ({ ...m, [r._id]: r.count }), {}),
  });
}

run()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });
