"use client";

import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  CirclePlay, Camera, AtSign, Globe, Send,
  Heart, Flag, Tv, Sparkles, Building2,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { categories } from "../data/publicCategories";
import BrandLogo from "./BrandLogo";
import { SITE_SOCIAL } from "../config/siteSocial";

const SOCIAL = [
  { key: "yt", name: "YouTube", nameHi: "यूट्यूब", url: SITE_SOCIAL.youtube, icon: CirclePlay, color: "#FF0000" },
  { key: "ig", name: "Instagram", nameHi: "इंस्टाग्राम", url: SITE_SOCIAL.instagram, icon: Camera, color: "#E1306C" },
  { key: "tw", name: "X", nameHi: "एक्स", url: SITE_SOCIAL.x, icon: AtSign, color: "#e7e9ea" },
  { key: "fb", name: "Facebook", nameHi: "फेसबुक", url: SITE_SOCIAL.facebook, icon: Globe, color: "#1877F2" },
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

  const browseCats = categories.filter((c) => c.slug !== "home");

  const company: { hi: string; en: string; to?: string }[] =
    lang === "hi"
      ? [
          { hi: "हमारे बारे में", en: "About", to: "/about" },
          { hi: "मिशन", en: "Mission", to: "/mission" },
          { hi: "विजन", en: "Vision", to: "/vision" },
          { hi: "संपर्क", en: "Contact" },
          { hi: "विज्ञापन", en: "Advertise" },
          { hi: "करियर", en: "Careers" },
          { hi: "प्राइवेसी", en: "Privacy", to: "/privacy" },
          { hi: "कुकी नीति", en: "Cookies", to: "/cookies" },
          { hi: "नियम", en: "Terms", to: "/terms" },
        ]
      : [
          { hi: "About", en: "About", to: "/about" },
          { hi: "Mission", en: "Mission", to: "/mission" },
          { hi: "Vision", en: "Vision", to: "/vision" },
          { hi: "Contact", en: "Contact" },
          { hi: "Advertise", en: "Advertise" },
          { hi: "Careers", en: "Careers" },
          { hi: "Privacy", en: "Privacy", to: "/privacy" },
          { hi: "Cookies", en: "Cookies", to: "/cookies" },
          { hi: "Terms", en: "Terms", to: "/terms" },
        ];

  return (
    <footer id="kn-site-footer" className="site-footer site-footer-premium">
      <div className="footer-premium-accent" aria-hidden />
      <div className="footer-premium-noise" aria-hidden />

      <div className="footer-premium-inner">
        <section className="footer-premium-brand">
          <div className="footer-premium-brand-row">
            <Link to="/" className="footer-premium-brand-logo-link" aria-label={t("होम", "Home")}>
              <BrandLogo className="footer-premium-brand-logo" height={56} decorative />
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
                {row.to ? (
                  <Link to={row.to} className="footer-premium-text-link">
                    {lang === "hi" ? row.hi : row.en}
                  </Link>
                ) : (
                  <button type="button" className="footer-premium-text-link footer-premium-text-btn">
                    {lang === "hi" ? row.hi : row.en}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-premium-bottom">
        <span className="footer-premium-copy">© {new Date().getFullYear()} Khabar Kothri</span>
        <div className="footer-premium-legal">
          <Link to="/privacy" className="footer-premium-legal-chip">
            {t("प्राइवेसी", "Privacy")}
          </Link>
          <Link to="/cookies" className="footer-premium-legal-chip">
            {t("कुकी", "Cookies")}
          </Link>
          <Link to="/terms" className="footer-premium-legal-chip">
            {t("नियम", "Terms")}
          </Link>
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
