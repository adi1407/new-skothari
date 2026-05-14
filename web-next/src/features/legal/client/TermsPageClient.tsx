"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import LegalPageShell from "../components/LegalPageShell";
import LegalMarkdownSections from "../components/LegalMarkdownSections";
import { LEGAL_LAST_UPDATED } from "../content/legalMeta";
import { TERMS_SECTIONS } from "../content/termsContent";

export default function TermsPageClient() {
  const { t, lang } = useLang();
  const updated = lang === "hi" ? LEGAL_LAST_UPDATED.hi : LEGAL_LAST_UPDATED.en;

  return (
    <LegalPageShell
      kicker={t("कानूनी दस्तावेज", "Legal documentation")}
      title={t("नियम एवं शर्तें", "Terms & conditions")}
      updatedLabel={t("अंतिम अपडेट", "Last updated")}
      updatedDate={updated}
      lead={
        <p className="legal-lead">
          {t(
            "ये नियम News Kothari वेबसाइट और उससे जुड़ी सेवाओं (रीडर अकाउंट, बुकमार्क, लाइक, न्यूज़लेटर, टिप्पणी जहाँ उपलब्ध हो, और अन्य फीचर्स) के उपयोग को नियंत्रित करते हैं। पूर्ण विवरण नीचे दिए गए खंडों में है।",
            "These terms govern your use of the News Kothari website and related services (reader accounts, bookmarks, likes, newsletter, comments where available, and other features). The sections below set out the full detail."
          )}
        </p>
      }
      chipsAriaLabel={t("मुख्य बिंदु", "Key highlights")}
      chips={[
        t("खाता व लाइसेंस", "Accounts & licences"),
        t("स्वीकार्य उपयोग", "Acceptable use"),
        t("दायित्व व कानून", "Liability & law"),
      ]}
    >
      <LegalMarkdownSections sections={TERMS_SECTIONS} />

      <section className="privacy-section legal-note-section">
        <h2 className="privacy-h2">{t("संपर्क", "Contact")}</h2>
        <p>
          {t(
            "इन नियमों से संबंधित प्रश्न या औपचारिक नोटिस के लिए वेबसाइट पर प्रकाशित आधिकारिक संपर्क चैनलों का उपयोग करें।",
            "For questions or formal notices regarding these terms, use the official contact channels published on the website."
          )}
        </p>
      </section>

      <p className="privacy-back">
        <Link to="/" className="privacy-back-link">
          {t("होम पर वापस", "Back to home")}
        </Link>
      </p>
    </LegalPageShell>
  );
}
