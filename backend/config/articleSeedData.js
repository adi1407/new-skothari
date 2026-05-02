/**
 * Rich sample articles for local/demo: 5 per category × 8 categories = 40.
 * Images: stable Picsum URLs (distinct seed per story). Bodies: short HTML + Hindi mirror.
 */

const CATEGORIES = ["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"];

const SEED_TAG = "khabar-seed-2026";

function img(category, index, hero = true) {
  const role = hero ? "hero" : "inline";
  return `https://picsum.photos/seed/kothari-${category}-${index}-${role}/1200/675`;
}

function enBody(topic, lede) {
  return `<p>${lede}</p><p>Officials confirmed that teams are reviewing documents and coordinating with state agencies. Independent analysts expect further clarity within days.</p><p>We will update this story as verified information becomes available. Readers can follow live coverage on our homepage and mobile alerts.</p>`;
}

function hiBody(hiLede) {
  return `<p>${hiLede}</p><p>अधिकारियों ने बताया कि दस्तावेज़ों की समीक्षा जारी है और राज्य स्तर पर समन्वय किया जा रहा है। विशेषज्ञों का मानना है कि अगले कुछ दिनों में स्थिति स्पष्ट होगी।</p><p>पुष्ट जानकारी मिलते ही इस रिपोर्ट में अपडेट देंगे। ताज़ा खबरों के लिए होमपेज और मोबाइल अलर्ट जुड़े रहें।</p>`;
}

