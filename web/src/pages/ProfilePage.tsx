import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Loader2, LogOut, Settings, History, Trash2 } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";
import {
  readerListBookmarks,
  readerListHistory,
  readerPatchMe,
  readerChangePassword,
} from "../services/readerApi";
import { adaptArticles } from "../services/articleAdapter";
import type { NewsItem } from "../data/mockData";

type Tab = "saved" | "history" | "settings";

export default function ProfilePage() {
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const { reader, loading, logout, refreshReader, deleteAccount } = useReaderAuth();
  const [tab, setTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<NewsItem[]>([]);
  const [history, setHistory] = useState<NewsItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [prefLang, setPrefLang] = useState<"hi" | "en">("hi");
  const [newsletter, setNewsletter] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [pwdCur, setPwdCur] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (!loading && !reader) {
      navigate(`/login?next=${encodeURIComponent("/profile")}`, { replace: true });
    }
  }, [reader, loading, navigate]);

  useEffect(() => {
    if (!reader) return;
    setDisplayName(reader.displayName);
    setPrefLang(reader.preferences?.preferredLang ?? "hi");
    setNewsletter(Boolean(reader.preferences?.newsletterOptIn));
  }, [reader]);

  useEffect(() => {
    if (!reader || tab !== "saved") return;
    let cancelled = false;
    setSavedLoading(true);
    readerListBookmarks(1, 30)
      .then(({ articles }) => {
        if (!cancelled) setSaved(adaptArticles(articles));
      })
      .catch(() => {
        if (!cancelled) setSaved([]);
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reader, tab]);

  useEffect(() => {
    if (!reader || tab !== "history") return;
    let cancelled = false;
    setHistoryLoading(true);
    readerListHistory(1, 30)
      .then(({ articles }) => {
        if (!cancelled) setHistory(adaptArticles(articles));
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reader, tab]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");
    try {
      await readerPatchMe({
        displayName: displayName.trim(),
        preferences: { preferredLang: prefLang, newsletterOptIn: newsletter },
      });
      await refreshReader();
      setLang(prefLang);
      setSettingsMsg(t("सेव हो गया।", "Saved."));
    } catch (e: unknown) {
      setSettingsMsg(e instanceof Error ? e.message : "Error");
    }
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");
    setPwdBusy(true);
    try {
      await readerChangePassword(pwdCur, pwdNew);
      setPwdCur("");
      setPwdNew("");
      setSettingsMsg(t("पासवर्ड बदल गया।", "Password updated."));
    } catch (e: unknown) {
      setSettingsMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setPwdBusy(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!reader) return;
    if (deleteConfirm.trim().toLowerCase() !== reader.email.toLowerCase()) {
      setSettingsMsg(t("पुष्टि के लिए अपना ईमेल टाइप करें।", "Type your email exactly to confirm."));
      return;
    }
    setSettingsMsg("");
    setDeleteBusy(true);
    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } catch (e: unknown) {
      setSettingsMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading || !reader) {
    return (
      <main className="reader-auth-page" style={{ paddingTop: 160 }}>
        <Loader2 size={32} className="reader-spinner" />
      </main>
    );
  }

  const initial = reader.displayName?.charAt(0)?.toUpperCase() || "?";
  const hasLocal = reader.hasLocalPassword === true;
  const isGoogle = Boolean(reader.googleId);

  return (
    <main className="reader-profile-page">
      <div className="reader-profile-header">
        <div className="reader-profile-avatar">
          {reader.avatar ? (
            <img src={reader.avatar} alt="" className="reader-profile-avatar-img" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div>
          <h1 className="reader-profile-name">{reader.displayName}</h1>
          <p className="reader-profile-email">{reader.email}</p>
          {isGoogle && (
            <p className="reader-profile-provider">
              {t("Google से साइन इन", "Signed in with Google")}
            </p>
          )}
        </div>
        <button type="button" className="reader-profile-logout" onClick={() => { logout(); navigate("/"); }}>
          <LogOut size={18} />
          {t("लॉग आउट", "Log out")}
        </button>
      </div>

      <div className="reader-profile-card reader-profile-account-card">
        <h2 className="reader-profile-section-label">{t("खाता", "Account")}</h2>
        <p className="reader-profile-meta-line">
          {t("ईमेल (पढ़ने के लिए)", "Email (read-only)")}: <strong>{reader.email}</strong>
        </p>
      </div>

      <div className="reader-profile-tabs">
        <button type="button" className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>
          <Bookmark size={16} />
          {t("सेव की खबरें", "Saved")}
        </button>
        <button type="button" className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
          <History size={16} />
          {t("इतिहास", "History")}
        </button>
        <button type="button" className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
          <Settings size={16} />
          {t("सेटिंग्स", "Settings")}
        </button>
      </div>

      {tab === "saved" && (
        <section className="reader-profile-section">
          {savedLoading ? (
            <Loader2 size={28} className="reader-spinner" />
          ) : saved.length === 0 ? (
            <p className="reader-profile-empty">{t("अभी कोई खबर सेव नहीं।", "No saved articles yet.")}</p>
          ) : (
            <ul className="reader-saved-list">
              {saved.map((item) => {
                const title = lang === "hi" ? item.title : item.titleEn;
                return (
                  <li key={String(item.id)}>
                    <Link to={`/article/${item.id}`} className="reader-saved-link">
                      <Bookmark size={14} className="reader-saved-icon" aria-hidden />
                      {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "history" && (
        <section className="reader-profile-section">
          {historyLoading ? (
            <Loader2 size={28} className="reader-spinner" />
          ) : history.length === 0 ? (
            <p className="reader-profile-empty">
              {t("अभी कोई पढ़ा हुआ लेख नहीं। खबरें खोलने पर यहाँ दिखेंगीं।", "No reading history yet. Open articles while signed in to see them here.")}
            </p>
          ) : (
            <ul className="reader-saved-list">
              {history.map((item) => {
                const title = lang === "hi" ? item.title : item.titleEn;
                return (
                  <li key={String(item.id)}>
                    <Link to={`/article/${item.id}`} className="reader-saved-link">
                      <History size={14} className="reader-saved-icon" aria-hidden />
                      {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "settings" && (
        <section className="reader-profile-section">
          <h2 className="reader-profile-section-label">{t("वरीयताएँ", "Preferences")}</h2>
          <form onSubmit={saveSettings} className="reader-auth-form">
            <label className="reader-auth-label">
              {t("नाम", "Display name")}
              <input
                className="reader-auth-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                required
              />
            </label>
            <label className="reader-auth-label">
              {t("भाषा वरीयता", "Language preference")}
              <select
                className="reader-auth-input"
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as "hi" | "en")}
              >
                <option value="hi">हिन्दी</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="reader-auth-label reader-checkbox">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
              />
              {t("न्यूज़लेटर चाहूँगा/चाहूँगी", "I want the newsletter")}
            </label>
            <button type="submit" className="reader-auth-submit">{t("सेव करें", "Save")}</button>
          </form>

          <h2 className="reader-profile-section-label reader-profile-security-head">
            {t("सुरक्षा", "Security")}
          </h2>
          {!hasLocal ? (
            <p className="reader-profile-meta-line">
              {t("पासवर्ड साइन-इन इस खाते पर उपलब्ध नहीं।", "Password sign-in is not used for this account.")}
            </p>
          ) : (
            <form onSubmit={changePwd} className="reader-auth-form">
              <h3 className="reader-profile-subhead">{t("पासवर्ड बदलें", "Change password")}</h3>
              <label className="reader-auth-label">
                {t("वर्तमान पासवर्ड", "Current password")}
                <input type="password" className="reader-auth-input" value={pwdCur} onChange={(e) => setPwdCur(e.target.value)} />
              </label>
              <label className="reader-auth-label">
                {t("नया पासवर्ड", "New password")}
                <input type="password" className="reader-auth-input" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} minLength={8} />
              </label>
              <button type="submit" className="reader-auth-submit" disabled={pwdBusy || !pwdCur || !pwdNew}>
                {pwdBusy ? "…" : t("अपडेट", "Update")}
              </button>
            </form>
          )}

          <div className="reader-profile-danger-zone">
            <h2 className="reader-profile-section-label reader-profile-danger-title">
              <Trash2 size={18} aria-hidden />
              {t("खाता हटाएँ", "Delete account")}
            </h2>
            <p className="reader-profile-meta-line">
              {t(
                "यह आपकी सेव की खबरें, पढ़ने का इतिहास और सेटिंग्स हटा देगा। पुष्टि के लिए अपना ईमेल नीचे लिखें।",
                "This removes saved articles, reading history, and settings. Type your email below to confirm."
              )}
            </p>
            <label className="reader-auth-label">
              {t("ईमेल पुष्टि", "Email confirmation")}
              <input
                className="reader-auth-input reader-profile-delete-input"
                type="email"
                autoComplete="off"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={reader.email}
              />
            </label>
            <button
              type="button"
              className="reader-profile-danger-btn"
              disabled={deleteBusy}
              onClick={onDeleteAccount}
            >
              {deleteBusy ? "…" : t("खाता स्थायी रूप से हटाएँ", "Permanently delete account")}
            </button>
          </div>

          {settingsMsg && <p className="reader-settings-msg">{settingsMsg}</p>}
        </section>
      )}

      <p className="reader-auth-footer" style={{ marginTop: 24 }}>
        <Link to="/">{t("होम", "Home")}</Link>
      </p>
    </main>
  );
}
