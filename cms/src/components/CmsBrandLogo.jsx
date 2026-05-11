/** Same asset as web-next `BrandLogo` — lives in `cms/public`. */
export const CMS_BRAND_LOGO_SRC = "/brand-logo.png";

export default function CmsBrandLogo({
  className = "",
  height = 40,
  decorative = false,
}) {
  return (
    <img
      src={CMS_BRAND_LOGO_SRC}
      alt={decorative ? "" : "Kothari News"}
      width={height}
      height={height}
      className={`object-contain select-none rounded-xl ${className}`.trim()}
      decoding="async"
      draggable={false}
      {...(decorative ? { "aria-hidden": true } : {})}
    />
  );
}
