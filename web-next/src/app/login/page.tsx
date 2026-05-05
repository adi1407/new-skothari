import type { Metadata } from "next";
import LoginPageClient from "../../features/auth/client/LoginPageClient";
import { buildNoIndexMetadata } from "../../lib/seo/metadataHelpers";

export const metadata: Metadata = buildNoIndexMetadata("Login");

export default function LoginPage() {
  return <LoginPageClient />;
}
