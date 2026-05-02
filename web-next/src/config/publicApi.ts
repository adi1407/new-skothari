/** Backend origin in production (Render). Empty in dev — Next rewrites `/api` to the backend. */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Hostnames that mean “this machine” in dev (wrong on another device if embedded in stored URLs). */
export function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "");
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

/**
 * When `.env` sets `NEXT_PUBLIC_API_ORIGIN=http://localhost:5050`, that URL is wrong on a **phone**
 * (localhost = the phone itself). Fall back to same-origin `/api` so Next dev rewrites hit your PC.
 */
export function getPublicApiOrigin(): string {
  const raw = stripTrailingSlash((process.env.NEXT_PUBLIC_API_ORIGIN as string | undefined) ?? "");

  if (typeof window === "undefined") {
    return raw;
  }

  if (!raw) return "";

  try {
    const url = new URL(raw.includes("://") ? raw : `http://${raw}`);
    const apiLoopback = isLoopbackHostname(url.hostname);
    const pageHost = window.location.hostname;
    const pageLoopback = isLoopbackHostname(pageHost);
    if (apiLoopback && !pageLoopback) {
      return "";
    }
  } catch {
    return raw;
  }

  return raw;
}

/**
 * Prefix relative paths (/api/…, /uploads/…) with the public API origin.
 * Converts absolute **loopback** URLs (e.g. `http://localhost:5050/uploads/…` from CMS/DB) to same-origin
 * paths so phones loading the site via LAN still hit Next rewrites instead of the device’s localhost.
 */
export function withPublicOrigin(path: string): string {
  if (!path) return path;
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (isLoopbackHostname(u.hostname)) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  const origin = getPublicApiOrigin();
  const p = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return origin ? `${origin}${p}` : p;
}
