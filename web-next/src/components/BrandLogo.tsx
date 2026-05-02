import { useLang } from "../context/LangContext";

export const BRAND_LOGO_SRC = "/brand-logo.png";

type BrandLogoProps = {
  className?: string;
  /** CSS px height; width matches (square asset). */
  height?: number;
  /** Use when parent already exposes an accessible name (e.g. home link with aria-label). */
  decorative?: boolean;
};

export default function BrandLogo({ className = "", height = 44, decorative = false }: BrandLogoProps) {
  const { lang } = useLang();
  const alt = decorative ? "" : lang === "hi" ? "खबर कोठरी" : "Khabar Kothri";

  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={alt}
      width={height}
      height={height}
      className={`brand-logo-img ${className}`.trim()}
      decoding="async"
      draggable={false}
      {...(decorative ? { "aria-hidden": true } : {})}
    />
  );
}
