function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Absolute API origin for server-side Next.js code
 * (`generateMetadata`, `sitemap`, and other server fetches).
 */
export function getServerApiOrigin(): string {
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (internal) return stripTrailingSlash(internal);

  const publicOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();
  if (publicOrigin) return stripTrailingSlash(publicOrigin);

  return "http://127.0.0.1:5050";
}

export function serverApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getServerApiOrigin()}${p}`;
}
