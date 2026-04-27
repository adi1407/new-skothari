import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";
import {
  clearHistory,
  deleteReaderAccount,
  exportReaderData,
  fetchRecommendations,
  listBookmarks,
  listHistory,
  listSessions,
  logoutAllOtherSessions,
  removeHistoryItem,
  revokeSession,
  sendSignal,
  updateReaderPreferences,
  updateReaderProfile,
} from "../services/readerApi";
import { adaptArticles } from "../services/articleAdapter";
import type { NewsItem } from "../data/mockData";

type TabKey = "prefs" | "saved" | "history" | "sessions" | "privacy" | "reco" | "profile";

function parseJwtPayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const { lang, setLang, t } = useLang();
  const { reader, token, loading, signInWithGooglePayload, refreshReader, logout } = useReaderAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("prefs");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reco, setReco] = useState<NewsItem[]>([]);
  const [exportBlob, setExportBlob] = useState<string>("");

  const profile = reader?.profile;
  const [prefsForm, setPrefsForm] = useState({
    primaryLanguage: "hi",
    preferredCategories: "",
    followedTopics: "",
    newsletterEnabled: false,
    newsletterTopics: "",
    digestCadence: "daily",
  });
  const [profileForm, setProfileForm] = useState({
    bio: "",
    profileVisibility: "private",
    avatarOverride: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    if (!profile) return;
    setPrefsForm({
      primaryLanguage: profile.primaryLanguage || "hi",
      preferredCategories: (profile.preferredCategories || []).join(", "),
      followedTopics: (profile.followedTopics || []).join(", "),
      newsletterEnabled: !!profile.newsletterEnabled,
      newsletterTopics: (profile.newsletterTopics || []).join(", "),
      digestCadence: profile.digestCadence || "daily",
    });
    setProfileForm({
      bio: profile.bio || "",
      profileVisibility: profile.profileVisibility || "private",
      avatarOverride: profile.avatarOverride || "",
      twitter: profile.socialLinks?.twitter || "",
      instagram: profile.socialLinks?.instagram || "",
      linkedin: profile.socialLinks?.linkedin || "",
      website: profile.socialLinks?.website || "",
    });
  }, [profile]);

  useEffect(() => {
    if (!token) return;
    listBookmarks(token).then((r) => setBookmarks(r.bookmarks || [])).catch(() => {});
    listHistory(token).then((r) => setHistory(r.history || [])).catch(() => {});
    listSessions(token).then((r) => setSessions(r.sessions || [])).catch(() => {});
    fetchRecommendations(token, 10)
      .then((r) => setReco(adaptArticles(r.articles || [])))
      .catch(() => {});
  }, [token]);

  const welcome = useMemo(
    () => (reader?.name ? `${t("नमस्ते", "Hello")}, ${reader.name}` : t("प्रोफ़ाइल", "Profile")),
    [reader?.name, t]
  );

  const onSavePreferences = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await updateReaderPreferences(token, {
        primaryLanguage: prefsForm.primaryLanguage as "hi" | "en",
        preferredCategories: prefsForm.preferredCategories.split(",").map((x) => x.trim()).filter(Boolean),
        followedTopics: prefsForm.followedTopics.split(",").map((x) => x.trim()).filter(Boolean),
        newsletterEnabled: !!prefsForm.newsletterEnabled,
        newsletterTopics: prefsForm.newsletterTopics.split(",").map((x) => x.trim()).filter(Boolean),
        digestCadence: prefsForm.digestCadence as "daily" | "weekly" | "off",
      });
      setLang(prefsForm.primaryLanguage as "hi" | "en");
      await refreshReader();
      setMessage(t("Preferences saved", "Preferences saved"));
    } finally {
      setBusy(false);
    }
  };

  const onSaveProfile = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await updateReaderProfile(token, {
        bio: profileForm.bio,
        profileVisibility: profileForm.profileVisibility as "private" | "public",
        avatarOverride: profileForm.avatarOverride,
        socialLinks: {
          twitter: profileForm.twitter,
          instagram: profileForm.instagram,
          linkedin: profileForm.linkedin,
          website: profileForm.website,
        },
      });
      await refreshReader();
      setMessage(t("Profile updated", "Profile updated"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="cat-page" style={{ padding: 40 }}>{t("लोड हो रहा है…", "Loading…")}</div>;

  return (
    <div className="cat-page" style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px 90px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{welcome}</h1>
      {!reader ? (
        <div className="cms-card" style={{ padding: 18 }}>
          <p style={{ marginBottom: 12 }}>{t("प्रोफ़ाइल और सेव्ड फीचर्स के लिए साइन-इन करें।", "Sign in to use profile and saved features.")}</p>
          <GoogleLogin
            onSuccess={(cred) => {
              const data = parseJwtPayload(cred.credential || "");
              if (!data?.email) return;
              signInWithGooglePayload({
                email: data.email,
                name: data.name || data.given_name || "Reader",
                googleId: data.sub,
                avatar: data.picture || "",
              }).then(() => setMessage("Signed in"));
            }}
            onError={() => setMessage("Google sign-in failed")}
          />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 16px" }}>
            {(["prefs", "saved", "history", "sessions", "privacy", "reco", "profile"] as TabKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className="nav-cat-pill"
                style={{ border: tab === k ? "1px solid #bb1919" : undefined }}
              >
                {k}
              </button>
            ))}
            <button type="button" className="nav-cat-pill" onClick={logout}>logout</button>
          </div>

          {tab === "prefs" && (
            <div className="cms-card" style={{ padding: 16, display: "grid", gap: 10 }}>
              <h3>Preferences</h3>
              <select value={prefsForm.primaryLanguage} onChange={(e) => setPrefsForm((s) => ({ ...s, primaryLanguage: e.target.value }))}>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>
              <input value={prefsForm.preferredCategories} onChange={(e) => setPrefsForm((s) => ({ ...s, preferredCategories: e.target.value }))} placeholder="preferred categories comma separated" />
              <input value={prefsForm.followedTopics} onChange={(e) => setPrefsForm((s) => ({ ...s, followedTopics: e.target.value }))} placeholder="followed topics comma separated" />
              <label><input type="checkbox" checked={prefsForm.newsletterEnabled} onChange={(e) => setPrefsForm((s) => ({ ...s, newsletterEnabled: e.target.checked }))} /> newsletter enabled</label>
              <input value={prefsForm.newsletterTopics} onChange={(e) => setPrefsForm((s) => ({ ...s, newsletterTopics: e.target.value }))} placeholder="newsletter topics comma separated" />
              <select value={prefsForm.digestCadence} onChange={(e) => setPrefsForm((s) => ({ ...s, digestCadence: e.target.value }))}>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="off">off</option>
              </select>
              <button onClick={onSavePreferences} disabled={busy}>Save preferences</button>
            </div>
          )}

          {tab === "profile" && (
            <div className="cms-card" style={{ padding: 16, display: "grid", gap: 10 }}>
              <h3>Public profile</h3>
              <textarea value={profileForm.bio} onChange={(e) => setProfileForm((s) => ({ ...s, bio: e.target.value }))} placeholder="bio" />
              <input value={profileForm.avatarOverride} onChange={(e) => setProfileForm((s) => ({ ...s, avatarOverride: e.target.value }))} placeholder="avatar url" />
              <select value={profileForm.profileVisibility} onChange={(e) => setProfileForm((s) => ({ ...s, profileVisibility: e.target.value }))}>
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
              <input value={profileForm.twitter} onChange={(e) => setProfileForm((s) => ({ ...s, twitter: e.target.value }))} placeholder="twitter link" />
              <input value={profileForm.instagram} onChange={(e) => setProfileForm((s) => ({ ...s, instagram: e.target.value }))} placeholder="instagram link" />
              <input value={profileForm.linkedin} onChange={(e) => setProfileForm((s) => ({ ...s, linkedin: e.target.value }))} placeholder="linkedin link" />
              <input value={profileForm.website} onChange={(e) => setProfileForm((s) => ({ ...s, website: e.target.value }))} placeholder="website link" />
              <button onClick={onSaveProfile} disabled={busy}>Save profile</button>
            </div>
          )}

          {tab === "saved" && (
            <div className="cms-card" style={{ padding: 16 }}>
              <h3>Bookmarks ({bookmarks.length})</h3>
              {bookmarks.map((b) => (
                <div key={b._id} style={{ padding: "8px 0", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => navigate(`/article/${b.article?._id}`)}>
                  {(b.article?.titleHi || b.article?.title || "Untitled")}
                </div>
              ))}
            </div>
          )}

          {tab === "history" && (
            <div className="cms-card" style={{ padding: 16 }}>
              <h3>History ({history.length})</h3>
              <button onClick={() => clearHistory(token).then(() => setHistory([]))}>Clear all</button>
              {history.map((h) => (
                <div key={h._id} style={{ padding: "8px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ cursor: "pointer" }} onClick={() => navigate(`/article/${h.article?._id}`)}>{(h.article?.titleHi || h.article?.title || "Untitled")}</span>
                  <button onClick={() => removeHistoryItem(token, h.article?._id).then(() => setHistory((prev) => prev.filter((x) => x._id !== h._id)))}>remove</button>
                </div>
              ))}
            </div>
          )}

          {tab === "sessions" && (
            <div className="cms-card" style={{ padding: 16 }}>
              <h3>Sessions ({sessions.length})</h3>
              <button onClick={() => logoutAllOtherSessions(token).then(() => listSessions(token).then((r) => setSessions(r.sessions || [])))}>Logout all others</button>
              {sessions.map((s) => (
                <div key={s.sessionId} style={{ padding: "8px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>{s.userAgent || "Unknown device"} {s.isCurrent ? "(current)" : ""}</span>
                  {!s.isCurrent && <button onClick={() => revokeSession(token, s.sessionId).then(() => setSessions((prev) => prev.filter((x) => x.sessionId !== s.sessionId)))}>revoke</button>}
                </div>
              ))}
            </div>
          )}

          {tab === "privacy" && (
            <div className="cms-card" style={{ padding: 16, display: "grid", gap: 10 }}>
              <h3>Privacy controls</h3>
              <button onClick={() => exportReaderData(token).then((data) => setExportBlob(JSON.stringify(data, null, 2)))}>Export my data</button>
              {exportBlob && <textarea rows={12} value={exportBlob} readOnly />}
              <button
                onClick={() => {
                  if (!window.confirm("Delete account permanently?")) return;
                  deleteReaderAccount(token).then(() => logout());
                }}
              >
                Delete account
              </button>
            </div>
          )}

          {tab === "reco" && (
            <div className="cms-card" style={{ padding: 16 }}>
              <h3>Because you read</h3>
              {reco.map((item) => (
                <div key={String(item.id)} style={{ padding: "8px 0", borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => {
                    sendSignal(token, { eventType: "category_click", category: item.categorySlug, weight: 1 }).catch(() => {});
                    navigate(`/article/${item.id}`);
                  }}>
                  {lang === "hi" ? item.title : item.titleEn}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {message && <p style={{ marginTop: 12, opacity: 0.8 }}>{message}</p>}
    </div>
  );
}
