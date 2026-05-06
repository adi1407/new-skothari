"use client";

import { GoogleLogin } from "@react-oauth/google";

type TFn = (hi: string, en: string) => string;

export default function ProfileSignInSection({
  googleSignInEnabled,
  signingIn,
  onGoogleSuccess,
  onGoogleError,
  t,
}: {
  googleSignInEnabled: boolean;
  signingIn: boolean;
  onGoogleSuccess: (cred: { credential?: string }) => void | Promise<void>;
  onGoogleError: () => void;
  t: TFn;
}) {
  return (
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
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              size="large"
              width="320"
              text="continue_with"
              theme="outline"
            />
          ) : (
            <div className="profile-alert" role="status">
              {t(
                "Google sign-in कॉन्फ़िगर नहीं है। Vercel पर web-next प्रोजेक्ट में NEXT_PUBLIC_GOOGLE_CLIENT_ID सेट करके रीडिप्लॉय करें (लोकल: .env.local)।",
                "Google sign-in is not configured. In your Vercel web-next project, add Environment Variable NEXT_PUBLIC_GOOGLE_CLIENT_ID (same as Google Cloud Web client ID), then Redeploy. Locally use web-next/.env.local."
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
  );
}
