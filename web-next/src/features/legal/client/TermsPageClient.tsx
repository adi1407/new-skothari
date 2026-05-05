"use client";

import { Link } from "react-router-dom";
import { useLang } from "../../../context/LangContext";

export default function TermsPageClient() {
  const { t } = useLang();
  const updated = "May 5, 2026";

  return (
    <main className="privacy-page legal-page article-page">
      <div className="privacy-page-inner section-inner">
        <p className="privacy-kicker">{t("कानूनी दस्तावेज", "Legal documentation")}</p>
        <h1 className="privacy-title">{t("नियम एवं शर्तें", "Terms & conditions")}</h1>
        <p className="privacy-updated">
          {t("अंतिम अपडेट", "Last updated")}: {updated}
        </p>
        <p className="legal-lead">
          {t(
            "ये नियम News Kothari वेबसाइट और उससे जुड़ी सेवाओं (रीडर अकाउंट, बुकमार्क, लाइक, न्यूज़लेटर, और अन्य फीचर्स) के उपयोग को नियंत्रित करते हैं।",
            "These terms govern your use of News Kothari website and related services (reader accounts, bookmarks, likes, newsletter, and other features)."
          )}
        </p>
        <div className="legal-chip-row" aria-label={t("मुख्य बिंदु", "Key highlights")}>
          <span className="legal-chip">{t("उपयोग नियम", "Usage rules")}</span>
          <span className="legal-chip">{t("सामग्री अधिकार", "Content rights")}</span>
          <span className="legal-chip">{t("जिम्मेदारी सीमा", "Liability limits")}</span>
        </div>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("स्वीकार्यता", "Acceptance")}</h2>
          <p>
            {t(
              "इस वेबसाइट का उपयोग करके आप इन नियमों और शर्तों से सहमत होते हैं। यदि आप सहमत नहीं हैं, तो कृपया सेवाओं का उपयोग न करें।",
              "By using this website, you agree to these Terms and Conditions. If you do not agree, please do not use the services."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("सेवाओं का दायरा", "Scope of services")}</h2>
          <p>
            {t(
              "हम समाचार, विश्लेषण, वीडियो, और रीडर सुविधाएं (जैसे बुकमार्क, लाइक, प्रोफाइल, न्यूज़लेटर) प्रदान करते हैं। हम सेवाओं में सुधार, संशोधन, निलंबन या समाप्ति का अधिकार सुरक्षित रखते हैं।",
              "We provide news, analysis, videos, and reader features (such as bookmarks, likes, profile, and newsletter). We reserve the right to improve, modify, suspend, or discontinue services."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("योग्यता और आयु", "Eligibility and age")}</h2>
          <p>
            {t(
              "सेवा का उपयोग करते समय आप यह घोषित करते हैं कि आपके पास कानूनी क्षमता है या आप वैध अभिभावकीय देखरेख में सेवा उपयोग कर रहे हैं।",
              "By using the service, you represent that you have legal capacity, or are using the service under valid parental/guardian supervision."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("खाता और उपयोगकर्ता जिम्मेदारी", "Account and user responsibility")}</h2>
          <ul className="privacy-list">
            <li>
              {t(
                "आप अपने खाते की जानकारी और लॉगिन एक्सेस की सुरक्षा के लिए जिम्मेदार हैं।",
                "You are responsible for safeguarding your account information and login access."
              )}
            </li>
            <li>
              {t(
                "गलत, अवैध, अपमानजनक, भ्रामक या दुरुपयोगात्मक गतिविधियों की अनुमति नहीं है।",
                "Illegal, abusive, defamatory, misleading, or harmful activities are not permitted."
              )}
            </li>
            <li>
              {t(
                "ऑटोमेटेड स्क्रैपिंग, असंगत बॉट ट्रैफिक, या सुरक्षा बाधित करने के प्रयास प्रतिबंधित हैं।",
                "Automated scraping, abusive bot traffic, or attempts to disrupt security are prohibited."
              )}
            </li>
            <li>
              {t(
                "आप किसी अन्य व्यक्ति की पहचान का दुरुपयोग या प्रतिरूपण नहीं करेंगे।",
                "You will not impersonate another person or misuse another identity."
              )}
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("संपादकीय सामग्री और अस्वीकरण", "Editorial content and disclaimer")}</h2>
          <p>
            {t(
              "हम सटीक और सत्यापित सामग्री प्रकाशित करने का प्रयास करते हैं, लेकिन पूर्ण त्रुटि-रहितता की गारंटी नहीं देते। समाचार परिस्थितियां बदल सकती हैं; इसलिए किसी भी निर्णय से पहले आधिकारिक स्रोतों की पुष्टि करें।",
              "We strive to publish accurate and verified content, but we do not guarantee absolute error-free information. News conditions may evolve; please verify with official sources before making critical decisions."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("बौद्धिक संपदा", "Intellectual property")}</h2>
          <p>
            {t(
              "जब तक अलग से उल्लेख न हो, वेबसाइट की सामग्री, लेआउट, ब्रांडिंग, लोगो और संपादकीय प्रस्तुति हमारी बौद्धिक संपदा है। पूर्व लिखित अनुमति के बिना पुनर्प्रकाशन, व्यावसायिक उपयोग, या व्यापक पुनर्वितरण प्रतिबंधित है।",
              "Unless otherwise stated, the website content, layout, branding, logo, and editorial presentation are our intellectual property. Republishing, commercial reuse, or large-scale redistribution without prior written permission is prohibited."
            )}
          </p>
          <ul className="privacy-list">
            <li>{t("व्यक्तिगत, गैर-व्यावसायिक उपयोग सामान्यतः अनुमत है", "Personal, non-commercial use is generally allowed")}</li>
            <li>{t("स्रोत संदर्भ सहित सीमित उद्धरण स्वीकार्य हो सकता है", "Limited quotations with proper attribution may be acceptable")}</li>
            <li>{t("बल्क कॉपी, रीपब्लिश या AI री-होस्टिंग बिना अनुमति निषिद्ध है", "Bulk copying, republishing, or AI re-hosting without permission is prohibited")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("यूज़र जनरेटेड सामग्री", "User-generated content")}</h2>
          <p>
            {t(
              "जहां लागू हो, आपके द्वारा जमा की गई सामग्री पर आपके मूल अधिकार बने रह सकते हैं; लेकिन प्लेटफ़ॉर्म पर प्रदर्शित/प्रोसेस करने हेतु आप सीमित लाइसेंस प्रदान करते हैं। हम नीतियों के उल्लंघन वाली सामग्री हटाने का अधिकार सुरक्षित रखते हैं।",
              "Where applicable, you may retain ownership of submitted content, while granting a limited license to display/process it on the platform. We reserve the right to remove content that violates policy."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("तृतीय-पक्ष लिंक", "Third-party links")}</h2>
          <p>
            {t(
              "साइट में बाहरी लिंक हो सकते हैं। उन वेबसाइटों की सामग्री, गोपनीयता या उपलब्धता पर हमारा नियंत्रण नहीं होता और हम उसके लिए उत्तरदायी नहीं हैं।",
              "The site may include external links. We do not control and are not responsible for the content, privacy practices, or availability of third-party websites."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("जिम्मेदारी की सीमा", "Limitation of liability")}</h2>
          <p>
            {t(
              "कानून द्वारा अनुमत सीमा तक, सेवा उपयोग से उत्पन्न प्रत्यक्ष/अप्रत्यक्ष नुकसान के लिए हमारी कुल जिम्मेदारी सीमित रहेगी। सेवा 'जैसी है' आधार पर उपलब्ध कराई जाती है।",
              "To the maximum extent permitted by law, our liability for direct or indirect losses arising from use of the service is limited. The service is provided on an 'as-is' basis."
            )}
          </p>
          <p>
            {t(
              "जहां कानून अनुमति देता है, हम अप्रत्यक्ष, विशेष, दंडात्मक या परिणामी क्षति के लिए उत्तरदायी नहीं होंगे।",
              "Where permitted by law, we are not liable for indirect, special, punitive, or consequential damages."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("समापन और निलंबन", "Termination and suspension")}</h2>
          <p>
            {t(
              "यदि किसी खाते द्वारा नियमों का उल्लंघन होता है, तो हम बिना पूर्व सूचना के पहुंच सीमित या समाप्त कर सकते हैं।",
              "If an account violates these terms, we may restrict or terminate access without prior notice."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("क्षतिपूर्ति", "Indemnity")}</h2>
          <p>
            {t(
              "आप सहमत हैं कि आपके द्वारा इन शर्तों के उल्लंघन, अवैध उपयोग, या तृतीय-पक्ष अधिकारों के उल्लंघन से उत्पन्न दावों के विरुद्ध आप उचित सीमा तक हमें सुरक्षित रखेंगे।",
              "You agree to indemnify us, to the extent permitted by law, against claims arising from your breach of these terms, unlawful use, or infringement of third-party rights."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("शासकीय कानून और क्षेत्राधिकार", "Governing law and jurisdiction")}</h2>
          <p>
            {t(
              "ये शर्तें भारत के लागू कानूनों के अधीन होंगी। विवाद की स्थिति में सक्षम न्यायालय का क्षेत्राधिकार लागू होगा, जब तक कि लागू उपभोक्ता कानून अन्यथा न कहे।",
              "These terms are governed by applicable laws of India. In case of disputes, competent courts shall have jurisdiction unless applicable consumer law provides otherwise."
            )}
          </p>
        </section>

        <section className="privacy-section">
          <h2 className="privacy-h2">{t("नियमों में बदलाव", "Changes to terms")}</h2>
          <p>
            {t(
              "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। अपडेट के बाद निरंतर उपयोग का अर्थ संशोधित शर्तों की स्वीकृति माना जाएगा।",
              "We may update these terms from time to time. Continued use after updates means acceptance of the revised terms."
            )}
          </p>
        </section>

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
      </div>
    </main>
  );
}
