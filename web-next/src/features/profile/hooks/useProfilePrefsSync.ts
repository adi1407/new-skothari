/* eslint-disable react-hooks/set-state-in-effect -- mirror server profile into local form */
import { useEffect, useState } from "react";

export function useProfilePrefsSync(profile: { primaryLanguage?: string } | null | undefined) {
  const [prefsForm, setPrefsForm] = useState({
    primaryLanguage: "hi",
  });

  useEffect(() => {
    if (!profile) return;
    setPrefsForm({
      primaryLanguage: profile.primaryLanguage || "hi",
    });
  }, [profile]);

  return { prefsForm, setPrefsForm };
}
