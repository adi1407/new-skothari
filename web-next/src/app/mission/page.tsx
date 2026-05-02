import type { Metadata } from "next";
import { siteName, toAbsoluteUrl } from "../../lib/seo/metadataHelpers";
import InstitutionalRouteClient from "../InstitutionalRouteClient";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "Our mission: verified journalism, editorial independence, and reader-first products — every day.",
  alternates: { canonical: toAbsoluteUrl("/mission") },
  openGraph: {
    title: `Mission | ${siteName}`,
    description: "Purpose and promise: accuracy, integrity, and accountability in how we report.",
    url: toAbsoluteUrl("/mission"),
  },
};

export default function MissionPage() {
  return <InstitutionalRouteClient kind="mission" />;
}
