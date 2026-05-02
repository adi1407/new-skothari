import type { Metadata } from "next";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";
import InstitutionalRouteClient from "../InstitutionalRouteClient";

export const metadata: Metadata = {
  title: "About us",
  description:
    "News Kothari is a digital-first bilingual newsroom focused on verified journalism, clarity, and readers across India.",
  alternates: { canonical: toAbsoluteUrl("/about") },
  openGraph: {
    title: `About us | ${siteName}`,
    description:
      "Who we are: a digital-first newsroom for Hindi and English readers — facts, context, and plain language.",
    url: toAbsoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return <InstitutionalRouteClient kind="about" />;
}