const TOPICS = {
  rajneeti: [
    { t: "Cabinet clears infra package for eastern states", th: "कैबिनेट ने पूर्वी राज्यों के लिए बुनियादी ढांचे का पैकेज मंजूर किया", lede: "The Union Cabinet approved a multi-year connectivity and power-grid plan aimed at faster growth in the eastern region.", hiLede: "केंद्रीय कैबिनेट ने पूर्वी क्षेत्र में तेज़ विकास के लिए कनेक्टिविटी और पावर ग्रिड पर बहु-वर्षीय योजना को मंजूरी दी।" },
    { t: "Opposition walks out over debate rules in Parliament", th: "संसद में बहस के नियमों पर विपक्ष का वॉकआउट", lede: "Opposition parties staged a walkout after the Speaker ruled on time allocation for a short-duration discussion.", hiLede: "स्पीकर ने अल्पकालिक चर्चा के समय आवंटन पर फैसला सुनाने के बाद विपक्षी दलों ने वॉकआउट किया।" },
    { t: "State poll panel announces revised counting schedule", th: "राज्य चुनाव आयोग ने गिनती का संशोधित कार्यक्रम जारी किया", lede: "The election commission published a revised timeline for counting and postal ballot verification following weather advisories.", hiLede: "मौसम संबंधी सलाह के बाद गिनती और डाक मतपत्र सत्यापन के लिए संशोधित समय सारणी जारी की गई।" },
    { t: "Centre and states agree on GST compliance simplification", th: "केंद्र और राज्यों ने जीएसटी अनुपालन सरलीकरण पर सहमति जताई", lede: "A joint panel recommended simpler filing steps for small businesses while keeping revenue safeguards in place.", hiLede: "संयुक्त समिति ने राजस्व सुरक्षा बनाए रखते हुए छोटे व्यवसायों के लिए दाखिल प्रक्रिया सरल करने की सिफारिश की।" },
    { t: "PM office lists priority themes for next development push", th: "पीएमओ ने अगले विकास धक्के के लिए प्राथमिकता विषय सूचीबद्ध किए", lede: "Themes include clean energy jobs, urban water security, and digital literacy for youth in tier-2 cities.", hiLede: "विषयों में स्वच्छ ऊर्जा रोज़गार, शहरी जल सुरक्षा और टियर-2 शहरों में युवाओं की डिजिटल साक्षरता शामिल है।" },
  ],
  khel: [
    { t: "National camp opens with focus on fitness benchmarks", th: "राष्ट्रीय शिविर फिटनेस बेंचमार्क पर केंद्रित होकर शुरू", lede: "Coaches outlined VO2 testing and injury-prevention drills before the international calendar heats up.", hiLede: "अंतरराष्ट्रीय कैलेंडर से पहले कोचों ने वीओ2 टेस्टिंग और चोट-रोधी ड्रिल की रूपरेखा तैयार की।" },
    { t: "Franchise league confirms playoff dates and venues", th: "फ्रेंचाइज़ लीग ने प्लेऑफ की तारीखें और स्थान की पुष्टि की", lede: "The board locked two neutral venues for the knockouts citing pitch consistency and broadcast logistics.", hiLede: "बोर्ड ने पिच स्थिरता और प्रसारण लॉजिस्टिक के कारण नॉकआउट के लिए दो तटस्थ स्थान तय किए।" },
    { t: "Youth championship draws record entries from 18 states", th: "युवा चैंपियनशिप में 18 राज्यों से रिकॉर्ड प्रविष्टियाँ", lede: "Organisers added extra qualifying pools after registrations crossed last year’s total by mid-week.", hiLede: "मध्य सप्ताह तक पंजीकरण पिछले वर्ष के कुल से आगे निकलने के बाद आयोजकों ने अतिरिक्त क्वालिफाइंग पूल जोड़े।" },
    { t: "Star batter cleared to return after rehab milestone", th: "रीहैब माइलस्टोन के बाद स्टार बल्लेबाज की वापसी मंजूर", lede: "Medical staff signed off on progressive loading after a six-week monitored recovery programme.", hiLede: "छह सप्ताह की निगरानी वाली रिकवरी के बाद मेडिकल स्टाफ ने प्रगतिशील लोडिंग पर हस्ताक्षर किए।" },
    { t: "Hockey federation names interim coach for Europe tour", th: "हॉकी महासंघ ने यूरोप दौरे के लिए अंतरिम कोच नामित किया", lede: "The tour will feature three test series as selectors evaluate younger players for the major tournament cycle.", hiLede: "दौरे में तीन टेस्ट सीरीज़ होंगी; चयनकर्ता प्रमुख टूर्नामेंट चक्र के लिए युवा खिलाड़ियों का मूल्यांकन करेंगे।" },
  ],
  desh: [
    { t: "Chip designers open India R&D hub for power-efficient cores", th: "चिप डिज़ाइनरों ने ऊर्जा-कुशल कोर के लिए भारत आर एंड डी हब खोला", lede: "The facility will partner with local universities on compiler tooling and formal verification workflows.", hiLede: "यह केंद्र कम्पाइलर टूलिंग और फॉर्मल वेरिफिकेशन वर्कफ़्लो पर स्थानीय विश्वविद्यालयों के साथ साझेदारी करेगा।" },
    { t: "Cloud outage post-mortem cites config drift in edge nodes", th: "क्लाउड आउटेज रिपोर्ट में एज नोड्स में कॉन्फ़िग ड्रिफ्ट उजागर", lede: "Engineers rolled out automated drift checks and staged rollouts after customer dashboards showed regional spikes.", hiLede: "ग्राहक डैशबोर्ड में क्षेत्रीय स्पाइक दिखने के बाद इंजीनियरों ने स्वचालित ड्रिफ्ट चेक और चरणबद्ध रोलआउट किए।" },
    { t: "Smartphone brand teases satellite messaging for hikers", th: "स्मार्टफोन ब्रांड ने ट्रेकर्स के लिए सैटेलाइट मैसेजिंग का संकेत दिया", lede: "Beta firmware will ship to testers in mountain states before a wider release later this quarter.", hiLede: "इस तिमाही व्यापक रिलीज़ से पहले बीटा फर्मवेयर पर्वतीय राज्यों में परीक्षकों को भेजा जाएगा।" },
    { t: "Open-source browser fork gains traction on privacy features", th: "ओपन-सोर्स ब्राउज़र फोर्क को गोपनीयता सुविधाओं पर मिली बढ़त", lede: "Contributors shipped stricter tracker lists and optional container tabs for work accounts.", hiLede: "योगदानकर्ताओं ने सख्त ट्रैकर सूची और कार्य खातों के लिए वैकल्पिक कंटेनर टैब जारी किए।" },
    { t: "AI safety lab publishes red-team findings on multilingual models", th: "एआई सेफ्टी लैब ने बहुभाषी मॉडल पर रेड-टीम निष्कर्ष जारी किए", lede: "The report highlights jailbreak patterns in low-resource languages and proposes layered guardrails.", hiLede: "रिपोर्ट में कम संसाधन वाली भाषाओं में जेलब्रेक पैटर्न और परतदार गार्डरेल का प्रस्ताव है।" },
  ],
  business: [
    { t: "RBI keeps policy stance unchanged; growth outlook revised up", th: "आरबीआई ने नीति रुख अपरिवर्तित रखा; वृद्धि दृष्टिकोण संशोधित", lede: "Governors cited resilient urban demand and easing input costs while flagging global uncertainty.", hiLede: "गवर्नरों ने शहरी मांग और इनपुट लागत में नरमी का हवाला दिया, साथ ही वैश्विक अनिश्चितता पर प्रकाश डाला।" },
    { t: "Airlines add routes as festive season bookings cross forecast", th: "त्योहारी सीज़न में बुकिंग पूर्वानुमान से आगे, एयरलाइनों ने रूट बढ़ाए", lede: "Carriers announced extra frequencies on trunk routes and larger aircraft on select morning slots.", hiLede: "वाहकों ने मुख्य मार्गों पर अतिरिक्त आवृत्ति और चुनिंदा सुबह के स्लॉट पर बड़े विमान की घोषणा की।" },
    { t: "SME lender rolls out same-day credit lines for exporters", th: "एसएमई ऋणदाता ने निर्यातकों के लिए समान-दिन क्रेडिट लाइन शुरू की", lede: "The product ties invoice data APIs to risk scores with human review only for edge cases.", hiLede: "उत्पाद चालान डेटा एपीआई को जोखिम स्कोर से जोड़ता है; केवल विशेष मामलों में मानव समीक्षा।" },
    { t: "Steel majors sign long-term renewable power agreements", th: "स्टील दिग्गजों ने दीर्घकालिक नवीकरणीय बिजली समझौते किए", lede: "The deals aim to stabilise energy costs while meeting decarbonisation milestones agreed with regulators.", hiLede: "समझौते ऊर्जा लागत स्थिर करने और नियामकों से तय डिकार्बनाइज़ेशन लक्ष्यों को पूरा करने के लिए हैं।" },
    { t: "Retail chain expands fresh supply hubs in tier-2 cities", th: "रिटेल चेन ने टियर-2 शहरों में ताज़ा आपूर्ति केंद्र बढ़ाए", lede: "Cold-chain upgrades are expected to cut spoilage and shorten shelf-to-store cycles for produce.", hiLede: "कोल्ड-चेन उन्नयन से खराबी कम और उपज के शेल्फ-टू-स्टोर चक्र छोटे होने की उम्मीद है।" },
  ],
  manoranjan: [
    { t: "Streaming platform drops trailer for period drama miniseries", th: "स्ट्रीमिंग प्लेटफॉर्म ने पीरियड ड्रामा मिनी-सीरीज़ का ट्रेलर जारी किया", lede: "Showrunners promise practical sets and a live-recorded score for the eight-episode arc.", hiLede: "शोरनर आठ-एपिसोड आर्क के लिए प्रैक्टिकल सेट और लाइव-रिकॉर्डेड स्कोर का वादा करते हैं।" },
    { t: "Music festival announces carbon-offset plan for next edition", th: "संगीत समारोह ने अगले संस्करण के लिए कार्बन-ऑफसेट योजना घोषित की", lede: "Organisers will fund mangrove restoration and offer rail discounts for ticket holders.", hiLede: "आयोजक मैंग्रोव पुनर्स्थापन को निधि देंगे और टिकट धारकों को रेल छूट देंगे।" },
    { t: "Award jury highlights regional cinema breakthrough performances", th: "पुरस्कार जूरी ने क्षेत्रीय सिनेमा की सफल प्रस्तुतियों पर प्रकाश डाला", lede: "Jurors praised debut directors who shot on location with minimal post-production reliance.", hiLede: "जूरी ने उन डेब्यू निर्देशकों की तारीफ की जिन्होंने स्थान पर शूट कर न्यूनतम पोस्ट-प्रोडक्शन पर निर्भरता रखी।" },
    { t: "Studio dates shift for big-budget action sequel", th: "बड़े बजट एक्शन सीक्वल की तारीखें बदलीं", lede: "The move follows extended VFX schedules and coordination with international co-production partners.", hiLede: "यह कदम विस्तारित वीएफएक्स अंतराल और अंतरराष्ट्रीय सह-उत्पादन भागीदारों के समन्वय के बाद है।" },
    { t: "Casting call draws thousands for youth-led anthology series", th: "युवा-नेतृत्व वाली एंथोलॉजी सीरीज़ के लिए कास्टिंग में हज़ारों", lede: "Shortlisted actors will workshop scripts with writers before cameras roll in monsoon month.", hiLede: "चयनित अभिनेताओं को मानसून माह में कैमरा शुरू होने से पहले लेखकों के साथ स्क्रिप्ट वर्कशॉप करनी होगी।" },
  ],
  health: [
    { t: "Health ministry expands free screening camps in rural blocks", th: "स्वास्थ्य मंत्रालय ने ग्रामीण ब्लॉकों में मुफ्त स्क्रीनिंग शिविर बढ़ाए", lede: "Teams will offer diabetes, hypertension, and anaemia checks with referral pathways to district hospitals.", hiLede: "टीमें मधुमेह, उच्च रक्तचाप और एनीमिया जांच के साथ जिला अस्पताल रेफरल मार्ग प्रदान करेंगी।" },
    { t: "Study links sleep regularity to lower cardiovascular risk", th: "अध्ययन ने नियमित नींद को कम हृदय-संवहनी जोखिम से जोड़ा", lede: "Researchers tracked wearable metrics across age groups and adjusted for activity levels.", hiLede: "शोधकर्ताओं ने आयु समूहों में वियरेबल मेट्रिक ट्रैक कर गतिविधि स्तर समायोजित किए।" },
    { t: "Vaccination drive adds evening slots for working parents", th: "टीकाकरण अभियान में कामकाजी माता-पिता के लिए शाम के स्लॉट", lede: "District officers said cold-chain capacity was expanded to handle the longer operating window.", hiLede: "जिला अधिकारियों ने कहा कि लंबी खिड़की के लिए कोल्ड-चेन क्षमता बढ़ाई गई।" },
    { t: "Mental health helpline adds regional language counsellors", th: "मानसिक स्वास्थ्य हेल्पलाइन में क्षेत्रीय भाषा परामर्शदाता जोड़े", lede: "The expansion follows a spike in calls after exam season and heat-wave advisories.", hiLede: "परीक्षा सीज़न और लू सलाह के बाद कॉल में वृद्धि के बाद यह विस्तार हुआ।" },
    { t: "Hospital chain pilots AI-assisted triage in emergency wards", th: "अस्पताल श्रृंखला ने आपातकालीन वार्ड में एआई-सहायता ट्राइज पायलट किया", lede: "Clinicians remain the final decision-makers; the tool flags patterns from vitals history.", hiLede: "चिकित्सक अंतिम निर्णयकर्ता रहेंगे; उपकरण विटल इतिहास से पैटर्न चिह्नित करता है।" },
  ],
  videsh: [
    { t: "Summit closes with joint statement on maritime cooperation", th: "शिखर सम्मेलन समुद्री सहयोग पर संयुक्त बयान के साथ समाप्त", lede: "Leaders pledged information sharing on illegal fishing and faster humanitarian corridors.", hiLede: "नेताओं ने अवैध मछली पकड़ने पर सूचना साझा करने और तेज़ मानवीय गलियारों का वादा किया।" },
    { t: "Central bank abroad signals slower tightening as inflation cools", th: "विदेशी केंद्रीय बैंक ने मुद्रास्फीति ठंडी होने पर धीमी कसावट का संकेत दिया", lede: "Markets moved on guidance that future moves would be data-dependent rather than calendar-based.", hiLede: "बाज़ारों ने उस मार्गदर्शन पर प्रतिक्रिया दी कि भविष्य के कदम कैलेंडर नहीं, डेटा-आधारित होंगे।" },
    { t: "Aid agencies pre-position supplies ahead of storm season", th: "तूफान सीज़न से पहले सहायता एजेंसियों ने आपूर्ति पहले से तैनात की", lede: "Logistics hubs near coastlines stock water purification kits and satellite phones.", hiLede: "तटीय लॉजिस्टिक्स केंद्रों में जल शुद्धि किट और सैटेलाइट फोन भंडारित हैं।" },
    { t: "Trade corridor reopens after security inspections complete", th: "सुरक्षा निरीक्षण पूरा होने के बाद व्यापार गलियारा फिर खुला", lede: "Freight operators reported a 36-hour backlog clearing within two days under priority lanes.", hiLede: "माल ऑपरेटरों ने बताया कि प्राथमिकता लेन में 36 घंटे का बैकलॉग दो दिन में साफ हुआ।" },
    { t: "Embassy issues advisory for citizens travelling during holidays", th: "दूतावास ने छुट्टियों में यात्रा कर रहे नागरिकों के लिए सलाह जारी की", lede: "Travellers are urged to register online, carry digital copies of documents, and monitor local alerts.", hiLede: "यात्रियों से ऑनलाइन पंजीकरण, दस्तावेज़ों की डिजिटल प्रति और स्थानीय अलर्ट पर नज़र रखने को कहा गया।" },
  ],
  krishi: [
    { t: "MSP committee recommends wider coverage for millets and pulses", th: "एमएसपी समिति ने बाजरा व दालों की व्यापक खरीद की सिफारिश की", lede: "Farm leaders welcomed the draft note, asking for clarity on procurement volumes and bonus timelines before the kharif harvest.", hiLede: "किसान नेताओं ने ड्राफ्ट नोट का स्वागत किया और खरीफ से पहले खरीद मात्रा व बोनस समय सारणी पर स्पष्टता माँगी।" },
    { t: "Soil health cards roll out in 120 blocks with micronutrient maps", th: "120 ब्लॉकों में माइक्रोन्यूट्रिएंट मैप के साथ मृदा स्वास्थ्य कार्ड", lede: "Agronomists said digitised grids will help tailor fertiliser mixes and reduce excess nitrogen use on marginal farms.", hiLede: "कृषि वैज्ञानिकों ने कहा कि डिजिटल ग्रिड से उर्वरक मिश्रण अनुकूल होगा और सीमांत खेतों पर अतिरिक्त नाइट्रोजन कम होगा।" },
    { t: "Canal lining pilot saves 18% conveyance loss in western districts", th: "पश्चिमी जिलों में नहर लाइनिंग पायलट से 18% अंतरण हानि में कमी", lede: "Irrigation engineers cited sealed segments and weed control as reasons for steadier flows during peak summer demand.", hiLede: "सिंचाई इंजीनियरों ने सील किए गए हिस्सों और खरपतवार नियंत्रण को गर्मियों में स्थिर प्रवाह का कारण बताया।" },
    { t: "Beekeeping clusters get cold-chain subsidy for hive products", th: "मधुमक्खी पालन क्लस्टर को छत्ते उत्पादों के लिए कोल्ड-चेन सब्सिडी", lede: "Cooperatives must share traceability QR codes with exporters to qualify for the graded honey incentive.", hiLede: "ग्रेडेड शहद प्रोत्साहन के लिए सहकारी समितियों को निर्यातकों के साथ ट्रेसेबिलिटी क्यूआर साझा करना होगा।" },
    { t: "Weather agency issues staggered sowing advisory for soybean belt", th: "मौसम एजेंसी ने सोयाबेल्ट के लिए चरणबद्द बुवाई सलाह जारी की", lede: "District agriculture officers will coordinate short-duration seed varieties if the monsoon trough stalls next month.", hiLede: "अगले महीने मानसून ट्रफ रुकने पर जिला कृषि अधिकारी अल्पावधि बीज किस्मों का समन्वय करेंगे।" },
  ],
};

