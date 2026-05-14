"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import LegalPageShell from "../components/LegalPageShell";
import LegalMarkdownSections from "../components/LegalMarkdownSections";
import { LEGAL_LAST_UPDATED } from "../content/legalMeta";
import { PRIVACY_SECTIONS } from "../content/privacyContent";

export default function PrivacyPageClient() {
  const { t, lang } = useLang();
  const updated = lang === "hi" ? LEGAL_LAST_UPDATED.hi : LEGAL_LAST_UPDATED.en;

  return (
    <LegalPageShell
      kicker={t("कानूनी दस्तावेज", "Legal documentation")}
      title={t("गोपनीयता नीति", "Privacy policy")}
      updatedLabel={t("अंतिम अपडेट", "Last updated")}
      updatedDate={updated}
      lead={
        <p className="legal-lead">
          {t(
            "यह नीति बताती है कि News Kothari आपके व्यक्तिगत डेटा को कैसे एकत्र, उपयोग, सुरक्षित और साझा करता है। हम न्यूनतम डेटा सिद्धांत का पालन करने का प्रयास करते हैं। पूर्ण विवरण नीचे दिए गए खंडों में है।",
            "This policy explains how News Kothari collects, uses, secures, and shares your personal data. We aim to follow data-minimization principles. The sections below contain the full detail."
          )}
        </p>
      }
      chipsAriaLabel={t("मुख्य बिंदु", "Key highlights")}
      chips={[
        t("एकत्रण व उद्देश्य", "Collection & purposes"),
        t("साझाकरण व सुरक्षा", "Sharing & security"),
        t("आपके अधिकार", "Your rights"),
      ]}
    >
      <LegalMarkdownSections sections={PRIVACY_SECTIONS} />

      <p className="privacy-back">
        <Link to="/" className="privacy-back-link">
          {t("होम पर वापस", "Back to home")}
        </Link>
      </p>
    </LegalPageShell>
  );
}
