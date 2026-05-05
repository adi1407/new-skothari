import type { Metadata } from "next";
import CookiesPageClient from "../../features/legal/client/CookiesPageClient";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";

export const metadata: Metadata = {
  title: "Cookies policy",
  description:
    "Learn how News Kothari uses cookies and browser storage for secure sessions, preferences, and product improvements.",
  alternates: { canonical: toAbsoluteUrl("/cookies") },
  openGraph: {
    title: `Cookies policy | ${siteName}`,
    description:
      "Cookie categories, controls, and browser storage practices for News Kothari readers.",
    url: toAbsoluteUrl("/cookies"),
  },
};

export default function CookiesRoutePage() {
  return <CookiesPageClient />;
}
