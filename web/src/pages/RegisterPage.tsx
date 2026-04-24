import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function RegisterPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, loginWithGoogle } = useReaderAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const nextPath = params.get("next") || "/profile";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await register(displayName.trim(), email.trim(), password);
      navigate(nextPath.startsWith("/") ? nextPath : "/profile", { replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="reader-auth-page">
      <div className="reader-auth-card">
        <h1 className="reader-auth-title">{t("खाता बनाएं", "Create account")}</h1>
        <p className="reader-auth-sub">
          {t("खबरें सेव करें और बाद में पढ़ें।", "Save articles to read later.")}
        </p>

        {GOOGLE_CLIENT_ID && (
          <div className="reader-google-wrap">
            <GoogleLogin
              onSuccess={async (cred) => {
                if (!cred.credential) return;
                setErr("");
                setBusy(true);
                try {
                  await loginWithGoogle(cred.credential);
                  navigate(nextPath.startsWith("/") ? nextPath : "/profile", { replace: true });
                } catch (e: unknown) {
                  setErr(e instanceof Error ? e.message : "Google sign-in failed");
                } finally {
                  setBusy(false);
                }
              }}
              onError={() => setErr(t("गूगल साइन-इन रद्द या विफल।", "Google sign-in was cancelled or failed."))}
              useOneTap={false}
            />
          </div>
        )}

        {GOOGLE_CLIENT_ID && (
          <div className="reader-auth-divider">
            <span>{t("या ईमेल से", "or with email")}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="reader-auth-form">
          {err && <p className="reader-auth-error" role="alert">{err}</p>}
          <label className="reader-auth-label">
            {t("नाम", "Display name")}
            <input
              type="text"
              autoComplete="name"
              className="reader-auth-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={80}
            />
          </label>
          <label className="reader-auth-label">
            {t("ईमेल", "Email")}
            <input
              type="email"
              autoComplete="email"
              className="reader-auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="reader-auth-label">
            {t("पासवर्ड (कम से कम ८ अक्षर)", "Password (min 8 characters)")}
            <input
              type="password"
              autoComplete="new-password"
              className="reader-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="reader-auth-submit" disabled={busy}>
            {busy ? "…" : t("रजिस्टर", "Register")}
          </button>
        </form>

        <p className="reader-auth-footer">
          {t("पहले से खाता है?", "Already have an account?")}{" "}
          <Link to={`/login?next=${encodeURIComponent(nextPath)}`}>{t("लॉग इन", "Log in")}</Link>
        </p>
        <p className="reader-auth-footer">
          <Link to="/">{t("होम पर वापस", "Back to home")}</Link>
        </p>
      </div>
    </main>
  );
}
