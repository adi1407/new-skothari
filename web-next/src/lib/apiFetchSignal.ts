/** AbortSignal for HTTP calls so a slow or unreachable API cannot block SSR or the UI. */
export const DEFAULT_API_FETCH_MS = 12_000;

export function apiFetchSignal(timeoutMs = DEFAULT_API_FETCH_MS): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  return undefined;
}
