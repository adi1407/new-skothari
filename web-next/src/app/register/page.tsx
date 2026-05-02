import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";
import { buildNoIndexMetadata } from "../../lib/seo/metadataHelpers";

export const metadata: Metadata = buildNoIndexMetadata("Register");

export default function RegisterPage() {
  return <RegisterPageClient />;
}
