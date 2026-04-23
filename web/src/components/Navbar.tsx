import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Moon, Sun, Menu, X, Globe2,
  Send, Home, Tv2, Clock, ChevronRight,
} from "lucide-react";

/* Brand SVG icons (lucide doesn't include these) */
const YtIcon  = () => <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>;
const IgIcon  = () => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.4a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>;
const TwIcon  = () => <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18.3 1.5h3.5l-7.7 8.8 9 11.9H16l-5.5-7.2-6.3 7.2H.6l8.2-9.4L.1 1.5h7.2l5 6.6 5.9-6.6zm-1.2 18.6h1.9L6.8 3.4H4.7l12.4 16.7z"/></svg>;
const FbIcon  = () => <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 2v2.3h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>;
import type { NewsItem } from "../data/mockData";
import { categories } from "../data/publicCategories";
import { useLang } from "../context/LangContext";
import { fetchPublicSearch } from "../services/newsApi";
import { adaptArticles } from "../services/articleAdapter";

interface NavbarProps {
  darkMode: boolean;
  toggleDark: () => void;
}

const SOCIAL_LINKS = [
  { name: "YouTube",   icon: <YtIcon />,              url: "https://youtube.com/@kotharinews",  color: "#FF0000" },
  { name: "Instagram", icon: <IgIcon />,              url: "https://instagram.com/kotharinews", color: "#E1306C" },
  { name: "Twitter",   icon: <TwIcon />,              url: "https://twitter.com/kotharinews",   color: "#1DA1F2" },
  { name: "Facebook",  icon: <FbIcon />,              url: "https://facebook.com/kotharinews",  color: "#1877F2" },
  { name: "Telegram",  icon: <Send size={16} />,      url: "https://t.me/kotharinews",          color: "#2AABEE" },
];

