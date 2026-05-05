import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";

export default function CookiesPage() {
  const { t } = useLang();
  const updated = "May 5, 2026";

  return (
    <main className="privacy-page article-page">
      <div className="privacy-page-inner section-inner">
        <p className="privacy-kicker">{t("कानूनी", "Legal")}</p>
        <h1 className="privacy-title">{t("कुकी नीति", "Cookies policy")}</h1>
        <p className="privacy-updated">
          {t("अंतिम अपडेट", "Last updated")}: {updated}
        </p>

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
          <h2 className="privacy-h2">{t("हमारी साइट पर सामान्य उदाहरण", "Common examples on our site")}</h2>
          <ul className="privacy-list">
            <li>{t("रीडर सत्र टोकन और ऑथ स्टेट", "Reader session token and auth state")}</li>
            <li>{t("भाषा/थीम प्राथमिकताएं", "Language/theme preferences")}</li>
            <li>{t("न्यूज़लेटर सदस्यता स्थिति", "Newsletter subscription state")}</li>
            <li>{t("सुरक्षा व दुरुपयोग रोकथाम संकेत", "Security and abuse-prevention signals")}</li>
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
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("तीसरे पक्ष के टूल", "Third-party tools")}</h2>
          <p>
            {t(
              "जहां लागू हो, हम सीमित तृतीय-पक्ष सेवाओं (जैसे प्रमाणीकरण/ईमेल डिलीवरी/होस्टिंग) का उपयोग करते हैं। वे अपनी सेवा के संचालन हेतु तकनीकी कुकीज़ या समान संकेत उपयोग कर सकते हैं।",
              "Where applicable, we use limited third-party services (such as authentication, email delivery, or hosting). They may use technical cookies or similar signals to operate their services."
            )}
          </p>
        </section>

        <section className="privacy-section">
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
      </div>
    </main>
  );
}
