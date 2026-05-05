import type { Metadata } from "next";
import ProfilePageClient from "../../features/profile/client/ProfilePageClient";
import { buildNoIndexMetadata } from "../../lib/seo/metadataHelpers";

export const metadata: Metadata = buildNoIndexMetadata("Profile");

export default function ProfilePage() {
  return <ProfilePageClient />;
}
