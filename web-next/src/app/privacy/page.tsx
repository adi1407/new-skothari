import type { Metadata } from "next";
import PrivacyPageClient from "../../features/legal/client/PrivacyPageClient";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Read how News Kothari collects, uses, safeguards, and manages reader data across accounts, sessions, and newsletter services.",
  alternates: { canonical: toAbsoluteUrl("/privacy") },
  openGraph: {
    title: `Privacy policy | ${siteName}`,
    description:
      "Data categories, legal basis, rights, retention, and security practices for News Kothari readers.",
    url: toAbsoluteUrl("/privacy"),
  },
};

export default function PrivacyRoutePage() {
  return <PrivacyPageClient />;
}
