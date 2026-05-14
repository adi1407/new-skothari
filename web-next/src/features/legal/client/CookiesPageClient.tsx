"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import LegalPageShell from "../components/LegalPageShell";
import LegalMarkdownSections from "../components/LegalMarkdownSections";
import { LEGAL_LAST_UPDATED } from "../content/legalMeta";
import { COOKIES_SECTIONS } from "../content/cookiesContent";

export default function CookiesPageClient() {
  const { t, lang } = useLang();
  const updated = lang === "hi" ? LEGAL_LAST_UPDATED.hi : LEGAL_LAST_UPDATED.en;

  return (
    <LegalPageShell
      kicker={t("कानूनी दस्तावेज", "Legal documentation")}
      title={t("कुकी नीति", "Cookies policy")}
      updatedLabel={t("अंतिम अपडेट", "Last updated")}
      updatedDate={updated}
      lead={
        <p className="legal-lead">
          {t(
            "यह कुकी नीति बताती है कि हम कुकीज़, लोकल स्टोरेज और समान तकनीकों का उपयोग कैसे करते हैं। विस्तार नीचे दिए गए खंडों में है; गोपनीयता नीति के साथ पढ़ें।",
            "This Cookies Policy explains how we use cookies, local storage, and similar technologies. Read the sections below for detail, together with our Privacy Policy."
          )}
        </p>
      }
      chipsAriaLabel={t("मुख्य बिंदु", "Key highlights")}
      chips={[
        t("आवश्यक व विश्लेषण", "Essential & analytics"),
        t("प्रथम/तृतीय-पक्ष", "First & third party"),
        t("नियंत्रण व सहमति", "Controls & consent"),
      ]}
    >
      <LegalMarkdownSections sections={COOKIES_SECTIONS} />

      <p className="privacy-back">
        <Link to="/" className="privacy-back-link">
          {t("होम पर वापस", "Back to home")}
        </Link>
      </p>
    </LegalPageShell>
  );
}
