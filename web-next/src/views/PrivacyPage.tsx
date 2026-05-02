import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";

/** Static privacy policy — bilingual blocks via t(). Last reviewed date shown in UI. */
export default function PrivacyPage() {
  const { t } = useLang();
  const updated = "April 29, 2026";

  return (
    <main className="privacy-page article-page">
      <div className="privacy-page-inner section-inner">
        <p className="privacy-kicker">{t("कानूनी", "Legal")}</p>
        <h1 className="privacy-title">{t("गोपनीयता नीति", "Privacy policy")}</h1>
        <p className="privacy-updated">
          {t("अंतिम अपडेट", "Last updated")}: {updated}
        </p>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("सारांश", "Summary")}</h2>
          <p>
            {t(
              "हम आपकी पहचान और उपयोग संबंधी जानकारी को सीमित और स्पष्ट उद्देश्यों के लिए संसाधित करते हैं — खाता, बुकमार्क, पढ़ने की गतिविधि के संकेत (जैसे देखना / अपवोट), और साइट सुधार।",
              "We process your identity and usage information for limited, clear purposes — account, bookmarks, reading activity signals (such as views and upvotes), and improving the site."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("हम कौन हैं", "Who we are")}</h2>
          <p>
            {t(
              "यह नीति इस समाचार वेबसाइट और संबंधित रीडर खाता सेवाओं पर लागू होती है। संपर्क के लिए अपनी वेबसाइट पर दिए गए संपर्क चैनल का उपयोग करें।",
              "This policy applies to this news website and related reader account services. Use the contact channels published on the site to reach us."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("हम कौन सा डेटा एकत्र करते हैं", "Data we collect")}</h2>
          <ul className="privacy-list">
            <li>
              {t(
                "खाता: ईमेल, नाम, और Google साइन-इन के माध्यम से आपकी पहचान (Google के अनुसार)।",
                "Account: email, name, and identity from Google sign-in (as provided by Google)."
              )}
            </li>
            <li>
              {t(
                "रीडर सुविधाएँ: आपके बुकमार्क, पढ़ने का इतिहास / प्रगति (जहाँ लागू हो), सत्र जानकारी, और सिफारिशों के लिए इवेंट सिग्नल (देखना, बुकमार्क, शेयर, पूर्ण पढ़ना, श्रेणी क्लिक, अपवोट)।",
                "Reader features: your bookmarks, reading history / progress where applicable, session information, and event signals for recommendations (views, bookmarks, shares, completes, category clicks, upvotes)."
              )}
            </li>
            <li>
              {t(
                "तकनीकी डेटा: ब्राउज़र प्रकार, उपयोगकर्ता-एजेंट स्ट्रिंग, और सुरक्षित सत्र टोकन।",
                "Technical data: browser type, user-agent strings, and secure session tokens."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("कुकीज़ और स्थानीय स्टोरेज", "Cookies and local storage")}</h2>
          <p>
            {t(
              "हम थीम / भाषा जैसी प्राथमिकताओं और साइन-इन स्थिति को संचालित करने के लिए ब्राउज़र स्टोरेज का उपयोग कर सकते हैं। आप अपने ब्राउज़र में सेटिंग्स समायोजित कर सकते हैं।",
              "We may use browser storage for preferences such as theme or language and sign-in state. You can adjust settings in your browser."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("तीसरे पक्ष", "Third parties")}</h2>
          <p>
            {t(
              "Google आपकी साइन-इन पहचान प्रदान करता है। उनकी गोपनीयता नीति लागू होती है। हम आपकी अनुमति के बिना आपके सोशल खातों पर पोस्ट नहीं करते।",
              "Google provides sign-in identity; their privacy policy applies. We do not post to your social accounts without permission."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("आपके अधिकार", "Your rights")}</h2>
          <p>
            {t(
              "आप प्रोफ़ाइल में गोपनीयता अनुभाग से खाता हटाने का अनुरोध कर सकते हैं।",
              "You may request account deletion from the Privacy section of your profile when signed in."
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
