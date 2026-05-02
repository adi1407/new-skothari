import { useLang } from "../context/LangContext";

const BRAND_WORDMARK_EN_SRC = "/brand-wordmark-en.png";
const BRAND_WORDMARK_HI_SRC = "/brand-wordmark-hi.png";

type BrandWordmarkProps = {
  className?: string;
  decorative?: boolean;
};

export default function BrandWordmark({ className = "", decorative = false }: BrandWordmarkProps) {
  const { lang } = useLang();
  const isHindi = lang === "hi";

  return (
    <img
      src={isHindi ? BRAND_WORDMARK_HI_SRC : BRAND_WORDMARK_EN_SRC}
      alt={decorative ? "" : isHindi ? "खबर कोठरी" : "News Kothri"}
      className={`brand-wordmark-img ${className}`.trim()}
      decoding="async"
      draggable={false}
      {...(decorative ? { "aria-hidden": true } : {})}
    />
  );
}