export default function Navbar({ darkMode, toggleDark }: NavbarProps) {
  const { lang, toggleLang, t } = useLang();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [remoteResults, setRemoteResults] = useState<NewsItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFetched, setSearchFetched] = useState(false);
  const searchRef   = useRef<HTMLInputElement>(null);
  const searchWrap  = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  /* active tab: home vs shows */
  const isShows = location.pathname === "/shows";

  /* active category from URL */
  const activeSlug = (() => {
    if (location.pathname === "/") return "home";
    const m = location.pathname.match(/^\/category\/(.+)/);
    return m ? m[1] : "";
  })();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close search on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchWrap.current && !searchWrap.current.contains(e.target as Node)) {
        setSearchActive(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* Ctrl/Cmd+K */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchActive(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchActive(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const handleCatClick = (slug: string) => {
    if (slug === "home")   navigate("/");
    else if (slug === "latest") navigate("/category/latest");
    else navigate(`/category/${slug}`);
    setMobileOpen(false);
  };

  /* Live search — published articles via public API */
  useEffect(() => {
    const q = searchQuery.trim();
    if (!searchActive || q.length < 2) {
      setRemoteResults([]);
      setSearchFetched(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchFetched(false);
    const handle = window.setTimeout(() => {
      fetchPublicSearch(q, 12)
        .then((raw) => setRemoteResults(adaptArticles(raw)))
        .finally(() => {
          setSearchLoading(false);
          setSearchFetched(true);
        });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [searchQuery, searchActive]);

  const results = remoteResults;

  return (
    <>
      <motion.nav
        className={`navbar-v2${scrolled ? " nav-scrolled" : ""}`}
        aria-label={t("मुख्य नेविगेशन", "Main navigation")}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── BRAND STRIP ── */}
        <div className="nav-brand-strip" />

        {/* ══════ ROW 1: Logo | Tabs | Socials ══════ */}
        <div className="nav-row1">

          {/* Logo */}
          <a href="/" className="nav-logo" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            <div className="nav-logo-mark">ख</div>
            <div className="nav-logo-text">
              <span className="nav-logo-name">{t("खबर कोठरी", "Khabar Kothri")}</span>
              <span className="nav-logo-tagline">{t("हर खबर, हर पल", "Every Story, Every Moment")}</span>
            </div>
          </a>

          {/* Center tabs: Home | Shows */}
          <div className="nav-main-tabs">
            <button
              type="button"
              className={`nav-main-tab nav-tab-home${!isShows ? " tab-active" : ""}`}
              onClick={() => navigate("/")}
            >
              <Home size={15} strokeWidth={2} aria-hidden />
              {t("होम", "Home")}
            </button>
            <button
              type="button"
              className={`nav-main-tab nav-tab-shows${isShows ? " tab-active" : ""}`}
              onClick={() => navigate("/shows")}
            >
              <Tv2 size={15} strokeWidth={2} aria-hidden />
              {t("शोज़", "Shows")}
            </button>
          </div>

          {/* Right: Social icons + util */}
          <div className="nav-row1-right">
            <div className="nav-socials">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-social-btn"
                  title={s.name}
                  style={{ "--social-color": s.color } as React.CSSProperties}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="nav-util-btns">
              <div className="nav-util-cluster" role="group" aria-label={t("भाषा और थीम", "Language and theme")}>
                <button type="button" className="nav-util-btn" onClick={toggleLang} title={t("भाषा बदलें", "Change language")}>
                  <Globe2 size={15} strokeWidth={2} aria-hidden />
                  <span className="nav-util-label">{lang === "hi" ? "EN" : "हि"}</span>
                </button>
                <button type="button" className="nav-util-btn" onClick={toggleDark} title={t("थीम बदलें", "Toggle theme")}>
                  {darkMode ? <Sun size={15} strokeWidth={2} aria-hidden /> : <Moon size={15} strokeWidth={2} aria-hidden />}
                </button>
              </div>
              <button type="button" className="nav-util-btn nav-mobile-menu" onClick={() => setMobileOpen(true)} aria-label={t("मेनू खोलें", "Open menu")}>
                <Menu size={20} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* ══════ ROW 2: Categories + Search ══════ */}
        <div className="nav-row2">
          <div className="nav-cats-scroll">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.slug}
                className={`nav-cat-pill${activeSlug === cat.slug ? " cat-pill-active" : ""}`}
                onClick={() => handleCatClick(cat.slug)}
              >
                {lang === "hi" ? cat.name : cat.nameEn}
              </button>
            ))}
          </div>

          {/* Inline search */}
          <div className="nav-search-zone" ref={searchWrap}>
            {searchActive ? (
              <div className="nav-search-expand">
                <Search size={15} className="nav-search-icon-inner" strokeWidth={2} aria-hidden />
                <input
                  ref={searchRef}
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("खोजें…", "Search news…")}
                  className="nav-search-input"
                />
                <button type="button" className="nav-search-clear" aria-label={t("खोज बंद करें", "Close search")} onClick={() => { setSearchActive(false); setSearchQuery(""); }}>
                  <X size={14} aria-hidden />
                </button>

                {/* Results dropdown */}
                <AnimatePresence>
                  {searchQuery.trim().length >= 2 && (
                    <motion.div
                      className="nav-search-results"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {searchLoading && (
                        <p className="nav-no-results">{t("खोज हो रही है…", "Searching…")}</p>
                      )}
                      {!searchLoading &&
                        results.map((item) => (
                        <button
                          type="button"
                          key={String(item.id)}
                          className="nav-result-item"
                          onClick={() => {
                            navigate(`/article/${item.id}`);
                            setSearchActive(false);
                            setSearchQuery("");
                          }}
                        >
                          <span className="nav-result-cat">
                            {lang === "hi" ? item.category : item.categoryEn}
                          </span>
                          <span className="nav-result-title">
                            {lang === "hi" ? item.title : item.titleEn}
                          </span>
                          <Clock size={10} className="nav-result-clock" />
                          <span className="nav-result-time">
                            {lang === "hi" ? item.time : item.timeEn}
                          </span>
                        </button>
                      ))}
                      {!searchLoading && searchFetched && results.length === 0 && (
                        <p className="nav-no-results">{t("कोई परिणाम नहीं", "No results found")}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                className="nav-search-trigger"
                aria-label={t("खोजें", "Search")}
                onClick={() => { setSearchActive(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              >
                <Search size={17} strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ══════ MOBILE DRAWER ══════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="drawer-header">
                <div className="nav-logo-mark" style={{ width: 32, height: 32, fontSize: 14 }}>ख</div>
                <span className="nav-logo-name" style={{ fontSize: 16 }}>{t("खबर कोठरी", "Khabar Kothri")}</span>
                <button type="button" onClick={() => setMobileOpen(false)} className="drawer-close" aria-label={t("बंद करें", "Close")}><X size={22} aria-hidden /></button>
              </div>

              {/* Drawer: Home / Shows tabs */}
              <div className="drawer-tabs-row">
                <button
                  type="button"
                  className={`nav-main-tab nav-tab-home${!isShows ? " tab-active" : ""}`}
                  onClick={() => { navigate("/"); setMobileOpen(false); }}
                >
                  <Home size={14} strokeWidth={2} aria-hidden /> {t("होम", "Home")}
                </button>
                <button
                  type="button"
                  className={`nav-main-tab nav-tab-shows${isShows ? " tab-active" : ""}`}
                  onClick={() => { navigate("/shows"); setMobileOpen(false); }}
                >
                  <Tv2 size={14} strokeWidth={2} aria-hidden /> {t("शोज़", "Shows")}
                </button>
              </div>

              <div className="drawer-actions">
                <button type="button" className="drawer-action-btn" onClick={toggleLang}>
                  <Globe2 size={16} strokeWidth={2} aria-hidden />
                  {lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
                </button>
                <button type="button" className="drawer-action-btn" onClick={toggleDark}>
                  {darkMode ? <Sun size={16} strokeWidth={2} aria-hidden /> : <Moon size={16} strokeWidth={2} aria-hidden />}
                  {darkMode ? t("लाइट मोड", "Light Mode") : t("डार्क मोड", "Dark Mode")}
                </button>
              </div>

              <nav className="drawer-nav">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.slug}
                    className={`drawer-cat-btn${activeSlug === cat.slug ? " active" : ""}`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCatClick(cat.slug)}
                  >
                    <span>{lang === "hi" ? cat.name : cat.nameEn}</span>
                    <ChevronRight size={15} className="drawer-chevron" />
                  </motion.button>
                ))}
              </nav>

              {/* Social icons in drawer */}
              <div className="drawer-social-row">
                {SOCIAL_LINKS.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="nav-social-btn" title={s.name}
                    style={{ "--social-color": s.color } as React.CSSProperties}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
