import type { Metadata } from "next";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "Read News Kothari terms covering service scope, account responsibilities, content usage, and legal conditions.",
  alternates: { canonical: toAbsoluteUrl("/terms") },
  openGraph: {
    title: `Terms & conditions | ${siteName}`,
    description:
      "Usage terms for News Kothari including account rules, disclaimers, and intellectual property conditions.",
    url: toAbsoluteUrl("/terms"),
  },
};

export default function TermsRoutePage() {
  return <TermsPageClient />;
}
