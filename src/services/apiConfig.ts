/** Returns the JWT token stored by the existing appStore */
const getToken = (): string | null => localStorage.getItem("token");

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** Fetch with auth header + 401 → redirect to /login */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(
      options.headers as Record<string, string> | undefined,
    ),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res;
}

/** authFetch + JSON parse + error on non-ok */
export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await authFetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
