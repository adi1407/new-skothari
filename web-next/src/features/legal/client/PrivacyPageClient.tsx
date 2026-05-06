"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import LegalPageShell from "../components/LegalPageShell";

export default function PrivacyPageClient() {
  const { t } = useLang();
  const updated = "May 5, 2026";

  return (
    <LegalPageShell
      kicker={t("कानूनी दस्तावेज", "Legal documentation")}
      title={t("गोपनीयता नीति", "Privacy policy")}
      updatedLabel={t("अंतिम अपडेट", "Last updated")}
      updatedDate={updated}
      lead={
        <p className="legal-lead">
          {t(
            "यह नीति बताती है कि News Kothari आपके व्यक्तिगत डेटा को कैसे एकत्र, उपयोग, सुरक्षित और साझा करता है। हम न्यूनतम डेटा सिद्धांत का पालन करते हैं और डेटा को केवल स्पष्ट, वैध और आवश्यक उद्देश्यों के लिए संसाधित करते हैं।",
            "This policy explains how News Kothari collects, uses, secures, and shares your personal data. We follow a data-minimization approach and process information only for clear, lawful, and necessary purposes."
          )}
        </p>
      }
      chipsAriaLabel={t("मुख्य बिंदु", "Key highlights")}
      chips={[
        t("डेटा न्यूनतमकरण", "Data minimization"),
        t("उपयोगकर्ता अधिकार", "User rights"),
        t("सुरक्षा नियंत्रण", "Security controls"),
      ]}
    >
        <section className="privacy-section">
          <h2 className="privacy-h2">{t("दायरा और लागू क्षेत्र", "Scope and applicability")}</h2>
          <p>
            {t(
              "यह नीति वेबसाइट, सार्वजनिक पेज, रीडर अकाउंट, न्यूज़लेटर सदस्यता और संबंधित इंटरैक्शन पर लागू होती है। यह तृतीय-पक्ष साइटों या उन सेवाओं पर लागू नहीं होती जिन पर हमारा नियंत्रण नहीं है।",
              "This policy applies to the website, public pages, reader accounts, newsletter subscriptions, and related interactions. It does not apply to third-party websites or services outside our control."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("एकत्रित डेटा की श्रेणियां", "Categories of data we collect")}</h2>
          <ul className="privacy-list">
            <li>
              {t(
                "पहचान/प्रोफ़ाइल डेटा: नाम, ईमेल, और Google साइन-इन से प्राप्त सीमित पहचान विवरण।",
                "Identity/profile data: name, email, and limited identity details received through Google sign-in."
              )}
            </li>
            <li>
              {t(
                "खाता और उपयोग डेटा: बुकमार्क, लाइक/अपवोट स्थिति, पढ़ने से संबंधित इवेंट, सत्र संकेत।",
                "Account and usage data: bookmarks, like/upvote states, reading-related events, and session signals."
              )}
            </li>
            <li>
              {t(
                "तकनीकी डेटा: डिवाइस/ब्राउज़र संकेत, IP आधारित सामान्य क्षेत्र, सुरक्षा लॉग।",
                "Technical data: device/browser signals, approximate IP-based region, and security logs."
              )}
            </li>
            <li>
              {t(
                "संचार डेटा: न्यूज़लेटर सदस्यता स्थिति और सहायता/फीडबैक संवाद (जहां लागू हो)।",
                "Communication data: newsletter subscription status and support/feedback exchanges where applicable."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("हम डेटा क्यों उपयोग करते हैं", "Why we use your data")}</h2>
          <ul className="privacy-list">
            <li>{t("अकाउंट प्रमाणीकरण और सुरक्षित साइन-इन हेतु", "To authenticate accounts and maintain secure sign-in")}</li>
            <li>{t("बुकमार्क/लाइक जैसे फीचर्स सक्षम करने हेतु", "To provide reader features like bookmarks and likes")}</li>
            <li>{t("कंटेंट प्रदर्शन, अनुशंसा और अनुभव सुधार हेतु", "To improve content performance, recommendations, and UX")}</li>
            <li>{t("दुरुपयोग रोकथाम, धोखाधड़ी पहचान और प्लेटफ़ॉर्म सुरक्षा हेतु", "To prevent abuse, detect fraud, and protect the platform")}</li>
            <li>{t("कानूनी दायित्वों और वैध हितों का पालन करने हेतु", "To comply with legal obligations and legitimate interests")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("कानूनी आधार", "Legal bases for processing")}</h2>
          <p>
            {t(
              "जहां लागू हो, हम डेटा को अनुबंध निष्पादन, उपयोगकर्ता सहमति, वैध हित (सुरक्षा/विश्लेषण), और कानूनी अनुपालन के आधार पर संसाधित करते हैं।",
              "Where applicable, we process data based on contract performance, user consent, legitimate interests (security/analytics), and legal compliance."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("कुकीज़ और लोकल स्टोरेज", "Cookies and local storage")}</h2>
          <p>
            {t(
              "हम आवश्यक और प्राथमिकता आधारित कुकी/ब्राउज़र स्टोरेज का उपयोग करते हैं, जैसे भाषा, थीम, सत्र स्थिति और सुरक्षा संकेत। अधिक विवरण के लिए हमारी कुकी नीति देखें।",
              "We use essential and preference-based cookies/browser storage for language, theme, session state, and security signals. See our Cookies Policy for details."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("डेटा साझाकरण", "Data sharing")}</h2>
          <ul className="privacy-list">
            <li>{t("हम आपका व्यक्तिगत डेटा बेचते नहीं हैं।", "We do not sell your personal data.")}</li>
            <li>
              {t(
                "सेवा संचालन के लिए सीमित सेवा प्रदाताओं (जैसे प्रमाणीकरण, ईमेल, होस्टिंग) के साथ आवश्यक डेटा साझा किया जा सकता है।",
                "Limited data may be shared with service providers (authentication, email, hosting) strictly for operating services."
              )}
            </li>
            <li>
              {t(
                "कानूनी अनुरोध, न्यायालय आदेश, या सुरक्षा जांच के तहत डेटा साझा करना आवश्यक हो सकता है।",
                "Data may be disclosed when required under lawful requests, court orders, or security investigations."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("डेटा संरक्षण और सुरक्षा", "Data protection and security")}</h2>
          <p>
            {t(
              "हम तकनीकी और संगठनात्मक सुरक्षा उपाय अपनाते हैं, जिनमें एक्सेस नियंत्रण, सीमित प्राधिकरण, सुरक्षित सत्र प्रबंधन और लॉग मॉनिटरिंग शामिल हो सकते हैं। फिर भी इंटरनेट ट्रांसमिशन पूरी तरह जोखिम-मुक्त नहीं होता।",
              "We implement technical and organizational safeguards, including access controls, limited authorization, secure session handling, and log monitoring. However, no internet transmission is entirely risk-free."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("डेटा प्रतिधारण", "Data retention")}</h2>
          <p>
            {t(
              "हम डेटा को उतनी अवधि तक रखते हैं जितनी सेवा संचालन, सुरक्षा, रिकॉर्ड कीपिंग और कानूनी अनुपालन के लिए आवश्यक है। अनावश्यक डेटा को हटाया, डी-आइडेंटिफाई या एग्रीगेट किया जा सकता है।",
              "We retain data for as long as necessary for operations, security, record-keeping, and legal compliance. Data no longer needed may be deleted, de-identified, or aggregated."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("आपके अधिकार", "Your rights")}</h2>
          <ul className="privacy-list">
            <li>{t("डेटा एक्सेस और सुधार का अनुरोध", "Request data access and correction")}</li>
            <li>{t("खाता हटाने/निष्क्रिय करने का अनुरोध", "Request account deletion or deactivation")}</li>
            <li>{t("न्यूज़लेटर/मार्केटिंग संचार से ऑप्ट-आउट", "Opt out of newsletter or marketing communication")}</li>
            <li>{t("उचित स्थिति में डेटा प्रोसेसिंग पर आपत्ति", "Object to certain processing where applicable")}</li>
          </ul>
          <p>
            {t(
              "अधिकारों का उपयोग करने के लिए वेबसाइट पर उपलब्ध संपर्क चैनलों के माध्यम से अनुरोध करें। हम उचित सत्यापन के बाद लागू कानूनों के अनुसार प्रतिक्रिया देंगे।",
              "To exercise rights, contact us through channels available on the website. We respond after reasonable verification and in line with applicable laws."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("बच्चों की गोपनीयता", "Children's privacy")}</h2>
          <p>
            {t(
              "सेवाएं सामान्य दर्शकों के लिए हैं और जानबूझकर बच्चों से व्यक्तिगत डेटा एकत्र करने का उद्देश्य नहीं रखतीं। यदि आपको लगता है कि अनुचित डेटा एकत्र हुआ है, तो हमें सूचित करें।",
              "Services are intended for a general audience and are not designed to knowingly collect personal data from children. If you believe inappropriate data was collected, notify us."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("अंतरराष्ट्रीय प्रोसेसिंग और अनुपालन", "International processing and compliance")}</h2>
          <p>
            {t(
              "आपके डेटा का प्रोसेसिंग/स्टोरेज विभिन्न क्षेत्रों में स्थित इंफ्रास्ट्रक्चर पर हो सकता है। ऐसे मामलों में हम उचित सुरक्षा उपाय लागू करने का प्रयास करते हैं।",
              "Your data may be processed or stored on infrastructure located in different regions. In such cases, we seek to apply appropriate safeguards."
            )}
          </p>
        </section>

        <section className="privacy-section legal-note-section">
          <h2 className="privacy-h2">{t("नीति में परिवर्तन", "Policy changes")}</h2>
          <p>
            {t(
              "हम समय-समय पर इस नीति को अपडेट कर सकते हैं। महत्वपूर्ण परिवर्तनों को वेबसाइट पर स्पष्ट रूप से प्रकाशित किया जाएगा। अपडेट के बाद आपका निरंतर उपयोग संशोधित नीति की स्वीकृति मानी जा सकती है।",
              "We may update this policy periodically. Material changes will be clearly published on the website. Continued use after updates may be treated as acceptance of the revised policy."
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
