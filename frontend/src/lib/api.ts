const configuredApiUrl = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

/**
 * Resolve a backend API path against VITE_API_URL when configured.
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return configuredApiUrl ? `${configuredApiUrl}${normalizedPath}` : normalizedPath;
}

/**
 * Fetch wrapper that uses VITE_API_URL in production and falls back to
 * localhost:5000 only during local development when no VITE_API_URL is set.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const primaryUrl = getApiUrl(normalizedPath);

  try {
    return await fetch(primaryUrl, init);
  } catch (err) {
    if (
      import.meta.env.DEV &&
      !configuredApiUrl &&
      (err as Error)?.name !== "AbortError"
    ) {
      return fetch(`http://localhost:5000${normalizedPath}`, init);
    }
    throw err;
  }
}
