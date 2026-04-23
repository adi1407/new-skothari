import { createContext, useContext, useState } from "react";

type Lang = "hi" | "en";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (hi: string, en: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: "hi",
  toggleLang: () => {},
  t: (hi) => hi,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("kn-lang");
    return (saved === "en" ? "en" : "hi") as Lang;
  });

  const toggleLang = () => {
    setLang((l) => {
      const next = l === "hi" ? "en" : "hi";
      localStorage.setItem("kn-lang", next);
      return next;
    });
  };

  // Helper: pick hi or en string based on current lang
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
