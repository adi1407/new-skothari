import type { Metadata } from "next";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";
import InstitutionalRouteClient from "../InstitutionalRouteClient";

export const metadata: Metadata = {
  title: "Vision",
  description:
    "Our vision: India’s trusted home for news — bilingual, innovative, and rooted in community.",
  alternates: { canonical: toAbsoluteUrl("/vision") },
  openGraph: {
    title: `Vision | ${siteName}`,
    description: "Where we are headed: trust, excellence, and meaningful connection with readers.",
    url: toAbsoluteUrl("/vision"),
  },
};

export default function VisionPage() {
  return <InstitutionalRouteClient kind="vision" />;
}
