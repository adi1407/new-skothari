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
          "न्यूज़ कोठरी एक डिजिटल-फर्स्ट समाचार कक्ष है — जहाँ तथ्य, संदर्भ और स्पष्ट भाषा को प्राथमिकता मिलती है। हम देश और दुनिया की घटनाओं को आप तक पहुँचाते हैं, बिना शोर-शराबे के।",
          "News Kothari is a digital-first newsroom where facts, context, and plain language come first. We bring India and the world to your screen — signal, not noise."
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
            h: t("संपादकीय दृष्टिकोण", "Editorial approach"),
            p: t(
              "हम राजनीति, अर्थव्यवस्था, खेल, स्वास्थ्य, कृषि, मनोरंजन और अंतरराष्टीय मुद्दों को संतुलित ढंग से कवर करते हैं। गंभीर रिपोर्टिंग के साथ स्पष्ट व्याख्या — ताकि आप न केवल ‘क्या हुआ’ जानें, बल्कि ‘क्यों मायने रखता है’ भी समझें।",
              "We cover politics, economy, sports, health, agriculture, entertainment, and global affairs with balance. Serious reporting meets clear explanation — so you understand not just what happened, but why it matters."
            ),
          },
          {
            h: t("भाषा व पहुँच", "Language & reach"),
            p: t(
              "द्विभाषी डेस्क का लक्ष्य है: एक ही मंच पर हिंदी और अंग्रेज़ी में विश्वसनीय कवरेज। मोबाइल-फर्स्ट डिज़ाइन से शहर और गाँव दोनों में पढ़ने का अनुभव तेज़ और साफ़ रहे।",
              "Our bilingual desk exists to deliver trustworthy coverage in Hindi and English on one platform. Mobile-first design keeps reading fast and clear — from metros to small towns."
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
          { icon: Shield, hi: "सत्यापन", en: "Verification" },
          { icon: Sparkles, hi: "स्पष्टता", en: "Clarity" },
          { icon: Users, hi: "समावेश", en: "Inclusion" },
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
            "“समाचार तब शक्तिशाली होता है जब वह समझने योग्य हो।”",
            "“News is powerful when it is understandable.”"
          ),
          by: t("— संपादकीय मंत्र", "— Editorial motto"),
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
