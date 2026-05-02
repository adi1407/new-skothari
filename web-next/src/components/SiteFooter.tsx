import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  CirclePlay, Camera, AtSign, Globe, Send,
  Heart, Flag, Tv, Sparkles, Building2, ArrowRight, Check,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { categories } from "../data/publicCategories";
import BrandLogo from "./BrandLogo";
import BrandWordmark from "./BrandWordmark";
import { withPublicOrigin } from "../config/publicApi";

const SOCIAL = [
  { key: "yt", name: "YouTube", nameHi: "यूट्यूब", url: "https://youtube.com/@kotharinews", icon: CirclePlay, color: "#FF0000" },
  { key: "ig", name: "Instagram", nameHi: "इंस्टाग्राम", url: "https://instagram.com/kotharinews", icon: Camera, color: "#E1306C" },
  { key: "tw", name: "X", nameHi: "एक्स", url: "https://twitter.com/kotharinews", icon: AtSign, color: "#e7e9ea" },
  { key: "fb", name: "Facebook", nameHi: "फेसबुक", url: "https://facebook.com/kotharinews", icon: Globe, color: "#1877F2" },
  { key: "tg", name: "Telegram", nameHi: "टेलीग्राम", url: "https://t.me/kotharinews", icon: Send, color: "#2AABEE" },
] as const;

const CAT_COLOR: Record<string, string> = {
  desh: "var(--cat-desh)",
  videsh: "var(--cat-videsh)",
  rajneeti: "var(--cat-rajneeti)",
  khel: "var(--cat-khel)",
  health: "var(--cat-health)",
  krishi: "var(--cat-krishi)",
  business: "var(--cat-business)",
  manoranjan: "var(--cat-manoranjan)",
  home: "var(--brand-red)",
};

export default function SiteFooter() {
  const { lang, t } = useLang();
  const [email, setEmail] = useState("");
  const [nlCadence, setNlCadence] = useState<"daily" | "weekly">("daily");
  const [nlStatus, setNlStatus] = useState<"idle" | "done">("idle");
  const [nlPending, setNlPending] = useState(false);
  const [nlErr, setNlErr] = useState("");

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

  const onNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || nlPending) return;
    setNlErr("");
    setNlPending(true);
    try {
      const res = await fetch(withPublicOrigin("/api/public/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "Subscribe failed");
      }
      setNlStatus("done");
      setEmail("");
      window.setTimeout(() => setNlStatus("idle"), 6000);
    } catch {
      setNlErr(lang === "hi" ? "अभी सब्सक्राइब नहीं हो सका — फिर कोशिश करें।" : "Could not subscribe. Try again.");
    } finally {
      setNlPending(false);
    }
  };

  return (
    <footer className="site-footer site-footer-premium">
      <div className="footer-premium-accent" aria-hidden />
      <div className="footer-premium-noise" aria-hidden />

      <div className="footer-premium-inner">
        <section className="footer-premium-brand">
          <div className="footer-premium-brand-row">
            <Link to="/" className="footer-premium-brand-logo-link" aria-label={t("होम", "Home")}>
              <BrandLogo className="footer-premium-brand-logo" height={56} decorative />
              <BrandWordmark className="footer-premium-brand-wordmark" decorative />
            </Link>
          </div>
          <p className="footer-premium-brand-tagline">
            {t(
              "सत्यापित खबरें, साफ़ भाषा — आपकी डिजिटल कोठरी।",
              "Verified news, clear voice — your digital newsroom."
            )}
          </p>
          <div className="footer-premium-social">
            {SOCIAL.map(({ key, name, nameHi, url, icon: Icon, color }) => {
              const label = lang === "hi" ? nameHi : name;
              return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-premium-social-btn"
                style={{ "--social": color } as CSSProperties}
                title={label}
                aria-label={label}
              >
                <Icon size={17} strokeWidth={2} aria-hidden />
                <span className="footer-premium-social-label">{label}</span>
              </a>
              );
            })}
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
              <Link to="/category/desh" className="footer-premium-text-link">{t("देश खबरें", "Desh")}</Link>
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
          <div className="footer-premium-newsletter-card">
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
                {t(
                  "धन्यवाद! नवीनतम खबरें आपके ईमेल पर भेज दी गईं।",
                  "Thanks — latest stories are heading to your inbox."
                )}
              </div>
            ) : (
              <form className="footer-premium-nl-stack" onSubmit={onNewsletter}>
                <div className="footer-premium-nl-cadence" role="group" aria-label={t("आवृत्ति", "Frequency")}>
                  <button
                    type="button"
                    className={`footer-premium-nl-cadence-btn${nlCadence === "daily" ? " is-active" : ""}`}
                    onClick={() => setNlCadence("daily")}
                  >
                    {t("दैनिक", "Daily")}
                  </button>
                  <button
                    type="button"
                    className={`footer-premium-nl-cadence-btn${nlCadence === "weekly" ? " is-active" : ""}`}
                    onClick={() => setNlCadence("weekly")}
                  >
                    {t("साप्ताहिक", "Weekly")}
                  </button>
                </div>
                <div className="footer-premium-nl-form">
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
                  <button type="submit" className="footer-premium-nl-submit" disabled={nlPending}>
                    {nlPending ? t("भेज रहे हैं…", "Sending…") : t("जुड़ें", "Subscribe")}
                    {!nlPending ? <ArrowRight size={16} strokeWidth={2.5} aria-hidden /> : null}
                  </button>
                </div>
              </form>
            )}
            {nlErr ? (
              <p className="footer-premium-nl-err" role="alert">
                {nlErr}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="footer-premium-bottom">
        <span className="footer-premium-copy">© {new Date().getFullYear()} Khabar Kothri</span>
        <div className="footer-premium-legal">
          <Link to="/privacy" className="footer-premium-legal-chip">
            {t("प्राइवेसी", "Privacy")}
          </Link>
          <button type="button" className="footer-premium-legal-chip">
            {t("नियम", "Terms")}
          </button>
          <button type="button" className="footer-premium-legal-chip">
            {t("साइट मैप", "Sitemap")}
          </button>
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
