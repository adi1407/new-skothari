"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../context/LangContext";
import { useReaderAuth } from "../../../context/ReaderAuthContext";
import { updateReaderPreferences } from "../../../services/readerApi";
import "../../../views/profile-page.css";
import ProfileBookmarksPanel from "../components/ProfileBookmarksPanel";
import ProfileHeader from "../components/ProfileHeader";
import ProfileLikedPanel from "../components/ProfileLikedPanel";
import ProfileNav from "../components/ProfileNav";
import ProfilePrivacyPanel from "../components/ProfilePrivacyPanel";
import ProfileSettingsPanel from "../components/ProfileSettingsPanel";
import ProfileSignInSection from "../components/ProfileSignInSection";
import { useProfileGoogleSignIn } from "../hooks/useProfileGoogleSignIn";
import { useProfilePrefsSync } from "../hooks/useProfilePrefsSync";
import { useProfileReaderLists } from "../hooks/useProfileReaderLists";
import type { ProfileTabKey } from "../types/profile";

export default function ProfilePageClient() {
  const googleSignInEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const { setLang, t } = useLang();
  const { reader, token, loading, isAuthenticated, signInWithGoogleCredential, refreshReader, logout } = useReaderAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProfileTabKey>("settings");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const profile = reader?.profile;
  const { prefsForm, setPrefsForm } = useProfilePrefsSync(profile);
  const { bookmarks, likedPosts, panelLoading, panelError } = useProfileReaderLists(token, isAuthenticated, t);

  const { signingIn, handleGoogleSuccess, handleGoogleError } = useProfileGoogleSignIn(
    navigate,
    refreshReader,
    signInWithGoogleCredential,
    setTab,
    setMessage,
    t
  );

  /* eslint-disable react-hooks/set-state-in-effect -- align tab when user signs in */
  useEffect(() => {
    if (isAuthenticated) setTab("settings");
  }, [isAuthenticated]);

  const welcome = useMemo(
    () => (reader?.name ? `${t("नमस्ते", "Hello")}, ${reader.name}` : t("प्रोफ़ाइल", "Profile")),
    [reader, t]
  );

  const onSavePreferences = useCallback(async () => {
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
  }, [token, prefsForm.primaryLanguage, setLang, refreshReader, t]);

  if (loading) return <div className="cat-page" style={{ padding: 40 }}>{t("लोड हो रहा है…", "Loading…")}</div>;

  const lastLoginLabel =
    reader?.lastLogin != null && reader.lastLogin !== ""
      ? `${t("अंतिम लॉगिन", "Last sign-in")}: ${new Date(reader.lastLogin).toLocaleString()}`
      : "";

  return (
    <div className="profile-shell">
      <ProfileHeader
        isAuthenticated={isAuthenticated}
        reader={reader}
        welcome={welcome}
        lastLoginLabel={lastLoginLabel}
        onLogout={logout}
        t={t}
      />

      {!isAuthenticated ? (
        <ProfileSignInSection
          googleSignInEnabled={googleSignInEnabled}
          signingIn={signingIn}
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={handleGoogleError}
          t={t}
        />
      ) : (
        <div className="profile-layout">
          <ProfileNav tab={tab} onTab={setTab} t={t} />

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
              <ProfileSettingsPanel
                prefsForm={prefsForm}
                setPrefsForm={setPrefsForm}
                busy={busy}
                onSave={onSavePreferences}
                t={t}
              />
            )}

            {tab === "saved" && <ProfileBookmarksPanel bookmarks={bookmarks} navigate={navigate} t={t} />}

            {tab === "liked" && <ProfileLikedPanel likedPosts={likedPosts} navigate={navigate} t={t} />}

            {tab === "privacy" && <ProfilePrivacyPanel token={token} onLogout={logout} t={t} />}
          </section>
        </div>
      )}

      {message && <p className="profile-toast">{message}</p>}
    </div>
  );
}
