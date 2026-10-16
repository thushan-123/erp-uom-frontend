export interface ClientFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function clientFetch<T = unknown>(
  pathname: string,
  options: ClientFetchOptions = {}
): Promise<{ status: number; data: T }> {
  const method = options.method || "GET";
  const queryStr = options.query
    ? "?" + new URLSearchParams(options.query).toString()
    : "";

  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = `/api/tenant${cleanPath}${queryStr}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return { status: 204, data: null as unknown as T };
  }

  let data: Record<string, unknown> | null = null;
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorDetail = typeof data?.detail === "string" ? data.detail : undefined;
    const errObj = data?.error as Record<string, unknown> | undefined;
    const errorMessage = typeof errObj?.message === "string" ? errObj.message : undefined;
    const errorMsg =
      errorDetail ||
      errorMessage ||
      `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; data?: unknown };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return { status: response.status, data: data as unknown as T };
}
