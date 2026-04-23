import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  CirclePlay, Camera, AtSign, Globe, Send,
  Heart, Flag, Rss, Tv, Sparkles, Building2, ArrowRight, Check,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { categories } from "../data/publicCategories";

const SOCIAL = [
  { key: "yt", name: "YouTube", nameHi: "यूट्यूब", url: "https://youtube.com/@kotharinews", icon: CirclePlay, color: "#FF0000" },
  { key: "ig", name: "Instagram", nameHi: "इंस्टाग्राम", url: "https://instagram.com/kotharinews", icon: Camera, color: "#E1306C" },
  { key: "tw", name: "X", nameHi: "एक्स", url: "https://twitter.com/kotharinews", icon: AtSign, color: "#e7e9ea" },
  { key: "fb", name: "Facebook", nameHi: "फेसबुक", url: "https://facebook.com/kotharinews", icon: Globe, color: "#1877F2" },
  { key: "tg", name: "Telegram", nameHi: "टेलीग्राम", url: "https://t.me/kotharinews", icon: Send, color: "#2AABEE" },
] as const;

const CAT_COLOR: Record<string, string> = {
  politics: "var(--cat-politics)",
  sports: "var(--cat-sports)",
  tech: "var(--cat-tech)",
  business: "var(--cat-business)",
  entertainment: "var(--cat-entertainment)",
  health: "var(--cat-health)",
  world: "var(--cat-world)",
  state: "#5d4037",
  home: "var(--brand-red)",
  latest: "var(--accent)",
};

export default function SiteFooter() {
  const { lang, t } = useLang();
  const [email, setEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "done">("idle");

  const browseCats = categories.filter((c) => c.slug !== "home");

  const company = lang === "hi"
    ? [
        { hi: "हमारे बारे में", en: "About" },
        { hi: "संपर्क", en: "Contact" },
        { hi: "विज्ञापन", en: "Advertise" },
        { hi: "करियर", en: "Careers" },
        { hi: "प्राइवेसी", en: "Privacy" },
        { hi: "नियम", en: "Terms" },
      ]
    : [
        { hi: "About", en: "About" },
        { hi: "Contact", en: "Contact" },
        { hi: "Advertise", en: "Advertise" },
        { hi: "Careers", en: "Careers" },
        { hi: "Privacy", en: "Privacy" },
        { hi: "Terms", en: "Terms" },
      ];

  const onNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNlStatus("done");
    setEmail("");
    window.setTimeout(() => setNlStatus("idle"), 5000);
  };

  return (
    <footer className="site-footer site-footer-premium">
      <div className="footer-premium-accent" aria-hidden />
      <div className="footer-premium-noise" aria-hidden />

      <div className="footer-premium-inner">
        <section className="footer-premium-brand">
          <div className="footer-premium-brand-row">
            <div className="footer-premium-mark" aria-hidden>
              <span className="footer-premium-mark-letter">ख</span>
            </div>
            <div>
              <p className="footer-premium-title">{t("खबर कोठरी", "Khabar Kothri")}</p>
              <p className="footer-premium-kicker">
                <Rss size={11} strokeWidth={2.5} className="footer-premium-kicker-icon" aria-hidden />
                {t("समाचार", "NEWS")}
              </p>
            </div>
          </div>
          <p className="footer-premium-tagline">
            {t(
              "भारत की भरोसेमंद हिंदी खबरें — विश्लेषण, तथ्य और गहराई के साथ।",
              "Trusted Hindi journalism — depth, context, and clarity in every story."
            )}
          </p>
          <div className="footer-premium-social">
            {SOCIAL.map(({ key, name, nameHi, url, icon: Icon, color }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-premium-social-btn"
                style={{ "--social": color } as CSSProperties}
                title={lang === "hi" ? nameHi : name}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{lang === "hi" ? nameHi : name}</span>
              </a>
            ))}
          </div>
        </section>

        <nav className="footer-premium-col">
          <h3 className="footer-premium-heading">
            <Sparkles size={14} className="footer-premium-heading-icon" aria-hidden />
            {t("श्रेणियाँ", "Categories")}
          </h3>
          <ul className="footer-premium-links">
            {browseCats.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="footer-premium-cat-link">
                  <span
                    className="footer-premium-cat-dot"
                    style={{ background: CAT_COLOR[c.slug] || "var(--brand-red)" }}
                  />
                  {lang === "hi" ? c.name : c.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-premium-col">
          <h3 className="footer-premium-heading">
            <Tv size={14} className="footer-premium-heading-icon" aria-hidden />
            {t("खोजें", "Explore")}
          </h3>
          <ul className="footer-premium-links">
            <li>
              <Link to="/" className="footer-premium-text-link">{t("होम", "Home")}</Link>
            </li>
            <li>
              <Link to="/category/latest" className="footer-premium-text-link">{t("ताज़ा खबरें", "Latest")}</Link>
            </li>
            <li>
              <Link to="/shows" className="footer-premium-text-link">{t("शोज़ व वीडियो", "Shows & video")}</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-premium-col">
          <h3 className="footer-premium-heading">
            <Building2 size={14} className="footer-premium-heading-icon" aria-hidden />
            {t("कंपनी", "Company")}
          </h3>
          <ul className="footer-premium-links">
            {company.map((row, i) => (
              <li key={i}>
                <button type="button" className="footer-premium-text-link footer-premium-text-btn">
                  {lang === "hi" ? row.hi : row.en}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-premium-newsletter">
        <div className="footer-premium-newsletter-inner">
          <div className="footer-premium-newsletter-copy">
            <p className="footer-premium-newsletter-title">{t("न्यूज़लेटर", "Newsletter")}</p>
            <p className="footer-premium-newsletter-sub">
              {t(
                "सुबह की बड़ी खबरें अपने इनबॉक्स में — बिना शोर के, सिर्फ़ काम की बात।",
                "Morning briefings in your inbox — signal, not noise."
              )}
            </p>
          </div>
          {nlStatus === "done" ? (
            <div className="footer-premium-nl-done" role="status">
              <Check size={18} strokeWidth={2.5} />
              {t("धन्यवाद! जल्द ही जुड़ेंगे।", "Thanks — you’re on the list.")}
            </div>
          ) : (
            <form className="footer-premium-nl-form" onSubmit={onNewsletter}>
              <label htmlFor="footer-nl-email" className="kn-visually-hidden">
                {t("ईमेल", "Email")}
              </label>
              <input
                id="footer-nl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === "hi" ? "आपका ईमेल" : "Your email"}
                className="footer-premium-nl-input"
                autoComplete="email"
              />
              <button type="submit" className="footer-premium-nl-submit">
                {t("जुड़ें", "Subscribe")}
                <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-premium-bottom">
        <span className="footer-premium-copy">
          © {new Date().getFullYear()}{" "}
          {t("खबर कोठरी। सर्वाधिकार सुरक्षित।", "Khabar Kothri. All rights reserved.")}
        </span>
        <div className="footer-premium-legal">
          {["Privacy", "Terms", "Sitemap"].map((l) => (
            <button key={l} type="button" className="footer-premium-legal-btn">
              {l}
            </button>
          ))}
          <span className="footer-premium-made">
            {t("भारत में निर्मित", "Made in")}{" "}
            <Flag size={13} className="footer-premium-flag" aria-hidden />
            {t("प्यार से", "with")}{" "}
            <Heart size={13} className="footer-premium-heart" fill="currentColor" aria-hidden />
          </span>
        </div>
      </div>

    </footer>
  );
}
