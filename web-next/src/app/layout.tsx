import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { defaultDescription, getSiteUrl, siteName } from "../lib/seo/metadataHelpers";
import AppChrome from "./AppChrome";
import AppProviders from "./AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: defaultDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const initialLang = jar.get("kn-lang")?.value === "en" ? "en" : "hi";
  const initialDark = jar.get("kn-dark")?.value === "1";

  return (
    <html
      lang={initialLang === "en" ? "en" : "hi"}
      suppressHydrationWarning
      style={{ colorScheme: initialDark ? "dark" : "light" }}
    >
      <body suppressHydrationWarning>
        <AppProviders initialLang={initialLang}>
          <AppChrome initialDark={initialDark}>{children}</AppChrome>
        </AppProviders>
      </body>
    </html>
  );
}
