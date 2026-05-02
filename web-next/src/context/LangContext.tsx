"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "hi" | "en";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (next: Lang) => void;
  t: (hi: string, en: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: "hi",
  toggleLang: () => {},
  setLang: () => {},
  t: (hi) => hi,
});

const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function persistLangCookie(next: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `kn-lang=${next};path=/;max-age=${LANG_COOKIE_MAX_AGE};SameSite=Lax`;
  try {
    localStorage.setItem("kn-lang", next);
  } catch {
    /* ignore */
  }
}

export function LangProvider({
  children,
  initialLang = "hi",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  const pushLang = (next: Lang) => {
    if (next === lang) return;
    persistLangCookie(next);
    setLangState(next);
    router.refresh();
  };

  const setLang = (next: Lang) => pushLang(next);

  const toggleLang = () => pushLang(lang === "hi" ? "en" : "hi");

  // Helper: pick hi or en string based on current lang
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
