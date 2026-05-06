"use client";

import type { ReactNode } from "react";

export default function LegalPageShell({
  kicker,
  title,
  updatedLabel,
  updatedDate,
  lead,
  chipsAriaLabel,
  chips,
  children,
}: {
  kicker: string;
  title: string;
  updatedLabel: string;
  updatedDate: string;
  lead: ReactNode;
  chipsAriaLabel: string;
  chips: string[];
  children: ReactNode;
}) {
  return (
    <main className="privacy-page legal-page article-page">
      <div className="privacy-page-inner section-inner">
        <p className="privacy-kicker">{kicker}</p>
        <h1 className="privacy-title">{title}</h1>
        <p className="privacy-updated">
          {updatedLabel}: {updatedDate}
        </p>
        {lead}
        <div className="legal-chip-row" aria-label={chipsAriaLabel}>
          {chips.map((c) => (
            <span key={c} className="legal-chip">
              {c}
            </span>
          ))}
        </div>
        {children}
      </div>
    </main>
  );
}
