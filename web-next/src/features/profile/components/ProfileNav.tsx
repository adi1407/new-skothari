"use client";

import type { ProfileTabKey } from "../types/profile";

type TFn = (hi: string, en: string) => string;

export default function ProfileNav({
  tab,
  onTab,
  t,
}: {
  tab: ProfileTabKey;
  onTab: (k: ProfileTabKey) => void;
  t: TFn;
}) {
  const keys: ProfileTabKey[] = ["settings", "saved", "liked", "privacy"];
  return (
    <aside className="profile-nav" aria-label={t("प्रोफ़ाइल मेनू", "Profile menu")}>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onTab(key)}
          className={`profile-tab ${tab === key ? "active" : ""}`}
        >
          {key === "settings"
            ? t("सेटिंग्स", "Settings")
            : key === "saved"
              ? t("बुकमार्क", "Bookmarks")
              : key === "liked"
                ? t("पसंद किए गए", "Liked")
                : t("गोपनीयता", "Privacy")}
        </button>
      ))}
    </aside>
  );
}
