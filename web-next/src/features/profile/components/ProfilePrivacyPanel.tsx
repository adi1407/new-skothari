"use client";

import { Link } from "react-router-dom";
import { deleteReaderAccount } from "../../../services/readerApi";

type TFn = (hi: string, en: string) => string;

export default function ProfilePrivacyPanel({
  token,
  onLogout,
  t,
}: {
  token: string | null;
  onLogout: () => void;
  t: TFn;
}) {
  return (
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
            if (token) void deleteReaderAccount(token).then(() => onLogout());
          }}
        >
          {t("खाता हटाएँ", "Delete account")}
        </button>
      </div>
    </div>
  );
}
