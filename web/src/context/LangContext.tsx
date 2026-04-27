import { createContext, useContext, useState } from "react";

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

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("kn-lang");
    return (saved === "en" ? "en" : "hi") as Lang;
  });

  const setLang = (next: Lang) => {
    localStorage.setItem("kn-lang", next);
    setLangState(next);
  };

  const toggleLang = () => {
    setLangState((l) => {
      const next = l === "hi" ? "en" : "hi";
      localStorage.setItem("kn-lang", next);
      return next;
    });
  };

  // Helper: pick hi or en string based on current lang
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
