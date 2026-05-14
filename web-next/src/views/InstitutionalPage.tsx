"use client";

import { Link, useLocation } from "react-router-dom";
import { Target, Eye, Building2, Sparkles, Shield, Users, ArrowRight } from "lucide-react";
import { useLang } from "../context/LangContext";

export type InstitutionalKind = "about" | "mission" | "vision";

const NAV: { kind: InstitutionalKind; path: string; hi: string; en: string }[] = [
  { kind: "about", path: "/about", hi: "परिचय", en: "About" },
  { kind: "mission", path: "/mission", hi: "मिशन", en: "Mission" },
  { kind: "vision", path: "/vision", hi: "विजन", en: "Vision" },
];

function IconFor({ kind }: { kind: InstitutionalKind }) {
  if (kind === "mission") return <Target size={22} strokeWidth={2} aria-hidden />;
  if (kind === "vision") return <Eye size={22} strokeWidth={2} aria-hidden />;
  return <Building2 size={22} strokeWidth={2} aria-hidden />;
}

export default function InstitutionalPage({ kind }: { kind: InstitutionalKind }) {
  const { lang, t } = useLang();
  const location = useLocation();
  const isHi = lang === "hi";

  const title =
    kind === "about"
      ? t("हम कौन हैं", "Who we are")
      : kind === "mission"
        ? t("हमारा मिशन", "Our mission")
        : t("हमारा विजन", "Our vision");

  const kicker =
    kind === "about"
      ? t("संस्था", "Institution")
      : kind === "mission"
        ? t("उद्देश्य", "Purpose")
        : t("दिशा", "Direction");

  const lead =
    kind === "about"
      ? t(
          "‘न्यूज़ कोठरी’ कोई ज्ञान बाँचने वाला लाउडस्पीकर या एसी कमरों में बैठकर ‘देश क्या सोच रहा है’ तय करने वाला चैनल नहीं है। ये एक बगावत है उस बोरिंग और पकाऊ न्यूज़ के खिलाफ, जो आपको नींद की गोली जैसी लगती है। सीधी बात: ये आपके मोहल्ले की वो नुक्कड़ वाली चौपाल है, जहाँ बकैती भी होती है और समझ भी बढ़ती है। टीवी वाले जो खबरें टाई लगाकर पढ़ते हैं, हम उन्हें ‘कोठरी’ की भट्टी में तपाकर, बिना किसी फिल्टर के आपके सामने परोसते हैं।",
          "News Kothari is not a lecturing loudspeaker or an air‑conditioned channel that decides ‘what the nation thinks.’ It is a rebellion against the boring, overcooked news that feels like a sleeping pill. In plain terms: it is your neighbourhood nukkad — where there is banter and there is real sense. We take the tie‑and‑teleprompter headlines, run them through the kothari forge, and serve them to you without the usual filter."
        )
      : kind === "mission"
        ? t(
            "हर कहानी के पीछे सत्यापन, संपादकीय स्वतंत्रता और पाठकों का सम्मान — यही हमारा दैनिक वादा है।",
            "Verification behind every story, editorial independence, and respect for readers — that is our daily promise."
          )
        : t(
            "भारत में भरोसेमंद समाचार का घर बनना — जहाँ हिंदी-अंग्रेज़ी दोनों पाठक समान रूप से सशक्त हों।",
            "To become India’s most trusted home for news — where Hindi and English readers are equally empowered."
          );

  const blocks =
    kind === "about"
      ? [
          {
            h: t("हम वो क्या लिखते हैं?", "What we actually write"),
            p: t(
              "हम वो लिखते हैं जो आप पान की गुमटी पर सोचते हैं और चाय की चुस्कियों के बीच बेधड़क बोलते हैं। खबर भी, नज़रिया भी, और उसके अंदर का पूरा भौकाल भी।",
              "We write what you think at the paan stall and say out loud between sips of chai — the headline, the angle, and the full swagger inside the story."
            ),
          },
          {
            h: t("हमारा भौकाल क्या है?", "What makes us tick"),
            p: t(
              "हम खबरों के पीछे भेड़-बकरियों की तरह नहीं भागते। जो खबर आपके काम की है, उसे पकड़ते हैं और उसका पूरा एक्स-रे कर डालते हैं। हमारी सबसे बड़ी खासियत है हमारा स्वैग और हमारी जुबान — एकदम ठेठ, देसी, बिना लाग-लपेट के। भारी-भरकम शब्दों का रायता फैलाने से हमें परहेज है। हम उसी भाषा में बात करते हैं जिसमें आज का यंग इंडिया बात करता है — जहाँ देसी टशन है और अंग्रेज़ी की कूलनेस भी।",
              "We do not herd-chase every headline. We grab the stories that matter to you and X‑ray them properly. Our edge is voice and swagger — straight, rooted, no pointless jargon. We speak the mix of languages young India actually uses — desi attitude with English cool where it fits."
            ),
          },
          {
            h: t("जहाँ कलम सख्त चलती है", "Where the pen gets serious"),
            p: t(
              "जैसे ड्रामा सिर्फ़ फिल्मों में नहीं होता, दांवपेंच सिर्फ़ राजनीति में नहीं होते, और खेल सिर्फ़ क्रिकेट नहीं है — वैसे ही खबरें सिर्फ़ वो नहीं जो सतह पर दिखती है; उन्हें चुनना पड़ता है, छानना पड़ता है। बेमतलब का सेन्सैशनलिज़म या किसी नेता का PR हम इन सबसे दूर रहते हैं, लेकिन जहाँ बात हक की हो, जेंडर, जाति, पर्यावरण और सिस्टम की नाकामी की हो, वहाँ हमारी कलम लट्ठ की तरह चलती है — एकदम अग्रेसिव और प्रो-पब्लिक।",
              "Drama is not only in films, gambits are not only in politics, and sport is not only cricket — and news is never only what floats on the surface; you have to choose and sift. We steer clear of hollow sensationalism and politician PR theatre — but on rights, gender, caste, the environment, and systemic failure, our pen moves like a stick: sharp, aggressive, and pro‑public."
            ),
          },
          {
            h: t("कोठरी के पिटारे से और क्या निकलेगा?", "What else comes out of the pitara"),
            p: t(
              "सिर्फ़ सूखी ख़बरें पढ़कर तो दिमाग सुन्न हो जाता है न? इसलिए यहाँ हम सिर्फ़ ज्ञान नहीं पेलते, एंटरटेनमेंट का पूरा जुगाड़ भी रखते हैं — भन्नाट फैक्ट्स, दिमाग के जाले साफ करने वाले रिव्यू, मीम्स, और दुनिया भर का ऐसा रायता जिसे समेटने में आपको मज़ा आएगा। ‘लोग क्या कहेंगे’ वाले टैबू सब्जेक्ट्स पर भी हम ऑपरेशन बिना एनेस्थीसिया के करते हैं। इतिहास के वो पन्ने जो दीमक खा रहे थे, उन्हें झाड़-पोंछ कर लाते हैं। हमारी रेंज? ऑस्कर से लेकर पंचायत चुनाव तक, मंगल मिशन से लेकर गाँव के देसी जुगाड़ तक, और विदेशी वेब सीरीज से लेकर भोजपुरी सिनेमा तक — जहाँ दिल दहलता है, वहाँ हमारी नज़र रहती है।",
              "Dry headlines alone numb the mind — so we do not only shovel ‘gyaan’; we keep the entertainment jugaad too: wild facts, brain‑clearing reviews, memes, and the kind of masala mix that is fun to unpack. We take on taboo topics without the anaesthesia of politeness. We dust off history’s moth‑eaten pages and bring them forward. Our range? From the Oscars to panchayat polls, from Mars missions to village jugaad, from foreign web series to Bhojpuri cinema — if it moves people, we are watching."
            ),
          },
        ]
      : kind === "mission"
        ? [
            {
              h: t("सत्यापित समाचार", "Verified journalism"),
              p: t(
                  "स्रोतों की जाँच, संदर्भ और सुधार योग्यता हमारी प्रक्रिया का हिस्सा हैं। तेज़ी कभी सटीकता पर भारी नहीं पड़ने देते।",
                  "Source-checking, context, and correctability are built into our workflow. Speed never outweighs accuracy."
                ),
            },
            {
              h: t("पाठक केंद्रित", "Reader-first"),
              p: t(
                  "बुकमार्क, प्रोफ़ाइल और सिफारिशें आपकी पढ़ने की आदतों का सम्मान करती हैं — बिना धमकी भरे नोटिफ़िकेशन या कृत्रिम विभाजन के।",
                  "Bookmarks, profiles, and recommendations respect how you read — without noisy notifications or artificial divides."
                ),
            },
          ]
        : [
            {
              h: t("भरोसा व नवाचार", "Trust & innovation"),
              p: t(
                  "वीडियो, शोज़ और लेखों का मिश्रण — भविष्य में भी हम कथानक को साधारण भाषा में तोड़ते रहेंगे, तकनीकी नए रूप अपनाते रहेंगे।",
                  "A blend of video, shows, and articles — we will keep breaking stories into plain language while adopting new formats responsibly."
                ),
            },
            {
              h: t("समुदाय", "Community"),
              p: t(
                  "सच्ची खबरें लोगों को जोड़ती हैं। हमारा लक्ष्य है एक ऐसा मंच जहाँ सार्थक बहस संभव हो — नफरत या अफवाह के बाजार नहीं।",
                  "Real news connects people. We aim to host meaningful debate — not markets for hate or rumour."
                ),
            },
          ];

  const values =
    kind === "about"
      ? [
          { icon: Shield, hi: "तथ्य का एक्स-रे", en: "Fact-first X-ray" },
          { icon: Sparkles, hi: "ठेठ जुबान", en: "Straight talk" },
          { icon: Users, hi: "पाठक-पक्ष", en: "Pro-public" },
        ]
      : kind === "mission"
        ? [
            { icon: Shield, hi: "ईमानदारी", en: "Integrity" },
            { icon: Target, hi: "फोकस", en: "Focus" },
            { icon: Users, hi: "जवाबदेही", en: "Accountability" },
          ]
        : [
            { icon: Eye, hi: "दूरदर्शिता", en: "Foresight" },
            { icon: Sparkles, hi: "उत्कृष्टता", en: "Excellence" },
            { icon: Building2, hi: "स्थिरता", en: "Stability" },
          ];

  const quote =
    kind === "about"
      ? {
          text: t(
            "“हम वो इंडिया हैं जो अपने ठेठपन पर कॉलर खड़ा करता है — जिसे अपनी जड़ों और अपनी बोली पर गुरूर है, लेकिन जो दुनिया को मुट्ठी में करने का माद्दा रखता है। ‘न्यूज़ कोठरी’ में आपका स्वागत है — आइए, कुंडी खोलिए, अंदर बैठिए और खबरों का असली स्वाद लीजिए!”",
            "“We are the India that wears its rootedness with pride — proud of its roots and its tongue, yet bold enough to hold the world in its fist. Welcome to News Kothari: open the latch, step inside, and taste the news as it really is.”"
          ),
          by: t("— संपादकीय आमंत्रण", "— Editorial welcome"),
        }
      : kind === "mission"
        ? {
            text: t(
              "“हर प्रकाशन से पहले एक सवाल: क्या यह पाठक की सेवा करता है?”",
              "“Before every publish: does this serve the reader?”"
            ),
            by: t("— डेस्क नियम", "— Desk rule"),
          }
        : {
            text: t(
              "“आज की खबर कल की याद बनती है — हम उस याद को सही रखना चाहते हैं।”",
              "“Today’s headline becomes tomorrow’s memory — we want that memory to be true.”"
            ),
            by: t("— विजन सार", "— Vision note"),
          };

  return (
    <main className="inst-page article-page">
      <div className="inst-hero" aria-hidden>
        <div className="inst-hero-grid" />
        <div className="inst-hero-glow" />
      </div>

      <div className="inst-page-inner section-inner">
        <nav className="inst-nav-pills" aria-label={t("संस्था पृष्ठ", "Institutional pages")}>
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            const label = isHi ? item.hi : item.en;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inst-pill${active ? " is-active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <header className="inst-header">
          <div className="inst-header-icon-wrap" aria-hidden>
            <IconFor kind={kind} />
          </div>
          <p className="inst-kicker">{kicker}</p>
          <h1 className="inst-title">{title}</h1>
          <p className="inst-lead">{lead}</p>
        </header>

        <div className="inst-layout">
          <div className="inst-main-col">
            {blocks.map((b, i) => (
              <section key={i} className="inst-section privacy-section">
                <h2 className="inst-h2 privacy-h2">{b.h}</h2>
                <p>{b.p}</p>
              </section>
            ))}

            <aside className="inst-quote" role="note">
              <p className="inst-quote-text">{quote.text}</p>
              <p className="inst-quote-by">{quote.by}</p>
            </aside>

            <div className="inst-back privacy-back">
              <Link to="/" className="inst-cta-link privacy-back-link">
                {t("होम पर लौटें", "Back to home")}
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="inst-aside" aria-label={t("मूल्य", "Values")}>
            <div className="inst-aside-card">
              <p className="inst-aside-kicker">{t("स्तंभ", "Pillars")}</p>
              <ul className="inst-value-list">
                {values.map(({ icon: Icon, hi, en }) => (
                  <li key={hi} className="inst-value-row">
                    <span className="inst-value-icon">
                      <Icon size={18} strokeWidth={2} aria-hidden />
                    </span>
                    <span className="inst-value-label">{isHi ? hi : en}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="inst-aside-card inst-aside-card--accent">
              <p className="inst-aside-accent-title">{t("संपादकीय", "Editorial")}</p>
              <p className="inst-aside-accent-text">
                {t(
                  "प्रतिक्रिया व सुझाव के लिए साइट पर दिए गए चैनलों से जुड़ें।",
                  "Reach us through the contact channels published on the site."
                )}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
