import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";
import {
  deleteReaderAccount,
  listBookmarks,
  listUpvotes,
  updateReaderPreferences,
} from "../services/readerApi";
import "./profile-page.css";

type TabKey = "settings" | "saved" | "liked" | "privacy";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "settings", label: "Settings" },
  { key: "saved", label: "Bookmarks" },
  { key: "liked", label: "Liked" },
  { key: "privacy", label: "Privacy" },
];

function parseJwtPayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const googleSignInEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const { lang, setLang, t } = useLang();
  const { reader, token, loading, isAuthenticated, signInWithGooglePayload, refreshReader, logout } = useReaderAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("settings");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [signingIn, setSigningIn] = useState(false);

  const profile = reader?.profile;
  const [prefsForm, setPrefsForm] = useState({
    primaryLanguage: "hi",
  });

  useEffect(() => {
    if (!profile) return;
    setPrefsForm({
      primaryLanguage: profile.primaryLanguage || "hi",
    });
  }, [profile]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    setPanelLoading(true);
    setPanelError("");
    Promise.all([
      listBookmarks(token).then((r) => setBookmarks(r.bookmarks || [])),
      listUpvotes(token).then((r) => setLikedPosts(r.upvotes || [])),
    ])
      .catch(() => setPanelError(t("प्रोफ़ाइल डेटा लोड नहीं हुआ।", "Could not load profile data.")))
      .finally(() => setPanelLoading(false));
  }, [token, isAuthenticated, t]);

  const welcome = useMemo(
    () => (reader?.name ? `${t("नमस्ते", "Hello")}, ${reader.name}` : t("प्रोफ़ाइल", "Profile")),
    [reader?.name, t]
  );

  useEffect(() => {
    if (isAuthenticated) setTab("settings");
  }, [isAuthenticated]);

  const handleGoogleSuccess = useCallback(
    async (cred: any) => {
      const data = parseJwtPayload(cred?.credential || "");
      if (!data?.email) {
        setMessage(t("Google credential नहीं मिला", "Google credential missing"));
        return;
      }
      setMessage("");
      setSigningIn(true);
      try {
        await signInWithGooglePayload({
          email: data.email,
          name: data.name || data.given_name || "Reader",
          googleId: data.sub,
          avatar: data.picture || "",
        });
        await refreshReader();
        setTab("settings");
        setMessage(t("साइन-इन सफल", "Signed in successfully"));
        navigate("/profile", { replace: true });
      } catch (err: any) {
        setMessage(err?.message || t("साइन-इन असफल", "Sign-in failed"));
      } finally {
        setSigningIn(false);
      }
    },
    [navigate, refreshReader, signInWithGooglePayload, t]
  );

  const handleGoogleError = useCallback(() => {
    setMessage(t("साइन-इन असफल", "Sign-in failed"));
  }, [t]);

  const onSavePreferences = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await updateReaderPreferences(token, {
        primaryLanguage: prefsForm.primaryLanguage as "hi" | "en",
      });
      setLang(prefsForm.primaryLanguage as "hi" | "en");
      await refreshReader();
      setMessage(t("Preferences saved", "Preferences saved"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="cat-page" style={{ padding: 40 }}>{t("लोड हो रहा है…", "Loading…")}</div>;

  const avatarSrc = reader?.avatar || "";
  const lastLoginLabel =
    reader?.lastLogin != null && reader.lastLogin !== ""
      ? `${t("अंतिम लॉगिन", "Last sign-in")}: ${new Date(reader.lastLogin).toLocaleString()}`
      : "";

  return (
    <div className="profile-shell">
      {isAuthenticated && reader ? (
        <header className="profile-head profile-head-signedin">
          <div className="profile-identity">
            {avatarSrc ? (
              <img className="profile-avatar" src={avatarSrc} alt="" width={56} height={56} />
            ) : (
              <div className="profile-avatar profile-avatar-fallback" aria-hidden>
                {(reader.name || reader.email || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="profile-identity-text">
              <h1 className="profile-title">{welcome}</h1>
              {reader.email && <p className="profile-sub">{reader.email}</p>}
              {lastLoginLabel && <p className="profile-meta-line">{lastLoginLabel}</p>}
            </div>
          </div>
          <button type="button" className="profile-btn ghost profile-head-logout" onClick={logout}>
            {t("लॉग आउट", "Log out")}
          </button>
        </header>
      ) : isAuthenticated ? (
        <div className="profile-head profile-head-signedin">
          <h1 className="profile-title">{welcome}</h1>
          <button type="button" className="profile-btn ghost profile-head-logout" onClick={logout}>
            {t("लॉग आउट", "Log out")}
          </button>
        </div>
      ) : (
        <div className="profile-head">
          <h1 className="profile-title">{welcome}</h1>
          {reader?.email && <p className="profile-sub">{reader.email}</p>}
        </div>
      )}

      {!isAuthenticated ? (
        <div className="profile-signin">
          <div className="profile-signin-copy">
            <p className="profile-signin-kicker">{t("खाता", "Account")}</p>
            <h2 className="profile-signin-title">
              {t("अपना पर्सनल न्यूज़ डैशबोर्ड अनलॉक करें", "Unlock your personal news dashboard")}
            </h2>
            <p className="profile-sub profile-signin-lead">
              {t(
                "बुकमार्क, सेटिंग्स और लेखों पर अपवोट के लिए साइन-इन करें। गोपनीयता नीति प्रोफ़ाइल में उपलब्ध है।",
                "Sign in to save bookmarks, change basic settings, and upvote articles. Our privacy policy is linked from your profile."
              )}
            </p>
            <ul className="profile-signin-list">
              <li>{t("बुकमार्क", "Bookmarks")}</li>
              <li>{t("भाषा जैसी बुनियादी सेटिंग्स", "Basic settings such as language")}</li>
              <li>{t("लेखों पर अपवोट (साइन-इन के बाद)", "Upvote articles after you sign in")}</li>
            </ul>
          </div>

          <div className={`profile-card profile-signin-card${signingIn ? " is-busy" : ""}`} aria-busy={signingIn}>
            <h3 className="profile-signin-card-title">{t("Google से सुरक्षित साइन-इन", "Secure sign-in with Google")}</h3>
            <div className="profile-google-wrap">
              {googleSignInEnabled ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  width="320"
                  text="continue_with"
                  theme="outline"
                />
              ) : (
                <div className="profile-alert" role="status">
                  {t(
                    "Google sign-in कॉन्फ़िगर नहीं है। NEXT_PUBLIC_GOOGLE_CLIENT_ID सेट करें।",
                    "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in web-next/.env.local."
                  )}
                </div>
              )}
            </div>
            {signingIn && <p className="profile-signin-progress">{t("साइन-इन हो रहा है…", "Signing in...")}</p>}
            <p className="profile-trust-line">
              {t(
                "हम आपकी अनुमति के बिना आपके खातों पर कुछ भी पोस्ट नहीं करते।",
                "We never post to your social accounts without your permission."
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="profile-layout">
          <aside className="profile-nav" aria-label={t("प्रोफ़ाइल मेनू", "Profile menu")}>
            {TABS.map((it) => (
              <button
                key={it.key}
                type="button"
                onClick={() => setTab(it.key)}
                className={`profile-tab ${tab === it.key ? "active" : ""}`}
              >
                {it.key === "settings"
                  ? t("सेटिंग्स", "Settings")
                  : it.key === "saved"
                    ? t("बुकमार्क", "Bookmarks")
                    : it.key === "liked"
                      ? t("पसंद किए गए", "Liked")
                    : t("गोपनीयता", "Privacy")}
              </button>
            ))}
          </aside>

          <section className="profile-body">
            {panelError && (
              <div className="profile-card profile-card-tight">
                <p className="profile-sub">{panelError}</p>
              </div>
            )}
            {panelLoading && (
              <div className="profile-card profile-card-tight">
                <p className="profile-sub">{t("प्रोफ़ाइल सेक्शन लोड हो रहे हैं…", "Loading profile sections...")}</p>
              </div>
            )}

            {tab === "settings" && (
              <div className="profile-card profile-form-card">
                <h3 className="profile-h3 profile-form-title">{t("सेटिंग्स", "Settings")}</h3>
                <div className="profile-form-grid">
                  <label className="profile-label" htmlFor="pf-lang">
                    {t("मुख्य भाषा", "Primary language")}
                  </label>
                  <select
                    id="pf-lang"
                    className="profile-input"
                    value={prefsForm.primaryLanguage}
                    onChange={(e) => setPrefsForm((s) => ({ ...s, primaryLanguage: e.target.value }))}
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="profile-form-actions">
                  <button className="profile-btn" type="button" onClick={onSavePreferences} disabled={busy}>
                    {t("सहेजें", "Save")}
                  </button>
                </div>
              </div>
            )}

            {tab === "saved" && (
              <div className="profile-card">
                <h3 className="profile-h3">
                  {t("बुकमार्क", "Bookmarks")} ({bookmarks.length})
                </h3>
                {bookmarks.length === 0 ? (
                  <div className="profile-empty">
                    <p className="profile-sub">{t("अभी कोई बुकमार्क नहीं।", "No bookmarks yet.")}</p>
                    <button type="button" className="profile-btn ghost" onClick={() => navigate("/")}>
                      {t("नवीनतम खबरें देखें", "Browse latest news")}
                    </button>
                  </div>
                ) : (
                  bookmarks.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      className="profile-row profile-row-dense"
                      onClick={() => navigate(`/article/${b.article?._id}`)}
                    >
                      <span className="profile-row-title">{b.article?.titleHi || b.article?.title || "Untitled"}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === "liked" && (
              <div className="profile-card">
                <h3 className="profile-h3">
                  {t("पसंद किए गए लेख", "Liked posts")} ({likedPosts.length})
                </h3>
                {likedPosts.length === 0 ? (
                  <div className="profile-empty">
                    <p className="profile-sub">{t("अभी कोई पसंद किए गए लेख नहीं।", "No liked posts yet.")}</p>
                    <button type="button" className="profile-btn ghost" onClick={() => navigate("/")}>
                      {t("नवीनतम खबरें देखें", "Browse latest news")}
                    </button>
                  </div>
                ) : (
                  likedPosts.map((row) => (
                    <button
                      key={row._id}
                      type="button"
                      className="profile-row profile-row-dense"
                      onClick={() => navigate(`/article/${row.article?._id}`)}
                    >
                      <span className="profile-row-title">{row.article?.titleHi || row.article?.title || "Untitled"}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === "privacy" && (
              <div className="profile-card profile-form-card">
                <h3 className="profile-h3 profile-form-title">{t("गोपनीयता", "Privacy")}</h3>
                <p className="profile-sub profile-privacy-lead">
                  {t(
                    "हम आपके डेटा को कैसे संभालते हैं, इसकी पूरी जानकारी हमारी गोपनीयता नीति में है।",
                    "Read how we handle your data in our full privacy policy."
                  )}
                </p>
                <p className="profile-form-actions">
                  <Link className="profile-btn" to="/privacy">
                    {t("गोपनीयता नीति पढ़ें", "Read privacy policy")}
                  </Link>
                </p>
                <p className="profile-sub profile-privacy-lead" style={{ marginTop: 24 }}>
                  {t("अपना रीडर खाता स्थायी रूप से हटा सकते हैं।", "You can permanently delete your reader account below.")}
                </p>
                <div className="profile-form-actions profile-form-actions-stack">
                  <button
                    type="button"
                    className="profile-btn danger"
                    onClick={() => {
                      if (!window.confirm(t("खाता स्थायी रूप से हटाएँ?", "Delete account permanently?"))) return;
                      deleteReaderAccount(token).then(() => logout());
                    }}
                  >
                    {t("खाता हटाएँ", "Delete account")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {message && <p className="profile-toast">{message}</p>}
    </div>
  );
}
