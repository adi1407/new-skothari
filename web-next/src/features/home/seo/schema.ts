import { defaultDescription, siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";

/** WebSite + Organization JSON-LD for the homepage (server-only). */
export function buildHomeWebSiteJsonLd(): Record<string, unknown> {
  const url = toAbsoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description: defaultDescription,
    url,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url,
    },
  };
}
