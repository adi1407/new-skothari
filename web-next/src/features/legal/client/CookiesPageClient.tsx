"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import LegalPageShell from "../components/LegalPageShell";

export default function CookiesPageClient() {
  const { t } = useLang();
  const updated = "May 5, 2026";

  return (
    <LegalPageShell
      kicker={t("कानूनी दस्तावेज", "Legal documentation")}
      title={t("कुकी नीति", "Cookies policy")}
      updatedLabel={t("अंतिम अपडेट", "Last updated")}
      updatedDate={updated}
      lead={
        <p className="legal-lead">
          {t(
            "यह कुकी नीति बताती है कि हम वेबसाइट पर कुकीज़, लोकल स्टोरेज और समान तकनीकों का उपयोग कैसे करते हैं, ताकि सेवा सुरक्षित, उपयोगी और व्यक्तिगत प्राथमिकताओं के अनुरूप रहे।",
            "This Cookies Policy explains how we use cookies, local storage, and similar technologies to keep the service secure, useful, and aligned with your preferences."
          )}
        </p>
      }
      chipsAriaLabel={t("मुख्य बिंदु", "Key highlights")}
      chips={[
        t("आवश्यक कुकीज़", "Essential cookies"),
        t("उपयोग नियंत्रण", "User controls"),
        t("तृतीय-पक्ष संकेत", "Third-party signals"),
      ]}
    >
        <section className="privacy-section">
          <h2 className="privacy-h2">{t("कुकी क्या हैं", "What cookies are")}</h2>
          <p>
            {t(
              "कुकीज़ और समान ब्राउज़र स्टोरेज तकनीकें छोटी डेटा फ़ाइलें हैं जो आपके डिवाइस पर सेव होती हैं। इनसे वेबसाइट आपकी सेटिंग्स याद रखती है, सुरक्षित सत्र बनाए रखती है और अनुभव बेहतर बनाती है।",
              "Cookies and similar browser storage technologies are small data files stored on your device. They help the website remember settings, maintain secure sessions, and improve your experience."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("हम कौन सी कुकी श्रेणियां उपयोग करते हैं", "Cookie categories we use")}</h2>
          <ul className="privacy-list">
            <li>
              <strong>{t("आवश्यक", "Strictly necessary")}:</strong>{" "}
              {t(
                "साइन-इन स्थिति, सुरक्षा, और मूल साइट कार्यक्षमता के लिए।",
                "Used for sign-in state, security, and core site functionality."
              )}
            </li>
            <li>
              <strong>{t("प्राथमिकता", "Preference")}:</strong>{" "}
              {t(
                "भाषा, थीम (डार्क/लाइट), और UI चयन जैसी सेटिंग्स के लिए।",
                "Used for settings such as language, theme (dark/light), and UI preferences."
              )}
            </li>
            <li>
              <strong>{t("विश्लेषण", "Analytics")}:</strong>{" "}
              {t(
                "पेज प्रदर्शन और उत्पाद सुधार के लिए समेकित उपयोग संकेतों को समझने हेतु।",
                "Used to understand aggregate usage signals for performance and product improvements."
              )}
            </li>
            <li>
              <strong>{t("संचार", "Communication")}:</strong>{" "}
              {t(
                "न्यूज़लेटर सदस्यता और संबंधित स्थिति (जैसे ऑप्ट-इन/ऑप्ट-आउट) को प्रबंधित करने हेतु।",
                "Used for newsletter subscription state and related communication preferences (opt-in/opt-out)."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("प्रत्येक श्रेणी का उद्देश्य", "Purpose of each category")}</h2>
          <ul className="privacy-list">
            <li>
              {t(
                "आवश्यक कुकीज़: लॉगिन सत्र, API सुरक्षा, CSRF/दुरुपयोग सुरक्षा और बुनियादी कार्यप्रवाह बनाए रखने में मदद करती हैं।",
                "Essential cookies: help maintain login sessions, API security, CSRF/abuse protections, and core workflows."
              )}
            </li>
            <li>
              {t(
                "प्राथमिकता कुकीज़: आपकी भाषा, थीम और उपयोग अनुभव से संबंधित विकल्प याद रखती हैं।",
                "Preference cookies: remember language, theme, and user-experience choices."
              )}
            </li>
            <li>
              {t(
                "विश्लेषण श्रेणी: समेकित स्तर पर प्रदर्शन, एरर ट्रेंड और फीचर गुणवत्ता को समझने में सहायता करती है।",
                "Analytics category: supports aggregate understanding of performance, error trends, and feature quality."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("हमारी साइट पर सामान्य उदाहरण", "Common examples on our site")}</h2>
          <ul className="privacy-list">
            <li>{t("रीडर सत्र टोकन और ऑथ स्टेट", "Reader session token and auth state")}</li>
            <li>{t("भाषा/थीम प्राथमिकताएं", "Language/theme preferences")}</li>
            <li>{t("न्यूज़लेटर सदस्यता स्थिति", "Newsletter subscription state")}</li>
            <li>{t("सुरक्षा व दुरुपयोग रोकथाम संकेत", "Security and abuse-prevention signals")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("कुकी की अवधि", "Cookie duration")}</h2>
          <ul className="privacy-list">
            <li>
              {t(
                "सेशन कुकीज़: ब्राउज़र सत्र समाप्त होने तक सक्रिय रहती हैं।",
                "Session cookies: remain active until your browser session ends."
              )}
            </li>
            <li>
              {t(
                "स्थायी कुकीज़/लोकल स्टोरेज: सेटिंग्स याद रखने के लिए अधिक समय तक रह सकती हैं, जब तक आप हटाएं या वे स्वतः समाप्त हों।",
                "Persistent cookies/local storage: may stay longer to remember settings until deleted or expired."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("आप नियंत्रण कैसे कर सकते हैं", "How you can control cookies")}</h2>
          <p>
            {t(
              "आप ब्राउज़र सेटिंग्स में कुकीज़ हटाने या ब्लॉक करने का विकल्प चुन सकते हैं। ध्यान दें: आवश्यक कुकीज़ निष्क्रिय करने से साइन-इन, बुकमार्क और कुछ इंटरैक्टिव सुविधाएं सही से काम नहीं कर सकतीं।",
              "You can delete or block cookies from your browser settings. Note: disabling essential cookies may impact sign-in, bookmarks, and some interactive features."
            )}
          </p>
          <ul className="privacy-list">
            <li>{t("ब्राउज़र सेटिंग्स से कुकी प्रबंधन करें", "Manage cookies through browser settings")}</li>
            <li>{t("लोकल स्टोरेज/कैश समय-समय पर साफ करें", "Clear local storage/cache periodically")}</li>
            <li>{t("न्यूज़लेटर ईमेल में अनसब्सक्राइब विकल्प का उपयोग करें", "Use unsubscribe options in newsletter emails")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("तीसरे पक्ष के टूल", "Third-party tools")}</h2>
          <p>
            {t(
              "जहां लागू हो, हम सीमित तृतीय-पक्ष सेवाओं (जैसे प्रमाणीकरण/ईमेल डिलीवरी/होस्टिंग) का उपयोग करते हैं। वे अपनी सेवा के संचालन हेतु तकनीकी कुकीज़ या समान संकेत उपयोग कर सकते हैं।",
              "Where applicable, we use limited third-party services (such as authentication, email delivery, or hosting). They may use technical cookies or similar signals to operate their services."
            )}
          </p>
          <p>
            {t(
              "तृतीय-पक्ष सेवाओं द्वारा रखी गई कुकीज़ के लिए संबंधित सेवा प्रदाता की नीतियां लागू होंगी। हम केवल आवश्यक एकीकरण तक सीमित रहने का प्रयास करते हैं।",
              "For cookies placed by third-party services, the respective provider's policy applies. We aim to keep integrations limited to what is operationally necessary."
            )}
          </p>
        </section>

        <section className="privacy-section legal-note-section">
          <h2 className="privacy-h2">{t("अपडेट", "Updates")}</h2>
          <p>
            {t(
              "कानूनी, तकनीकी या उत्पाद परिवर्तनों के अनुसार यह कुकी नीति समय-समय पर अपडेट हो सकती है। कृपया इस पेज पर प्रदर्शित ‘अंतिम अपडेट’ तिथि देखें।",
              "This cookies policy may be updated from time to time due to legal, technical, or product changes. Please check the 'Last updated' date on this page."
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
