"use client";

import { useLang } from "../../../context/LangContext";

export type BilingualSection = {
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export default function LegalMarkdownSections({ sections }: { sections: BilingualSection[] }) {
  const { lang } = useLang();
  const isHi = lang === "hi";
  return (
    <>
      {sections.map((s, i) => {
        const title = isHi ? s.titleHi : s.titleEn;
        const body = isHi ? s.bodyHi : s.bodyEn;
        const paras = body
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean);
        return (
          <section key={i} className="privacy-section">
            <h2 className="privacy-h2">{title}</h2>
            {paras.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </section>
        );
      })}
    </>
  );
}
