/** Backend origin in production (Render). Empty in dev — Vite proxy serves /api and /uploads. */
export function getPublicApiOrigin(): string {
  return (import.meta.env.VITE_PUBLIC_API_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
}

/** Prefix relative paths (/api/…, /uploads/…) with the public API origin. Leaves absolute URLs unchanged. */
export function withPublicOrigin(path: string): string {
  if (!path) return path;
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = getPublicApiOrigin();
  const p = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return origin ? `${origin}${p}` : p;
}
