import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loginWithGoogle } = useReaderAuth();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const nextPath = params.get("next") || "/profile";

  return (
    <main className="reader-auth-page">
      <div className="reader-auth-card">
        <h1 className="reader-auth-title">{t("लॉग इन", "Log in")}</h1>
        <p className="reader-auth-sub">
          {t(
            "Google से साइन इन करें — सेव की खबरें और सेटिंग्स।",
            "Sign in with Google to save stories and manage settings."
          )}
        </p>

        {!GOOGLE_CLIENT_ID && (
          <p className="reader-auth-error" role="alert">
            {t(
              "Google साइन-इन यहाँ कॉन्फ़िगर नहीं है। वेब ऐप में VITE_GOOGLE_CLIENT_ID और बैकएंड में GOOGLE_CLIENT_ID सेट करें।",
              "Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID on the web app and GOOGLE_CLIENT_ID on the API."
            )}
          </p>
        )}

        {GOOGLE_CLIENT_ID && (
          <div className="reader-google-wrap">
            {err && <p className="reader-auth-error" role="alert" style={{ marginBottom: 12 }}>{err}</p>}
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
            {busy && <p className="reader-auth-footer" style={{ marginTop: 12 }}>…</p>}
          </div>
        )}

        <p className="reader-auth-footer" style={{ marginTop: 20 }}>
          <Link to="/">{t("होम पर वापस", "Back to home")}</Link>
        </p>
      </div>
    </main>
  );
}
