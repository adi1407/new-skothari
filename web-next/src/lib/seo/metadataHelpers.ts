import type { Metadata } from "next";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return "http://localhost:3000";
}

export const siteName = "Kothari News";

export const defaultDescription =
  "Khabar Kothari brings fast, verified coverage across desh, videsh, rajneeti, khel, health, krishi, business and manoranjan.";

export function toAbsoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${p}`;
}

export function buildNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}
