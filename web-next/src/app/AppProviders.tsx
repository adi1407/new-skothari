"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { LangProvider } from "../context/LangContext";
import { ReaderAuthProvider } from "../context/ReaderAuthContext";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

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