function buildPayloads(authorId, batchId) {
  const out = [];
  let seq = 0;
  const baseTime = Date.now();

  for (const category of CATEGORIES) {
    const rows = TOPICS[category];
    if (!rows || rows.length < 5) {
      throw new Error(
        `articleSeedData: TOPICS["${category}"] must have 5 rows (got ${rows ? rows.length : "undefined"}). Align keys with CATEGORIES.`
      );
    }
    for (let i = 0; i < 5; i++) {
      const row = rows[i];
      const slug = `kothari-${category}-${i + 1}-${batchId}`;
      const primaryLocale = i < 3 ? "hi" : "en";
      const isBreaking = category === "rajneeti" && i === 0 && primaryLocale === "hi";
      out.push({
        primaryLocale,
        title: row.t,
        titleHi: row.th,
        slug,
        summary: `${row.lede} Our correspondents are tracking reactions from stakeholders and opposition benches.`,
        summaryHi: `${row.hiLede} हमारे संवाददाता हितधारकों और विपक्ष की प्रतिक्रिया पर नज़र रख रहे हैं।`,
        body: enBody(row.t, row.lede),
        bodyHi: hiBody(row.hiLede),
        category,
        tags: [category, "khabar-kothari", SEED_TAG],
        isBreaking,
        images: [
          { url: img(category, i + 1, true), caption: row.t, isHero: true },
          { url: img(category, i + 1, false), caption: "File / representative image", isHero: false },
        ],
        author: authorId,
        status: "published",
        publishedAt: new Date(baseTime - seq * 120000),
        views: 1200 + seq * 137,
      });
      seq += 1;
    }
  }
  return out;
}

module.exports = { buildPayloads, SEED_TAG };
