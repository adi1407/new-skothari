import type { Metadata } from "next";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Canonical origin for metadata, sitemap, and robots.
 * - Accepts `https://host`, `http://host`, or bare `host` (https assumed).
 * - On Vercel, falls back to `VERCEL_URL` when `NEXT_PUBLIC_SITE_URL` is unset.
 * - Never returns a string that would make `new URL(...)` throw.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (raw) {
    try {
      const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
      return stripTrailingSlash(u.origin);
    } catch {
      /* fall through */
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    if (host) return `https://${host}`;
  }

  return "http://localhost:3000";
}

export const siteName = "Kothari News";

export const defaultDescription =
  "Khabar Kothari brings fast, verified coverage across desh, videsh, rajneeti, khel, health, krishi, business and manoranjan.";

export function toAbsoluteUrl(path: string): string {
  const t = String(path || "").trim();
  if (!t) return getSiteUrl();
  if (/^https?:\/\//i.test(t)) return t;
  const p = t.startsWith("/") ? t : `/${t}`;
  return `${getSiteUrl()}${p}`;
}

/** Safe for `metadataBase` in `layout.tsx` — never throws even if env is mis-set at build/runtime. */
export function getMetadataBase(): URL {
  try {
    return new URL(getSiteUrl());
  } catch {
    const v = process.env.VERCEL_URL?.trim();
    if (v) {
      try {
        return new URL(`https://${v.replace(/^https?:\/\//i, "")}`);
      } catch {
        /* fall through */
      }
    }
    return new URL("http://localhost:3000");
  }
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
