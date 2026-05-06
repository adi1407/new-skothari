"use client";

import type { Dispatch, SetStateAction } from "react";

type TFn = (hi: string, en: string) => string;

export default function ProfileSettingsPanel({
  prefsForm,
  setPrefsForm,
  busy,
  onSave,
  t,
}: {
  prefsForm: { primaryLanguage: string };
  setPrefsForm: Dispatch<SetStateAction<{ primaryLanguage: string }>>;
  busy: boolean;
  onSave: () => void | Promise<void>;
  t: TFn;
}) {
  return (
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
        <button className="profile-btn" type="button" onClick={() => void onSave()} disabled={busy}>
          {t("सहेजें", "Save")}
        </button>
      </div>
    </div>
  );
}
