import type { Metadata } from "next";
import ShowsPageClient from "../../features/shows/client/ShowsPageClient";
import { showsMetadata } from "../../features/shows/seo/metadata";

export const metadata: Metadata = showsMetadata;

export default function ShowsPage() {
  return <ShowsPageClient />;
}
