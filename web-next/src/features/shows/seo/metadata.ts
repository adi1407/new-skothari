import type { Metadata } from "next";
import { siteName, toAbsoluteUrl } from "../../../lib/seo/metadataHelpers";

export const showsMetadata: Metadata = {
  title: "Shows & Videos",
  description:
    "Watch Kothari News shows, explainers, and video reports with the latest updates across India and the world.",
  alternates: { canonical: toAbsoluteUrl("/shows") },
  openGraph: {
    title: `Shows & Videos | ${siteName}`,
    description:
      "News shows, deep dives, and video bulletins from Kothari News.",
    url: toAbsoluteUrl("/shows"),
  },
};
