"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { LangProvider } from "../context/LangContext";
import { ReaderAuthProvider } from "../context/ReaderAuthContext";

/** GoogleOAuthProvider throws on invalid IDs; Vercel often has placeholder env values. */
function readGoogleWebClientId(): string {
  const raw = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  if (!raw || raw === "undefined" || raw === "null") return "";
  if (!raw.includes(".apps.googleusercontent.com")) return "";
  return raw;
}

const googleClientId = readGoogleWebClientId();

export default function AppProviders({
  children,
  initialLang = "hi",
}: {
  children: React.ReactNode;
  initialLang?: "hi" | "en";
}) {
  return (
    <LangProvider initialLang={initialLang}>
      <ReaderAuthProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
        ) : (
          children
        )}
      </ReaderAuthProvider>
    </LangProvider>
  );
}
